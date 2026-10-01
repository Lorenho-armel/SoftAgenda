import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { FlashService } from '../../../../core/services/flash.service';
import { AccesAgendaGoogle, EtatAgendaGoogle } from '../../models/indisponibilite.model';
import { messageApi } from '../../models/message-api';
import { IndisponibilitesApiService } from '../../services/indisponibilites-api.service';

@Component({
  selector: 'app-google-agenda-panneau',
  templateUrl: './google-agenda-panneau.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleAgendaPanneauComponent {
  private readonly api = inject(IndisponibilitesApiService);
  private readonly flash = inject(FlashService);
  private readonly destroyRef = inject(DestroyRef);
  readonly etat = toSignal(
    this.api.etatAgendaGoogle().pipe(catchError(() => of<EtatAgendaGoogle | null>(null))),
    { initialValue: null },
  );
  readonly acces = signal<AccesAgendaGoogle[] | null>(null);
  readonly verificationEnCours = signal(false);

  verifier(): void {
    this.verificationEnCours.set(true);
    this.api.accesAgendaGoogle().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (acces) => {
        this.verificationEnCours.set(false);
        this.acces.set(acces);
      },
      error: (erreur: unknown) => {
        this.verificationEnCours.set(false);
        this.flash.erreur(messageApi(erreur));
      },
    });
  }

  resynchroniser(): void {
    this.api.resynchroniserAgendaGoogle().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.flash.succes('La publication des rencontres dans Google Agenda a été lancée en arrière-plan.'),
      error: (erreur: unknown) => this.flash.erreur(messageApi(erreur)),
    });
  }
}
