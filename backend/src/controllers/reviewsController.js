import { load, save } from '../db.js';

/** GET /api/reviews?statut=en_attente (rôle admin) : file de modération. */
export function listReviews(req, res) {
  const statut = req.query.statut || 'en_attente';
  res.json(load().reviews.filter((r) => r.statut === statut));
}

/** PATCH /api/reviews/:id { statut: 'publie' | 'rejete' } (rôle admin) */
export function moderateReview(req, res) {
  const review = load().reviews.find((r) => r.id === Number(req.params.id));
  if (!review) return res.status(404).json({ message: 'Avis introuvable.' });
  if (!['publie', 'rejete'].includes(req.body?.statut)) {
    return res.status(400).json({ message: 'Statut invalide (publie ou rejete).' });
  }
  review.statut = req.body.statut;
  save();
  res.json(review);
}
