import { Injectable, signal } from '@angular/core';

export type TonFlash = 'succes' | 'erreur';

export interface MessageFlash {
  id: number;
  ton: TonFlash;
  texte: string;
}

const DUREE_AFFICHAGE_MS = 4000;

@Injectable({ providedIn: 'root' })
export class FlashService {
  private prochainId = 0;
  readonly messages = signal<MessageFlash[]>([]);

  succes(texte: string): void {
    this.afficher('succes', texte);
  }

  erreur(texte: string): void {
    this.afficher('erreur', texte);
  }

  fermer(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private afficher(ton: TonFlash, texte: string): void {
    const id = ++this.prochainId;
    this.messages.update((messages) => [...messages, { id, ton, texte }]);
    setTimeout(() => this.fermer(id), DUREE_AFFICHAGE_MS);
  }
}
