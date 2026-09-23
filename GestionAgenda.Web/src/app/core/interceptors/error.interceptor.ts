import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((erreur: unknown) => {
      if (!(erreur instanceof HttpErrorResponse)) {
        notifications.erreur('Une erreur interne est survenue.');
        return throwError(() => erreur);
      }

      if (erreur.status === 401 && !req.url.includes('/auth/') && auth.estConnecte()) {
        return auth.rafraichir().pipe(
          switchMap(() => next(req.clone({
            setHeaders: { Authorization: `Bearer ${auth.accessToken() ?? ''}` },
          }))),
          catchError(() => {
            auth.oublier();
            void router.navigate(['/connexion']);
            notifications.erreur('Session expirée.');
            return throwError(() => erreur);
          }),
        );
      }

      if (erreur.status === 401) {
        auth.oublier();
        void router.navigate(['/connexion']);
      }

      notifications.erreur(messageHttp(erreur));
      return throwError(() => erreur);
    }),
  );
};

function messageHttp(erreur: HttpErrorResponse): string {
  if (erreur.status === 403) {
    return 'Accès interdit.';
  }

  if (erreur.status >= 500) {
    return 'Une erreur interne est survenue.';
  }

  const corps = erreur.error as ApiResponse<unknown> | undefined;
  if (corps && typeof corps.message === 'string' && corps.message.length > 0) {
    return corps.message;
  }

  if (erreur.status === 404) {
    return 'Élément introuvable.';
  }

  return 'La requête a été refusée.';
}
