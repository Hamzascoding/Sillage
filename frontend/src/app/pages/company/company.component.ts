import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CRITERES, CompanyDetail } from '../../core/models';
import { FrDatePipe } from '../../shared/fr-date.pipe';
import { OfferCardComponent } from '../../shared/offer-card.component';
import { StarsComponent } from '../../shared/stars.component';

type Tab = 'presentation' | 'offres' | 'avis';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, OfferCardComponent, StarsComponent, FrDatePipe],
  templateUrl: './company.component.html',
})
export class CompanyComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly criteres = CRITERES;
  readonly scores = [1, 2, 3, 4, 5];
  readonly company = signal<CompanyDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly tab = signal<Tab>('avis');

  readonly reviewForm = this.fb.nonNullable.group({
    encadrement: [0, Validators.min(1)],
    missions: [0, Validators.min(1)],
    apprentissage: [0, Validators.min(1)],
    ambiance: [0, Validators.min(1)],
    gratification: [0, Validators.min(1)],
    contexte: ['', Validators.maxLength(80)],
    commentaire: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(600)]],
  });
  readonly sending = signal(false);
  readonly reviewSent = signal(false);
  readonly reviewError = signal('');

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading.set(true);
          this.error.set('');
          this.reviewSent.set(false);
        }),
        switchMap((id) =>
          this.api.company(id).pipe(
            catchError((err) => {
              this.error.set(err.status === 404 ? 'Cette entreprise n’existe pas.' : 'Impossible de charger l’entreprise.');
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((company) => {
        this.company.set(company);
        this.loading.set(false);
      });
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }

  barWidth(value: number | null | undefined): number {
    return ((value ?? 0) / 5) * 100;
  }

  submitReview(): void {
    const company = this.company();
    if (!company) return;
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const value = this.reviewForm.getRawValue();
    const notes = Object.fromEntries(CRITERES.map((c) => [c.key, value[c.key]]));
    this.sending.set(true);
    this.reviewError.set('');
    this.api.addReview(company.id, { notes, commentaire: value.commentaire, contexte: value.contexte }).subscribe({
      next: () => {
        this.reviewSent.set(true);
        this.sending.set(false);
        this.reviewForm.reset();
      },
      error: (err) => {
        this.reviewError.set(err.error?.message ?? 'Impossible d’envoyer l’avis. Réessayez.');
        this.sending.set(false);
      },
    });
  }
}
