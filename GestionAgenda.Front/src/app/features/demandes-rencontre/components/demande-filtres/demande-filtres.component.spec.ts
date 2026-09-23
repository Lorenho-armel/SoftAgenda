import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FiltreDemande } from '../../models/demande.model';
import { DemandeFiltresComponent } from './demande-filtres.component';

describe('DemandeFiltresComponent', () => {
  let fixture: ComponentFixture<DemandeFiltresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeFiltresComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DemandeFiltresComponent);
    fixture.detectChanges();
  });

  it('devrait émettre le filtre et le tri choisis', () => {
    // Arrange
    const recus: FiltreDemande[] = [];
    fixture.componentInstance.appliquer.subscribe((filtre) => recus.push(filtre));
    fixture.componentInstance.form.setValue({
      search: 'budget',
      urgence: 'Critique',
      priorite: 'Haute',
      statut: 'EnAnalyse',
      type: 'RendezVous',
      societeId: 's1',
      demandeurId: '',
      dateDebut: '2026-09-24',
      dateFin: '',
      sortBy: 'datedebutsouhaitee',
      sortDirection: 'desc',
    });

    // Act
    fixture.nativeElement.querySelector('button').click();

    // Assert
    expect(recus).toHaveLength(1);
    expect(recus[0].urgence).toBe('Critique');
    expect(recus[0].priorite).toBe('Haute');
    expect(recus[0].sortBy).toBe('datedebutsouhaitee');
    expect(recus[0].sortDirection).toBe('desc');
    expect(recus[0].search).toBe('budget');
  });
});
