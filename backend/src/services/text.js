// Utilitaires de texte (purs, testables)

/** Minuscules + suppression des accents, pour une recherche tolérante. */
export function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** « Aziz Ben Salah » -> « Aziz S. » (nom affiché publiquement sur un avis). */
export function displayName(fullName) {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Étudiant';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
