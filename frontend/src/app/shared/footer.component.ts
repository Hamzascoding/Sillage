import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="border-t border-bordure bg-white">
      <div
        class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between"
      >
        <p>Sillage · Projet Web SUP’COM 2026/2027</p>
        <p>Trouver le bon stage, grâce à ceux qui y sont passés.</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
