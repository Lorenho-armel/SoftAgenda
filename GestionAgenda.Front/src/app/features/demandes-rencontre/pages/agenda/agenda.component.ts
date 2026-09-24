import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CalendarOptions,
  EventClickInfo,
  EventInput,
  EventSourceFuncInfo,
  EventSourceInput,
} from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { optionsCalendrier } from '../../../../shared/calendrier/calendrier.config';
import { filtreVide } from '../../models/demande.model';
import { LEGENDE_AGENDA, evenementDemande, evenementRencontre } from '../../models/evenements-calendrier';
import { DemandesApiService } from '../../services/demandes-api.service';
import { TableauAssistanteApiService } from '../../services/tableau-assistante-api.service';

const TAILLE_PAGE_MAX = 100;

@Component({
  selector: 'app-agenda',
  imports: [CalendrierComponent],
  templateUrl: './agenda.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaComponent {
  private readonly api = inject(DemandesApiService);
  private readonly tableauApi = inject(TableauAssistanteApiService);
  private readonly router = inject(Router);
  private readonly estAssistante = inject(AuthService).roles().includes('Assistante');
  readonly legende = LEGENDE_AGENDA;
  readonly options: CalendarOptions = optionsCalendrier({
    initialView: 'timeGridWeek',
    headerToolbar: { start: 'prev,next today', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    eventSources: this.sources(),
    select: (info) => void this.router.navigate(['/demandes-rencontre/nouvelle'], {
      queryParams: { debut: info.start.toISOString(), fin: info.end.toISOString() },
    }),
    eventClick: (info: EventClickInfo) => this.ouvrir(info),
  });

  private sources(): EventSourceInput[] {
    const demandes: EventSourceInput = {
      id: 'demandes',
      events: (info: EventSourceFuncInfo) => firstValueFrom(this.api.lister({
        ...filtreVide(),
        dateDebut: info.start.toISOString(),
        dateFin: info.end.toISOString(),
        sortBy: 'datedebutsouhaitee',
      }, 1, TAILLE_PAGE_MAX).pipe(
        map((page) => page.items.map(evenementDemande)),
        catchError(() => of<EventInput[]>([])),
      )),
    };
    if (!this.estAssistante) {
      return [demandes];
    }

    const rencontres: EventSourceInput = {
      id: 'rencontres',
      events: () => firstValueFrom(this.tableauApi.obtenir().pipe(
        map((tableau) => [...tableau.rencontresAujourdhui, ...tableau.prochainesRencontres].map(evenementRencontre)),
        catchError(() => of<EventInput[]>([])),
      )),
    };
    return [demandes, rencontres];
  }

  private ouvrir(info: EventClickInfo): void {
    const demandeId: unknown = info.event.extendedProps['demandeId'];
    if (typeof demandeId === 'string') {
      void this.router.navigate(['/demandes-rencontre', demandeId]);
    }
  }
}
