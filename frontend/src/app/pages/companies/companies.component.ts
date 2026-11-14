
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CompanySummary } from '../../core/models';
import { StarsComponent } from '../../shared/stars.component';

interface LocalOffer {
  id: number;
  companyId?: number;
  companyName?: string;
  dateLimite?: string;
}

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [RouterLink, StarsComponent],
  templateUrl: './companies.component.html',
})
export class CompaniesComponent {
  private readonly api = inject(ApiService);

  readonly companies = signal<CompanySummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.api.companies().subscribe({
      next: (list) => {
        const localOffers = this.getLocalOffers();

        const updatedCompanies = list.map((company) => {
          const localOpenOffers = localOffers.filter((offer) => {
            const belongsToCompany =
              offer.companyId === company.id ||
              offer.companyName === company.nom;

            return belongsToCompany && this.isOfferOpen(offer);
          });

          return {
            ...company,
            nbOffres: (company.nbOffres ?? 0) + localOpenOffers.length,
          };
        });

        this.companies.set(updatedCompanies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'Impossible de charger les entreprises. Vérifiez que l’API est démarrée.',
        );
        this.loading.set(false);
      },
    });
  }

  private getLocalOffers(): LocalOffer[] {
    try {
      return JSON.parse(
        localStorage.getItem('sillage_company_offers') ?? '[]',
      ) as LocalOffer[];
    } catch {
      return [];
    }
  }

  private isOfferOpen(offer: LocalOffer): boolean {
    if (!offer.dateLimite) return true;

    const deadline = new Date(offer.dateLimite);
    if (Number.isNaN(deadline.getTime())) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    return deadline >= today;
  }
}
