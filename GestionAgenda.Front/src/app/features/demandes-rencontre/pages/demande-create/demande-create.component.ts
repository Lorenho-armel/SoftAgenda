import { DestroyRef, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EventDropInfo, EventResizeDoneInfo } from '@fullcalendar/angular';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap } from 'rxjs';
import { FlashService } from '../../../../core/services/flash.service';
import { CalendrierSaisieComponent } from '../../../../shared/calendrier/calendrier-saisie.component';
import { EvenementClique, PlageHoraire, dateValide, versSaisieLocale } from '../../../../shared/calendrier/calendrier.config';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { IconeComponent } from '../../../../shared/components/icone/icone.component';
import { PRIORITES, SocieteDetail, SocieteOption, TYPES, URGENCES } from '../../models/demande.model';
import { libelleStatut } from '../../models/demande-libelles';
import { DeplacementDemandeService } from '../../services/deplacement-demande.service';
import { sourceDemandes } from '../../services/source-demandes';
import { DemandeApercuComponent } from '../../components/demande-apercu/demande-apercu.component';
import { messageApi } from '../../models/message-api';
import { DemandesApiService } from '../../services/demandes-api.service';
import { ReferentielApiService } from '../../services/referentiel-api.service';

@Component({
  selector: 'app-demande-create',
  imports: [ReactiveFormsModule, FieldErrorComponent, CalendrierSaisieComponent, IconeComponent, DemandeApercuComponent],
  templateUrl: './demande-create.component.html',
  host: { '(document:keydown.escape)': 'fermerFormulaire()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandeCreateComponent {
  private readonly api = inject(DemandesApiService);
  private readonly referentiel = inject(ReferentielApiService);
  private readonly flash = inject(FlashService);
  private readonly deplacement = inject(DeplacementDemandeService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly alerte = signal('');
  readonly urgences = URGENCES;
  readonly priorites = PRIORITES;
  readonly types = TYPES.map((valeur) => ({ valeur, libelle: libelleStatut(valeur) }));
  readonly form = new FormGroup({
    dirigeantId: new FormControl('', { nonNullable: true, validators: [Validators.required, guidValide] }),
    societeId: new FormControl('', { nonNullable: true, validators: [Validators.required, guidValide] }),
    type: new FormControl<'RendezVous' | 'Reunion'>('RendezVous', { nonNullable: true }),
    motif: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(500)] }),
    dateDebutSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateFinSouhaitee: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dureeMinutes: new FormControl(60, { nonNullable: true, validators: [Validators.required, Validators.min(15), Validators.max(480)] }),
    urgence: new FormControl<'Normal' | 'Urgent' | 'Critique'>('Normal', { nonNullable: true }),
    priorite: new FormControl<'Faible' | 'Moyenne' | 'Haute' | 'Critique'>('Moyenne', { nonNullable: true }),
    salleSouhaiteeId: new FormControl('', { nonNullable: true, validators: [guidOptionnel] }),
    participants: new FormArray<FormGroup<{
      utilisateurId: FormControl<string>;
      nomComplet: FormControl<string>;
      email: FormControl<string>;
    }>>([]),
  });

  readonly formulaireOuvert = signal(false);
  private readonly valeurs = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly resumePeriode = computed(() => {
    const debut = dateValide(this.valeurs().dateDebutSouhaitee);
    const fin = dateValide(this.valeurs().dateFinSouhaitee);
    return debut && fin && fin > debut ? libellePeriode(debut, fin) : '';
  });

  private readonly version = signal(0);
  readonly sources = computed(() => [sourceDemandes(this.api, `demandes-${this.version()}`)]);
  readonly demandeOuverte = signal<EvenementClique | null>(null);
  readonly rechercheSociete = new FormControl('', { nonNullable: true });
  private readonly resultatsSocietes = signal<SocieteOption[]>([]);
  readonly societe = signal<SocieteDetail | null>(null);
  readonly optionsSocietes = computed(() => {
    const resultats = this.resultatsSocietes();
    const choisie = this.societe();
    return choisie && !resultats.some((option) => option.id === choisie.id)
      ? [{ id: choisie.id, nom: choisie.nom }, ...resultats]
      : resultats;
  });
  readonly membres = computed(() =>
    (this.societe()?.membres ?? []).filter((membre) => membre.id !== this.valeurs().dirigeantId));

  constructor() {
    this.rechercheSociete.valueChanges.pipe(
      startWith(this.rechercheSociete.value),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((terme) => this.referentiel.societes(terme).pipe(catchError(() => of<SocieteOption[]>([])))),
      takeUntilDestroyed(),
    ).subscribe((societes) => {
      this.resultatsSocietes.set(societes);
      if (societes.length === 1 && !this.form.controls.societeId.value) {
        this.form.controls.societeId.setValue(societes[0].id);
      }
    });

    this.form.controls.societeId.valueChanges.pipe(
      distinctUntilChanged(),
      switchMap((id) => {
        this.societe.set(null);
        return GUID.test(id) ? this.referentiel.societe(id).pipe(catchError(() => of(null))) : of(null);
      }),
      takeUntilDestroyed(),
    ).subscribe((detail) => this.appliquerSociete(detail));

    const debut = dateValide(this.route.snapshot.queryParamMap.get('debut'));
    const fin = dateValide(this.route.snapshot.queryParamMap.get('fin'));
    if (debut && fin && fin > debut) {
      this.choisirPeriode({ debut, fin });
    }
  }

  choisirPeriode(plage: PlageHoraire): void {
    const minutes = Math.round((plage.fin.getTime() - plage.debut.getTime()) / 60_000);
    this.form.patchValue({
      dateDebutSouhaitee: versSaisieLocale(plage.debut),
      dateFinSouhaitee: versSaisieLocale(plage.fin),
      dureeMinutes: Math.max(DUREE_MIN, Math.min(this.form.controls.dureeMinutes.value, minutes)),
    });
    this.form.controls.dateDebutSouhaitee.markAsDirty();
    this.form.controls.dateFinSouhaitee.markAsDirty();
    this.ouvrirFormulaire();
  }

  private appliquerSociete(detail: SocieteDetail | null): void {
    this.societe.set(detail);
    if (!detail) {
      return;
    }

    const { dirigeantId, salleSouhaiteeId, participants } = this.form.controls;
    if (!detail.dirigeants.some((dirigeant) => dirigeant.id === dirigeantId.value)) {
      dirigeantId.setValue(detail.dirigeants.length === 1 ? detail.dirigeants[0].id : '');
    }

    if (!detail.salles.some((salle) => salle.id === salleSouhaiteeId.value)) {
      salleSouhaiteeId.setValue('');
    }

    for (const participant of participants.controls) {
      const utilisateur = participant.controls.utilisateurId;
      if (utilisateur.value && !detail.membres.some((membre) => membre.id === utilisateur.value)) {
        utilisateur.setValue('');
      }
    }
  }

  actualiser(): void {
    this.version.update((version) => version + 1);
  }

  deplacerDemande(info: EventDropInfo | EventResizeDoneInfo): void {
    this.deplacement.appliquer(info, () => this.actualiser());
  }

  fermerApercu(): void {
    this.demandeOuverte.set(null);
  }

  apresSuppression(): void {
    this.fermerApercu();
    this.actualiser();
  }

  private reinitialiser(): void {
    const { societeId, dirigeantId } = this.form.getRawValue();
    this.form.controls.participants.clear();
    this.form.reset({ societeId, dirigeantId });
    this.alerte.set('');
    this.fermerFormulaire();
  }

  ouvrirFormulaire(): void {
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  ajouterParticipant(): void {
    this.form.controls.participants.push(new FormGroup({
      utilisateurId: new FormControl('', { nonNullable: true, validators: [guidOptionnel] }),
      nomComplet: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(256)] }),
    }));
  }

  retirerParticipant(index: number): void {
    this.form.controls.participants.removeAt(index);
  }

  enregistrer(): void {
    this.ouvrirFormulaire();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeur = this.form.getRawValue();
    const participants = valeur.participants
      .map((participant) => participant.utilisateurId ? { ...participant, nomComplet: '', email: '' } : participant)
      .filter((participant) => participant.utilisateurId || participant.nomComplet || participant.email);
    const message = messageSaisie(valeur, participants);
    this.alerte.set(message);
    if (message) {
      return;
    }

    this.api.creer({ ...valeur, participants })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actualiser();
          this.reinitialiser();
          this.flash.succes('La demande a été créée avec succès.');
        },
        error: (erreur: unknown) => this.alerte.set(messageApi(erreur)),
      });
  }
}

const DUREE_MIN = 15;

function libellePeriode(debut: Date, fin: Date): string {
  const jour = (date: Date) => date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const heure = (date: Date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const texte = debut.toDateString() === fin.toDateString()
    ? `${jour(debut)} · ${heure(debut)} – ${heure(fin)}`
    : `Du ${jour(debut)} ${heure(debut)} au ${jour(fin)} ${heure(fin)}`;
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function guidValide(control: AbstractControl): ValidationErrors | null {
  return GUID.test(String(control.value ?? '')) ? null : { pattern: true };
}

function guidOptionnel(control: AbstractControl): ValidationErrors | null {
  const valeur = String(control.value ?? '');
  return valeur.length === 0 || GUID.test(valeur) ? null : { pattern: true };
}

function messageSaisie(
  valeur: { type: string; dateDebutSouhaitee: string; dateFinSouhaitee: string; dureeMinutes: number },
  participants: { utilisateurId: string; nomComplet: string; email: string }[],
): string {
  const debut = new Date(valeur.dateDebutSouhaitee);
  const fin = new Date(valeur.dateFinSouhaitee);
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin <= debut) {
    return 'La fin de la période souhaitée doit être postérieure au début.';
  }

  if (debut.getTime() <= Date.now()) {
    return 'La période souhaitée doit commencer dans le futur.';
  }

  if (valeur.dureeMinutes > (fin.getTime() - debut.getTime()) / 60_000) {
    return 'La durée dépasse la période souhaitée.';
  }

  if (valeur.type === 'Reunion' && participants.length === 0) {
    return 'Une réunion comporte au moins un participant en plus du dirigeant.';
  }

  const incoherent = participants.some((participant) => {
    const interne = participant.utilisateurId.length > 0;
    const externe = participant.nomComplet.length > 0 && participant.email.length > 0;
    return interne === externe;
  });
  return incoherent
    ? 'Un participant interne a un utilisateur ; un participant externe a un nom et un e-mail.'
    : '';
}
