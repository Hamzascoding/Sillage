import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from './models';

export const TOKEN_KEY = 'sillage_token';
const USER_KEY = 'sillage_user';

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(readStoredUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, motDePasse })
      .pipe(tap((r) => this.store(r)));
  }

  register(nom: string, email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', { nom, email, motDePasse })
      .pipe(tap((r) => this.store(r)));
  }

  logout(redirect = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    if (redirect) this.router.navigate(['/']);
  }

  private store(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this._user.set(response.user);
  }
}
