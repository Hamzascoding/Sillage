
import { Router } from 'express';
import {
  authenticate,
  optionalAuth,
  requireRole,
} from '../middleware/auth.js';

import { register, login, me } from '../controllers/authController.js';

import {
  listOffers,
  getOffer,
  createOffer,
} from '../controllers/offersController.js';

import {
  listCompanies,
  getCompany,
  addReview,
} from '../controllers/companiesController.js';

import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationsController.js';

import {
  listReviews,
  moderateReview,
} from '../controllers/reviewsController.js';

const router = Router();

// ==========================================
// AUTHENTIFICATION
// ==========================================

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, me);

// ==========================================
// OFFRES
// ==========================================

// Consultation publique
router.get('/offers', listOffers);
router.get('/offers/:id', getOffer);

// Création réservée aux entreprises
router.post(
  '/offers',
  authenticate,
  requireRole('entreprise'),
  createOffer
);

// ==========================================
// ENTREPRISES
// ==========================================

// Consultation publique
router.get('/companies', listCompanies);
router.get('/companies/:id', optionalAuth, getCompany);

// Seuls les étudiants peuvent publier des avis
router.post(
  '/companies/:id/reviews',
  authenticate,
  requireRole('etudiant'),
  addReview
);

// ==========================================
// CANDIDATURES
// ==========================================

// Toutes les opérations sont réservées aux étudiants
router.get(
  '/applications',
  authenticate,
  requireRole('etudiant'),
  listApplications
);

router.post(
  '/applications',
  authenticate,
  requireRole('etudiant'),
  createApplication
);

router.patch(
  '/applications/:id',
  authenticate,
  requireRole('etudiant'),
  updateApplication
);

router.delete(
  '/applications/:id',
  authenticate,
  requireRole('etudiant'),
  deleteApplication
);

// ==========================================
// MODÉRATION DES AVIS
// ==========================================

// Réservée à l'administration de l'école
router.get(
  '/reviews',
  authenticate,
  requireRole('admin'),
  listReviews
);

router.patch(
  '/reviews/:id',
  authenticate,
  requireRole('admin'),
  moderateReview
);

export default router;
