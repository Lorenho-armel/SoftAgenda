import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const APPARENCES: Record<string, string> = {
  critique: 'bg-navy text-paper',
  urgent: 'bg-gold text-ink',
  normal: 'bg-sage text-ink',
  haute: 'bg-gold-light text-ink',
  moyenne: 'bg-navy-soft text-paper',
  faible: 'border border-sage bg-paper text-navy',
};

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input.required<string>();
  readonly classes = computed(() =>
    `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold before:size-2 before:shrink-0 before:rounded-full before:bg-current before:content-[''] ${APPARENCES[this.tone()] ?? APPARENCES['normal']}`);
}
