import { Injectable, inject } from '@angular/core';
import { EventDropInfo, EventResizeDoneInfo } from '@fullcalendar/angular';
import { switchMap } from 'rxjs';
import { FlashService } from '../../../core/services/flash.service';
import { DemandeDetail } from '../models/demande.model';
import { messageApi } from '../models/message-api';
import { DemandesApiService } from './demandes-api.service';

export interface PeriodeDeplacee {
  dateDebutSouhaitee: string;
  dateFinSouhaitee: string;
  dureeMinutes: number;
}

export function periodeDeplacee(demande: DemandeDetail, debut: Date, fin: Date): PeriodeDeplacee {
  const decalage = debut.getTime() - new Date(demande.dateDebutSouhaitee).getTime();
  const finPeriode = new Date(new Date(demande.dateFinSouhaitee).getTime() + decalage);
  return {
    dateDebutSouhaitee: debut.toISOString(),
    dateFinSouhaitee: (finPeriode > fin ? finPeriode : fin).toISOString(),
    dureeMinutes: Math.round((fin.getTime() - debut.getTime()) / 60_000),
  };
}

@Injectable({ providedIn: 'root' })
export class DeplacementDemandeService {
  private readonly api = inject(DemandesApiService);
  private readonly flash = inject(FlashService);

  appliquer(info: EventDropInfo | EventResizeDoneInfo, apres: () => void = () => undefined): void {
    const demandeId: unknown = info.event.extendedProps['demandeId'];
    const { start, end } = info.event;
    if (typeof demandeId !== 'string' || !start || !end) {
      info.revert();
      return;
    }

    const redimensionnement = 'endDelta' in info;
    this.api.obtenir(demandeId).pipe(
      switchMap((demande) => this.api.modifier(demande.id, {
        type: demande.type,
        motif: demande.motif,
        ...periodeDeplacee(demande, start, end),
        salleSouhaiteeId: demande.salleSouhaiteeId ?? '',
        participants: demande.participants.map((participant) => ({
          utilisateurId: participant.utilisateurId ?? '',
          nomComplet: participant.nomComplet ?? '',
          email: participant.email ?? '',
        })),
      })),
    ).subscribe({
      next: () => {
        this.flash.succes(redimensionnement ? 'La durée de la demande a été modifiée.' : 'La demande a été déplacée.');
        apres();
      },
      error: (erreur: unknown) => {
        info.revert();
        this.flash.erreur(messageApi(erreur));
      },
    });
  }
}
