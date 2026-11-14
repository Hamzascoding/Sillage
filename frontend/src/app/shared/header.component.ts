import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="border-b border-bordure bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a routerLink="/" class="flex items-center gap-2" aria-label="Sillage, retour à l’accueil">
          <img src="logo.png" alt="" width="36" height="36" class="rounded-lg" />
          <span class="font-display text-xl font-bold">Sillage</span>
        </a>

        <button
          type="button"
          class="rounded-champ border border-bordure px-3 py-1.5 text-sm font-semibold md:hidden"
          (click)="open.set(!open())"
          [attr.aria-expanded]="open()"
          aria-controls="menu-principal"
        >
          Menu
        </button>

        <nav id="menu-principal" aria-label="Navigation principale" [class]="navClasses()">
          <a
            routerLink="/offres"
            routerLinkActive="text-sillage"
            class="font-semibold hover:text-sillage"
            (click)="open.set(false)"
          >
            Offres
          </a>

          <a
            routerLink="/entreprises"
            routerLinkActive="text-sillage"
            class="font-semibold hover:text-sillage"
            (click)="open.set(false)"
          >
            Entreprises
          </a>

          @if (auth.isLoggedIn()) {
            @if (auth.user()?.role === 'etudiant') {
              <a
                routerLink="/suivi"
                routerLinkActive="text-sillage"
                class="font-semibold hover:text-sillage"
                (click)="open.set(false)"
              >
                Mes candidatures
              </a>

              <a
                routerLink="/favoris"
                routerLinkActive="text-sillage"
                class="font-semibold hover:text-sillage"
                (click)="open.set(false)"
              >
                Mes favoris
              </a>

              <a
                routerLink="/profil"
                routerLinkActive="text-sillage"
                class="font-semibold hover:text-sillage"
                (click)="open.set(false)"
              >
                Mon profil
              </a>
            }

            @if (auth.user()?.role === 'entreprise') {
              <a
                routerLink="/espace-entreprise"
                routerLinkActive="text-sillage"
                class="font-semibold hover:text-sillage"
                (click)="open.set(false)"
              >
                Gestion des offres
              </a>
            }

            @if (auth.user()?.role === 'admin') {
              <a
                routerLink="/moderation"
                routerLinkActive="text-sillage"
                class="font-semibold hover:text-sillage"
                (click)="open.set(false)"
              >
                Modération
              </a>
            }

            <span class="flex items-center gap-2">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-sillage/10 text-xs font-bold text-sillage"
                aria-hidden="true"
              >
                {{ initials() }}
              </span>

              <span class="text-sm text-muted">
                {{ auth.user()?.nom }}
              </span>
            </span>

            <button type="button" class="btn-secondary" (click)="logout()">Déconnexion</button>
          } @else {
            <a
              routerLink="/connexion"
              class="font-semibold hover:text-sillage"
              (click)="open.set(false)"
            >
              Connexion
            </a>

            <a
              routerLink="/connexion"
              [queryParams]="{ mode: 'inscription' }"
              class="btn-primary"
              (click)="open.set(false)"
            >
              S’inscrire
            </a>
          }
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly open = signal(false);

  readonly navClasses = computed(() =>
    this.open()
      ? 'flex w-full flex-col items-start gap-3 pt-3 md:w-auto md:flex-row md:items-center md:gap-6 md:pt-0'
      : 'hidden md:flex md:items-center md:gap-6',
  );

  readonly initials = computed(() =>
    (this.auth.user()?.nom ?? '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  logout(): void {
    this.open.set(false);
    this.auth.logout();
  }
}
