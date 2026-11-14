
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

interface StudentProfile {
  nom: string;
  email: string;
  telephone: string;
  ecole: string;
  formation: string;
  specialite: string;
  niveau: string;
  anneeUniversitaire: string;
  ville: string;
  description: string;
  competences: string;
  langues: string;
  cvName: string;
  cvDataUrl: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);

  readonly message = signal('');
  readonly error = signal('');

  profile: StudentProfile = this.loadProfile();

  private storageKey(): string {
    return `sillage_student_profile_${this.auth.user()?.id ?? 'guest'}`;
  }

  private loadProfile(): StudentProfile {
    const user = this.auth.user();

    const empty: StudentProfile = {
      nom: user?.nom ?? '',
      email: user?.email ?? '',
      telephone: '',
      ecole: '',
      formation: '',
      specialite: '',
      niveau: '',
      anneeUniversitaire: '',
      ville: '',
      description: '',
      competences: '',
      langues: '',
      cvName: '',
      cvDataUrl: '',
    };

    try {
      const saved = localStorage.getItem(this.storageKey());
      return saved ? { ...empty, ...JSON.parse(saved) } : empty;
    } catch {
      return empty;
    }
  }

  saveProfile(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.profile));
      this.error.set('');
      this.message.set('Votre profil a été enregistré.');
    } catch {
      this.message.set('');
      this.error.set('Le stockage est plein. Essayez avec un CV plus léger.');
    }
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.message.set('');
    this.error.set('');

    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.error.set('Veuillez sélectionner un fichier PDF.');
      input.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.error.set('Le CV ne doit pas dépasser 2 Mo.');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.profile.cvName = file.name;
      this.profile.cvDataUrl = String(reader.result ?? '');
      this.saveProfile();
    };

    reader.onerror = () => {
      this.error.set('Impossible de lire ce fichier.');
    };

    reader.readAsDataURL(file);
  }

  removeCv(): void {
    this.profile.cvName = '';
    this.profile.cvDataUrl = '';
    this.saveProfile();
  }
}
