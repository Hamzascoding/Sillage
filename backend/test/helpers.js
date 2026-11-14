import './setup.js';
import { resetDb } from '../src/db.js';
import { buildSeed } from '../src/seed.js';

/** Réinitialise la base mémoire avec les données de démonstration. */
export const freshDb = () => resetDb(buildSeed({ hash: (p) => `hash:${p}` }));

/** Faux objet « res » d'Express, suffisant pour tester les contrôleurs. */
export function mockRes() {
  const res = { code: 200, body: undefined };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.end = () => res;
  return res;
}
