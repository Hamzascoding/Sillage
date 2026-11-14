
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-offer-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-4xl space-y-6">

      <nav class="text-sm text-muted">
        <a routerLink="/espace-entreprise" class="hover:text-sillage">
          Espace entreprise
        </a>
        <span class="mx-2">›</span>
        <span>Nouvelle offre</span>
      </nav>

      <header>
        <p class="text-sm font-semibold uppercase tracking-wider text-sillage">
          Publication
        </p>
        <h1 class="mt-2 text-3xl font-bold">Créer une offre</h1>
        <p class="mt-2 text-muted">
          Présentez votre opportunité et trouvez les meilleurs candidats.
        </p>
      </header>

      @if (success()) {
        <div class="card space-y-4 p-8 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-valide/10 text-3xl text-valide">
            ✓
          </div>
          <h2 class="text-2xl font-bold">Offre créée avec succès !</h2>
          <p class="text-muted">
            Votre offre a été enregistrée dans votre espace entreprise.
          </p>
          <a routerLink="/espace-entreprise" class="btn-primary inline-flex">
            Retour au tableau de bord
          </a>
        </div>
      } @else {

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">

          <!-- Section 1 -->
          <section class="card space-y-5 p-6">
            <div>
              <span class="text-xs font-bold text-sillage">01 — INFORMATIONS GÉNÉRALES</span>
              <h2 class="mt-1 text-xl font-bold">Présentation de l'offre</h2>
              <p class="mt-1 text-sm text-muted">
                Les informations principales de votre opportunité.
              </p>
            </div>

            <div>
              <label class="label" for="titre">Titre de l'offre *</label>
              <input id="titre" class="field"
                     [class.border-rose-500]="isInvalid('titre')"
                     [class.bg-rose-50]="isInvalid('titre')"
                     [attr.aria-invalid]="isInvalid('titre')"
                     formControlName="titre"
                     placeholder="Ex. : Stage PFE - Développeur Full Stack"
                     maxlength="100" />
              @if (isInvalid('titre')) {
                <p class="mt-1 text-sm text-rose-600" role="alert">
                  @if (form.controls.titre.hasError('required')) {
                    Le titre est obligatoire.
                  } @else {
                    Le titre doit contenir entre 5 et 100 caractères.
                  }
                </p>
              }
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label" for="type">Type de stage *</label>
                <select id="type" class="field"
                        [class.border-rose-500]="isInvalid('type')"
                        [class.bg-rose-50]="isInvalid('type')"
                        formControlName="type">
                  <option value="">Sélectionner...</option>
                  <option value="Stage d'été">Stage d'été</option>
                  <option value="Stage de formation humaine">Formation humaine</option>
                  <option value="Stage ingénieur">Stage ingénieur</option>
                  <option value="Stage PFE">Stage PFE</option>
                </select>
                @if (isInvalid('type')) {
                  <p class="mt-1 text-sm text-rose-600" role="alert">
                    Veuillez sélectionner un type de stage.
                  </p>
                }
              </div>

              <div>
                <label class="label" for="niveau">Niveau recherché *</label>
                <select id="niveau" class="field"
                        [class.border-rose-500]="isInvalid('niveau')"
                        [class.bg-rose-50]="isInvalid('niveau')"
                        formControlName="niveau">
                  <option value="">Sélectionner...</option>
                  <option value="1re année">1re année</option>
                  <option value="2e année">2e année</option>
                  <option value="PFE">PFE</option>
                </select>
                @if (isInvalid('niveau')) {
                  <p class="mt-1 text-sm text-rose-600" role="alert">
                    Veuillez sélectionner un niveau.
                  </p>
                }
              </div>
            </div>
          </section>

          <!-- Section 2 -->
          <section class="card space-y-5 p-6">
            <div>
              <span class="text-xs font-bold text-sillage">02 — CONDITIONS</span>
              <h2 class="mt-1 text-xl font-bold">Modalités du stage</h2>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label" for="mode">Mode de travail *</label>
                <select id="mode" class="field"
                        [class.border-rose-500]="isInvalid('mode')"
                        [class.bg-rose-50]="isInvalid('mode')"
                        formControlName="mode">
                  <option value="">Sélectionner...</option>
                  <option value="Sur site">Sur site</option>
                  <option value="Hybride">Hybride</option>
                  <option value="À distance">À distance</option>
                </select>
                @if (isInvalid('mode')) {
                  <p class="mt-1 text-sm text-rose-600" role="alert">
                    Veuillez sélectionner un mode de travail.
                  </p>
                }
              </div>

              <div>
                <label class="label" for="ville">Ville *</label>
                <input id="ville" class="field"
                       [class.border-rose-500]="isInvalid('ville')"
                       [class.bg-rose-50]="isInvalid('ville')"
                       formControlName="ville"
                       placeholder="Ex. : Tunis" />
                @if (isInvalid('ville')) {
                  <p class="mt-1 text-sm text-rose-600" role="alert">
                    Veuillez indiquer une ville.
                  </p>
                }
              </div>

              <div>
                <label class="label" for="duree">Durée (semaines) *</label>
                <input id="duree" type="number" min="1" max="52"
                       class="field"
                       [class.border-rose-500]="isInvalid('dureeSemaines')"
                       [class.bg-rose-50]="isInvalid('dureeSemaines')"
                       formControlName="dureeSemaines" />
                @if (isInvalid('dureeSemaines')) {
                  <p class="mt-1 text-sm text-rose-600" role="alert">
                    La durée doit être comprise entre 1 et 52 semaines.
                  </p>
                }
              </div>

              <div>
                <label class="label" for="dateLimite">Date limite de candidature *</label>
                <input id="dateLimite" type="date" class="field"
                       [min]="today"
                       [class.border-rose-500]="isInvalid('dateLimite')"
                       [class.bg-rose-50]="isInvalid('dateLimite')"
                       formControlName="dateLimite" />
                @if (isInvalid('dateLimite')) {
                  <p class="mt-1 text-sm text-rose-600" role="alert">
                    Veuillez choisir une date valide dans le futur.
                  </p>
                }
              </div>
            </div>

            <label class="flex cursor-pointer items-center justify-between rounded-xl border border-bordure p-4">
              <div>
                <p class="font-semibold">Stage rémunéré</p>
                <p class="text-sm text-muted">
                  Proposer une gratification au stagiaire.
                </p>
              </div>
              <input type="checkbox" formControlName="remunere"
                     class="h-5 w-5 accent-[#2443D6]" />
            </label>
          </section>

          <!-- Section 3 -->
          <section class="card space-y-5 p-6">
            <div>
              <span class="text-xs font-bold text-sillage">03 — DESCRIPTION</span>
              <h2 class="mt-1 text-xl font-bold">Description du poste</h2>
            </div>

            <div>
              <label class="label" for="description">Description détaillée *</label>
              <textarea id="description" rows="5" maxlength="1500"
                        class="field resize-y"
                        [class.border-rose-500]="isInvalid('description')"
                        [class.bg-rose-50]="isInvalid('description')"
                        formControlName="description"
                        placeholder="Présentez votre entreprise, le contexte du stage et les objectifs..."></textarea>
              @if (isInvalid('description')) {
                <p class="mt-1 text-sm text-rose-600" role="alert">
                  @if (form.controls.description.hasError('required')) {
                    La description est obligatoire.
                  } @else {
                    La description doit contenir au moins 30 caractères.
                  }
                </p>
              }
              <p class="mt-1 text-right text-xs text-muted">
                {{ form.controls.description.value.length }}/1500
              </p>
            </div>

            <div>
              <label class="label" for="missions">Missions principales *</label>
              <textarea id="missions" rows="4" class="field resize-y"
                        [class.border-rose-500]="isInvalid('missions')"
                        [class.bg-rose-50]="isInvalid('missions')"
                        formControlName="missions"
                        placeholder="Une mission par ligne&#10;Développer des fonctionnalités&#10;Participer aux réunions techniques"></textarea>
              @if (isInvalid('missions')) {
                <p class="mt-1 text-sm text-rose-600" role="alert">
                  Ajoutez au moins une mission.
                </p>
              }
              <p class="mt-1 text-xs text-muted">
                Saisissez une mission par ligne.
              </p>
            </div>

            <div>
              <label class="label" for="profil">Profil recherché *</label>
              <textarea id="profil" rows="4" class="field resize-y"
                        [class.border-rose-500]="isInvalid('profil')"
                        [class.bg-rose-50]="isInvalid('profil')"
                        formControlName="profil"
                        placeholder="Une compétence par ligne&#10;Maîtrise de JavaScript&#10;Connaissances en SQL"></textarea>
              @if (isInvalid('profil')) {
                <p class="mt-1 text-sm text-rose-600" role="alert">
                  Ajoutez au moins une compétence ou qualité.
                </p>
              }
              <p class="mt-1 text-xs text-muted">
                Saisissez une compétence ou qualité par ligne.
              </p>
            </div>
          </section>

          @if (error()) {
            <div class="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700"
                 role="alert">
              {{ error() }}
            </div>
          }

          <div class="flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <a routerLink="/espace-entreprise" class="btn-secondary text-center">
              Annuler
            </a>

            <button type="submit" class="btn-primary" [disabled]="submitting()">
              {{ submitting() ? 'Publication...' : 'Publier mon offre →' }}
            </button>
          </div>

          <p class="text-center text-xs text-muted">
            * Champs obligatoires
          </p>

        </form>
      }
    </div>
  `,
})
export class OfferCreateComponent {
  private readonly fb = inject(FormBuilder);

  readonly success = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');

  readonly today = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.nonNullable.group({
    titre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    type: ['', Validators.required],
    niveau: ['', Validators.required],
    mode: ['', Validators.required],
    ville: ['', Validators.required],
    dureeSemaines: [8, [Validators.required, Validators.min(1), Validators.max(52)]],
    remunere: [false],
    dateLimite: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(30), Validators.maxLength(1500)]],
    missions: ['', Validators.required],
    profil: ['', Validators.required],
  });

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    this.error.set('');

    const value = this.form.getRawValue();

    // Also reject fields containing only spaces or line breaks.
    const missions = value.missions.split('\n').map(x => x.trim()).filter(Boolean);
    const profil = value.profil.split('\n').map(x => x.trim()).filter(Boolean);

    if (!missions.length) {
      this.form.controls.missions.setErrors({ required: true });
    }

    if (!profil.length) {
      this.form.controls.profil.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez corriger les champs signalés en rouge.');
      document.querySelector('.border-rose-500')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    if (value.dateLimite < this.today) {
      this.form.controls.dateLimite.setErrors({ past: true });
      this.form.controls.dateLimite.markAsTouched();
      this.error.set('La date limite doit être dans le futur.');
      return;
    }

    this.submitting.set(true);

    try {
      const key = 'sillage_company_offers';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');

      if (!Array.isArray(existing)) {
        throw new Error('Données invalides');
      }

      const offer = {
        id: Date.now(),
        ...value,
        missions,
        profil,
        companyId: 1,
        publieLe: this.today,
        source: 'demo',
      };

      existing.push(offer);
      localStorage.setItem(key, JSON.stringify(existing));

      this.success.set(true);
    } catch {
      this.error.set('Impossible d’enregistrer cette offre dans le navigateur.');
    } finally {
      this.submitting.set(false);
    }
  }
}
