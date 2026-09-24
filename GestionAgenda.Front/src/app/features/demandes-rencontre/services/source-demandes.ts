import { EventInput, EventSourceFuncInfo, EventSourceInput } from '@fullcalendar/angular';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { filtreVide } from '../models/demande.model';
import { evenementDemande } from '../models/evenements-calendrier';
import { DemandesApiService } from './demandes-api.service';

const TAILLE_PAGE_MAX = 100;

export function sourceDemandes(api: DemandesApiService, id = 'demandes'): EventSourceInput {
  return {
    id,
    events: (info: EventSourceFuncInfo) => firstValueFrom(api.lister({
      ...filtreVide(),
      dateDebut: info.start.toISOString(),
      dateFin: info.end.toISOString(),
      sortBy: 'datedebutsouhaitee',
    }, 1, TAILLE_PAGE_MAX).pipe(
      map((page) => page.items.filter((demande) => demande.statut !== 'Annulee').map(evenementDemande)),
      catchError(() => of<EventInput[]>([])),
    )),
  };
}
