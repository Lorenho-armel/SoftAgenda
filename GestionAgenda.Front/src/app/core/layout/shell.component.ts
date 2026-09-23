import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { NotificationsTempsReelService } from '../services/notifications-temps-reel.service';

@Component({
  selector: 'app-shell',
  imports: [NgOptimizedImage, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly notifications = inject(NotificationService);
  private readonly tempsReel = inject(NotificationsTempsReelService);
  readonly email = this.auth.email;
  readonly estAssistante = computed(() => this.auth.roles().includes('Assistante'));

  constructor() {
    void this.tempsReel.demarrer();
  }

  deconnecter(): void {
    void this.tempsReel.arreter();
    this.auth.oublier();
    void this.router.navigate(['/connexion']);
  }
}
