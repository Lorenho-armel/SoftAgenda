import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { CalendarOptions, EventClickInfo } from '@fullcalendar/angular';
import { catchError, of } from 'rxjs';
import { CalendrierComponent } from '../../../../shared/calendrier/calendrier.component';
import { optionsCalendrier } from '../../../../shared/calendrier/calendrier.config';
import { DemandeLigneComponent } from '../../components/demande-ligne/demande-ligne.component';
import { RencontreLigneComponent } from '../../components/rencontre-ligne/rencontre-ligne.component';
import { evenementRencontre } from '../../models/evenements-calendrier';
import { CompteursTableau } from '../../models/tableau-assistante.model';
import { TableauAssistanteApiService } from '../../services/tableau-assistante-api.service';

interface CarteTableau {
  libelle: string;
  valeur: number;
  route: string;
  params: Record<string, string> | null;
  ancre: string | null;
}

@Component({
  selector: 'app-tableau-assistante',
  imports: [RouterLink, CalendrierComponent, DemandeLigneComponent, RencontreLigneComponent],
  templateUrl: './tableau-assistante.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableauAssistanteComponent {
  private readonly api = inject(TableauAssistanteApiService);
  private readonly router = inject(Router);
  readonly tableau = toSignal(this.api.obtenir().pipe(catchError(() => of(null))));
  readonly cartes = computed(() => {
    const tableau = this.tableau();
    return tableau ? cartesDe(tableau.compteurs) : [];
  });
  readonly optionsAgenda = computed<CalendarOptions>(() => {
    const tableau = this.tableau();
    const rencontres = tableau ? [...tableau.rencontresAujourdhui, ...tableau.prochainesRencontres] : [];
    return optionsCalendrier({
      initialView: 'listWeek',
      headerToolbar: { start: 'prev,next today', center: 'title', end: 'listWeek,timeGridWeek' },
      noEventsText: 'Aucune rencontre sur cette période.',
      events: rencontres.map(evenementRencontre),
      eventClick: (info: EventClickInfo) => this.ouvrir(info),
    });
  });

  private ouvrir(info: EventClickInfo): void {
    const demandeId: unknown = info.event.extendedProps['demandeId'];
    if (typeof demandeId === 'string') {
      void this.router.navigate(['/demandes-rencontre', demandeId]);
    }
  }
}

function cartesDe(compteurs: CompteursTableau): CarteTableau[] {
  return [
    versFile('À traiter', compteurs.aTraiter, { vue: 'EnAttente' }),
    versFile('Urgentes', compteurs.urgentes, { vue: 'Urgentes' }),
    versFile('Critiques', compteurs.critiques, { vue: 'Critiques' }),
    versFile('Prioritaires', compteurs.prioritaires, { vue: 'Prioritaires' }),
    versFile('Acceptées', compteurs.acceptees, { statut: 'Acceptee' }),
    versFile('Reportées', compteurs.reportees, { statut: 'Reportee' }),
    versAncre("Planifiées aujourd'hui", compteurs.planifieesAujourdhui, '#aujourdhui'),
  ];
}

function versFile(libelle: string, valeur: number, params: Record<string, string>): CarteTableau {
  return { libelle, valeur, route: '/demandes-rencontre/file', params, ancre: null };
}

function versAncre(libelle: string, valeur: number, ancre: string): CarteTableau {
  return { libelle, valeur, route: '', params: null, ancre };
}
