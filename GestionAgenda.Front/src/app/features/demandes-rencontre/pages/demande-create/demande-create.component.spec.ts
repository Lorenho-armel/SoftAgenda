import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { DemandesApiService } from '../../services/demandes-api.service';
import { DemandeCreateComponent } from './demande-create.component';

describe('DemandeCreateComponent', () => {
  let fixture: ComponentFixture<DemandeCreateComponent>;
  const api = {
    creer: vi.fn(),
  };

  beforeEach(async () => {
    api.creer.mockReset();
    await TestBed.configureTestingModule({
      imports: [DemandeCreateComponent],
      providers: [
        provideRouter([]),
        { provide: DemandesApiService, useValue: api },
      ],
    })
      .overrideComponent(CalendrierComponent, { set: { imports: [], template: '' } })
      .compileComponents();
    fixture = TestBed.createComponent(DemandeCreateComponent);
    fixture.detectChanges();
  });

  it('devrait afficher l erreur renvoyee a la creation', () => {
    // Arrange
    api.creer.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: { message: 'Le dirigeant indiqué n\'exerce pas dans cette société.' },
    })));
    fixture.componentInstance.form.setValue({
      dirigeantId: '22222222-2222-2222-2222-222222222222',
      societeId: '11111111-1111-1111-1111-111111111111',
      type: 'RendezVous',
      motif: 'Point budget',
      dateDebutSouhaitee: '2027-01-10T09:00',
      dateFinSouhaitee: '2027-01-10T11:00',
      dureeMinutes: 60,
      urgence: 'Normal',
      priorite: 'Moyenne',
      salleSouhaiteeId: '',
      participants: [],
    });

    // Act
    fixture.componentInstance.enregistrer();
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain('n\'exerce pas dans cette société');
  });
});
