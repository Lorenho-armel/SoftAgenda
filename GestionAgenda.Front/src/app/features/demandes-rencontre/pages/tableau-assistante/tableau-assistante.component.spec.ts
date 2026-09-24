import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { DemandeResume } from '../../models/demande.model';
import { TableauAssistante } from '../../models/tableau-assistante.model';
import { TableauAssistanteApiService } from '../../services/tableau-assistante-api.service';
import { TableauAssistanteComponent } from './tableau-assistante.component';

const demande: DemandeResume = {
  id: 'd1',
  demandeurId: 'u1',
  dirigeantId: 'u2',
  societeId: 's1',
  type: 'RendezVous',
  motif: 'Point budget trimestriel',
  dateDebutSouhaitee: '2026-09-24T08:00:00Z',
  dateFinSouhaitee: '2026-09-24T10:00:00Z',
  dureeMinutes: 60,
  urgence: 'Critique',
  priorite: 'Faible',
  statut: 'EnAnalyse',
  salleSouhaiteeId: null,
  dateCreation: '2026-09-23T08:00:00Z',
  demandeurNom: 'Nina Leroy',
  societeNom: 'Softwell',
};

describe('TableauAssistanteComponent', () => {
  let fixture: ComponentFixture<TableauAssistanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauAssistanteComponent],
      providers: [
        provideRouter([]),
        { provide: TableauAssistanteApiService, useValue: { obtenir: vi.fn(() => of(tableau())) } },
      ],
    })
      .overrideComponent(CalendrierComponent, { set: { imports: [], template: '' } })
      .compileComponents();
    fixture = TestBed.createComponent(TableauAssistanteComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('devrait afficher les indicateurs et la vue à traiter', () => {
    // Act
    const texte = fixture.nativeElement.textContent as string;

    // Assert
    expect(texte).toContain('À traiter maintenant');
    expect(texte).toContain('Point budget trimestriel');
    expect(texte).toContain('Critique');
    expect(texte).toContain('Faible');
    expect(texte).toContain('Prochaines rencontres du dirigeant');
    expect(texte).toContain('Claire Martin');
  });

  it('devrait ouvrir la demande depuis le tableau', () => {
    // Act
    const liens = [...fixture.nativeElement.querySelectorAll('a')] as HTMLAnchorElement[];
    const detail = liens.find((lien) => lien.textContent?.trim() === 'Détail' && lien.getAttribute('href')?.includes('d1'));
    const critiques = liens.find((lien) => lien.textContent?.includes('Critiques'));

    // Assert
    expect(detail?.getAttribute('href')).toContain('/demandes-rencontre/d1');
    expect(critiques?.getAttribute('href')).toContain('vue=Critiques');
  });
});

function tableau(): TableauAssistante {
  return {
    compteurs: {
      aTraiter: 1,
      urgentes: 0,
      critiques: 1,
      prioritaires: 0,
      acceptees: 1,
      reportees: 0,
      planifieesAujourdhui: 0,
    },
    aTraiterMaintenant: [demande],
    rencontresAujourdhui: [],
    prochainesRencontres: [{
      demandeId: 'd2',
      motif: 'Comité stratégique',
      urgence: 'Urgent',
      priorite: 'Haute',
      debut: '2026-09-25T09:00:00Z',
      fin: '2026-09-25T10:00:00Z',
      dirigeantNom: 'Claire Martin',
      societeNom: 'Softwell',
    }],
  };
}
