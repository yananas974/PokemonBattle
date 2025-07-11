import type { MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Battle - Accueil' },
    { name: 'description', content: 'Découvrez les Pokémon disponibles pour créer votre équipe !' },
  ];
};

export const loader = async () => {
  // Rediriger directement vers login
  throw redirect('/login');
};

export default function Index() {
  return null; // Ne sera jamais rendu
}
