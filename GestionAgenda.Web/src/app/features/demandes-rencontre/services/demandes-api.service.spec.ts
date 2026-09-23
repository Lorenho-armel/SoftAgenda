import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DemandesApiService } from './demandes-api.service';

describe('DemandesApiService', () => {
  let service: DemandesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DemandesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('devrait retourner la file quand l API repond', async () => {
    // Arrange
    const promesse = firstValueFrom(service.file({
      search: '', statut: '', urgence: 'Critique', priorite: '', type: '',
      societeId: '', demandeurId: '', dateDebut: '', dateFin: '',
      sortBy: '', sortDirection: 'asc', vue: 'Critiques',
    }, 1, 10));

    // Act
    const requete = http.expectOne((appel) => appel.url.includes('/demandes-rencontre/file'));
    requete.flush({
      success: true,
      message: null,
      timestamp: '2026-09-23T00:00:00Z',
      data: {
        demandes: { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 },
        compteurs: { nouvelles: 1, urgentes: 0, critiques: 2, prioritaires: 0, enAttente: 1, planifiees: 0 },
        demandeurs: [],
        societes: [],
      },
    });
    const resultat = await promesse;

    // Assert
    expect(requete.request.params.get('vue')).toBe('Critiques');
    expect(requete.request.params.get('urgence')).toBe('Critique');
    expect(resultat.compteurs.critiques).toBe(2);
  });
});
