import { DemandeResume, Priorite, Urgence } from './demande.model';

export interface CompteursTableau {
  aTraiter: number;
  urgentes: number;
  critiques: number;
  prioritaires: number;
  acceptees: number;
  reportees: number;
  planifieesAujourdhui: number;
}

export interface RencontreTableau {
  demandeId: string;
  motif: string;
  urgence: Urgence;
  priorite: Priorite;
  debut: string;
  fin: string;
  dirigeantNom: string;
  societeNom: string;
}

export interface TableauAssistante {
  compteurs: CompteursTableau;
  aTraiterMaintenant: DemandeResume[];
  rencontresAujourdhui: RencontreTableau[];
  prochainesRencontres: RencontreTableau[];
}
