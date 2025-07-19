
/**
 * Composant d'espacement pour compenser la navbar fixe
 * Utilise une hauteur dynamique selon la taille d'écran
 */
export default function NavbarSpacer() {
  return (
    <div className="h-16 sm:h-20 w-full" aria-hidden="true" />
  );
} 