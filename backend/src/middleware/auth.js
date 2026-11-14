// Authentification par jeton JWT (en-tête « Authorization: Bearer <jeton> »)
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { load } from '../db.js';

function readUser(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return load().users.find((u) => u.id === payload.uid) || null;
  } catch {
    return null; // jeton invalide ou expiré
  }
}

/** Identifie l'utilisateur s'il est connecté, sans bloquer les visiteurs. */
export function optionalAuth(req, res, next) {
  req.user = readUser(req);
  next();
}

/** Exige un utilisateur connecté. */
export function authenticate(req, res, next) {
  const user = readUser(req);
  if (!user) return res.status(401).json({ message: 'Authentification requise.' });
  req.user = user;
  next();
}

/** Exige l'un des rôles donnés (à placer après authenticate). */
export function requireRole(...roles) {
  return (req, res, next) =>
    roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Accès refusé pour ce rôle.' });
}
