import { useActionData } from '@remix-run/react';
import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';

export const action: ActionFunction = async ({ request }) => {
  // Commenté la logique d'authentification pour tester la redirection directe
  /*
  const formData = await request.formData();
  const username = formData.get('username')?.toString();
  const password = formData.get('password')?.toString();

  if (!username || !password) {
    return json({ error: 'Tous les champs sont requis' }, { status: 400 });
  }

  if (username !== 'admin' || password !== '1234') {
    return json({ error: 'Identifiants invalides' }, { status: 400 });
  }
  */

  // Redirection directe vers la page /pokemon sans validation
  return redirect('/login');
};

export default function LoginPage() {
  const actionData = useActionData();

  return (
    <div style={styles.container}>
      <h1>Connexion</h1>
      <Form method="post" style={styles.form}>
        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Jouer à Pokémon
        </button>
      </Form>
      {/* Le message d'erreur est désactivé car on ne gère plus l'auth */}
      {/* {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>} */}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#ffcb05',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
