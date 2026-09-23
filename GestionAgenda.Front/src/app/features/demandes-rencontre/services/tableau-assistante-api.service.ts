import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TableauAssistante } from '../models/tableau-assistante.model';

@Injectable({ providedIn: 'root' })
export class TableauAssistanteApiService {
  private readonly http = inject(HttpClient);

  obtenir(): Observable<TableauAssistante> {
    const bornes = bornesJourLocal();
    const params = new HttpParams().set('debutJour', bornes.debut).set('finJour', bornes.fin);
    return this.http
      .get<ApiResponse<TableauAssistante>>(`${environment.apiUrl}/dashboard/assistante`, { params })
      .pipe(map((reponse) => reponse.data));
  }
}

function bornesJourLocal(): { debut: string; fin: string } {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 1);
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}
