import { EventInput } from '@fullcalendar/angular';
import { ajouterMinutes } from '../../../shared/calendrier/calendrier.config';
import { DemandeResume, StatutDemande } from './demande.model';
import { libelleStatut } from './demande-libelles';
import { RencontreTableau } from './tableau-assistante.model';

export const COULEUR_RENCONTRE = '#1c2a52';

export const COULEURS_STATUT: Record<StatutDemande, string> = {
  EnAttente: '#575d8f',
  EnAnalyse: '#bc9c22',
  Acceptee: '#2f855a',
  Reportee: '#c2410c',
  Planifiee: '#2e427b',
  Refusee: '#8a1f2b',
  Terminee: '#7c8069',
  Annulee: '#9ca3af',
};

export const LEGENDE_AGENDA: readonly { libelle: string; couleur: string }[] = [
  ...(Object.keys(COULEURS_STATUT) as StatutDemande[]).map((statut) => ({
    libelle: libelleStatut(statut),
    couleur: COULEURS_STATUT[statut],
  })),
  { libelle: 'Rencontre confirmée', couleur: COULEUR_RENCONTRE },
];

export function evenementDemande(demande: DemandeResume): EventInput {
  const debut = new Date(demande.dateDebutSouhaitee);
  return {
    id: `demande-${demande.id}`,
    title: `${demande.motif} · ${demande.demandeurNom}`,
    start: debut,
    end: ajouterMinutes(debut, demande.dureeMinutes),
    color: COULEURS_STATUT[demande.statut],
    extendedProps: { demandeId: demande.id },
  };
}

export function evenementRencontre(rencontre: RencontreTableau): EventInput {
  return {
    id: `rencontre-${rencontre.demandeId}`,
    title: `${rencontre.motif} · ${rencontre.dirigeantNom}`,
    start: rencontre.debut,
    end: rencontre.fin,
    color: COULEUR_RENCONTRE,
    extendedProps: { demandeId: rencontre.demandeId },
  };
}
