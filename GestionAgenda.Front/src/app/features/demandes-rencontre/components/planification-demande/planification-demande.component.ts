import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventInput } from '@fullcalendar/angular';
import { CalendrierSaisieComponent } from '../../../../shared/calendrier/calendrier-saisie.component';
import {
  COULEUR_CONFLIT,
  PlageHoraire,
  ajouterMinutes,
  dateValide,
  versSaisieLocale,
} from '../../../../shared/calendrier/calendrier.config';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { BilanPlanification, SalleOption } from '../../models/demande.model';

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
  readonly debutActuel = input<string | null>(null);
  readonly salleActuelle = input<string | null>(null);
  readonly salles = input<SalleOption[]>([]);
  readonly verifier = output<CreneauConfirme>();
  readonly planifier = output<CreneauConfirme>();
  readonly erreurCreneau = signal('');
  readonly form = new FormGroup({
    debutPlanifie: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    salleId: new FormControl('', { nonNullable: true }),
  });
  readonly fenetre = computed<PlageHoraire | null>(() => {
    const debut = dateValide(this.debutSouhaite());
    const fin = dateValide(this.finSouhaitee());
    return debut && fin && fin > debut ? { debut, fin } : null;
  });
  readonly bornes = computed(() => {
    const fenetre = this.fenetre();
    if (!fenetre) {
      return null;
    }

    const dernierDebut = ajouterMinutes(fenetre.fin, -this.dureeMinutes());
    return { min: versSaisieLocale(fenetre.debut), max: versSaisieLocale(dernierDebut), premier: fenetre.debut, dernier: dernierDebut };
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

  constructor() {
    effect(() => {
      const debut = dateValide(this.debutActuel() ?? '') ?? this.fenetre()?.debut;
      if (debut && !this.form.controls.debutPlanifie.dirty) {
        this.form.controls.debutPlanifie.setValue(versSaisieLocale(debut));
      }

      const salle = this.salleActuelle();
      if (salle && !this.form.controls.salleId.dirty) {
        this.form.controls.salleId.setValue(salle);
      }
    });
  }

  choisirCreneau(plage: PlageHoraire): void {
    this.form.controls.debutPlanifie.setValue(versSaisieLocale(plage.debut));
    this.form.controls.debutPlanifie.markAsDirty();
    this.erreurCreneau.set('');
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
    this.erreurCreneau.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return null;
    }

    const valeur = this.form.getRawValue();
    const debut = new Date(valeur.debutPlanifie);
    const bornes = this.bornes();
    if (bornes && (debut < bornes.premier || debut > bornes.dernier)) {
      this.erreurCreneau.set(
        `Le rendez-vous (${this.dureeMinutes()} min) doit tenir dans la période souhaitée : `
        + `choisissez un début entre le ${formater(bornes.premier)} et le ${formater(bornes.dernier)}.`,
      );
      return null;
    }

    return {
      debutPlanifie: debut.toISOString(),
      salleId: valeur.salleId || null,
    };
  }
}

function formater(date: Date): string {
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}
