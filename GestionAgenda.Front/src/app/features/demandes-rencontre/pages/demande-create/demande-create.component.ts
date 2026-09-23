import { DestroyRef, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { PRIORITES, TYPES, URGENCES } from '../../models/demande.model';
import { libelleStatut } from '../../models/demande-libelles';
import { messageApi } from '../../models/message-api';
import { DemandesApiService } from '../../services/demandes-api.service';

@Component({
  selector: 'app-demande-create',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './demande-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeCreateComponent {
  private readonly api = inject(DemandesApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly alerte = signal('');
  readonly urgences = URGENCES;
  readonly priorites = PRIORITES;
  readonly types = TYPES.map((valeur) => ({ valeur, libelle: libelleStatut(valeur) }));
  readonly form = new FormGroup({
    dirigeantId: new FormControl('', { nonNullable: true, validators: [Validators.required, guidValide] }),
    societeId: new FormControl('', { nonNullable: true, validators: [Validators.required, guidValide] }),
    type: new FormControl<'RendezVous' | 'Reunion'>('RendezVous', { nonNullable: true }),
    motif: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(500)] }),
    dateDebutSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateFinSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dureeMinutes: new FormControl(60, { nonNullable: true, validators: [Validators.required, Validators.min(15), Validators.max(480)] }),
    urgence: new FormControl<'Normal' | 'Urgent' | 'Critique'>('Normal', { nonNullable: true }),
    priorite: new FormControl<'Faible' | 'Moyenne' | 'Haute' | 'Critique'>('Moyenne', { nonNullable: true }),
    salleSouhaiteeId: new FormControl('', { nonNullable: true, validators: [guidOptionnel] }),
    participants: new FormArray<FormGroup<{
      utilisateurId: FormControl<string>;
      nomComplet: FormControl<string>;
      email: FormControl<string>;
    }>>([]),
  });

  ajouterParticipant(): void {
    this.form.controls.participants.push(new FormGroup({
      utilisateurId: new FormControl('', { nonNullable: true, validators: [guidOptionnel] }),
      nomComplet: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(256)] }),
    }));
  }

  retirerParticipant(index: number): void {
    this.form.controls.participants.removeAt(index);
  }

  enregistrer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeur = this.form.getRawValue();
    const participants = valeur.participants.filter((participant) =>
      participant.utilisateurId || participant.nomComplet || participant.email);
    const message = messageSaisie(valeur, participants);
    this.alerte.set(message);
    if (message) {
      return;
    }

    this.api.creer({ ...valeur, participants })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (demande) => void this.router.navigate(['/demandes-rencontre', demande.id]),
        error: (erreur: unknown) => this.alerte.set(messageApi(erreur)),
      });
  }
}

const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function guidValide(control: AbstractControl): ValidationErrors | null {
  return GUID.test(String(control.value ?? '')) ? null : { pattern: true };
}

function guidOptionnel(control: AbstractControl): ValidationErrors | null {
  const valeur = String(control.value ?? '');
  return valeur.length === 0 || GUID.test(valeur) ? null : { pattern: true };
}

function messageSaisie(
  valeur: { type: string; dateDebutSouhaitee: string; dateFinSouhaitee: string; dureeMinutes: number },
  participants: { utilisateurId: string; nomComplet: string; email: string }[],
): string {
  const debut = new Date(valeur.dateDebutSouhaitee);
  const fin = new Date(valeur.dateFinSouhaitee);
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin <= debut) {
    return 'La fin de la période souhaitée doit être postérieure au début.';
  }

  if (debut.getTime() <= Date.now()) {
    return 'La période souhaitée doit commencer dans le futur.';
  }

  if (valeur.dureeMinutes > (fin.getTime() - debut.getTime()) / 60_000) {
    return 'La durée dépasse la période souhaitée.';
  }

  if (valeur.type === 'Reunion' && participants.length === 0) {
    return 'Une réunion comporte au moins un participant en plus du dirigeant.';
  }

  const incoherent = participants.some((participant) => {
    const interne = participant.utilisateurId.length > 0;
    const externe = participant.nomComplet.length > 0 && participant.email.length > 0;
    return interne === externe;
  });
  return incoherent
    ? 'Un participant interne a un utilisateur ; un participant externe a un nom et un e-mail.'
    : '';
}
