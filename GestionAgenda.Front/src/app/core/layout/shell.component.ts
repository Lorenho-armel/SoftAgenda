import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { IconeComponent, NomIcone } from '../../shared/components/icone/icone.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { NotificationsTempsReelService } from '../services/notifications-temps-reel.service';
import { ThemeService } from '../services/theme.service';

interface LienMenu {
  libelle: string;
  route: string;
  icone: NomIcone;
  exact: boolean;
}

type Panneau = 'notifications' | 'profil';

@Component({
  selector: 'app-shell',
  imports: [NgOptimizedImage, RouterOutlet, RouterLink, RouterLinkActive, IconeComponent],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly notifications = inject(NotificationService);
  private readonly tempsReel = inject(NotificationsTempsReelService);
  readonly theme = inject(ThemeService);
  readonly email = this.auth.email;
  readonly estAssistante = computed(() => this.auth.roles().includes('Assistante'));
  readonly role = computed(() => this.auth.roles()[0] ?? 'Utilisateur');
  readonly nom = computed(() => nomDepuisEmail(this.email()));
  readonly initiales = computed(() => initialesDe(this.nom()));
  readonly reduit = signal(false);
  readonly menuMobile = signal(false);
  readonly panneau = signal<Panneau | null>(null);
  readonly titre = toSignal(
    this.router.events.pipe(
      filter((evenement) => evenement instanceof NavigationEnd),
      map(() => titreCourant(this.router.routerState.snapshot.root)),
    ),
    { initialValue: titreCourant(this.router.routerState.snapshot.root) },
  );
  readonly liens = computed<LienMenu[]>(() => [
    ...(this.estAssistante()
      ? [{ libelle: 'Tableau de bord', route: '/demandes-rencontre/tableau', icone: 'tableau' as const, exact: false }]
      : []),
    { libelle: 'Agenda', route: '/demandes-rencontre/agenda', icone: 'calendrier', exact: false },
    { libelle: 'File des demandes', route: '/demandes-rencontre/file', icone: 'file', exact: false },
    { libelle: 'Liste des demandes', route: '/demandes-rencontre', icone: 'liste', exact: true },
    { libelle: 'Nouvelle demande', route: '/demandes-rencontre/nouvelle', icone: 'plus', exact: false },
  ]);

  constructor() {
    void this.tempsReel.demarrer();
  }

  basculerMenu(): void {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      this.reduit.update((valeur) => !valeur);
      return;
    }

    this.menuMobile.update((valeur) => !valeur);
  }

  basculerPanneau(panneau: Panneau): void {
    this.panneau.update((actuel) => (actuel === panneau ? null : panneau));
  }

  deconnecter(): void {
    this.panneau.set(null);
    void this.tempsReel.arreter();
    this.auth.oublier();
    void this.router.navigate(['/connexion']);
  }
}

function titreCourant(racine: ActivatedRouteSnapshot): string {
  let courant: ActivatedRouteSnapshot | null = racine;
  let titre = '';
  while (courant) {
    titre = courant.title ?? titre;
    courant = courant.firstChild;
  }

  return titre || 'Gestion Agenda';
}

function nomDepuisEmail(email: string | null): string {
  if (!email) {
    return 'Utilisateur';
  }

  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter((mot) => mot.length > 0)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(' ');
}

function initialesDe(nom: string): string {
  const mots = nom.split(' ').filter((mot) => mot.length > 0);
  const initiales = mots.length > 1 ? mots[0].charAt(0) + mots[1].charAt(0) : nom.slice(0, 2);
  return initiales.toUpperCase();
}
