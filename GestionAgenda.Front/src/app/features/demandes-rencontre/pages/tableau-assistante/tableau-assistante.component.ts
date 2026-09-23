import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { DemandeLigneComponent } from '../../components/demande-ligne/demande-ligne.component';
import { RencontreLigneComponent } from '../../components/rencontre-ligne/rencontre-ligne.component';
import { CompteursTableau } from '../../models/tableau-assistante.model';
import { TableauAssistanteApiService } from '../../services/tableau-assistante-api.service';

interface CarteTableau {
  libelle: string;
  valeur: number;
  route: string;
  params: Record<string, string> | null;
  ancre: string | null;
}

@Component({
  selector: 'app-tableau-assistante',
  imports: [RouterLink, DemandeLigneComponent, RencontreLigneComponent],
  templateUrl: './tableau-assistante.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableauAssistanteComponent {
  private readonly api = inject(TableauAssistanteApiService);
  readonly tableau = toSignal(this.api.obtenir().pipe(catchError(() => of(null))));
  readonly cartes = computed(() => {
    const tableau = this.tableau();
    return tableau ? cartesDe(tableau.compteurs) : [];
  });
}

function cartesDe(compteurs: CompteursTableau): CarteTableau[] {
  return [
    versFile('À traiter', compteurs.aTraiter, { vue: 'EnAttente' }),
    versFile('Urgentes', compteurs.urgentes, { vue: 'Urgentes' }),
    versFile('Critiques', compteurs.critiques, { vue: 'Critiques' }),
    versFile('Prioritaires', compteurs.prioritaires, { vue: 'Prioritaires' }),
    versFile('Acceptées', compteurs.acceptees, { statut: 'Acceptee' }),
    versFile('Reportées', compteurs.reportees, { statut: 'Reportee' }),
    versAncre("Planifiées aujourd'hui", compteurs.planifieesAujourdhui, '#aujourdhui'),
  ];
}

function versFile(libelle: string, valeur: number, params: Record<string, string>): CarteTableau {
  return { libelle, valeur, route: '/demandes-rencontre/file', params, ancre: null };
}

function versAncre(libelle: string, valeur: number, ancre: string): CarteTableau {
  return { libelle, valeur, route: '', params: null, ancre };
}
