import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventInput } from '@fullcalendar/angular';
import { CalendrierSaisieComponent } from '../../../../shared/calendrier/calendrier-saisie.component';
import { COULEUR_CONFLIT, PlageHoraire, dateValide, versSaisieLocale } from '../../../../shared/calendrier/calendrier.config';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { BilanPlanification } from '../../models/demande.model';

export interface CreneauConfirme {
  debutPlanifie: string;
  salleId: string | null;
}

@Component({
  selector: 'app-planification-demande',
  imports: [ReactiveFormsModule, FieldErrorComponent, CalendrierSaisieComponent],
  templateUrl: './planification-demande.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanificationDemandeComponent {
  readonly visible = input(false);
  readonly confirmerLibelle = input('Planifier');
  readonly bilan = input<BilanPlanification | null>(null);
  readonly debutSouhaite = input('');
  readonly finSouhaitee = input('');
  readonly dureeMinutes = input(60);
  readonly verifier = output<CreneauConfirme>();
  readonly planifier = output<CreneauConfirme>();
  readonly form = new FormGroup({
    debutPlanifie: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    salleId: new FormControl('', { nonNullable: true }),
  });
  readonly fenetre = computed<PlageHoraire | null>(() => {
    const debut = dateValide(this.debutSouhaite());
    const fin = dateValide(this.finSouhaitee());
    return debut && fin && fin > debut ? { debut, fin } : null;
  });
  readonly conflits = computed<EventInput[]>(() =>
    (this.bilan()?.conflits ?? [])
      .filter((conflit) => conflit.debut && conflit.fin)
      .map((conflit, index) => ({
        id: `conflit-${index}`,
        title: conflit.titre ?? conflit.message,
        start: conflit.debut!,
        end: conflit.fin!,
        color: COULEUR_CONFLIT,
      })));

  choisirCreneau(plage: PlageHoraire): void {
    this.form.controls.debutPlanifie.setValue(versSaisieLocale(plage.debut));
    this.form.controls.debutPlanifie.markAsDirty();
  }

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
