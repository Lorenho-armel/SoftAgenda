import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { DemandeResume } from '../../models/demande.model';
import { libelleJour, libelleStatut, tonPriorite, tonUrgence } from '../../models/demande-libelles';

@Component({
  selector: 'app-demande-ligne',
  imports: [BadgeComponent, RouterLink],
  templateUrl: './demande-ligne.component.html',
  styleUrl: './demande-ligne.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeLigneComponent {
  readonly demande = input.required<DemandeResume>();
  readonly actionsRapides = input(false);
  readonly analyser = output<string>();
  readonly accepter = output<string>();
  readonly jour = computed(() => libelleJour(this.demande().dateDebutSouhaitee));
  readonly tonUrgence = computed(() => tonUrgence(this.demande().urgence));
  readonly tonPriorite = computed(() => tonPriorite(this.demande().priorite));
  readonly statut = computed(() => libelleStatut(this.demande().statut));
  readonly client = computed(() => this.demande().demandeurNom || this.demande().societeNom || 'Client');
}
