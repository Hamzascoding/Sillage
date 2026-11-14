import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Offer } from '../../core/models';
import { OfferCardComponent } from '../../shared/offer-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, OfferCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly search = new FormControl('', { nonNullable: true });
  readonly niveaux = ['1re année', '2e année', 'PFE'];
  readonly recent = signal<Offer[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly valeurs = [
    { titre: 'Centraliser', texte: 'Tous les stages du cursus dans un seul catalogue, du premier stage au PFE.' },
    { titre: 'Éclairer', texte: 'Des avis vérifiés d’anciens stagiaires, notés critère par critère.' },
    { titre: 'Suivre', texte: 'Un tableau Kanban pour suivre chaque candidature jusqu’à la réponse.' },
  ];

  constructor() {
    this.api.offers({ tri: 'recent', limit: 3 }).subscribe({
      next: (result) => {
        this.recent.set(result.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les offres. Vérifiez que l’API est démarrée (npm start dans backend/).');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    const q = this.search.value.trim();
    this.router.navigate(['/offres'], { queryParams: q ? { q } : {} });
  }
}
