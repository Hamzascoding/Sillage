import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';
import { load, save, nextId } from '../db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPublicUser = (u) => ({ id: u.id, nom: u.nom, email: u.email, role: u.role });
const signToken = (u) => jwt.sign({ uid: u.id, role: u.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/** POST /api/auth/register : création d'un compte étudiant. */
export function register(req, res) {
  const { nom, email, motDePasse } = req.body ?? {};
  if (typeof nom !== 'string' || nom.trim().length < 2) {
    return res.status(400).json({ message: 'Le nom doit contenir au moins 2 caractères.' });
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: 'Adresse e-mail invalide.' });
  }
  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  const db = load();
  const emailNorm = email.trim().toLowerCase();
  if (db.users.some((u) => u.email === emailNorm)) {
    return res.status(409).json({ message: 'Un compte existe déjà avec cette adresse e-mail.' });
  }
  const user = {
    id: nextId('users'),
    nom: nom.trim(),
    email: emailNorm,
    role: 'etudiant',
    passwordHash: bcrypt.hashSync(motDePasse, 10),
    creeLe: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
}

/** POST /api/auth/login */
export function login(req, res) {
  const { email, motDePasse } = req.body ?? {};
  const user = typeof email === 'string' ? load().users.find((u) => u.email === email.trim().toLowerCase()) : null;
  if (!user || typeof motDePasse !== 'string' || !bcrypt.compareSync(motDePasse, user.passwordHash)) {
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' });
  }
  res.json({ token: signToken(user), user: toPublicUser(user) });
}

/** GET /api/auth/me */
export function me(req, res) {
  res.json(toPublicUser(req.user));
}
