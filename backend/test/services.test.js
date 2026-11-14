import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, displayName } from '../src/services/text.js';
import { computeRating, reviewScore } from '../src/services/ratings.js';
import { enrichOffer, filterOffers, paginate } from '../src/services/offers.js';
import { hasAcceptedApplication, hasReviewed, isValidStatut } from '../src/services/applications.js';
import { buildContext } from '../src/services/context.js';
import { freshDb } from './helpers.js';

const enrichedOffers = () => {
  freshDb();
  const { db, ratings, companiesById } = buildContext();
  return db.offers.map((o) => enrichOffer(o, companiesById, ratings));
};

test('normalize retire les accents et la casse', () => {
  assert.equal(normalize('  Sécurité Réseau '), 'securite reseau');
});

test('displayName abrège le nom de famille', () => {
  assert.equal(displayName('Aziz Ben Salah'), 'Aziz S.');
  assert.equal(displayName('Aziz'), 'Aziz');
  assert.equal(displayName(''), 'Étudiant');
});

test('computeRating ignore les avis non publiés et renvoie null sans avis', () => {
  const notes = { encadrement: 4, missions: 4, apprentissage: 4, ambiance: 4, gratification: 4 };
  const rating = computeRating([
    { statut: 'publie', notes },
    { statut: 'en_attente', notes: { ...notes, encadrement: 1 } },
  ]);
  assert.equal(rating.count, 1);
  assert.equal(rating.note, 4);
  assert.equal(computeRating([]).note, null);
  assert.equal(reviewScore({ notes: { encadrement: 5, missions: 4, apprentissage: 4, ambiance: 4, gratification: 3 } }), 4);
});

test('filterOffers : niveau, mode, rémunération combinés', () => {
  const offers = enrichedOffers();
  const res = filterOffers(offers, { niveau: 'PFE', mode: 'Hybride', remunere: 'true' });
  assert.ok(res.length > 0);
  assert.ok(res.every((o) => o.niveau === 'PFE' && o.mode === 'Hybride' && o.remunere));
});

test('filterOffers : recherche texte insensible aux accents', () => {
  const offers = enrichedOffers();
  const res = filterOffers(offers, { q: 'securite' });
  assert.ok(res.some((o) => o.titre.includes('Sécurité')));
});

test('filterOffers : noteMin exclut les entreprises sans avis suffisants', () => {
  const offers = enrichedOffers();
  const res = filterOffers(offers, { noteMin: '4.5' });
  assert.ok(res.every((o) => o.entreprise.note >= 4.5));
  assert.ok(res.length < offers.length);
});

test('filterOffers : tri par note puis par date', () => {
  const offers = enrichedOffers();
  const byNote = filterOffers(offers, { tri: 'note' });
  assert.ok((byNote[0].entreprise.note ?? 0) >= (byNote[byNote.length - 1].entreprise.note ?? 0));
  const recent = filterOffers(offers, { tri: 'recent' });
  assert.ok(recent[0].publieLe >= recent[1].publieLe);
});

test('paginate borne la page et la taille', () => {
  const items = Array.from({ length: 13 }, (_, i) => i);
  const p = paginate(items, 99, 6);
  assert.equal(p.page, 3);
  assert.equal(p.pages, 3);
  assert.deepEqual(p.items, [12]);
  assert.equal(paginate([], 1, 6).pages, 1);
});

test('règles des candidatures et des avis', () => {
  const db = freshDb();
  assert.equal(isValidStatut('entretien'), true);
  assert.equal(isValidStatut('inconnu'), false);
  // L'étudiant de démonstration a une candidature acceptée chez l'entreprise 6, pas chez la 1
  assert.equal(hasAcceptedApplication(1, 6, db.applications, db.offers), true);
  assert.equal(hasAcceptedApplication(1, 1, db.applications, db.offers), false);
  assert.equal(hasReviewed(1, 6, db.reviews), false);
});
