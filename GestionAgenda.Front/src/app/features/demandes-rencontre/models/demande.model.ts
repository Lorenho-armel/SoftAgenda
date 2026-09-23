export type TypeDemande = 'RendezVous' | 'Reunion';
export type Urgence = 'Normal' | 'Urgent' | 'Critique';
export type Priorite = 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
export type StatutDemande =
  | 'EnAttente'
  | 'EnAnalyse'
  | 'Acceptee'
  | 'Refusee'
  | 'Reportee'
  | 'Planifiee'
  | 'Terminee'
  | 'Annulee';
export type VueFile = 'Nouvelles' | 'Urgentes' | 'Critiques' | 'Prioritaires' | 'EnAttente' | 'Planifiees';
export type TypeConflit = 'CalendrierDirigeant' | 'CalendrierParticipant' | 'Salle';
export type BadgeTon = 'normal' | 'urgent' | 'critique' | 'faible' | 'moyenne' | 'haute';

export interface Participant {
  id: string;
  utilisateurId: string | null;
  nomComplet: string | null;
  email: string | null;
}

export interface HistoriqueDemande {
  id: string;
  typeEvenement: string;
  commentaire: string | null;
  statutAvant: StatutDemande | null;
  statutApres: StatutDemande | null;
  dateCreation: string;
}

export interface DemandeResume {
  id: string;
  demandeurId: string;
  dirigeantId: string;
  societeId: string;
  type: TypeDemande;
  motif: string;
  dateDebutSouhaitee: string;
  dateFinSouhaitee: string;
  dureeMinutes: number;
  urgence: Urgence;
  priorite: Priorite;
  statut: StatutDemande;
  salleSouhaiteeId: string | null;
  dateCreation: string;
  demandeurNom: string;
  societeNom: string;
}

export interface DemandeDetail extends DemandeResume {
  rendezVousId: string | null;
  reunionId: string | null;
  participants: Participant[];
  historique: HistoriqueDemande[];
}

export interface PersonneOption {
  id: string;
  nomComplet: string;
}

export interface SocieteOption {
  id: string;
  nom: string;
}

export interface CompteursFile {
  nouvelles: number;
  urgentes: number;
  critiques: number;
  prioritaires: number;
  enAttente: number;
  planifiees: number;
}

export interface FileDemandes {
  demandes: {
    items: DemandeResume[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  compteurs: CompteursFile;
  demandeurs: PersonneOption[];
  societes: SocieteOption[];
}

export interface ConflitPlanification {
  nature: TypeConflit;
  bloquant: boolean;
  message: string;
  titre: string | null;
  debut: string | null;
  fin: string | null;
  participantNom: string | null;
  salleNom: string | null;
}

export interface BilanPlanification {
  debut: string;
  fin: string;
  peutPlanifier: boolean;
  conflits: ConflitPlanification[];
}

export interface FiltreDemande {
  search: string;
  statut: StatutDemande | '';
  urgence: Urgence | '';
  priorite: Priorite | '';
  type: TypeDemande | '';
  societeId: string;
  demandeurId: string;
  dateDebut: string;
  dateFin: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  vue: VueFile | '';
}

export interface ParticipantSaisie {
  utilisateurId: string;
  nomComplet: string;
  email: string;
}

export interface CreerDemandeSaisie {
  dirigeantId: string;
  societeId: string;
  type: TypeDemande;
  motif: string;
  dateDebutSouhaitee: string;
  dateFinSouhaitee: string;
  dureeMinutes: number;
  urgence: Urgence;
  priorite: Priorite;
  salleSouhaiteeId: string;
  participants: ParticipantSaisie[];
}

export const URGENCES: Urgence[] = ['Normal', 'Urgent', 'Critique'];
export const PRIORITES: Priorite[] = ['Faible', 'Moyenne', 'Haute', 'Critique'];
export const STATUTS: StatutDemande[] = [
  'EnAttente', 'EnAnalyse', 'Acceptee', 'Refusee', 'Reportee', 'Planifiee', 'Terminee', 'Annulee',
];
export const TYPES: TypeDemande[] = ['RendezVous', 'Reunion'];

export const VUES: { id: VueFile; libelle: string; compteur: keyof CompteursFile }[] = [
  { id: 'Nouvelles', libelle: 'Nouvelles', compteur: 'nouvelles' },
  { id: 'Urgentes', libelle: 'Urgentes', compteur: 'urgentes' },
  { id: 'Critiques', libelle: 'Critiques', compteur: 'critiques' },
  { id: 'Prioritaires', libelle: 'Prioritaires', compteur: 'prioritaires' },
  { id: 'EnAttente', libelle: 'En attente', compteur: 'enAttente' },
  { id: 'Planifiees', libelle: 'Planifiées', compteur: 'planifiees' },
];

export function filtreVide(): FiltreDemande {
  return {
    search: '',
    statut: '',
    urgence: '',
    priorite: '',
    type: '',
    societeId: '',
    demandeurId: '',
    dateDebut: '',
    dateFin: '',
    sortBy: '',
    sortDirection: 'asc',
    vue: '',
  };
}

export function filtreInitial(vue: string | null, statut: string | null): FiltreDemande {
  return {
    ...filtreVide(),
    vue: estVue(vue) ? vue : '',
    statut: estStatut(statut) ? statut : '',
  };
}

function estVue(valeur: string | null): valeur is VueFile {
  return VUES.some((vue) => vue.id === valeur);
}

function estStatut(valeur: string | null): valeur is StatutDemande {
  return STATUTS.some((statut) => statut === valeur);
}
