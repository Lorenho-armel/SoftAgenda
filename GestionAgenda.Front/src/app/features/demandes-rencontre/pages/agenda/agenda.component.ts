import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  CalendarApi,
  CalendarOptions,
  EventClickInfo,
  EventDropInfo,
  EventInput,
  EventResizeDoneInfo,
  EventSourceInput,
} from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { EvenementClique, optionsCalendrier } from '../../../../shared/calendrier/calendrier.config';
import { DemandeApercuComponent } from '../../components/demande-apercu/demande-apercu.component';
import { libelleStatut } from '../../models/demande-libelles';
import { LEGENDE_AGENDA, evenementRencontre } from '../../models/evenements-calendrier';
import { DemandesApiService } from '../../services/demandes-api.service';
import { DeplacementDemandeService } from '../../services/deplacement-demande.service';
import { sourceDemandes } from '../../services/source-demandes';
import { TableauAssistanteApiService } from '../../services/tableau-assistante-api.service';

@Component({
  selector: 'app-agenda',
  imports: [CalendrierComponent, DemandeApercuComponent],
  templateUrl: './agenda.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaComponent {
  private readonly api = inject(DemandesApiService);
  private readonly tableauApi = inject(TableauAssistanteApiService);
  private readonly router = inject(Router);
  private readonly deplacement = inject(DeplacementDemandeService);
  private readonly estAssistante = inject(AuthService).roles().includes('Assistante');
  private calendrier: CalendarApi | null = null;
  readonly demandeOuverte = signal<EvenementClique | null>(null);
  readonly legende = LEGENDE_AGENDA.filter((entree) => entree.libelle !== libelleStatut('Annulee'));
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
    eventDrop: (info: EventDropInfo) => this.deplacer(info),
    eventResize: (info: EventResizeDoneInfo) => this.deplacer(info),
  });

  fermer(): void {
    this.demandeOuverte.set(null);
  }

  actualiser(): void {
    this.calendrier?.refetchEvents();
  }

  apresSuppression(): void {
    this.fermer();
    this.actualiser();
  }

  private sources(): EventSourceInput[] {
    const demandes = sourceDemandes(this.api);
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

  private deplacer(info: EventDropInfo | EventResizeDoneInfo): void {
    const calendrier = info.view.calendar;
    this.deplacement.appliquer(info, () => calendrier.refetchEvents());
  }

  private ouvrir(info: EventClickInfo): void {
    const demandeId: unknown = info.event.extendedProps['demandeId'];
    if (typeof demandeId === 'string') {
      this.calendrier = info.view.calendar;
      this.demandeOuverte.set({ demandeId, ancre: info.el.getBoundingClientRect() });
    }
  }
}
