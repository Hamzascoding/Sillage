export type Niveau = '1re année' | '2e année' | 'PFE';
export type Mode = 'Sur site' | 'Hybride' | 'À distance';
export type Statut = 'a_postuler' | 'envoyee' | 'entretien' | 'acceptee' | 'refusee';

export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'etudiant' | 'entreprise' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CompanySummary {
  id: number;
  nom: string;
  secteur: string;
  ville: string;
  note: number | null;
  nbAvis: number;
  nbOffres?: number;
}

export interface Offer {
  id: number;
  titre: string;
  type: string;
  niveau: Niveau;
  mode: Mode;
  ville: string;
  dureeSemaines: number;
  remunere: boolean;
  description: string;
  missions: string[];
  profil: string[];
  publieLe: string;
  dateLimite: string;
  entreprise: CompanySummary;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface Review {
  id: number;
  auteur: string;
  contexte: string;
  notes: Record<string, number>;
  noteGlobale: number;
  commentaire: string;
  creeLe: string;
  verifie: boolean;
}

export interface CompanyDetail extends CompanySummary {
  taille: string;
  description: string;
  criteres: Record<string, number | null>;
  offres: Offer[];
  avis: Review[];
  peutDeposerAvis: boolean;
}

export interface ApplicationView {
  id: number;
  statut: Statut;
  offreId: number;
  titre: string;
  entreprise: string;
  echeance: string;
  creeLe: string;
}

export interface OfferFilters {
  q?: string;
  niveau?: string;
  mode?: string;
  remunere?: boolean;
  noteMin?: number;
  tri?: string;
  page?: number;
  limit?: number;
}

export interface ReviewPayload {
  notes: Record<string, number>;
  commentaire: string;
  contexte: string;
}

export const CRITERES = [
  { key: 'encadrement', label: 'Encadrement' },
  { key: 'missions', label: 'Missions' },
  { key: 'apprentissage', label: 'Apprentissage' },
  { key: 'ambiance', label: 'Ambiance' },
  { key: 'gratification', label: 'Gratification' },
] as const;
