import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlashService } from '../../../core/services/flash.service';
import { IconeComponent } from '../icone/icone.component';

@Component({
  selector: 'app-flash',
  imports: [IconeComponent],
  template: `
    <div class="pointer-events-none fixed top-20 right-4 z-[60] grid w-[min(24rem,calc(100vw-2rem))] gap-2" aria-live="polite">
      @for (message of flash.messages(); track message.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border bg-paper px-4 py-3 text-sm shadow-lg"
          [class.border-sage]="message.ton === 'succes'"
          [class.border-danger]="message.ton === 'erreur'"
          [attr.role]="message.ton === 'erreur' ? 'alert' : 'status'"
        >
          <app-icone
            [nom]="message.ton === 'succes' ? 'succes' : 'alerte'"
            [class.text-sage]="message.ton === 'succes'"
            [class.text-danger]="message.ton === 'erreur'"
          />
          <p class="m-0 flex-1 text-texte">{{ message.texte }}</p>
          <button type="button" class="bouton-icone -m-1 size-7" aria-label="Fermer le message" (click)="flash.fermer(message.id)">
            <app-icone nom="croix" [taille]="4" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashComponent {
  readonly flash = inject(FlashService);
}
