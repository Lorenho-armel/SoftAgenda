import { CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';
import monarchTheme from '@fullcalendar/angular/themes/monarch';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import frLocale from 'fullcalendar/locales/fr';

export interface EvenementClique {
  demandeId: string;
  ancre: DOMRect;
}

export interface PlageHoraire {
  debut: Date;
  fin: Date;
}

export const COULEUR_SELECTION = '#bc9c22';
export const COULEUR_CONFLIT = '#b42318';

export function optionsCalendrier(options: CalendarOptions): CalendarOptions {
  return {
    plugins: [monarchTheme, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    locale: frLocale,
    firstDay: 1,
    height: 'auto',
    nowIndicator: true,
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    businessHours: { daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00' },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    slotHeaderFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    snapDuration: '00:15:00',
    eventAllow: (plage) => plage.start >= new Date(),
    ...options,
  };
}

export function versSaisieLocale(date: Date): string {
  const deuxChiffres = (valeur: number) => String(valeur).padStart(2, '0');
  return `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`
    + `T${deuxChiffres(date.getHours())}:${deuxChiffres(date.getMinutes())}`;
}

export function dateValide(valeur: string | null | undefined): Date | null {
  if (!valeur) {
    return null;
  }

  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ajouterMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
