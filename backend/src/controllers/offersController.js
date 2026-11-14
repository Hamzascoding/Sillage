
import { load, save, nextId } from '../db.js';
import { buildContext } from '../services/context.js';
import { enrichOffer, filterOffers, paginate } from '../services/offers.js';

/** GET /api/offers */
export function listOffers(req, res) {
  const { db, ratings, companiesById } = buildContext();
  const enriched = db.offers.map((o) =>
    enrichOffer(o, companiesById, ratings)
  );

  res.json(
    paginate(
      filterOffers(enriched, req.query),
      req.query.page,
      req.query.limit
    )
  );
}

/** GET /api/offers/:id */
export function getOffer(req, res) {
  const { db, ratings, companiesById } = buildContext();

  const offer = db.offers.find(
    (o) => o.id === Number(req.params.id)
  );

  if (!offer) {
    return res.status(404).json({ message: 'Offre introuvable.' });
  }

  res.json(enrichOffer(offer, companiesById, ratings));
}

/**
 * POST /api/offers
 * Réservé aux entreprises authentifiées.
 */
export function createOffer(req, res) {
  const db = load();

  // 1. Vérifier l'entreprise associée au compte connecté
  const companyId = req.user.companyId;

  const company = db.companies.find(
    (c) => c.id === Number(companyId)
  );

  if (!company) {
    return res.status(403).json({
      message: 'Aucune entreprise associée à ce compte.',
    });
  }

  // 2. Récupérer les informations du formulaire
  const {
    titre,
    type,
    niveau,
    mode,
    ville,
    dureeSemaines,
    remunere,
    dateLimite,
    description,
    missions,
    profil,
  } = req.body ?? {};

  // 3. Validation des champs obligatoires
  if (
    !titre?.trim() ||
    !type?.trim() ||
    !niveau ||
    !mode ||
    !ville?.trim() ||
    !description?.trim() ||
    !dateLimite
  ) {
    return res.status(400).json({
      message: 'Veuillez remplir tous les champs obligatoires.',
    });
  }

  // 4. Validation des valeurs autorisées
  const validNiveaux = ['1re année', '2e année', 'PFE'];
  const validModes = ['Sur site', 'Hybride', 'À distance'];

  if (!validNiveaux.includes(niveau)) {
    return res.status(400).json({
      message: 'Niveau invalide.',
    });
  }

  if (!validModes.includes(mode)) {
    return res.status(400).json({
      message: 'Mode de travail invalide.',
    });
  }

  if (
    !Number.isInteger(Number(dureeSemaines)) ||
    Number(dureeSemaines) <= 0
  ) {
    return res.status(400).json({
      message: 'La durée doit être un nombre entier positif.',
    });
  }

  if (typeof remunere !== 'boolean') {
    return res.status(400).json({
      message: 'Veuillez préciser si le stage est rémunéré.',
    });
  }

  // 5. Vérifier le format de la date
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateLimite) ||
    Number.isNaN(Date.parse(`${dateLimite}T00:00:00`)) ||
    new Date(`${dateLimite}T00:00:00`)
      .toISOString().slice(0, 10) !== dateLimite
  ) {
    return res.status(400).json({
      message: 'Date limite invalide.',
    });
  }

  // 6. Valider les listes
  if (
    !Array.isArray(missions) ||
    !Array.isArray(profil) ||
    missions.some((m) => typeof m !== 'string' || !m.trim()) ||
    profil.some((p) => typeof p !== 'string' || !p.trim())
  ) {
    return res.status(400).json({
      message: 'Les missions et le profil doivent être des listes de textes.',
    });
  }

  // 7. Créer l'offre
  const offer = {
    id: nextId('offers'),
    companyId: company.id,
    titre: titre.trim(),
    type: type.trim(),
    niveau,
    mode,
    ville: ville.trim(),
    dureeSemaines: Number(dureeSemaines),
    remunere,
    publieLe: new Date().toISOString().slice(0, 10),
    dateLimite,
    description: description.trim(),
    missions: missions.map((m) => m.trim()),
    profil: profil.map((p) => p.trim()),
  };

  // 8. Enregistrer dans la base JSON
  db.offers.push(offer);
  save();

  // 9. Retourner l'offre avec les informations de l'entreprise
  const { ratings, companiesById } = buildContext();

  return res.status(201).json(
    enrichOffer(offer, companiesById, ratings)
  );
}
