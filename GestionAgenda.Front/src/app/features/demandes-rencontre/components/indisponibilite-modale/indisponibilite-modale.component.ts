import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlashService } from '../../../../core/services/flash.service';
import { PlageHoraire, versSaisieLocale } from '../../../../shared/calendrier/calendrier.config';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { DirigeantGere, TYPES_INDISPONIBILITE, TypeIndisponibilite } from '../../models/indisponibilite.model';
import { messageApi } from '../../models/message-api';
import { IndisponibilitesApiService } from '../../services/indisponibilites-api.service';

@Component({
  selector: 'app-indisponibilite-modale',
  imports: [ReactiveFormsModule, FieldErrorComponent, IconeComponent],
  templateUrl: './indisponibilite-modale.component.html',
  host: { '(document:keydown.escape)': 'fermer.emit()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndisponibiliteModaleComponent implements OnInit {
  private readonly api = inject(IndisponibilitesApiService);
  private readonly flash = inject(FlashService);
  private readonly destroyRef = inject(DestroyRef);
  readonly plage = input<PlageHoraire | null>(null);
  readonly fermer = output<void>();
  readonly creee = output<void>();
  readonly types = TYPES_INDISPONIBILITE;
  readonly dirigeants = signal<DirigeantGere[]>([]);
  readonly alerte = signal('');
  readonly envoi = signal(false);
  readonly form = new FormGroup({
    dirigeant: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<TypeIndisponibilite>('TempsBloque', { nonNullable: true }),
    motif: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    debut: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fin: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.api.dirigeants().pipe(takeUntilDestroyed()).subscribe({
      next: (dirigeants) => {
        this.dirigeants.set(dirigeants);
        if (dirigeants.length === 1) {
          this.form.controls.dirigeant.setValue(cle(dirigeants[0]));
        }
      },
      error: (erreur: unknown) => this.alerte.set(messageApi(erreur)),
    });
  }

  ngOnInit(): void {
    const plage = this.plage();
    if (plage) {
      this.form.patchValue({ debut: versSaisieLocale(plage.debut), fin: versSaisieLocale(plage.fin) });
    }
  }

  cle(dirigeant: DirigeantGere): string {
    return cle(dirigeant);
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeur = this.form.getRawValue();
    const debut = new Date(valeur.debut);
    const fin = new Date(valeur.fin);
    if (fin <= debut) {
      this.alerte.set('La fin doit être postérieure au début.');
      return;
    }

    const [dirigeantId, societeId] = valeur.dirigeant.split('|');
    this.envoi.set(true);
    this.api.creer({
      dirigeantId,
      societeId,
      type: valeur.type,
      motif: valeur.motif,
      debut: debut.toISOString(),
      fin: fin.toISOString(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.flash.succes('L\'indisponibilité a été ajoutée.');
          this.creee.emit();
        },
        error: (erreur: unknown) => {
          this.envoi.set(false);
          this.alerte.set(messageApi(erreur));
        },
      });
  }
}

function cle(dirigeant: DirigeantGere): string {
  return `${dirigeant.dirigeantId}|${dirigeant.societeId}`;
}
