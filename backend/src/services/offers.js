// Filtrage, tri et pagination des offres (purs, testables)
import { normalize } from './text.js';

/** Ajoute à une offre le résumé de son entreprise (nom, ville, note, nombre d'avis). */
export function enrichOffer(offer, companiesById, ratings) {
  const company = companiesById[offer.companyId];
  const rating = ratings[offer.companyId] ?? { note: null, count: 0 };
  const { companyId, ...rest } = offer;
  return {
    ...rest,
    entreprise: {
      id: company.id,
      nom: company.nom,
      secteur: company.secteur,
      ville: company.ville,
      note: rating.note,
      nbAvis: rating.count,
    },
  };
}

const SORTS = {
  // Les plus récentes d'abord
  recent: (a, b) => b.publieLe.localeCompare(a.publieLe),
  // Les mieux notées d'abord (entreprises sans avis en dernier)
  note: (a, b) => (b.entreprise.note ?? -1) - (a.entreprise.note ?? -1),
  // Date limite la plus proche d'abord
  echeance: (a, b) => a.dateLimite.localeCompare(b.dateLimite),
};

/**
 * Filtre combinable : q (texte), niveau, mode, remunere, noteMin. Tri : recent | note | echeance.
 * `offers` doit déjà être enrichi (voir enrichOffer).
 */
export function filterOffers(offers, query = {}) {
  const q = normalize(query.q);
  const noteMin = Number(query.noteMin) || 0;
  const wantsPaid = query.remunere === true || query.remunere === 'true';

  const result = offers.filter((o) => {
    if (query.niveau && o.niveau !== query.niveau) return false;
    if (query.mode && o.mode !== query.mode) return false;
    if (wantsPaid && !o.remunere) return false;
    if (noteMin > 0 && (o.entreprise.note ?? 0) < noteMin) return false;
    if (q) {
      const haystack = normalize([o.titre, o.entreprise.nom, o.entreprise.secteur, o.description, o.missions.join(' ')].join(' '));
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sort = SORTS[query.tri] ?? SORTS.recent;
  return [...result].sort(sort);
}

/** Pagination : renvoie la page demandée (bornée) et les métadonnées utiles à l'interface. */
export function paginate(items, page = 1, limit = 6) {
  const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 50);
  const pages = Math.max(Math.ceil(items.length / safeLimit), 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), pages);
  const start = (safePage - 1) * safeLimit;
  return { items: items.slice(start, start + safeLimit), total: items.length, page: safePage, pages, limit: safeLimit };
}
