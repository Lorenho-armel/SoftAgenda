import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { FlashService } from '../../../../core/services/flash.service';
import { EtatFeuille, RapportImport } from '../../models/indisponibilite.model';
import { messageApi } from '../../models/message-api';
import { IndisponibilitesApiService } from '../../services/indisponibilites-api.service';

@Component({
  selector: 'app-google-sheets-panneau',
  templateUrl: './google-sheets-panneau.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleSheetsPanneauComponent {
  private readonly api = inject(IndisponibilitesApiService);
  private readonly flash = inject(FlashService);
  private readonly destroyRef = inject(DestroyRef);
  readonly importe = output<void>();
  readonly etat = toSignal(this.api.etatFeuille().pipe(catchError(() => of<EtatFeuille | null>(null))), { initialValue: null });
  readonly rapport = signal<RapportImport | null>(null);
  readonly enCours = signal(false);

  importer(): void {
    this.enCours.set(true);
    this.api.importerFeuille().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (rapport) => {
        this.enCours.set(false);
        this.rapport.set(rapport);
        this.flash.succes(`Import terminé : ${rapport.demandesCreees} demande(s), ${rapport.indisponibilitesCreees} indisponibilité(s).`);
        this.importe.emit();
      },
      error: (erreur: unknown) => {
        this.enCours.set(false);
        this.flash.erreur(messageApi(erreur));
      },
    });
  }

  resynchroniser(): void {
    this.api.resynchroniserFeuille().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.flash.succes('La resynchronisation du Sheet a été lancée en arrière-plan.'),
      error: (erreur: unknown) => this.flash.erreur(messageApi(erreur)),
    });
  }
}
