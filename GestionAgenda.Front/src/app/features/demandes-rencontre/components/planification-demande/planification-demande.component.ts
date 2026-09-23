import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { BilanPlanification } from '../../models/demande.model';

export interface CreneauConfirme {
  debutPlanifie: string;
  salleId: string | null;
}

@Component({
  selector: 'app-planification-demande',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './planification-demande.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanificationDemandeComponent {
  readonly visible = input(false);
  readonly bilan = input<BilanPlanification | null>(null);
  readonly verifier = output<CreneauConfirme>();
  readonly planifier = output<CreneauConfirme>();
  readonly form = new FormGroup({
    debutPlanifie: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    salleId: new FormControl('', { nonNullable: true }),
  });

  controler(): void {
    const creneau = this.lire();
    if (creneau) {
      this.verifier.emit(creneau);
    }
  }

  confirmer(): void {
    const creneau = this.lire();
    if (creneau) {
      this.planifier.emit(creneau);
    }
  }

  private lire(): CreneauConfirme | null {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return null;
    }

    const valeur = this.form.getRawValue();
    return {
      debutPlanifie: new Date(valeur.debutPlanifie).toISOString(),
      salleId: valeur.salleId || null,
    };
  }
}
