import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { FlashService } from '../../../../core/services/flash.service';
import { versSaisieLocale } from '../../../../shared/calendrier/calendrier.config';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import {
  DemandeDetail,
  STATUTS_MODIFIABLES,
  SalleOption,
  StatutDemande,
  TYPES,
  TypeDemande,
} from '../../models/demande.model';
import { libelleStatut } from '../../models/demande-libelles';
import { COULEURS_STATUT } from '../../models/evenements-calendrier';
import { messageApi } from '../../models/message-api';
import { DemandesApiService } from '../../services/demandes-api.service';
import { ReferentielApiService } from '../../services/referentiel-api.service';

type Mode = 'apercu' | 'modifier' | 'supprimer';

const STATUTS_TERMINAUX: readonly StatutDemande[] = ['Refusee', 'Terminee', 'Annulee'];

@Component({
  selector: 'app-demande-apercu',
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, IconeComponent],
  templateUrl: './demande-apercu.component.html',
  host: { '(document:keydown.escape)': 'fermer.emit()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeApercuComponent implements OnInit {
  private readonly api = inject(DemandesApiService);
  private readonly referentiel = inject(ReferentielApiService);
  private readonly flash = inject(FlashService);
  private readonly destroyRef = inject(DestroyRef);

  readonly demandeId = input.required<string>();
  readonly ancre = input<DOMRect | null>(null);
  readonly fermer = output();
  readonly modifiee = output<DemandeDetail>();
  readonly supprimee = output<string>();

  readonly demande = signal<DemandeDetail | null>(null);
  readonly salles = signal<SalleOption[]>([]);
  readonly mode = signal<Mode>('apercu');
  readonly alerte = signal('');
  readonly envoi = signal(false);
  readonly types = TYPES.map((valeur) => ({ valeur, libelle: libelleStatut(valeur) }));
  readonly libelleStatut = libelleStatut;
  readonly couleur = computed(() => {
    const demande = this.demande();
    return demande ? COULEURS_STATUT[demande.statut] : 'transparent';
  });
  readonly position = computed(() => {
    const ancre = this.ancre();
    return ancre && this.mode() !== 'modifier' ? positionBulle(ancre) : null;
  });
  readonly libelleDate = computed(() => {
    const demande = this.demande();
    return demande ? libellePeriode(new Date(demande.dateDebutSouhaitee), new Date(demande.dateFinSouhaitee)) : '';
  });
  readonly modifiable = computed(() => STATUTS_MODIFIABLES.includes(this.demande()?.statut ?? 'Annulee'));
  readonly supprimable = computed(() => !STATUTS_TERMINAUX.includes(this.demande()?.statut ?? 'Annulee'));

  readonly form = new FormGroup({
    type: new FormControl<TypeDemande>('RendezVous', { nonNullable: true }),
    motif: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(500)] }),
    dateDebutSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateFinSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dureeMinutes: new FormControl(60, { nonNullable: true, validators: [Validators.required, Validators.min(15), Validators.max(480)] }),
    salleSouhaiteeId: new FormControl('', { nonNullable: true }),
  });
  readonly motifSuppression = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    this.api.obtenir(this.demandeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (demande) => this.demande.set(demande),
        error: (erreur: unknown) => this.alerte.set(messageApi(erreur)),
      });
  }

  modifier(): void {
    const demande = this.demande();
    if (!demande) {
      return;
    }

    this.form.reset({
      type: demande.type,
      motif: demande.motif,
      dateDebutSouhaitee: versSaisieLocale(new Date(demande.dateDebutSouhaitee)),
      dateFinSouhaitee: versSaisieLocale(new Date(demande.dateFinSouhaitee)),
      dureeMinutes: demande.dureeMinutes,
      salleSouhaiteeId: demande.salleSouhaiteeId ?? '',
    });
    this.referentiel.societe(demande.societeId)
      .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe((societe) => this.salles.set(societe?.salles ?? []));
    this.basculer('modifier');
  }

  supprimer(): void {
    this.motifSuppression.reset('');
    this.basculer('supprimer');
  }

  basculer(mode: Mode): void {
    this.alerte.set('');
    this.mode.set(mode);
  }

  enregistrer(): void {
    const demande = this.demande();
    if (!demande || this.envoi()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeur = this.form.getRawValue();
    const message = messagePeriode(valeur.dateDebutSouhaitee, valeur.dateFinSouhaitee, valeur.dureeMinutes);
    this.alerte.set(message);
    if (message) {
      return;
    }

    this.envoi.set(true);
    this.api.modifier(demande.id, {
      ...valeur,
      participants: demande.participants.map((participant) => ({
        utilisateurId: participant.utilisateurId ?? '',
        nomComplet: participant.nomComplet ?? '',
        email: participant.email ?? '',
      })),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (modifiee) => {
          this.envoi.set(false);
          this.demande.set(modifiee);
          this.mode.set('apercu');
          this.flash.succes('La demande a été modifiée avec succès.');
          this.modifiee.emit(modifiee);
        },
        error: (erreur: unknown) => {
          this.envoi.set(false);
          this.alerte.set(messageApi(erreur));
        },
      });
  }

  confirmerSuppression(): void {
    const demande = this.demande();
    if (!demande || this.envoi()) {
      return;
    }

    if (this.motifSuppression.invalid || !this.motifSuppression.value.trim()) {
      this.motifSuppression.markAsTouched();
      this.alerte.set('Indiquez le motif de la suppression.');
      return;
    }

    this.envoi.set(true);
    this.api.annuler(demande.id, this.motifSuppression.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.envoi.set(false);
          this.flash.succes('La demande a été supprimée avec succès.');
          this.supprimee.emit(demande.id);
        },
        error: (erreur: unknown) => {
          this.envoi.set(false);
          this.alerte.set(messageApi(erreur));
        },
      });
  }
}

const LARGEUR_BULLE = 416;
const HAUTEUR_BULLE_ESTIMEE = 340;
const MARGE = 16;
const ECART = 12;

function positionBulle(ancre: DOMRect): { top: number; left: number; largeur: number } {
  const largeur = Math.min(LARGEUR_BULLE, window.innerWidth - 2 * MARGE);
  let left = (window.innerWidth - largeur) / 2;
  if (ancre.left - ECART - largeur >= MARGE) {
    left = ancre.left - ECART - largeur;
  } else if (ancre.right + ECART + largeur <= window.innerWidth - MARGE) {
    left = ancre.right + ECART;
  }

  const top = Math.max(MARGE, Math.min(ancre.top, window.innerHeight - HAUTEUR_BULLE_ESTIMEE - MARGE));
  return { top, left, largeur };
}

function libellePeriode(debut: Date, fin: Date): string {
  const jour = (date: Date) => {
    const texte = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return texte.charAt(0).toUpperCase() + texte.slice(1);
  };
  const heure = (date: Date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return debut.toDateString() === fin.toDateString()
    ? `${jour(debut)} · De ${heure(debut)} à ${heure(fin)}`
    : `Du ${jour(debut)} ${heure(debut)} au ${jour(fin)} ${heure(fin)}`;
}

function messagePeriode(debutSaisi: string, finSaisie: string, dureeMinutes: number): string {
  const debut = new Date(debutSaisi);
  const fin = new Date(finSaisie);
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin <= debut) {
    return 'La fin de la période souhaitée doit être postérieure au début.';
  }

  return dureeMinutes > (fin.getTime() - debut.getTime()) / 60_000
    ? 'La durée dépasse la période souhaitée.'
    : '';
}
