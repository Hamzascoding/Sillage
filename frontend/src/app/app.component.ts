import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer.component';
import { HeaderComponent } from './shared/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <a href="#contenu" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
      Aller au contenu
    </a>
    <app-header />
    <main id="contenu" class="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8">
      <router-outlet />
    </main>
    <app-footer />
  `,
})
export class AppComponent {}
