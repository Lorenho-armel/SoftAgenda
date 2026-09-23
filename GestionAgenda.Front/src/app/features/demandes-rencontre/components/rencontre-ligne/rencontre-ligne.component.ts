import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { tonPriorite, tonUrgence } from '../../models/demande-libelles';
import { RencontreTableau } from '../../models/tableau-assistante.model';

@Component({
  selector: 'app-rencontre-ligne',
  imports: [DatePipe, RouterLink, BadgeComponent],
  templateUrl: './rencontre-ligne.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RencontreLigneComponent {
  readonly rencontre = input.required<RencontreTableau>();
  readonly tons = computed(() => ({
    urgence: tonUrgence(this.rencontre().urgence),
    priorite: tonPriorite(this.rencontre().priorite),
  }));
}
