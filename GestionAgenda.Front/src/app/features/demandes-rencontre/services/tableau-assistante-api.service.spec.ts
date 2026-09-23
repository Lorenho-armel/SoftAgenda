import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TableauAssistanteApiService } from './tableau-assistante-api.service';

describe('TableauAssistanteApiService', () => {
  let service: TableauAssistanteApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TableauAssistanteApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('devrait demander le tableau sur la journée locale', async () => {
    // Arrange
    const promesse = firstValueFrom(service.obtenir());

    // Act
    const requete = http.expectOne((appel) => appel.url.includes('/dashboard/assistante'));
    requete.flush({
      success: true,
      message: null,
      timestamp: '2026-09-23T00:00:00Z',
      data: {
        compteurs: {
          aTraiter: 2, urgentes: 1, critiques: 0, prioritaires: 1, acceptees: 0, reportees: 0, planifieesAujourdhui: 0,
        },
        aTraiterMaintenant: [],
        rencontresAujourdhui: [],
        prochainesRencontres: [],
      },
    });
    const resultat = await promesse;

    // Assert
    expect(requete.request.params.get('debutJour')).toBeTruthy();
    expect(requete.request.params.get('finJour')).toBeTruthy();
    expect(resultat.compteurs.aTraiter).toBe(2);
    expect(resultat.compteurs.urgentes).toBe(1);
  });
});
