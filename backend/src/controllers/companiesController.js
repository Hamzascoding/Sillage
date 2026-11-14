import { load, save, nextId } from '../db.js';
import { buildContext } from '../services/context.js';
import { enrichOffer } from '../services/offers.js';
import { CRITERES, reviewScore } from '../services/ratings.js';
import { hasAcceptedApplication, hasReviewed } from '../services/applications.js';
import { displayName } from '../services/text.js';

const summary = (company, rating, offersCount) => ({
  id: company.id,
  nom: company.nom,
  secteur: company.secteur,
  ville: company.ville,
  note: rating.note,
  nbAvis: rating.count,
  nbOffres: offersCount,
});

const publicReview = (r) => ({
  id: r.id,
  auteur: r.auteur,
  contexte: r.contexte,
  notes: r.notes,
  noteGlobale: reviewScore(r),
  commentaire: r.commentaire,
  creeLe: r.creeLe,
  verifie: r.verifie,
});

/** GET /api/companies : annuaire des entreprises. */
export function listCompanies(req, res) {
  const { db, ratings } = buildContext();
  res.json(db.companies.map((c) => summary(c, ratings[c.id], db.offers.filter((o) => o.companyId === c.id).length)));
}

/** GET /api/companies/:id : page entreprise (offres, avis publiés, droit de déposer un avis). */
export function getCompany(req, res) {
  const { db, ratings, companiesById } = buildContext();
  const company = companiesById[Number(req.params.id)];
  if (!company) return res.status(404).json({ message: 'Entreprise introuvable.' });

  const offers = db.offers.filter((o) => o.companyId === company.id).map((o) => enrichOffer(o, companiesById, ratings));
  const avis = db.reviews
    .filter((r) => r.companyId === company.id && r.statut === 'publie')
    .sort((a, b) => b.creeLe.localeCompare(a.creeLe))
    .map(publicReview);
  const user = req.user;
  const peutDeposerAvis =
    !!user &&
    user.role === 'etudiant' &&
    hasAcceptedApplication(user.id, company.id, db.applications, db.offers) &&
    !hasReviewed(user.id, company.id, db.reviews);

  res.json({
    ...summary(company, ratings[company.id], offers.length),
    taille: company.taille,
    description: company.description,
    criteres: ratings[company.id].criteres,
    offres: offers,
    avis,
    peutDeposerAvis,
  });
}

/** POST /api/companies/:id/reviews : dépôt d'un avis (statut « en attente » jusqu'à modération). */
export function addReview(req, res) {
  const db = load();
  const company = db.companies.find((c) => c.id === Number(req.params.id));
  if (!company) return res.status(404).json({ message: 'Entreprise introuvable.' });

  const { notes, commentaire, contexte } = req.body ?? {};
  const notesOk = notes && CRITERES.every((c) => Number.isInteger(notes[c]) && notes[c] >= 1 && notes[c] <= 5);
  if (!notesOk) return res.status(400).json({ message: 'Chaque critère doit être noté de 1 à 5.' });
  if (typeof commentaire !== 'string' || commentaire.trim().length < 20 || commentaire.trim().length > 600) {
    return res.status(400).json({ message: 'Le commentaire doit contenir entre 20 et 600 caractères.' });
  }
  if (!hasAcceptedApplication(req.user.id, company.id, db.applications, db.offers)) {
    return res.status(403).json({ message: 'Seuls les étudiants dont une candidature a été acceptée chez cette entreprise peuvent déposer un avis.' });
  }
  if (hasReviewed(req.user.id, company.id, db.reviews)) {
    return res.status(409).json({ message: 'Vous avez déjà déposé un avis pour cette entreprise.' });
  }

  const review = {
    id: nextId('reviews'),
    companyId: company.id,
    userId: req.user.id,
    auteur: displayName(req.user.nom),
    contexte: typeof contexte === 'string' ? contexte.trim().slice(0, 80) : '',
    notes: Object.fromEntries(CRITERES.map((c) => [c, notes[c]])),
    commentaire: commentaire.trim(),
    creeLe: new Date().toISOString(),
    statut: 'en_attente',
    verifie: true,
  };
  db.reviews.push(review);
  save();
  res.status(201).json({ message: 'Merci ! Votre avis sera publié après modération.' });
}
