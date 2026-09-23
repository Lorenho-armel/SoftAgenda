import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemandeResume, FileDemandes, FiltreDemande } from '../../models/demande.model';
import { DemandesApiService } from '../../services/demandes-api.service';
import { DemandeListComponent } from './demande-list.component';

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
  priorite: 'Haute',
  statut: 'EnAnalyse',
  salleSouhaiteeId: null,
  dateCreation: '2026-09-23T08:00:00Z',
  demandeurNom: 'Nina Leroy',
  societeNom: 'Softwell',
};

describe('DemandeListComponent', () => {
  let fixture: ComponentFixture<DemandeListComponent>;
  const api = {
    file: vi.fn(() => of(fileVide())),
    lister: vi.fn(() => of({ items: [demande], totalCount: 1, page: 1, pageSize: 10, totalPages: 1 })),
  };

  beforeEach(async () => {
    api.lister.mockClear();
    await TestBed.configureTestingModule({
      imports: [DemandeListComponent],
      providers: [{ provide: DemandesApiService, useValue: api }, provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(DemandeListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('devrait afficher les demandes reçues', () => {
    // Assert
    const texte = fixture.nativeElement.textContent as string;
    expect(texte).toContain('Point budget trimestriel');
    expect(texte).toContain('Nina Leroy');
    expect(texte).toContain('Critique');
    expect(texte).toContain('Haute');
  });

  it('devrait relancer la liste avec le filtre et le tri', async () => {
    // Arrange
    const filtre: FiltreDemande = {
      search: 'budget',
      statut: 'EnAnalyse',
      urgence: 'Critique',
      priorite: 'Haute',
      type: '',
      societeId: '',
      demandeurId: '',
      dateDebut: '',
      dateFin: '',
      sortBy: 'priorite',
      sortDirection: 'desc',
      vue: '',
    };

    // Act
    fixture.componentInstance.filtrer(filtre);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    expect(api.lister).toHaveBeenLastCalledWith(filtre, 1, 10);
  });
});

function fileVide(): FileDemandes {
  return {
    demandes: { items: [], totalCount: 0, page: 1, pageSize: 1, totalPages: 0 },
    compteurs: { nouvelles: 0, urgentes: 0, critiques: 0, prioritaires: 0, enAttente: 0, planifiees: 0 },
    demandeurs: [],
    societes: [],
  };
}
