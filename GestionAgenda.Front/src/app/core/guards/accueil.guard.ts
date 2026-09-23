import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const accueilGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const cible = auth.roles().includes('Assistante')
    ? '/demandes-rencontre/tableau'
    : '/demandes-rencontre/file';
  return inject(Router).parseUrl(cible);
};
