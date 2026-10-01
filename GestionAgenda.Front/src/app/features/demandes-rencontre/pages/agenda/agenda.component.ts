import { DestroyRef, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CalendarApi,
  CalendarOptions,
  EventClickInfo,
  EventDropInfo,
  EventInput,
  EventResizeDoneInfo,
  EventSourceFuncInfo,
  EventSourceInput,
} from '@fullcalendar/angular';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { FlashService } from '../../../../core/services/flash.service';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { EvenementClique, optionsCalendrier } from '../../../../shared/calendrier/calendrier.config';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { DemandeApercuComponent } from '../../components/demande-apercu/demande-apercu.component';
import { GoogleAgendaPanneauComponent } from '../../components/google-agenda-panneau/google-agenda-panneau.component';
import { GoogleSheetsPanneauComponent } from '../../components/google-sheets-panneau/google-sheets-panneau.component';
import { IndisponibiliteModaleComponent } from '../../components/indisponibilite-modale/indisponibilite-modale.component';
import { libelleStatut } from '../../models/demande-libelles';
import {
  COULEUR_INDISPONIBILITE,
  LEGENDE_AGENDA,
  evenementIndisponibilite,
  evenementRencontre,
} from '../../models/evenements-calendrier';
import { messageApi } from '../../models/message-api';
import { DemandesApiService } from '../../services/demandes-api.service';
import { DeplacementDemandeService } from '../../services/deplacement-demande.service';
import { IndisponibilitesApiService } from '../../services/indisponibilites-api.service';
import { sourceDemandes } from '../../services/source-demandes';
import { TableauAssistanteApiService } from '../../services/tableau-assistante-api.service';

interface IndisponibiliteOuverte {
  id: string;
  titre: string;
  debut: Date | null;
  fin: Date | null;
}

@Component({
  selector: 'app-agenda',
  imports: [CalendrierComponent, DemandeApercuComponent, IndisponibiliteModaleComponent, GoogleSheetsPanneauComponent, GoogleAgendaPanneauComponent, IconeComponent],
  templateUrl: './agenda.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaComponent {
  private readonly api = inject(DemandesApiService);
  private readonly tableauApi = inject(TableauAssistanteApiService);
  private readonly indisponibilitesApi = inject(IndisponibilitesApiService);
  private readonly router = inject(Router);
  private readonly flash = inject(FlashService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly deplacement = inject(DeplacementDemandeService);
  private readonly roles = inject(AuthService).roles();
  private readonly estAssistante = this.roles.includes('Assistante');
  readonly estGestionnaire = this.estAssistante || this.roles.includes('Dirigeant');
  private calendrier: CalendarApi | null = null;
  readonly demandeOuverte = signal<EvenementClique | null>(null);
  readonly indisponibiliteOuverte = signal<IndisponibiliteOuverte | null>(null);
  readonly saisieIndisponibilite = signal(false);
  readonly legende = LEGENDE_AGENDA.filter((entree) =>
    entree.libelle !== libelleStatut('Annulee')
    && (this.estGestionnaire || entree.couleur !== COULEUR_INDISPONIBILITE));
  readonly options: CalendarOptions = optionsCalendrier({
    initialView: 'timeGridWeek',
    headerToolbar: { start: 'prev,next today', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    eventSources: this.sources(),
    datesSet: (info) => {
      this.calendrier = info.view.calendar;
    },
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

  apresAjoutIndisponibilite(): void {
    this.saisieIndisponibilite.set(false);
    this.actualiser();
  }

  supprimerIndisponibilite(id: string): void {
    this.indisponibilitesApi.supprimer(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.indisponibiliteOuverte.set(null);
        this.flash.succes('L\'indisponibilité a été supprimée.');
        this.actualiser();
      },
      error: (erreur: unknown) => this.flash.erreur(messageApi(erreur)),
    });
  }

  private sources(): EventSourceInput[] {
    const sources: EventSourceInput[] = [sourceDemandes(this.api)];
    if (this.estAssistante) {
      sources.push({
        id: 'rencontres',
        events: () => firstValueFrom(this.tableauApi.obtenir().pipe(
          map((tableau) => [...tableau.rencontresAujourdhui, ...tableau.prochainesRencontres].map(evenementRencontre)),
          catchError(() => of<EventInput[]>([])),
        )),
      });
    }

    if (this.estGestionnaire) {
      sources.push({
        id: 'indisponibilites',
        events: (info: EventSourceFuncInfo) => firstValueFrom(this.indisponibilitesApi.lister(info.start, info.end).pipe(
          map((indisponibilites) => indisponibilites.map(evenementIndisponibilite)),
          catchError(() => of<EventInput[]>([])),
        )),
      });
    }

    return sources;
  }

  private deplacer(info: EventDropInfo | EventResizeDoneInfo): void {
    const calendrier = info.view.calendar;
    this.deplacement.appliquer(info, () => calendrier.refetchEvents());
  }

  private ouvrir(info: EventClickInfo): void {
    this.calendrier = info.view.calendar;
    const indisponibiliteId: unknown = info.event.extendedProps['indisponibiliteId'];
    if (typeof indisponibiliteId === 'string') {
      this.indisponibiliteOuverte.set({
        id: indisponibiliteId,
        titre: info.event.title,
        debut: info.event.start,
        fin: info.event.end,
      });
      return;
    }

    const demandeId: unknown = info.event.extendedProps['demandeId'];
    if (typeof demandeId === 'string') {
      this.demandeOuverte.set({ demandeId, ancre: info.el.getBoundingClientRect() });
    }
  }
}
