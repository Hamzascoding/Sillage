import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Offer } from '../core/models';
import { StarsComponent } from './stars.component';

/** Carte d'offre réutilisée sur l'accueil, la liste d'offres et la page entreprise. */
@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [RouterLink, StarsComponent],
  template: `
    <article class="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sillage/10 font-display text-sm font-bold text-sillage" aria-hidden="true">
          {{ initials }}
        </div>
        <div>
          <h3 class="text-base font-semibold">
            <a [routerLink]="['/offres', offer.id]" class="hover:text-sillage">{{ offer.titre }}</a>
          </h3>
          <p class="text-sm text-muted">{{ offer.entreprise.nom }} · {{ offer.ville }} · {{ offer.mode }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="chip bg-sillage/10 text-sillage">{{ offer.type }}</span>
            <span class="chip bg-surface text-muted">{{ offer.dureeSemaines }} sem.</span>
            @if (offer.remunere) {
              <span class="chip bg-valide/20 text-valide-profond">Gratifié</span>
            }
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <a [routerLink]="['/offres', offer.id]" class="btn-primary">Voir l’offre</a>
      </div>
    </article>
  `,
})
export class OfferCardComponent {
  @Input({ required: true }) offer!: Offer;

  get initials(): string {
    return this.offer.entreprise.nom
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
