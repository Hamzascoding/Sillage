
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Offer, PageResult } from '../../core/models';
import { OfferCardComponent } from '../../shared/offer-card.component';

const DEFAULT_FILTERS = {
  q: '',
  niveau: '',
  mode: '',
  remunere: false,
  noteMin: 0,
  tri: 'recent',
};

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [ReactiveFormsModule, OfferCardComponent],
  templateUrl: './offers.component.html',
})
export class OffersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly niveaux = ['1re année', '2e année', 'PFE'];
  readonly modes = ['Sur site', 'Hybride', 'À distance'];

  readonly notes = [
    { value: 0, label: 'Toutes' },
    { value: 3, label: '3 et plus' },
    { value: 4, label: '4 et plus' },
    { value: 4.5, label: '4,5 et plus' },
  ];

  readonly tris = [
    { value: 'recent', label: 'Plus récentes' },
    { value: 'note', label: 'Mieux notées' },
    { value: 'echeance', label: 'Date limite proche' },
  ];

  readonly form = this.fb.nonNullable.group({ ...DEFAULT_FILTERS });
  readonly page = signal(1);
  readonly result = signal<PageResult<Offer> | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.result()?.pages ?? 0 }, (_, i) => i + 1)
  );

  private readonly load$ = new Subject<void>();
  private syncingUrl = false;

  ngOnInit(): void {
    this.load$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set('');
        }),
        switchMap(() =>
          this.api.offers({
            ...this.form.getRawValue(),
            page: this.page(),
            limit: 6,
          }).pipe(
            catchError(() => {
              this.error.set(
                'Impossible de charger les offres. Vérifiez que l’API est démarrée.'
              );
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((apiResult) => {
        this.loading.set(false);

        if (!apiResult) return;

        const filters = this.form.getRawValue();

        // Les offres locales sont ajoutées à la première page uniquement.
        const localOffers = this.page() === 1
          ? this.getLocalOffers().filter((offer) =>
              this.matchesFilters(offer, filters)
            )
          : [];

        const apiIds = new Set(apiResult.items.map((offer) => offer.id));

        // Les nouvelles offres locales apparaissent en premier.
        const combinedOffers = [
          ...localOffers
            .filter((offer) => !apiIds.has(offer.id))
            .sort(
              (a, b) =>
                new Date(b.publieLe).getTime() -
                new Date(a.publieLe).getTime()
            ),
          ...apiResult.items,
        ];

        this.result.set({
          ...apiResult,
          items: combinedOffers,
        });
      });

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.syncUrl();
        this.load$.next();
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (this.syncingUrl) return;

        const incoming = {
          q: params.get('q') ?? '',
          niveau: params.get('niveau') ?? '',
          mode: params.get('mode') ?? '',
        };

        const current = this.form.getRawValue();

        if (
          incoming.q !== current.q ||
          incoming.niveau !== current.niveau ||
          incoming.mode !== current.mode
        ) {
          this.form.patchValue(incoming);
        }
      });

    this.load$.next();
  }

  /**
   * Récupère les offres créées localement par les entreprises.
   * Elles sont stockées dans le navigateur pour la démonstration.
   */
  private getLocalOffers(): Offer[] {
    try {
      const stored = JSON.parse(
        localStorage.getItem('sillage_company_offers') || '[]'
      ) as Array<Record<string, any>>;

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
          missions: Array.isArray(offer['missions'])
            ? offer['missions']
            : [],
          profil: Array.isArray(offer['profil'])
            ? offer['profil']
            : [],
          publieLe: String(
            offer['publieLe'] || new Date().toISOString()
          ),
          dateLimite: String(offer['dateLimite'] || ''),
          entreprise: {
            id: 1,
            nom: String(offer['companyName'] || 'Entreprise A'),
            secteur: 'Entreprise',
            ville: String(offer['ville'] || ''),
            note: null,
            nbAvis: 0,
          },
        }))
        .filter(
          (offer) =>
            Number.isFinite(offer.id) &&
            offer.titre.length > 0
        );
    } catch {
      return [];
    }
  }

  /** Applique les filtres de recherche aux offres locales. */
  private matchesFilters(
    offer: Offer,
    filters: ReturnType<typeof this.form.getRawValue>
  ): boolean {
    const query = filters.q.trim().toLowerCase();

    if (
      query &&
      ![
        offer.titre,
        offer.description,
        offer.ville,
        offer.entreprise.nom,
      ].some((value) => value.toLowerCase().includes(query))
    ) {
      return false;
    }

    if (filters.niveau && offer.niveau !== filters.niveau) {
      return false;
    }

    if (filters.mode && offer.mode !== filters.mode) {
      return false;
    }

    if (filters.remunere && !offer.remunere) {
      return false;
    }

    // Les offres locales n'ont pas encore de note.
    if (filters.noteMin > 0) {
      return false;
    }

    return true;
  }

  goTo(page: number): void {
    this.page.set(page);
    this.load$.next();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset(): void {
    this.form.reset({ ...DEFAULT_FILTERS });
  }

  private syncUrl(): void {
    const { q, niveau, mode } = this.form.getRawValue();

    this.syncingUrl = true;

    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: {
          q: q || null,
          niveau: niveau || null,
          mode: mode || null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .finally(() => (this.syncingUrl = false));
  }
}
