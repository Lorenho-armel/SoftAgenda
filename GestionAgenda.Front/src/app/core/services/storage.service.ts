import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly stockage = isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null;

  get(cle: string): string | null {
    return this.stockage?.getItem(cle) ?? null;
  }

  set(cle: string, valeur: string): void {
    this.stockage?.setItem(cle, valeur);
  }

  remove(cle: string): void {
    this.stockage?.removeItem(cle);
  }
}
