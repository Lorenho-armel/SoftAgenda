import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { accueilGuard } from './accueil.guard';
import { assistanteGuard } from './assistante.guard';
import { AuthService } from '../services/auth.service';

describe('gardes du tableau assistante', () => {
  it('devrait ouvrir le tableau pour une assistante', () => {
    // Arrange
    const roles = signal(['Assistante']);
    const router = preparer(roles);

    // Act
    const resultat = TestBed.runInInjectionContext(() => accueilGuard(routeVide(), etatVide()));

    // Assert
    expect(resultat).toEqual(router.parseUrl('/demandes-rencontre/tableau'));
    expect(TestBed.runInInjectionContext(() => assistanteGuard(routeVide(), etatVide()))).toBe(true);
  });

  it('devrait renvoyer un autre rôle vers la file', () => {
    // Arrange
    const roles = signal(['Dirigeant']);
    const router = preparer(roles);

    // Act
    const accueil = TestBed.runInInjectionContext(() => accueilGuard(routeVide(), etatVide()));
    const tableau = TestBed.runInInjectionContext(() => assistanteGuard(routeVide(), etatVide()));

    // Assert
    expect(accueil).toEqual(router.parseUrl('/demandes-rencontre/file'));
    expect(tableau).toEqual(router.createUrlTree(['/demandes-rencontre/file']));
  });
});

function preparer(roles: ReturnType<typeof signal<string[]>>): Router {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { roles } }],
  });
  return TestBed.inject(Router);
}

function routeVide(): never {
  return {} as never;
}

function etatVide(): never {
  return {} as never;
}
