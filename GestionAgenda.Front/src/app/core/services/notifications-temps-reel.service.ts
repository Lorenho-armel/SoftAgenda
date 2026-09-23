import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

interface MessageTempsReel {
  titre: string;
  message: string;
}

interface AbonnementNavigateur {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@Injectable({ providedIn: 'root' })
export class NotificationsTempsReelService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private connexion: HubConnection | null = null;

  async demarrer(): Promise<void> {
    if (!this.auth.accessToken() || this.connexion) {
      return;
    }

    const hub = new HubConnectionBuilder()
      .withUrl(environment.apiUrl.replace(/\/api$/, '') + '/hubs/notifications', {
        accessTokenFactory: () => this.auth.accessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();
    hub.on('notification', (message: MessageTempsReel) => {
      this.notifications.annoncer(`${message.titre}. ${message.message}`);
    });
    try {
      await hub.start();
    } catch {
      return;
    }

    this.connexion = hub;
    try {
      await this.abonnerPush();
    } catch {
      return;
    }
  }

  async arreter(): Promise<void> {
    await this.connexion?.stop();
    this.connexion = null;
  }

  private async abonnerPush(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const cle = await firstValueFrom(
      this.http.get<ApiResponse<{ clePublique: string }>>(`${environment.apiUrl}/notifications/push/cle`),
    );
    if (!cle.data?.clePublique) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.register('sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: cleVersOctets(cle.data.clePublique),
    });
    const brut = subscription.toJSON() as AbonnementNavigateur;
    await firstValueFrom(this.http.post(`${environment.apiUrl}/notifications/push`, {
      endpoint: brut.endpoint,
      cleP256dh: brut.keys.p256dh,
      auth: brut.keys.auth,
    }));
  }
}

function cleVersOctets(cle: string): Uint8Array<ArrayBuffer> {
  const rembourre = cle + '='.repeat((4 - (cle.length % 4)) % 4);
  const binaire = atob(rembourre.replace(/-/g, '+').replace(/_/g, '/'));
  const octets = new Uint8Array(binaire.length);
  for (let index = 0; index < binaire.length; index += 1) {
    octets[index] = binaire.charCodeAt(index);
  }

  return octets;
}
