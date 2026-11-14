import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { freshDb, mockRes } from './helpers.js';
import { load } from '../src/db.js';
import { listOffers, getOffer } from '../src/controllers/offersController.js';
import { listCompanies, getCompany, addReview } from '../src/controllers/companiesController.js';
import { listApplications, createApplication, updateApplication, deleteApplication } from '../src/controllers/applicationsController.js';
import { listReviews, moderateReview } from '../src/controllers/reviewsController.js';

const student = () => load().users.find((u) => u.id === 1);
const goodNotes = { encadrement: 5, missions: 4, apprentissage: 4, ambiance: 5, gratification: 3 };
const validReview = { notes: goodNotes, commentaire: 'Très bonne expérience, tuteur disponible et missions concrètes.', contexte: 'PFE 2026' };

beforeEach(() => freshDb());

test('GET /offers : pagination et filtre', () => {
  const res = mockRes();
  listOffers({ query: { niveau: 'PFE', limit: '3' } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.items.length, 3);
  assert.ok(res.body.total >= 3);
  assert.ok(res.body.items.every((o) => o.niveau === 'PFE' && o.entreprise.nom));
});

test('GET /offers/:id : succès et 404', () => {
  const ok = mockRes();
  getOffer({ params: { id: '1' } }, ok);
  assert.equal(ok.body.titre, 'Support réseau & NOC');
  assert.equal(ok.body.companyId, undefined);
  const ko = mockRes();
  getOffer({ params: { id: '999' } }, ko);
  assert.equal(ko.code, 404);
});

test('GET /companies et /companies/:id (avis publiés uniquement)', () => {
  const list = mockRes();
  listCompanies({}, list);
  assert.equal(list.body.length, 6);
  const res = mockRes();
  getCompany({ params: { id: '5' }, user: null }, res);
  assert.equal(res.body.avis.length, 0); // l'avis de l'entreprise E est en attente
  assert.equal(res.body.note, null);
  assert.equal(res.body.peutDeposerAvis, false);
  const ko = mockRes();
  getCompany({ params: { id: '99' } }, ko);
  assert.equal(ko.code, 404);
});

test('Dépôt d’un avis : refus sans candidature acceptée, validation, succès, doublon', () => {
  const user = student();
  const forbidden = mockRes();
  addReview({ params: { id: '1' }, user, body: validReview }, forbidden);
  assert.equal(forbidden.code, 403);

  const invalid = mockRes();
  addReview({ params: { id: '6' }, user, body: { ...validReview, commentaire: 'trop court' } }, invalid);
  assert.equal(invalid.code, 400);
  const badNotes = mockRes();
  addReview({ params: { id: '6' }, user, body: { ...validReview, notes: { ...goodNotes, ambiance: 9 } } }, badNotes);
  assert.equal(badNotes.code, 400);

  const before = mockRes();
  getCompany({ params: { id: '6' }, user }, before);
  assert.equal(before.body.peutDeposerAvis, true);

  const created = mockRes();
  addReview({ params: { id: '6' }, user, body: validReview }, created);
  assert.equal(created.code, 201);

  const after = mockRes();
  getCompany({ params: { id: '6' }, user }, after);
  assert.equal(after.body.avis.length, 0); // en attente de modération : non visible
  assert.equal(after.body.peutDeposerAvis, false);

  const duplicate = mockRes();
  addReview({ params: { id: '6' }, user, body: validReview }, duplicate);
  assert.equal(duplicate.code, 409);
});

test('Modération : un avis approuvé devient visible et compte dans la note', () => {
  const user = student();
  addReview({ params: { id: '6' }, user, body: validReview }, mockRes());
  const queue = mockRes();
  listReviews({ query: {} }, queue);
  const pending = queue.body.find((r) => r.companyId === 6);
  assert.ok(pending);

  const bad = mockRes();
  moderateReview({ params: { id: String(pending.id) }, body: { statut: 'nimporte' } }, bad);
  assert.equal(bad.code, 400);

  const ok = mockRes();
  moderateReview({ params: { id: String(pending.id) }, body: { statut: 'publie' } }, ok);
  assert.equal(ok.body.statut, 'publie');

  const company = mockRes();
  getCompany({ params: { id: '6' }, user: null }, company);
  assert.equal(company.body.nbAvis, 1);
  assert.equal(company.body.avis[0].auteur, 'Aziz B.');
});

test('Candidatures : liste, création, doublon, mise à niveau « enregistrée » -> « envoyée »', () => {
  const user = student();
  const list = mockRes();
  listApplications({ user }, list);
  assert.equal(list.body.length, 9);
  assert.ok(list.body.every((a) => a.titre && a.entreprise));

  const created = mockRes();
  createApplication({ user, body: { offerId: 1 } }, created);
  assert.equal(created.code, 201);
  assert.equal(created.body.statut, 'envoyee');

  const duplicate = mockRes();
  createApplication({ user, body: { offerId: 1 } }, duplicate);
  assert.equal(duplicate.code, 409);

  const saved = mockRes();
  createApplication({ user, body: { offerId: 2, statut: 'a_postuler' } }, saved);
  assert.equal(saved.body.statut, 'a_postuler');
  const upgraded = mockRes();
  createApplication({ user, body: { offerId: 2, statut: 'envoyee' } }, upgraded);
  assert.equal(upgraded.code, 200);
  assert.equal(upgraded.body.statut, 'envoyee');

  const unknown = mockRes();
  createApplication({ user, body: { offerId: 999 } }, unknown);
  assert.equal(unknown.code, 404);
  const badStatus = mockRes();
  createApplication({ user, body: { offerId: 3, statut: 'acceptee' } }, badStatus);
  assert.equal(badStatus.code, 400);
});

test('Candidatures : déplacement Kanban, propriété et suppression', () => {
  const user = student();
  const moved = mockRes();
  updateApplication({ user, params: { id: '1' }, body: { statut: 'envoyee' } }, moved);
  assert.equal(moved.body.statut, 'envoyee');

  const invalid = mockRes();
  updateApplication({ user, params: { id: '1' }, body: { statut: 'nope' } }, invalid);
  assert.equal(invalid.code, 400);

  const stranger = { id: 2, role: 'etudiant', nom: 'Autre' };
  const notOwner = mockRes();
  updateApplication({ user: stranger, params: { id: '1' }, body: { statut: 'refusee' } }, notOwner);
  assert.equal(notOwner.code, 404);

  const removed = mockRes();
  deleteApplication({ user, params: { id: '1' } }, removed);
  assert.equal(removed.code, 204);
  const again = mockRes();
  deleteApplication({ user, params: { id: '1' } }, again);
  assert.equal(again.code, 404);
});
