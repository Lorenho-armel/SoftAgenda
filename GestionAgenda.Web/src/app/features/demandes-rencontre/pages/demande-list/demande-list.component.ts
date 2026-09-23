import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { PagerComponent } from '../../../../shared/components/pager/pager.component';
import { DemandeFiltresComponent } from '../../components/demande-filtres/demande-filtres.component';
import { DemandeLigneComponent } from '../../components/demande-ligne/demande-ligne.component';
import { FiltreDemande, filtreVide } from '../../models/demande.model';
import { DemandesApiService } from '../../services/demandes-api.service';

@Component({
  selector: 'app-demande-list',
  imports: [DemandeFiltresComponent, DemandeLigneComponent, PagerComponent],
  templateUrl: './demande-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeListComponent {
  private readonly api = inject(DemandesApiService);
  private readonly filtre = signal(filtreVide());
  private readonly page = signal(1);
  readonly options = toSignal(this.api.file(filtreVide(), 1, 1).pipe(catchError(() => of(null))));
  readonly resultat = toSignal(
    combineLatest([toObservable(this.filtre), toObservable(this.page)]).pipe(
      switchMap(([filtre, page]) => this.api.lister(filtre, page, 10).pipe(catchError(() => of(null)))),
    ),
  );

  filtrer(filtre: FiltreDemande): void {
    this.page.set(1);
    this.filtre.set(filtre);
  }

  changerPage(page: number): void {
    this.page.set(page);
  }
}
