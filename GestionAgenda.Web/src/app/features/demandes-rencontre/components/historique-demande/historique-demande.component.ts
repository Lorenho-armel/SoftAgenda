import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HistoriqueDemande } from '../../models/demande.model';
import { libelleStatut } from '../../models/demande-libelles';

@Component({
  selector: 'app-historique-demande',
  imports: [DatePipe],
  templateUrl: './historique-demande.component.html',
  styleUrl: './historique-demande.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoriqueDemandeComponent {
  readonly historique = input.required<HistoriqueDemande[]>();
  readonly lignes = computed(() => this.historique().map((evenement) => ({
    id: evenement.id,
    typeEvenement: evenement.typeEvenement,
    dateCreation: evenement.dateCreation,
    commentaire: evenement.commentaire,
    statut: evenement.statutApres ? libelleStatut(evenement.statutApres) : '',
  })));
}
