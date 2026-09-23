import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly message = computed(() => messageControle(this.control()));
}

function messageControle(control: AbstractControl | null): string {
  if (!control || !control.touched || !control.errors) {
    return '';
  }

  if (control.hasError('required')) {
    return 'Ce champ est obligatoire.';
  }

  if (control.hasError('pattern')) {
    return 'Identifiant invalide.';
  }

  if (control.hasError('email')) {
    return 'Adresse e-mail invalide.';
  }

  if (control.hasError('minlength')) {
    return `Au moins ${longueur(control, 'minlength')} caractères.`;
  }

  if (control.hasError('maxlength')) {
    return `Au plus ${longueur(control, 'maxlength')} caractères.`;
  }

  if (control.hasError('min') || control.hasError('max')) {
    return 'La valeur est hors limites.';
  }

  return 'Valeur invalide.';
}

function longueur(control: AbstractControl, cle: string): number {
  const erreur: unknown = control.getError(cle);
  if (typeof erreur === 'object' && erreur !== null && 'requiredLength' in erreur) {
    const valeur = erreur.requiredLength;
    return typeof valeur === 'number' ? valeur : 0;
  }

  return 0;
}
