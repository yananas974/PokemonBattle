import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { config } from '~/config/env';
import type { Pokemon } from '~/types/pokemon';

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
