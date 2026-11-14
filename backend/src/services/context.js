// Prépare les données calculées souvent utiles aux contrôleurs (notes, entreprises par id).
import { load } from '../db.js';
import { ratingsByCompany } from './ratings.js';

export function buildContext() {
  const db = load();
  const ratings = ratingsByCompany(db.companies, db.reviews);
  const companiesById = Object.fromEntries(db.companies.map((c) => [c.id, c]));
  return { db, ratings, companiesById };
}
