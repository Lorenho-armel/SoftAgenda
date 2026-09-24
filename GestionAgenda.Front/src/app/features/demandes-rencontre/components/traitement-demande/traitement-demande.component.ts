import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventInput } from '@fullcalendar/angular';
import { CalendrierSaisieComponent } from '../../../../shared/calendrier/calendrier-saisie.component';
import { PlageHoraire, versSaisieLocale } from '../../../../shared/calendrier/calendrier.config';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { StatutDemande } from '../../models/demande.model';

export interface DecisionDemande {
  statut: StatutDemande;
  commentaire: string;
  dateDebutSouhaitee: string | null;
  dateFinSouhaitee: string | null;
}

@Component({
  selector: 'app-traitement-demande',
  imports: [ReactiveFormsModule, FieldErrorComponent, CalendrierSaisieComponent],
  templateUrl: './traitement-demande.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraitementDemandeComponent {
  readonly statut = input.required<StatutDemande>();
  readonly evenements = input<EventInput[]>([]);
  readonly decider = output<DecisionDemande>();
  readonly peutDecider = computed(() => this.statut() === 'EnAttente' || this.statut() === 'EnAnalyse');
  readonly refus = new FormGroup({
    commentaire: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
  });
  readonly report = new FormGroup({
    commentaire: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
    dateDebutSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateFinSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  analyser(): void {
    this.decider.emit({ statut: 'EnAnalyse', commentaire: '', dateDebutSouhaitee: null, dateFinSouhaitee: null });
  }

  accepter(): void {
    this.decider.emit({ statut: 'Acceptee', commentaire: '', dateDebutSouhaitee: null, dateFinSouhaitee: null });
  }

  refuser(): void {
    if (this.refus.invalid) {
      this.refus.markAllAsTouched();
      return;
    }

    this.decider.emit({
      statut: 'Refusee',
      commentaire: this.refus.controls.commentaire.value,
      dateDebutSouhaitee: null,
      dateFinSouhaitee: null,
    });
  }

  choisirReport(plage: PlageHoraire): void {
    this.report.patchValue({
      dateDebutSouhaitee: versSaisieLocale(plage.debut),
      dateFinSouhaitee: versSaisieLocale(plage.fin),
    });
  }

  terminer(): void {
    this.decider.emit({ statut: 'Terminee', commentaire: '', dateDebutSouhaitee: null, dateFinSouhaitee: null });
  }

  reporter(): void {
    if (this.report.invalid) {
      this.report.markAllAsTouched();
      return;
    }

    const valeur = this.report.getRawValue();
    this.decider.emit({
      statut: 'Reportee',
      commentaire: valeur.commentaire,
      dateDebutSouhaitee: new Date(valeur.dateDebutSouhaitee).toISOString(),
      dateFinSouhaitee: new Date(valeur.dateFinSouhaitee).toISOString(),
    });
  }
}
