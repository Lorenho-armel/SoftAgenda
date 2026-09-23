import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SessionJetons } from '../models/session.model';
import { StorageService } from './storage.service';

const CLE_REFRESH = 'refreshToken';

interface ChargeUtile {
  role?: string | string[];
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  readonly accessToken = signal<string | null>(null);
  readonly email = signal<string | null>(null);
  readonly roles = signal<readonly string[]>([]);

  estConnecte(): boolean {
    return this.accessToken() !== null;
  }

  connecter(email: string, motDePasse: string): Observable<void> {
    return this.http
      .post<ApiResponse<SessionJetons>>(`${environment.apiUrl}/auth/login`, { email, motDePasse })
      .pipe(map((reponse) => this.memoriser(reponse.data)));
  }

  rafraichir(): Observable<void> {
    const refreshToken = this.storage.get(CLE_REFRESH);
    if (!refreshToken) {
      return throwError(() => new Error('Session absente'));
    }

    return this.http
      .post<ApiResponse<SessionJetons>>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(map((reponse) => this.memoriser(reponse.data)));
  }

  restaurer(): Promise<void> {
    if (!this.storage.get(CLE_REFRESH)) {
      return Promise.resolve();
    }

    return firstValueFrom(this.rafraichir().pipe(catchError(() => {
      this.oublier();
      return of(undefined);
    })));
  }

  oublier(): void {
    this.accessToken.set(null);
    this.email.set(null);
    this.roles.set([]);
    this.storage.remove(CLE_REFRESH);
  }

  private memoriser(session: SessionJetons): void {
    this.accessToken.set(session.accessToken);
    this.storage.set(CLE_REFRESH, session.refreshToken);
    const charge = decoder(session.accessToken);
    this.email.set(charge.email ?? null);
    this.roles.set(normaliserRoles(charge.role));
  }
}

function decoder(token: string): ChargeUtile {
  const segment = token.split('.')[1] ?? '';
  const brut: unknown = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/')));
  if (typeof brut !== 'object' || brut === null) {
    return {};
  }

  const role = 'role' in brut ? brut.role : undefined;
  const email = 'email' in brut ? brut.email : undefined;
  return {
    role: estRole(role) ? role : undefined,
    email: typeof email === 'string' ? email : undefined,
  };
}

function estRole(valeur: unknown): valeur is string | string[] {
  return typeof valeur === 'string' || (Array.isArray(valeur) && valeur.every((item) => typeof item === 'string'));
}

function normaliserRoles(role: string | string[] | undefined): string[] {
  if (!role) {
    return [];
  }

  return Array.isArray(role) ? role : [role];
}
