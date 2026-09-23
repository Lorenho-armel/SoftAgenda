import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal<string | null>(null);

  erreur(message: string): void {
    this.message.set(message);
  }

  effacer(): void {
    this.message.set(null);
  }
}
