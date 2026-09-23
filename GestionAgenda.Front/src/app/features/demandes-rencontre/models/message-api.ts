import { HttpErrorResponse } from '@angular/common/http';

export function messageApi(erreur: unknown): string {
  if (!(erreur instanceof HttpErrorResponse)) {
    return 'La demande n\'a pas abouti.';
  }

  const corps = erreur.error as { message?: string } | null;
  if (corps && typeof corps.message === 'string' && corps.message.length > 0) {
    return corps.message;
  }

  if (erreur.status === 0) {
    return 'Le serveur est injoignable.';
  }

  return 'La demande n\'a pas abouti.';
}
