import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, catchError, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { HistoriqueDemandeComponent } from '../../components/historique-demande/historique-demande.component';
import { CreneauConfirme, PlanificationDemandeComponent } from '../../components/planification-demande/planification-demande.component';
import { DecisionDemande, TraitementDemandeComponent } from '../../components/traitement-demande/traitement-demande.component';
import { BilanPlanification, ConflitPlanification } from '../../models/demande.model';
import { messageApi } from '../../models/message-api';
import { libelleStatut, tonPriorite, tonUrgence } from '../../models/demande-libelles';
import { DemandesApiService } from '../../services/demandes-api.service';

@Component({
  selector: 'app-demande-detail',
  imports: [DatePipe, BadgeComponent, TraitementDemandeComponent, PlanificationDemandeComponent, HistoriqueDemandeComponent],
  templateUrl: './demande-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeDetailComponent {
  private readonly api = inject(DemandesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly version = signal(0);
  readonly bilan = signal<BilanPlanification | null>(null);
  readonly erreur = signal('');
  readonly demande = toSignal(
    combineLatest([
      this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
      toObservable(this.version),
    ]).pipe(
      filter(([id]) => id.length > 0),
      switchMap(([id]) => this.api.obtenir(id).pipe(
        tap(() => this.erreur.set('')),
        catchError((erreur: unknown) => {
          this.erreur.set(messageApi(erreur));
          return of(null);
        }),
      )),
    ),
  );
  readonly entete = computed(() => {
    const demande = this.demande();
    if (!demande) {
      return null;
    }

    return {
      demande,
      tonUrgence: tonUrgence(demande.urgence),
      tonPriorite: tonPriorite(demande.priorite),
      statut: libelleStatut(demande.statut),
      type: libelleStatut(demande.type),
      participants: demande.participants.map((participant) => ({
        id: participant.id,
        libelle: participant.nomComplet || participant.email || participant.utilisateurId || 'Participant',
      })),
    };
  });

  decider(decision: DecisionDemande): void {
    const id = this.demande()?.id;
    if (!id) {
      return;
    }

    this.erreur.set('');
    this.api.changerStatut(id, decision.statut, decision.commentaire || null, {
      debut: decision.dateDebutSouhaitee,
      fin: decision.dateFinSouhaitee,
    }, null, null)
      .pipe(
        catchError((erreur: unknown) => {
          this.erreur.set(messageApi(erreur));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.version.update((valeur) => valeur + 1));
  }

  verifier(creneau: CreneauConfirme): void {
    const id = this.demande()?.id;
    if (!id) {
      return;
    }

    this.erreur.set('');
    this.api.verifierCreneau(id, creneau.debutPlanifie, creneau.salleId)
      .pipe(
        catchError((erreur: unknown) => {
          this.erreur.set(messageApi(erreur));
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((bilan) => this.bilan.set(bilan));
  }

  planifier(creneau: CreneauConfirme): void {
    const id = this.demande()?.id;
    if (!id) {
      return;
    }

    const demande = this.demande();
    const appel = demande?.statut === 'Planifiee'
      ? this.api.deplacer(id, creneau.debutPlanifie, creneau.salleId)
      : this.api.changerStatut(id, 'Planifiee', null, { debut: null, fin: null }, creneau.debutPlanifie, creneau.salleId);
    this.erreur.set('');
    appel
      .pipe(
        catchError((erreur: unknown) => this.retenirConflits(erreur, creneau.debutPlanifie)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.bilan.set(null);
        this.version.update((valeur) => valeur + 1);
      });
  }

  private retenirConflits(erreur: unknown, debut: string) {
    if (erreur instanceof HttpErrorResponse && erreur.status === 409) {
      const corps = erreur.error as ApiResponse<ConflitPlanification[]>;
      this.bilan.set({
        debut,
        fin: debut,
        peutPlanifier: false,
        conflits: Array.isArray(corps.data) ? corps.data : [],
      });
    } else {
      this.erreur.set(messageApi(erreur));
    }

    return EMPTY;
  }
}
