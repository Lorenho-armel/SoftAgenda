import { ChangeDetectionStrategy, Component, computed, input, output, untracked } from '@angular/core';
import {
  CalendarOptions,
  DateClickInfo,
  DateSelectInfo,
  EventClickInfo,
  EventDropInfo,
  EventInput,
  EventResizeDoneInfo,
  EventSourceInput,
} from '@fullcalendar/angular';
import { CalendrierComponent } from './calendrier.component';
import {
  COULEUR_SELECTION,
  EvenementClique,
  PlageHoraire,
  ajouterMinutes,
  dateValide,
  optionsCalendrier,
} from './calendrier.config';

export type ModeSaisie = 'periode' | 'creneau';

@Component({
  selector: 'app-calendrier-saisie',
  imports: [CalendrierComponent],
  template: `
    <p class="m-0 mb-3 text-xs text-navy-soft">{{ aide() }}</p>
    <app-calendrier [options]="options()" />
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendrierSaisieComponent {
  readonly mode = input<ModeSaisie>('periode');
  readonly debut = input('');
  readonly fin = input('');
  readonly dureeMinutes = input(60);
  readonly fenetre = input<PlageHoraire | null>(null);
  readonly evenements = input<EventInput[]>([]);
  readonly sources = input<EventSourceInput[]>([]);
  readonly choisir = output<PlageHoraire>();
  readonly evenementClique = output<EvenementClique>();
  readonly evenementModifie = output<EventDropInfo | EventResizeDoneInfo>();

  readonly aide = computed(() => {
    if (this.mode() === 'periode') {
      return 'Faites glisser sur une plage libre pour définir la période. Déplacez une demande existante pour changer sa date, ou tirez son bord inférieur pour changer sa durée.';
    }

    return this.fenetre()
      ? 'Cliquez sur une heure dans la période souhaitée (en doré) pour choisir le créneau.'
      : 'Cliquez sur une heure pour choisir le créneau.';
  });

  readonly options = computed<CalendarOptions>(() => {
    const mode = this.mode();
    const fenetre = this.fenetre();
    return optionsCalendrier({
      initialView: 'timeGridWeek',
      initialDate: untracked(() => this.dateInitiale()),
      headerToolbar: { start: 'prev,next today', center: 'title', end: 'timeGridWeek,timeGridDay' },
      selectable: mode === 'periode',
      selectMirror: true,
      selectAllow: fenetre ? (plage) => plage.start >= fenetre.debut && plage.end <= fenetre.fin : undefined,
      select: (info: DateSelectInfo) => this.choisir.emit({ debut: info.start, fin: info.end }),
      dateClick: mode === 'creneau' ? (info: DateClickInfo) => this.choisirCreneau(info.date) : undefined,
      // Pas d'option `events` : chaque changement de celle-ci retire toutes les autres sources du calendrier.
      eventSources: [[...this.fond(fenetre), ...this.selection(), ...this.evenements()], ...this.sources()],
      eventClick: (info: EventClickInfo) => this.cliquer(info),
      eventDrop: (info: EventDropInfo) => this.evenementModifie.emit(info),
      eventResize: (info: EventResizeDoneInfo) => this.evenementModifie.emit(info),
    });
  });

  private cliquer(info: EventClickInfo): void {
    const demandeId: unknown = info.event.extendedProps['demandeId'];
    if (typeof demandeId === 'string') {
      this.evenementClique.emit({ demandeId, ancre: info.el.getBoundingClientRect() });
    }
  }

  private choisirCreneau(debut: Date): void {
    const fin = ajouterMinutes(debut, this.dureeMinutes());
    const fenetre = this.fenetre();
    if (fenetre && (debut < fenetre.debut || fin > fenetre.fin)) {
      return;
    }

    this.choisir.emit({ debut, fin });
  }

  private dateInitiale(): Date {
    return dateValide(this.debut()) ?? this.fenetre()?.debut ?? new Date();
  }

  private fond(fenetre: PlageHoraire | null): EventInput[] {
    return fenetre
      ? [{ id: 'fenetre', start: fenetre.debut, end: fenetre.fin, display: 'background', color: COULEUR_SELECTION }]
      : [];
  }

  private selection(): EventInput[] {
    const debut = dateValide(this.debut());
    if (!debut) {
      return [];
    }

    const fin = this.mode() === 'creneau' ? ajouterMinutes(debut, this.dureeMinutes()) : dateValide(this.fin());
    if (!fin || fin <= debut) {
      return [];
    }

    return [{
      id: 'selection',
      title: this.mode() === 'creneau' ? 'Créneau choisi' : 'Période souhaitée',
      start: debut,
      end: fin,
      color: COULEUR_SELECTION,
    }];
  }
}
