import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';
import {
  BilanPlanification,
  CreerDemandeSaisie,
  DemandeDetail,
  DemandeResume,
  FileDemandes,
  FiltreDemande,
  StatutDemande,
} from '../models/demande.model';

@Injectable({ providedIn: 'root' })
export class DemandesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/demandes-rencontre`;

  lister(filtre: FiltreDemande, page: number, size: number): Observable<PaginatedResult<DemandeResume>> {
    return this.http
      .get<ApiResponse<PaginatedResult<DemandeResume>>>(this.baseUrl, { params: paramsDe(filtre, page, size) })
      .pipe(map((reponse) => reponse.data));
  }

  file(filtre: FiltreDemande, page: number, size: number): Observable<FileDemandes> {
    return this.http
      .get<ApiResponse<FileDemandes>>(`${this.baseUrl}/file`, { params: paramsDe(filtre, page, size) })
      .pipe(map((reponse) => reponse.data));
  }

  obtenir(id: string): Observable<DemandeDetail> {
    return this.http
      .get<ApiResponse<DemandeDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((reponse) => reponse.data));
  }

  creer(saisie: CreerDemandeSaisie): Observable<DemandeDetail> {
    return this.http
      .post<ApiResponse<DemandeDetail>>(this.baseUrl, corpsCreation(saisie))
      .pipe(map((reponse) => reponse.data));
  }

  changerStatut(
    id: string,
    statut: StatutDemande,
    commentaire: string | null,
    dates: { debut: string | null; fin: string | null },
    debutPlanifie: string | null,
    salleId: string | null,
  ): Observable<DemandeDetail> {
    return this.http
      .patch<ApiResponse<DemandeDetail>>(`${this.baseUrl}/${id}/statut`, {
        statut,
        commentaire,
        dateDebutSouhaitee: dates.debut,
        dateFinSouhaitee: dates.fin,
        debutPlanifie,
        salleId,
      })
      .pipe(map((reponse) => reponse.data));
  }

  verifierCreneau(id: string, debutPlanifie: string, salleId: string | null): Observable<BilanPlanification> {
    return this.http
      .post<ApiResponse<BilanPlanification>>(`${this.baseUrl}/${id}/verification-creneau`, { debutPlanifie, salleId })
      .pipe(map((reponse) => reponse.data));
  }
}

function paramsDe(filtre: FiltreDemande, page: number, size: number): HttpParams {
  let params = new HttpParams().set('page', page).set('size', size).set('sortDirection', filtre.sortDirection);
  params = ajouter(params, 'search', filtre.search);
  params = ajouter(params, 'statut', filtre.statut);
  params = ajouter(params, 'urgence', filtre.urgence);
  params = ajouter(params, 'priorite', filtre.priorite);
  params = ajouter(params, 'type', filtre.type);
  params = ajouter(params, 'societeId', filtre.societeId);
  params = ajouter(params, 'demandeurId', filtre.demandeurId);
  params = ajouter(params, 'sortBy', filtre.sortBy);
  params = ajouter(params, 'vue', filtre.vue);
  if (filtre.dateDebut) {
    params = params.set('dateDebut', new Date(filtre.dateDebut).toISOString());
  }

  if (filtre.dateFin) {
    params = params.set('dateFin', new Date(filtre.dateFin).toISOString());
  }

  return params;
}

function ajouter(params: HttpParams, cle: string, valeur: string): HttpParams {
  return valeur ? params.set(cle, valeur) : params;
}

function corpsCreation(saisie: CreerDemandeSaisie): unknown {
  return {
    dirigeantId: saisie.dirigeantId,
    societeId: saisie.societeId,
    type: saisie.type,
    motif: saisie.motif,
    dateDebutSouhaitee: new Date(saisie.dateDebutSouhaitee).toISOString(),
    dateFinSouhaitee: new Date(saisie.dateFinSouhaitee).toISOString(),
    dureeMinutes: saisie.dureeMinutes,
    urgence: saisie.urgence,
    priorite: saisie.priorite,
    salleSouhaiteeId: saisie.salleSouhaiteeId || null,
    participants: saisie.participants.map((participant) => ({
      utilisateurId: participant.utilisateurId || null,
      nomComplet: participant.nomComplet || null,
      email: participant.email || null,
    })),
  };
}
