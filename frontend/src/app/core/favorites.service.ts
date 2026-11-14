import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly auth = inject(AuthService);

  private storageKey(): string {
    const userId = this.auth.user()?.id ?? 'guest';
    return `sillage_favorites_${userId}`;
  }

  getAll(): number[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey()) ?? '[]') as number[];
    } catch {
      return [];
    }
  }

  has(offerId: number): boolean {
    return this.getAll().includes(offerId);
  }

  add(offerId: number): void {
    const ids = this.getAll();

    if (!ids.includes(offerId)) {
      ids.push(offerId);
      localStorage.setItem(this.storageKey(), JSON.stringify(ids));
    }
  }

  remove(offerId: number): void {
    const ids = this.getAll().filter((id) => id !== offerId);
    localStorage.setItem(this.storageKey(), JSON.stringify(ids));
  }

  toggle(offerId: number): boolean {
    if (this.has(offerId)) {
      this.remove(offerId);
      return false;
    }

    this.add(offerId);
    return true;
  }
}
