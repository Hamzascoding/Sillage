// Calcul des notes d'entreprise à partir des avis publiés (pur, testable)

export const CRITERES = ['encadrement', 'missions', 'apprentissage', 'ambiance', 'gratification'];

const round1 = (n) => Math.round(n * 10) / 10;
const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;

/** Note globale d'un avis = moyenne de ses cinq critères. */
export function reviewScore(review) {
  return round1(average(CRITERES.map((c) => review.notes[c])));
}

/** Notes d'une entreprise : moyenne par critère et note globale (avis publiés uniquement). */
export function computeRating(reviews) {
  const published = reviews.filter((r) => r.statut === 'publie');
  const criteres = {};
  for (const c of CRITERES) {
    criteres[c] = published.length ? round1(average(published.map((r) => r.notes[c]))) : null;
  }
  const note = published.length ? round1(average(CRITERES.map((c) => criteres[c]))) : null;
  return { note, count: published.length, criteres };
}

/** Table { companyId -> rating } calculée en une seule passe. */
export function ratingsByCompany(companies, reviews) {
  const table = {};
  for (const company of companies) {
    table[company.id] = computeRating(reviews.filter((r) => r.companyId === company.id));
  }
  return table;
}
