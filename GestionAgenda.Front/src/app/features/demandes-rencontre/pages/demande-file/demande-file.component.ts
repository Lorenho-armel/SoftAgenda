import { DestroyRef, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, finalize, of, switchMap, tap } from 'rxjs';
import { PagerComponent } from '../../../../shared/components/pager/pager.component';
import { DemandeFiltresComponent } from '../../components/demande-filtres/demande-filtres.component';
import { DemandeLigneComponent } from '../../components/demande-ligne/demande-ligne.component';
import { FiltreDemande, VUES, VueFile, filtreInitial } from '../../models/demande.model';
import { DemandesApiService } from '../../services/demandes-api.service';

@Component({
  selector: 'app-demande-file',
  imports: [DemandeFiltresComponent, DemandeLigneComponent, PagerComponent],
  templateUrl: './demande-file.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeFileComponent {
  private readonly api = inject(DemandesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filtre = signal(filtreInitial(
    this.route.snapshot.queryParamMap.get('vue'),
    this.route.snapshot.queryParamMap.get('statut'),
  ));
  private readonly page = signal(1);
  private readonly version = signal(0);
  readonly vues = VUES;
  readonly chargement = signal(false);
  readonly file = toSignal(
    combineLatest([toObservable(this.filtre), toObservable(this.page), toObservable(this.version)]).pipe(
      tap(() => this.chargement.set(true)),
      switchMap(([filtre, page]) => this.api.file(filtre, page, 10).pipe(
        finalize(() => this.chargement.set(false)),
        catchError(() => of(null)),
      )),
    ),
  );
  readonly vueActive = this.filtre.asReadonly();

  choisirVue(vue: VueFile): void {
    this.page.set(1);
    this.filtre.update((actuel) => ({ ...actuel, vue: actuel.vue === vue ? '' : vue }));
  }

  filtrer(filtre: FiltreDemande): void {
    this.page.set(1);
    this.filtre.set({ ...filtre, vue: this.filtre().vue });
  }

  changerPage(page: number): void {
    this.page.set(page);
  }

  analyser(id: string): void {
    this.traiter(id, 'EnAnalyse');
  }

  accepter(id: string): void {
    this.traiter(id, 'Acceptee');
  }

  private traiter(id: string, statut: 'EnAnalyse' | 'Acceptee'): void {
    this.api.changerStatut(id, statut, null, { debut: null, fin: null }, null, null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.version.update((valeur) => valeur + 1));
  }
}
