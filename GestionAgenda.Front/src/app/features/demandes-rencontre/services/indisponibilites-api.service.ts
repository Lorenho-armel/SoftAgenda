import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AccesAgendaGoogle,
  CreerIndisponibilite,
  EtatAgendaGoogle,
  DirigeantGere,
  EtatFeuille,
  Indisponibilite,
  RapportImport,
} from '../models/indisponibilite.model';

@Injectable({ providedIn: 'root' })
export class IndisponibilitesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/indisponibilites`;
  private readonly feuilleUrl = `${environment.apiUrl}/google-sheets`;
  private readonly agendaUrl = `${environment.apiUrl}/google-agenda`;

  dirigeants(): Observable<DirigeantGere[]> {
    return this.http
      .get<ApiResponse<DirigeantGere[]>>(`${this.baseUrl}/dirigeants`)
      .pipe(map((reponse) => reponse.data));
  }

  lister(debut: Date, fin: Date): Observable<Indisponibilite[]> {
    const params = new HttpParams().set('debut', debut.toISOString()).set('fin', fin.toISOString());
    return this.http
      .get<ApiResponse<Indisponibilite[]>>(this.baseUrl, { params })
      .pipe(map((reponse) => reponse.data));
  }

  creer(saisie: CreerIndisponibilite): Observable<Indisponibilite> {
    return this.http
      .post<ApiResponse<Indisponibilite>>(this.baseUrl, saisie)
      .pipe(map((reponse) => reponse.data));
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  etatFeuille(): Observable<EtatFeuille> {
    return this.http
      .get<ApiResponse<EtatFeuille>>(`${this.feuilleUrl}/etat`)
      .pipe(map((reponse) => reponse.data));
  }

  importerFeuille(): Observable<RapportImport> {
    return this.http
      .post<ApiResponse<RapportImport>>(`${this.feuilleUrl}/import`, {})
      .pipe(map((reponse) => reponse.data));
  }

  resynchroniserFeuille(): Observable<void> {
    return this.http.post<void>(`${this.feuilleUrl}/resynchronisation`, {});
  }

  etatAgendaGoogle(): Observable<EtatAgendaGoogle> {
    return this.http
      .get<ApiResponse<EtatAgendaGoogle>>(`${this.agendaUrl}/etat`)
      .pipe(map((reponse) => reponse.data));
  }

  accesAgendaGoogle(): Observable<AccesAgendaGoogle[]> {
    return this.http
      .get<ApiResponse<AccesAgendaGoogle[]>>(`${this.agendaUrl}/acces`)
      .pipe(map((reponse) => reponse.data));
  }

  resynchroniserAgendaGoogle(): Observable<void> {
    return this.http.post<void>(`${this.agendaUrl}/resynchronisation`, {});
  }
}
