import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlashService } from '../../../../core/services/flash.service';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { DemandesApiService } from '../../services/demandes-api.service';
import { ReferentielApiService } from '../../services/referentiel-api.service';
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
        {
          provide: ReferentielApiService,
          useValue: {
            societes: () => of([{ id: '11111111-1111-1111-1111-111111111111', nom: 'Holding Démo' }]),
            societe: () => of({
              id: '11111111-1111-1111-1111-111111111111',
              nom: 'Holding Démo',
              dirigeants: [{ id: '22222222-2222-2222-2222-222222222222', nomComplet: 'Dirigeant Démo', email: 'd@demo.local' }],
              membres: [],
              salles: [],
            }),
          },
        },
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

  it('devrait fermer la modale et rester sur le calendrier apres la creation', () => {
    // Arrange
    const flash = TestBed.inject(FlashService);
    const succes = vi.spyOn(flash, 'succes');
    api.creer.mockReturnValue(of({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      motif: 'Point budget',
      demandeurNom: 'Alice Bernard',
      dateDebutSouhaitee: '2027-01-10T09:00:00Z',
      dureeMinutes: 60,
      statut: 'EnAttente',
    }));
    const composant = fixture.componentInstance;
    composant.form.setValue({
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
    composant.enregistrer();

    // Assert
    expect(composant.formulaireOuvert()).toBe(false);
    expect(composant.sources()[0]).toMatchObject({ id: 'demandes-1' });
    expect(composant.form.controls.motif.value).toBe('');
    expect(composant.form.controls.societeId.value).toBe('11111111-1111-1111-1111-111111111111');
    expect(succes).toHaveBeenCalledWith('La demande a été créée avec succès.');
  });
});
