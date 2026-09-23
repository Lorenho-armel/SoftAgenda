import { BadgeTon, Priorite, Urgence } from './demande.model';

export function tonUrgence(urgence: Urgence): BadgeTon {
  if (urgence === 'Critique') {
    return 'critique';
  }

  return urgence === 'Urgent' ? 'urgent' : 'normal';
}

export function tonPriorite(priorite: Priorite): BadgeTon {
  if (priorite === 'Critique') {
    return 'critique';
  }

  if (priorite === 'Haute') {
    return 'haute';
  }

  return priorite === 'Moyenne' ? 'moyenne' : 'faible';
}

export function libelleJour(iso: string, maintenant = new Date()): string {
  const date = new Date(iso);
  const origine = new Date(maintenant);
  origine.setHours(0, 0, 0, 0);
  const cible = new Date(date);
  cible.setHours(0, 0, 0, 0);
  const jours = Math.round((cible.getTime() - origine.getTime()) / 86_400_000);
  if (jours === 0) {
    return "Aujourd'hui";
  }

  if (jours === 1) {
    return 'Demain';
  }

  const texte = date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export function libelleStatut(statut: string): string {
  const libelles: Record<string, string> = {
    EnAttente: 'En attente',
    EnAnalyse: 'En analyse',
    Acceptee: 'Acceptée',
    Refusee: 'Refusée',
    Reportee: 'Reportée',
    Planifiee: 'Planifiée',
    Terminee: 'Terminée',
    Annulee: 'Annulée',
    RendezVous: 'Rendez-vous',
    Reunion: 'Réunion',
  };
  return libelles[statut] ?? statut;
}
