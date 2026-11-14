
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { FavoritesService } from '../../core/favorites.service';
import { Offer } from '../../core/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly favorites = inject(FavoritesService);

  readonly offers = signal<Offer[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.loadFavorites();
  }

  private getLocalOffers(): Offer[] {
    try {
      const stored = JSON.parse(
        localStorage.getItem('sillage_company_offers') || '[]'
      ) as Array<Record<string, any>>;

      const companyName = 'Entreprise A';

      return stored
        .map((offer) => ({
          id: Number(offer['id']),
          titre: String(offer['titre'] || ''),
          type: String(offer['type'] || 'Stage'),
          niveau: offer['niveau'] as Offer['niveau'],
          mode: offer['mode'] as Offer['mode'],
          ville: String(offer['ville'] || ''),
          dureeSemaines: Number(offer['dureeSemaines'] || 0),
          remunere: Boolean(offer['remunere']),
          description: String(offer['description'] || ''),
          missions: Array.isArray(offer['missions']) ? offer['missions'] : [],
          profil: Array.isArray(offer['profil']) ? offer['profil'] : [],
          publieLe: String(offer['publieLe'] || new Date().toISOString()),
          dateLimite: String(offer['dateLimite'] || ''),
          entreprise: {
            id: 1,
            nom: companyName,
            secteur: 'Entreprise',
            ville: String(offer['ville'] || ''),
            note: null,
            nbAvis: 0,
          },
        }))
        .filter((offer) => Number.isFinite(offer.id));
    } catch {
      return [];
    }
  }

  loadFavorites(): void {
    this.loading.set(true);
    this.error.set('');

    const ids = this.favorites.getAll();

    if (ids.length === 0) {
      this.offers.set([]);
      this.loading.set(false);
      return;
    }

    // Récupérer les offres créées localement par les entreprises.
    const localOffers = this.getLocalOffers().filter((offer) =>
      ids.includes(offer.id)
    );

    // Récupérer également les offres provenant de l'API.
    this.api.offers({ limit: 100 }).subscribe({
      next: (result) => {
        const apiOffers = result.items.filter((offer) =>
          ids.includes(offer.id)
        );

        // Éviter les doublons si une offre existe dans les deux sources.
        const existingIds = new Set(apiOffers.map((offer) => offer.id));

        this.offers.set([
          ...apiOffers,
          ...localOffers.filter((offer) => !existingIds.has(offer.id)),
        ]);

        this.loading.set(false);
      },
      error: () => {
        // Même si l'API est indisponible, les favoris locaux restent visibles.
        this.offers.set(localOffers);

        if (localOffers.length === 0) {
          this.error.set(
            'Impossible de charger vos favoris. Vérifiez que le serveur est démarré.'
          );
        } else {
          this.error.set(
            'Serveur indisponible : affichage de vos favoris enregistrés localement.'
          );
        }

        this.loading.set(false);
      },
    });
  }

  remove(offerId: number): void {
    this.favorites.remove(offerId);
    this.offers.update((offers) =>
      offers.filter((offer) => offer.id !== offerId)
    );
  }
}
