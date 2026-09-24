import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SocieteDetail, SocieteOption } from '../models/demande.model';

@Injectable({ providedIn: 'root' })
export class ReferentielApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/referentiel`;

  societes(recherche: string): Observable<SocieteOption[]> {
    const params = recherche.trim() ? new HttpParams().set('recherche', recherche.trim()) : undefined;
    return this.http
      .get<ApiResponse<SocieteOption[]>>(`${this.baseUrl}/societes`, { params })
      .pipe(map((reponse) => reponse.data));
  }

  societe(id: string): Observable<SocieteDetail> {
    return this.http
      .get<ApiResponse<SocieteDetail>>(`${this.baseUrl}/societes/${id}`)
      .pipe(map((reponse) => reponse.data));
  }
}
