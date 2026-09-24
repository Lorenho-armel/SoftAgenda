import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CalendarOptions, FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendrier',
  imports: [FullCalendarModule],
  template: '<full-calendar [options]="options()" />',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendrierComponent {
  readonly options = input.required<CalendarOptions>();
}
