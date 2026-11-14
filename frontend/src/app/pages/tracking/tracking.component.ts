import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ApplicationView, Statut } from '../../core/models';
import { FrDatePipe } from '../../shared/fr-date.pipe';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [RouterLink, FrDatePipe],
  templateUrl: './tracking.component.html',
})
export class TrackingComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly applications = signal<ApplicationView[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  get total(): number {
    return this.applications().length;
  }

  get sentCount(): number {
    return this.applications().filter((a) => a.statut === 'envoyee').length;
  }

  get interviewCount(): number {
    return this.applications().filter((a) => a.statut === 'entretien').length;
  }

  ngOnInit(): void {
    this.api.applications().subscribe({
      next: (applications) => {
        // Saved offers are favourites, not applications.
        this.applications.set(applications.filter((app) => app.statut !== 'a_postuler'));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos candidatures. Vérifiez que l’API est démarrée.');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: Statut): string {
    const labels: Record<Statut, string> = {
      a_postuler: 'Enregistrée',
      envoyee: 'Envoyée',
      entretien: 'Entretien',
      acceptee: 'Acceptée',
      refusee: 'Refusée',
    };

    return labels[status] ?? 'En cours';
  }

  statusClass(status: Statut): string {
    const classes: Record<Statut, string> = {
      a_postuler: 'bg-surface text-muted',
      envoyee: 'bg-sillage/10 text-sillage',
      entretien: 'bg-amber-100 text-amber-800',
      acceptee: 'bg-valide/10 text-valide',
      refusee: 'bg-rose-100 text-rose-700',
    };

    return classes[status] ?? 'bg-surface text-muted';
  }
}
