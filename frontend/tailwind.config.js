/** Jetons de la charte graphique Sillage (voir dossier Objectif 2, pages 19 à 26). */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        sillage: { DEFAULT: '#2443D6', dark: '#1B35B0' },
        encre: '#0F1B3D',
        elan: { DEFAULT: '#FF7A3D', profond: '#C2410C' },
        valide: { DEFAULT: '#1FB58F', profond: '#0B7A5C' },
        ambre: '#FFB020',
        surface: '#F3F5FB',
        muted: '#5A6478',
        bordure: '#DDE2EE',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { carte: '12px', champ: '10px' },
      boxShadow: { carte: '0 2px 8px rgba(15, 27, 61, 0.12)' },
    },
  },
  plugins: [],
};
