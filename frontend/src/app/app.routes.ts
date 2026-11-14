import { Routes, CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { authGuard, studentGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';

const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (): boolean | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/connexion']);
    }

    const role = auth.user()?.role;

    return role && allowedRoles.includes(role) ? true : router.createUrlTree(['/']);
  };
};

export const routes: Routes = [
  {
    path: '',
    title: 'Sillage · Stages et PFE',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'offres',
    title: 'Offres · Sillage',
    loadComponent: () => import('./pages/offers/offers.component').then((m) => m.OffersComponent),
  },
  {
    path: 'offres/:id',
    title: 'Fiche offre · Sillage',
    loadComponent: () =>
      import('./pages/offer-detail/offer-detail.component').then((m) => m.OfferDetailComponent),
  },
  {
    path: 'entreprises',
    title: 'Entreprises · Sillage',
    loadComponent: () =>
      import('./pages/companies/companies.component').then((m) => m.CompaniesComponent),
  },
  {
    path: 'entreprises/:id',
    title: 'Entreprise · Sillage',
    loadComponent: () =>
      import('./pages/company/company.component').then((m) => m.CompanyComponent),
  },

  {
    path: 'connexion',
    title: 'Connexion · Sillage',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'suivi',
    title: 'Mes candidatures · Sillage',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('./pages/tracking/tracking.component').then((m) => m.TrackingComponent),
  },

  {
    path: 'espace-entreprise',
    title: 'Espace entreprise · Sillage',
    canActivate: [authGuard, roleGuard(['entreprise'])],
    loadComponent: () =>
      import('./pages/company-dashboard/company-dashboard.component').then(
        (m) => m.CompanyDashboardComponent,
      ),
  },

  {
    path: 'espace-entreprise/nouvelle-offre',
    title: 'Créer une offre · Sillage',
    canActivate: [authGuard, roleGuard(['entreprise'])],
    loadComponent: () =>
      import('./pages/company-dashboard/offer-create.component').then(
        (m) => m.OfferCreateComponent,
      ),
  },
  {
    path: 'favoris',
    title: 'Mes favoris · Sillage',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('./pages/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: 'profil',
    title: 'Mon profil · Sillage',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
