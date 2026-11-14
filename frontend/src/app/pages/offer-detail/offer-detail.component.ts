import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Offer } from '../../core/models';
import { FrDatePipe } from '../../shared/fr-date.pipe';
import { StarsComponent } from '../../shared/stars.component';
import { FavoritesService } from '../../core/favorites.service';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [RouterLink, StarsComponent, FrDatePipe],
  templateUrl: './offer-detail.component.html',
})
export class OfferDetailComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly favorites = inject(FavoritesService);

  readonly auth = inject(AuthService);

  readonly offer = signal<Offer | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly message = signal('');
  readonly messageIsError = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading.set(true);
          this.error.set('');
          this.message.set('');
          this.offer.set(null);
        }),
        switchMap((id) =>
          this.api.offer(id).pipe(
            catchError((err) => {
              // If the API does not know this offer, check localStorage.
              const localOffer = this.findLocalOffer(id);

              if (localOffer) {
                return of(localOffer);
              }

              this.error.set(
                err.status === 404
                  ? 'Cette offre n’existe pas ou a été retirée.'
                  : 'Impossible de charger l’offre.',
              );

              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((offer) => {
        this.offer.set(offer);
        this.loading.set(false);
      });
  }

  private findLocalOffer(id: number): Offer | null {
    try {
      const stored = JSON.parse(localStorage.getItem('sillage_company_offers') || '[]');

      if (!Array.isArray(stored)) return null;

      const raw = stored.find((item: Record<string, any>) => Number(item.id) === id);

      if (!raw) return null;

      return {
        id: Number(raw.id),
        titre: String(raw.titre || ''),
        type: String(raw.type || 'Stage'),
        niveau: raw.niveau,
        mode: raw.mode,
        ville: String(raw.ville || ''),
        dureeSemaines: Number(raw.dureeSemaines || 0),
        remunere: Boolean(raw.remunere),
        description: String(raw.description || ''),
        missions: Array.isArray(raw.missions) ? raw.missions : [],
        profil: Array.isArray(raw.profil) ? raw.profil : [],
        publieLe: String(raw.publieLe || ''),
        dateLimite: String(raw.dateLimite || ''),
        entreprise: {
          id: Number(raw.companyId || 1),
          nom: this.auth.user()?.nom || 'Entreprise A',
          secteur: 'Entreprise',
          ville: String(raw.ville || ''),
          note: null,
          nbAvis: 0,
        },
      };
    } catch {
      return null;
    }
  }
  isOwnOffer(): boolean {
    const offer = this.offer();
    const user = this.auth.user();

    if (!offer || !user || user.role !== 'entreprise') {
      return false;
    }

    return offer.entreprise.nom === user.nom;
  }

  saveFavorite(): void {
    const offer = this.offer();
    if (!offer) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }

    if (this.auth.user()?.role !== 'etudiant') return;

    const saved = this.favorites.toggle(offer.id);

    this.messageIsError.set(false);
    this.message.set(saved ? 'Offre ajoutée à vos favoris.' : 'Offre retirée de vos favoris.');
  }
  isFavorite(): boolean {
    const offer = this.offer();
    return offer ? this.favorites.has(offer.id) : false;
  }
  showDeleteDemo(): void {
    if (!this.isOwnOffer()) return;

    this.messageIsError.set(false);
    this.message.set(
      'Fonctionnalité de démonstration : la suppression des offres sera disponible prochainement.',
    );
  }
  act(statut: 'envoyee' | 'a_postuler'): void {
    const offer = this.offer();
    if (!offer) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }

    // Locally created offers are demo-only and are not stored by the API.
    const isLocalOffer = this.isLocalOffer(offer.id);

    if (isLocalOffer) {
      this.messageIsError.set(false);
      this.message.set(
        'Cette offre est une offre de démonstration : la candidature en ligne n’est pas activée.',
      );
      return;
    }

    this.busy.set(true);
    this.message.set('');

    this.api.apply(offer.id, statut).subscribe({
      next: () => {
        this.messageIsError.set(false);
        this.message.set(
          statut === 'envoyee'
            ? 'Candidature enregistrée. Suivez-la dans « Mes candidatures ».'
            : 'Offre enregistrée dans la colonne « À postuler ».',
        );
        this.busy.set(false);
      },
      error: (err) => {
        this.messageIsError.set(true);
        this.message.set(err.error?.message ?? 'Une erreur est survenue. Réessayez.');
        this.busy.set(false);
      },
    });
  }

  private isLocalOffer(id: number): boolean {
    try {
      const stored = JSON.parse(localStorage.getItem('sillage_company_offers') || '[]');

      return (
        Array.isArray(stored) && stored.some((item: Record<string, any>) => Number(item.id) === id)
      );
    } catch {
      return false;
    }
  }
}
