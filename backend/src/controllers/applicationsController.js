import { load, save, nextId } from '../db.js';
import { isValidStatut } from '../services/applications.js';

const toView = (app, db) => {
  const offer = db.offers.find((o) => o.id === app.offerId);
  const company = db.companies.find((c) => c.id === offer?.companyId);
  return {
    id: app.id,
    statut: app.statut,
    offreId: app.offerId,
    titre: offer?.titre ?? 'Offre supprimée',
    entreprise: company?.nom ?? '',
    echeance: offer?.dateLimite ?? '',
    creeLe: app.creeLe,
  };
};

/** GET /api/applications : candidatures de l'étudiant connecté. */
export function listApplications(req, res) {
  const db = load();
  res.json(db.applications.filter((a) => a.userId === req.user.id).map((a) => toView(a, db)));
}

/** POST /api/applications { offerId, statut? } : « Postuler » (envoyee) ou « Enregistrer » (a_postuler). */
export function createApplication(req, res) {
  const db = load();
  const { offerId, statut = 'envoyee' } = req.body ?? {};
  if (!db.offers.some((o) => o.id === Number(offerId))) return res.status(404).json({ message: 'Offre introuvable.' });
  if (!['a_postuler', 'envoyee'].includes(statut)) {
    return res.status(400).json({ message: 'Statut initial invalide (a_postuler ou envoyee).' });
  }
  const existing = db.applications.find((a) => a.userId === req.user.id && a.offerId === Number(offerId));
  if (existing) {
    // Une offre enregistrée peut être envoyée ; tout autre doublon est refusé
    if (existing.statut === 'a_postuler' && statut === 'envoyee') {
      existing.statut = 'envoyee';
      existing.majLe = new Date().toISOString();
      save();
      return res.json(toView(existing, db));
    }
    return res.status(409).json({ message: 'Cette offre figure déjà dans votre suivi.' });
  }
  const now = new Date().toISOString();
  const application = { id: nextId('applications'), userId: req.user.id, offerId: Number(offerId), statut, creeLe: now, majLe: now };
  db.applications.push(application);
  save();
  res.status(201).json(toView(application, db));
}

/** PATCH /api/applications/:id { statut } : déplacement d'une carte dans le Kanban. */
export function updateApplication(req, res) {
  const db = load();
  const application = db.applications.find((a) => a.id === Number(req.params.id) && a.userId === req.user.id);
  if (!application) return res.status(404).json({ message: 'Candidature introuvable.' });
  if (!isValidStatut(req.body?.statut)) return res.status(400).json({ message: 'Statut invalide.' });
  application.statut = req.body.statut;
  application.majLe = new Date().toISOString();
  save();
  res.json(toView(application, db));
}

/** DELETE /api/applications/:id */
export function deleteApplication(req, res) {
  const db = load();
  const index = db.applications.findIndex((a) => a.id === Number(req.params.id) && a.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Candidature introuvable.' });
  db.applications.splice(index, 1);
  save();
  res.status(204).end();
}
