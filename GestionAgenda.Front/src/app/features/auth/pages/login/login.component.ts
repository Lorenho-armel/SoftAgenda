import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { IconeComponent, NomIcone } from '../../../../shared/components/icone/icone.component';

interface Atout {
  icone: NomIcone;
  titre: string;
  detail: string;
}

@Component({
  selector: 'app-login',
  imports: [NgOptimizedImage, ReactiveFormsModule, FieldErrorComponent, IconeComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly notifications = inject(NotificationService);
  readonly envoi = signal(false);
  readonly motDePasseVisible = signal(false);
  readonly atouts: readonly Atout[] = [
    { icone: 'document', titre: 'Créer une demande', detail: 'En quelques clics' },
    { icone: 'horloge', titre: "Suivre l'avancement", detail: 'En temps réel' },
    { icone: 'calendrier', titre: 'Planifier les rencontres', detail: 'Sans conflit' },
    { icone: 'cloche', titre: 'Recevoir les rappels', detail: 'Automatiquement' },
  ];
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    motDePasse: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  connecter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeur = this.form.getRawValue();
    this.notifications.effacer();
    this.envoi.set(true);
    this.auth.connecter(valeur.email, valeur.motDePasse)
      .pipe(finalize(() => this.envoi.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/demandes-rencontre/file']),
        error: () => undefined,
      });
  }
}
