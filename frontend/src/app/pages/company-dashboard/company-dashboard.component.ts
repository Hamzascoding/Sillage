
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Offer } from '../../core/models';
import { OfferCardComponent } from '../../shared/offer-card.component';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [RouterLink, OfferCardComponent],
  template: `
    <div class="space-y-8">
      <section class="rounded-2xl bg-encre p-6 text-white sm:p-8">
        <p class="text-sm font-medium text-white/60">ESPACE ENTREPRISE</p>

        <div class="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 class="font-display text-2xl font-bold sm:text-3xl">
              Bonjour, {{ auth.user()?.nom }} 👋
            </h1>
            <p class="mt-2 text-white/70">
              Gérez vos offres de stage et trouvez vos futurs talents.
            </p>
          </div>

          <a routerLink="/espace-entreprise/nouvelle-offre"
             class="btn-primary shrink-0 text-center">
            + Créer une offre
          </a>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-bold">Vue d'ensemble</h2>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article class="card p-5">
            <span class="text-sm text-muted">Total des offres</span>
            <p class="mt-3 font-display text-3xl font-bold">{{ offers().length }}</p>
            <p class="mt-1 text-xs text-muted">Offres publiées</p>
          </article>

          <article class="card p-5">
            <span class="text-sm text-muted">Offres actives</span>
            <p class="mt-3 font-display text-3xl font-bold">{{ activeCount() }}</p>
            <p class="mt-1 text-xs text-muted">Dates limites non dépassées</p>
          </article>

          <article class="card p-5">
            <span class="text-sm text-muted">Offres expirées</span>
            <p class="mt-3 font-display text-3xl font-bold">{{ expiredCount() }}</p>
            <p class="mt-1 text-xs text-muted">Dates limites dépassées</p>
          </article>
        </div>
      </section>

      <section>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold">Mes offres</h2>
            <p class="mt-1 text-sm text-muted">
              Consultez les offres publiées par votre entreprise.
            </p>
          </div>

          <a routerLink="/espace-entreprise/nouvelle-offre" class="btn-secondary">
            + Nouvelle offre
          </a>
        </div>

        @if (loading()) {
          <div class="card mt-4 p-8 text-center">
            <p class="text-muted">Chargement de vos offres...</p>
          </div>
        } @else if (error() && offers().length === 0) {
          <div class="card mt-4 p-6 text-center">
            <p class="font-semibold">{{ error() }}</p>
            <button type="button" class="btn-secondary mt-4" (click)="loadOffers()">
              Réessayer
            </button>
          </div>
        } @else if (offers().length === 0) {
          <div class="card mt-4 p-10 text-center">
            <div class="text-4xl" aria-hidden="true">📄</div>
            <h3 class="mt-4 font-bold">Aucune offre pour le moment</h3>
            <p class="mt-2 text-sm text-muted">
              Publiez votre première offre pour attirer des candidats.
            </p>
            <a routerLink="/espace-entreprise/nouvelle-offre"
               class="btn-primary mt-5 inline-block">
              Créer ma première offre
            </a>
          </div>
        } @else {
          @if (error()) {
            <p class="mt-3 text-sm text-ambre">{{ error() }}</p>
          }

          <div class="mt-4 space-y-3">
            @for (offer of offers(); track offer.id) {
              <app-offer-card [offer]="offer" />
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class CompanyDashboardComponent {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly offers = signal<Offer[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly activeCount = computed(() =>
    this.offers().filter(
      offer => offer.dateLimite >= new Date().toISOString().slice(0, 10)
    ).length
  );

  readonly expiredCount = computed(() =>
    this.offers().length - this.activeCount()
  );

  constructor() {
    this.loadOffers();
  }

  private getLocalOffers(): Offer[] {
    try {
      const stored = JSON.parse(
        localStorage.getItem('sillage_company_offers') || '[]'
      ) as Array<Record<string, any>>;

      const companyName = this.auth.user()?.nom || 'Entreprise A';

      return stored
        .filter(offer => Number(offer['companyId']) === 1)
        .map(offer => ({
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
        }));
    } catch {
      return [];
    }
  }

  loadOffers(): void {
    this.loading.set(true);
    this.error.set('');

    const localOffers = this.getLocalOffers();

    this.api.offers({ limit: 50 }).subscribe({
      next: result => {
        const companyName = this.auth.user()?.nom;

        const apiOffers = result.items.filter(
          offer => offer.entreprise.nom === companyName
        );

        const existingIds = new Set(apiOffers.map(offer => offer.id));

        const combined = [
          ...apiOffers,
          ...localOffers.filter(offer => !existingIds.has(offer.id)),
        ];

        this.offers.set(combined);
        this.loading.set(false);
      },
      error: () => {
        this.offers.set(localOffers);
        this.error.set(
          'Serveur indisponible : affichage des offres enregistrées localement.'
        );
        this.loading.set(false);
      },
    });
  }
}
