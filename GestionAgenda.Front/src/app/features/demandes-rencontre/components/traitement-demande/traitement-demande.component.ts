import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlageHoraire } from '../../../../shared/calendrier/calendrier.config';
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
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './traitement-demande.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraitementDemandeComponent {
  readonly statut = input.required<StatutDemande>();
  readonly proposition = input<PlageHoraire | null>(null);
  readonly decider = output<DecisionDemande>();
  readonly annulerDeplacement = output<void>();
  readonly peutDecider = computed(() => this.statut() === 'EnAttente' || this.statut() === 'EnAnalyse');
  readonly libelleProposition = computed(() => {
    const periode = this.proposition();
    return periode ? `du ${horodatage(periode.debut)} au ${horodatage(periode.fin)}` : '';
  });
  readonly refus = new FormGroup({
    commentaire: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
  });
  readonly report = new FormGroup({
    commentaire: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
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

  terminer(): void {
    this.decider.emit({ statut: 'Terminee', commentaire: '', dateDebutSouhaitee: null, dateFinSouhaitee: null });
  }

  reporter(): void {
    const periode = this.proposition();
    if (!periode) {
      return;
    }

    if (this.report.invalid) {
      this.report.markAllAsTouched();
      return;
    }

    this.decider.emit({
      statut: 'Reportee',
      commentaire: this.report.controls.commentaire.value,
      dateDebutSouhaitee: periode.debut.toISOString(),
      dateFinSouhaitee: periode.fin.toISOString(),
    });
  }
}

function horodatage(date: Date): string {
  return date.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}
