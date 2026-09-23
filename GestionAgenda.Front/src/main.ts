import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

registerLocaleData(localeFr);
void demarrer();

async function demarrer(): Promise<void> {
  await appliquerConfiguration();
  await bootstrapApplication(AppComponent, appConfig);
}

async function appliquerConfiguration(): Promise<void> {
  try {
    const reponse = await fetch('/assets/config.json', { cache: 'no-store' });
    if (!reponse.ok) {
      return;
    }

    const config = (await reponse.json()) as { apiUrl?: string };
    if (config.apiUrl) {
      environment.apiUrl = config.apiUrl;
    }
  } catch {
    return;
  }
}
