import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemandeDetail, StatutDemande } from '../../models/demande.model';
import { DemandesApiService } from '../../services/demandes-api.service';
import { DemandeDetailComponent } from './demande-detail.component';

const identifiant = '11111111-1111-1111-1111-111111111111';

describe('DemandeDetailComponent', () => {
  let statut: StatutDemande = 'EnAnalyse';
  let fixture: ComponentFixture<DemandeDetailComponent>;
  const api = {
    obtenir: vi.fn(() => of(detail(statut))),
    changerStatut: vi.fn(() => of(detail(statut))),
    verifierCreneau: vi.fn(() => of({
      debut: '2026-10-01T08:00:00.000Z',
      fin: '2026-10-01T09:00:00.000Z',
      peutPlanifier: true,
      conflits: [],
    })),
  };

  beforeEach(async () => {
    statut = 'EnAnalyse';
    api.changerStatut.mockReset();
    api.changerStatut.mockImplementation(() => of(detail(statut)));
    await TestBed.configureTestingModule({
      imports: [DemandeDetailComponent],
      providers: [
        { provide: DemandesApiService, useValue: api },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: identifiant })) } },
      ],
    }).compileComponents();
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

  it('devrait reporter avec un commentaire et de nouvelles dates', async () => {
    // Arrange
    await afficher();
    const formulaires = fixture.nativeElement.querySelectorAll('#traitement form') as NodeListOf<HTMLFormElement>;
    const report = formulaires[1];
    saisir(report.querySelector('textarea'), 'Semaine suivante');
    const dates = report.querySelectorAll('input');
    saisir(dates[0], '2026-10-06T10:00');
    saisir(dates[1], '2026-10-06T12:00');

    // Act
    (report.querySelector('button') as HTMLButtonElement).click();

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant,
      'Reportee',
      'Semaine suivante',
      {
        debut: new Date('2026-10-06T10:00').toISOString(),
        fin: new Date('2026-10-06T12:00').toISOString(),
      },
      null,
      null,
    );
  });

  it('devrait planifier un créneau libre', async () => {
    // Arrange
    statut = 'Acceptee';
    await afficher();
    saisir(fixture.nativeElement.querySelector('#planification input'), '2026-10-01T10:00');

    // Act
    cliquer('Planifier');

    // Assert
    expect(api.changerStatut).toHaveBeenCalledWith(
      identifiant,
      'Planifiee',
      null,
      { debut: null, fin: null },
      new Date('2026-10-01T10:00').toISOString(),
      null,
    );
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
    saisir(fixture.nativeElement.querySelector('#planification input'), '2026-10-01T10:00');

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

function detail(statut: StatutDemande): DemandeDetail {
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
    historique: [{
      id: 'h1',
      typeEvenement: 'Creation',
      commentaire: null,
      statutAvant: null,
      statutApres: 'EnAttente',
      dateCreation: '2026-09-23T08:00:00Z',
    }],
  };
}
