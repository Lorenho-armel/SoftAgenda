import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

const CLE_THEME = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly sombre = signal(lirePreference());

  constructor() {
    effect(() => this.document.documentElement.classList.toggle('dark', this.sombre()));
  }

  basculer(): void {
    this.sombre.update((valeur) => !valeur);
    try {
      localStorage.setItem(CLE_THEME, this.sombre() ? 'sombre' : 'clair');
    } catch {
      return;
    }
  }
}

function lirePreference(): boolean {
  try {
    return localStorage.getItem(CLE_THEME) === 'sombre';
  } catch {
    return false;
  }
}
