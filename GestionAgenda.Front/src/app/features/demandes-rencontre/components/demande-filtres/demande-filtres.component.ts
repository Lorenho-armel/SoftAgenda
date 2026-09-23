import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  FiltreDemande,
  PRIORITES,
  PersonneOption,
  STATUTS,
  TYPES,
  URGENCES,
  SocieteOption,
} from '../../models/demande.model';
import { libelleStatut } from '../../models/demande-libelles';

@Component({
  selector: 'app-demande-filtres',
  imports: [ReactiveFormsModule],
  templateUrl: './demande-filtres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeFiltresComponent {
  readonly societes = input<SocieteOption[]>([]);
  readonly demandeurs = input<PersonneOption[]>([]);
  readonly appliquer = output<FiltreDemande>();
  readonly urgences = URGENCES;
  readonly priorites = PRIORITES;
  readonly statuts = STATUTS.map((valeur) => ({ valeur, libelle: libelleStatut(valeur) }));
  readonly types = TYPES.map((valeur) => ({ valeur, libelle: libelleStatut(valeur) }));
  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    urgence: new FormControl<FiltreDemande['urgence']>('', { nonNullable: true }),
    priorite: new FormControl<FiltreDemande['priorite']>('', { nonNullable: true }),
    statut: new FormControl<FiltreDemande['statut']>('', { nonNullable: true }),
    type: new FormControl<FiltreDemande['type']>('', { nonNullable: true }),
    societeId: new FormControl('', { nonNullable: true }),
    demandeurId: new FormControl('', { nonNullable: true }),
    dateDebut: new FormControl('', { nonNullable: true }),
    dateFin: new FormControl('', { nonNullable: true }),
    sortBy: new FormControl('', { nonNullable: true }),
    sortDirection: new FormControl<'asc' | 'desc'>('asc', { nonNullable: true }),
  });

  soumettre(): void {
    const valeur = this.form.getRawValue();
    this.appliquer.emit({ ...valeur, vue: '' });
  }
}
