import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { AuthResponse } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly mode = signal<'connexion' | 'inscription'>(
    this.route.snapshot.queryParamMap.get('mode') === 'inscription' ? 'inscription' : 'connexion',
  );
  readonly busy = signal(false);
  readonly error = signal('');

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  readonly registerForm = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(mode: 'connexion' | 'inscription'): void {
    this.mode.set(mode);
    this.error.set('');
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, motDePasse } = this.loginForm.getRawValue();
    this.run(this.auth.login(email, motDePasse));
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { nom, email, motDePasse } = this.registerForm.getRawValue();
    this.run(this.auth.register(nom, email, motDePasse));
  }

  private run(request: Observable<AuthResponse>): void {
    this.busy.set(true);
    this.error.set('');
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.router.navigateByUrl(this.targetUrl());
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err.error?.message ?? 'Connexion impossible. Vérifiez que l’API est démarrée.');
      },
    });
  }

  /** Retour à la page demandée avant la connexion (adresse interne uniquement). */
  private targetUrl(): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/suivi';
  }
}
