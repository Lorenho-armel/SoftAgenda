import { Injectable } from '@angular/core';

const MEMOIRE = new Map<string, string>();

@Injectable({ providedIn: 'root' })
export class StorageService {
  get(cle: string): string | null {
    return MEMOIRE.get(cle) ?? null;
  }

  set(cle: string, valeur: string): void {
    MEMOIRE.set(cle, valeur);
  }

  remove(cle: string): void {
    MEMOIRE.delete(cle);
  }
}
