import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { DemandeDetail, StatutDemande } from '../../models/demande.model';
import { DemandesApiService } from '../../services/demandes-api.service';
import { ReferentielApiService } from '../../services/referentiel-api.service';
import { DemandeDetailComponent } from './demande-detail.component';

const identifiant = '11111111-1111-1111-1111-111111111111';

describe('DemandeDetailComponent', () => {
  let statut: StatutDemande = 'EnAnalyse';
  let gestionnaire = true;
  let fixture: ComponentFixture<DemandeDetailComponent>;
  const api = {
    obtenir: vi.fn(() => of(detail(statut, gestionnaire))),
    changerStatut: vi.fn(() => of(detail(statut, gestionnaire))),
    verifierCreneau: vi.fn(() => of({
      debut: '2026-10-01T08:00:00.000Z',
      fin: '2026-10-01T09:00:00.000Z',
      peutPlanifier: true,
      conflits: [],
    })),
  };
  const referentiel = {
    societe: vi.fn(() => of({ salles: [{ id: 'salle-atlas', nom: 'Salle Atlas', capacite: 8 }] })),
  };

  beforeEach(async () => {
    statut = 'EnAnalyse';
    gestionnaire = true;
    api.changerStatut.mockReset();
    api.changerStatut.mockImplementation(() => of(detail(statut, gestionnaire)));
    await TestBed.configureTestingModule({
      imports: [DemandeDetailComponent],
      providers: [
        { provide: DemandesApiService, useValue: api },
        { provide: ReferentielApiService, useValue: referentiel },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: identifiant })) } },
      ],
    })
      .overrideComponent(CalendrierComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  });

  it('devrait afficher le motif, l urgence et la priorité', async () => {
    // Act
    await afficher();

    // Assert
    const texte = fixture.nativeElement.textContent as string;
    expect(texte).toContain('Point budget trimestriel');
    expect(texte).toContain('Urgent');
    expect(texte).toContain('Haute');
    expect(texte).toContain('En analyse');
    expect(texte).toContain('Nina Leroy');
  });

  it('devrait afficher les noms et la rencontre planifiée plutôt que des identifiants', async () => {
    // Arrange
    const rendezVousId = '99999999-9999-9999-9999-999999999999';
    api.obtenir.mockReturnValueOnce(of({
      ...detail('Planifiee'),
      rendezVousId,
      participants: [{ id: 'p1', utilisateurId: '88888888-8888-8888-8888-888888888888', nomComplet: 'Louis Petit', email: null }],
      rencontre: { type: 'RendezVous', debut: '2026-10-27T12:00:00Z', fin: '2026-10-27T13:00:00Z', salleId: null, salleNom: 'Salle Atlas', statut: 'Planifie' },
    }));

    // Act
    await afficher();

    // Assert
    const texte = fixture.nativeElement.textContent as string;
    expect(texte).toContain('Claire Martin');
    expect(texte).toContain('Louis Petit');
    expect(texte).toContain('Salle Atlas');
    expect(texte).toContain('par Nina Leroy');
    expect(texte).not.toContain(rendezVousId);
    expect(texte).not.toContain('88888888');
  });

  it('devrait accepter la demande en analyse', async () => {
    // Arrange
    await afficher();

    // Act
    cliquer('Accepter');

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant, 'Acceptee', null, { debut: null, fin: null }, null, null,
    );
  });

  it('devrait accepter directement une demande en attente', async () => {
    // Arrange
    statut = 'EnAttente';
    await afficher();

    // Act
    cliquer('Accepter');

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant, 'Acceptee', null, { debut: null, fin: null }, null, null,
    );
  });

  it('devrait refuser avec un commentaire', async () => {
    // Arrange
    await afficher();
    renseigner('#traitement form textarea', 'Créneau incompatible');

    // Act
    cliquerDans('#traitement form', 'Refuser');

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant, 'Refusee', 'Créneau incompatible', { debut: null, fin: null }, null, null,
    );
  });

  it('devrait reporter vers la période déplacée dans le calendrier', async () => {
    // Arrange
    await afficher();
    const debut = new Date('2026-10-06T10:00');
    const fin = new Date('2026-10-06T12:00');
    fixture.componentInstance.proposition.set({ debut, fin });
    fixture.detectChanges();
    renseigner('#traitement form textarea', 'Semaine suivante');

    // Act
    cliquerDans('#traitement form', 'Reporter');

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant,
      'Reportee',
      'Semaine suivante',
      { debut: debut.toISOString(), fin: fin.toISOString() },
      null,
      null,
    );
  });

  it('devrait masquer l acceptation tant que la demande est déplacée', async () => {
    // Arrange
    await afficher();

    // Act
    fixture.componentInstance.proposition.set({ debut: new Date('2026-10-06T10:00'), fin: new Date('2026-10-06T12:00') });
    fixture.detectChanges();

    // Assert
    expect(boutons().some((bouton) => bouton.textContent?.trim() === 'Accepter')).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('nouvelle période proposée');
  });

  it('devrait masquer le traitement à qui ne gère pas la demande', async () => {
    // Arrange
    gestionnaire = false;

    // Act
    await afficher();

    // Assert
    expect(fixture.nativeElement.querySelector('#traitement')).toBeNull();
  });

  it('devrait planifier au début souhaité proposé par défaut', async () => {
    // Arrange
    statut = 'Acceptee';
    await afficher();

    // Act
    cliquer('Planifier');

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant,
      'Planifiee',
      null,
      { debut: null, fin: null },
      '2026-09-24T08:00:00.000Z',
      null,
    );
  });

  it('devrait planifier dans la salle choisie par son nom', async () => {
    // Arrange
    statut = 'Acceptee';
    await afficher();
    const liste = fixture.nativeElement.querySelector('#planification select') as HTMLSelectElement;

    // Act
    liste.value = liste.options[1].value;
    liste.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    cliquer('Vérifier les conflits');

    // Assert
    expect(liste.options[1].textContent).toContain('Salle Atlas');
    expect(api.verifierCreneau).toHaveBeenCalledWith(identifiant, '2026-09-24T08:00:00.000Z', 'salle-atlas');
  });

  it('devrait refuser un début hors de la période souhaitée sans appeler l API', async () => {
    // Arrange
    statut = 'Acceptee';
    api.verifierCreneau.mockClear();
    await afficher();
    saisir(fixture.nativeElement.querySelector('#planification input'), '2026-10-01T10:00');

    // Act
    cliquer('Vérifier les conflits');
    fixture.detectChanges();

    // Assert
    expect(api.verifierCreneau).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('doit tenir dans la période souhaitée');
  });

  it('devrait afficher l erreur de chargement', async () => {
    // Arrange
    api.obtenir.mockReturnValueOnce(throwError(() => new HttpErrorResponse({
      status: 404,
      error: { message: 'Demande introuvable.' },
    })));

    // Act
    await afficher();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Demande introuvable.');
    expect(fixture.nativeElement.textContent).not.toContain('Chargement');
  });

  it('devrait afficher l echec d une decision', async () => {
    // Arrange
    api.changerStatut.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: { message: 'La transition est interdite.' },
    })));
    await afficher();

    // Act
    fixture.componentInstance.decider({
      statut: 'Acceptee',
      commentaire: '',
      dateDebutSouhaitee: null,
      dateFinSouhaitee: null,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('La transition est interdite.');
  });

  it('devrait afficher le blocage quand la planification est conflictuelle', async () => {
    // Arrange
    statut = 'Acceptee';
    api.changerStatut.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: {
        data: [{
          nature: 'Salle',
          bloquant: true,
          message: 'La salle est déjà occupée.',
          titre: null,
          debut: null,
          fin: null,
          participantNom: null,
          salleNom: 'Conseil',
        }],
      },
    })));
    await afficher();

    // Act
    cliquer('Planifier');
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('Planification bloquée.');
    expect(fixture.nativeElement.textContent).toContain('La salle est déjà occupée.');
  });

  async function afficher(): Promise<void> {
    fixture = TestBed.createComponent(DemandeDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function cliquer(libelle: string): void {
    const bouton = boutons().find((element) => element.textContent?.trim() === libelle);
    bouton?.click();
  }

  function cliquerDans(selecteur: string, libelle: string): void {
    const zone = fixture.nativeElement.querySelector(selecteur) as HTMLElement;
    const bouton = [...zone.querySelectorAll('button')].find((element) => element.textContent?.trim() === libelle);
    (bouton as HTMLButtonElement | undefined)?.click();
  }

  function boutons(): HTMLButtonElement[] {
    return [...fixture.nativeElement.querySelectorAll('button')];
  }

  function renseigner(selecteur: string, valeur: string): void {
    saisir(fixture.nativeElement.querySelector(selecteur), valeur);
  }

  function saisir(element: Element | null, valeur: string): void {
    const champ = element as HTMLInputElement | HTMLTextAreaElement;
    champ.value = valeur;
    champ.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
});

function detail(statut: StatutDemande, estGestionnaire = true): DemandeDetail {
  return {
    id: identifiant,
    demandeurId: 'u1',
    dirigeantId: 'u2',
    societeId: 's1',
    type: 'RendezVous',
    motif: 'Point budget trimestriel',
    dateDebutSouhaitee: '2026-09-24T08:00:00Z',
    dateFinSouhaitee: '2026-09-24T10:00:00Z',
    dureeMinutes: 60,
    urgence: 'Urgent',
    priorite: 'Haute',
    statut,
    salleSouhaiteeId: null,
    dateCreation: '2026-09-23T08:00:00Z',
    demandeurNom: 'Nina Leroy',
    societeNom: 'Softwell',
    rendezVousId: null,
    reunionId: null,
    participants: [],
    estGestionnaire,
    dirigeantNom: 'Claire Martin',
    rencontre: null,
    historique: [{
      id: 'h1',
      typeEvenement: 'Creation',
      commentaire: null,
      statutAvant: null,
      statutApres: 'EnAttente',
      dateCreation: '2026-09-23T08:00:00Z',
      auteurNom: 'Nina Leroy',
    }],
  };
}
