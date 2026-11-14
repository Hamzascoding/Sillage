import { Component, Input } from '@angular/core';

/** Affiche une note sur 5 sous forme d'étoiles (lecture seule). */
@Component({
  selector: 'app-stars',
  standalone: true,
  template: `
    <span class="inline-flex" role="img" [attr.aria-label]="label">
      @for (s of stars; track s) {
        <span class="leading-none" [class.text-ambre]="s <= rounded" [class.text-gray-300]="s > rounded" aria-hidden="true">★</span>
      }
    </span>
  `,
})
export class StarsComponent {
  @Input() value: number | null = 0;
  readonly stars = [1, 2, 3, 4, 5];

  get rounded(): number {
    return Math.round(this.value ?? 0);
  }

  get label(): string {
    return this.value === null ? 'Pas encore de note' : `Note de ${this.value} sur 5`;
  }
}
