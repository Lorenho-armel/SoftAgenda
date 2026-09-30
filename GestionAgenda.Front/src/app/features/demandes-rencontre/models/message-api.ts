import { HttpErrorResponse } from '@angular/common/http';

export function messageApi(erreur: unknown): string {
  if (!(erreur instanceof HttpErrorResponse)) {
    return 'La demande n\'a pas abouti.';
  }

  const corps = erreur.error as { message?: string; errors?: Record<string, string[]> } | null;
  if (corps && typeof corps.message === 'string' && corps.message.length > 0) {
    return corps.message;
  }

  if (corps?.errors && typeof corps.errors === 'object') {
    const champs = Object.keys(corps.errors).map((champ) => champ.replace(/^\$\.?/, '')).filter(Boolean);
    return champs.length > 0
      ? `Données invalides : ${champs.join(', ')}.`
      : 'Les données envoyées sont invalides.';
  }

  if (erreur.status === 0) {
    return 'Le serveur est injoignable.';
  }

  return 'La demande n\'a pas abouti.';
}
