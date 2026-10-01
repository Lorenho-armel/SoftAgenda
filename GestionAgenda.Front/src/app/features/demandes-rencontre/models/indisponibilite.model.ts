export type TypeIndisponibilite = 'Deplacement' | 'TempsBloque' | 'Personnel' | 'Evenement';

export const TYPES_INDISPONIBILITE: readonly { valeur: TypeIndisponibilite; libelle: string }[] = [
  { valeur: 'Deplacement', libelle: 'Déplacement' },
  { valeur: 'TempsBloque', libelle: 'Temps bloqué' },
  { valeur: 'Personnel', libelle: 'Personnel' },
  { valeur: 'Evenement', libelle: 'Événement' },
];

export function libelleIndisponibilite(type: TypeIndisponibilite): string {
  return TYPES_INDISPONIBILITE.find((item) => item.valeur === type)?.libelle ?? 'Indisponibilité';
}

export interface Indisponibilite {
  id: string;
  dirigeantId: string;
  dirigeantNom: string;
  societeId: string;
  type: TypeIndisponibilite;
  motif: string;
  debut: string;
  fin: string;
}

export interface DirigeantGere {
  dirigeantId: string;
  dirigeantNom: string;
  societeId: string;
  societeNom: string;
}

export interface CreerIndisponibilite {
  dirigeantId: string;
  societeId: string;
  type: TypeIndisponibilite;
  motif: string;
  debut: string;
  fin: string;
}

export interface EtatFeuille {
  configuree: boolean;
  lien: string | null;
  onglet: string;
}

export interface EtatAgendaGoogle {
  configuree: boolean;
  compteService: string | null;
  lien: string;
}

export interface AccesAgendaGoogle {
  dirigeantId: string;
  dirigeantNom: string;
  agenda: string;
  accessible: boolean;
  message: string;
}

export interface MessageImport {
  ligne: number;
  niveau: 'Erreur' | 'Avertissement';
  texte: string;
}

export interface RapportImport {
  demandesCreees: number;
  indisponibilitesCreees: number;
  lignesIgnorees: number;
  messages: MessageImport[];
}
