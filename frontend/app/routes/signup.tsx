import { useState } from "react";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

// Action pour gérer la soumission du formulaire d'inscription
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Validation côté serveur
  if (!email || !username || !password || !confirmPassword) {
    return json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: "Les mots de passe ne correspondent pas" }, { status: 400 });
  }

  try {
    // Appel à l'API backend pour l'inscription
    const response = await fetch("http://pokemon-backend:3001/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return json({ error: data.message || "Erreur lors de l'inscription" }, { status: response.status });
    }

    // Si l'inscription réussit, rediriger vers la page de connexion
    return redirect("/login?message=Inscription réussie ! Vous pouvez maintenant vous connecter.");
  } catch (error) {
    return json({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }
};

// Loader pour vérifier si l'utilisateur est déjà connecté
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Ici vous pourriez vérifier si l'utilisateur est déjà connecté
  // et le rediriger si nécessaire
  return json({});
};

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const isSubmitting = navigation.state === "submitting";

  return (
    <div style={styles.container}>
      <div style={styles.signupCard}>
        <div style={styles.header}>
          <h1 style={styles.title}>Créer un compte</h1>
          <p style={styles.subtitle}>Rejoignez Pokemon Battle</p>
        </div>

        <Form method="post" style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              style={styles.input}
              placeholder="votre@email.com"
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              style={styles.input}
              placeholder="votre_nom_utilisateur"
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Mot de passe
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                style={styles.input}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirmer le mot de passe
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                required
                style={styles.input}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <div style={styles.passwordRequirements}>
            <p style={styles.requirementsTitle}>Le mot de passe doit contenir :</p>
            <ul style={styles.requirementsList}>
              <li>Au moins 8 caractères</li>
              <li>Une majuscule et une minuscule</li>
              <li>Un chiffre</li>
              <li>Un caractère spécial</li>
            </ul>
          </div>

          {actionData?.error && (
            <div style={styles.errorMessage}>
              {actionData.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.submitButtonDisabled : {})
            }}
          >
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </button>
        </Form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Déjà un compte ?{" "}
            <Link to="/login" style={styles.link}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem",
  } as const,
  
  signupCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    padding: "2rem",
    width: "100%",
    maxWidth: "450px",
  } as const,
  
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  } as const,
  
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "0.5rem",
    margin: 0,
  } as const,
  
  subtitle: {
    color: "#6b7280",
    fontSize: "1rem",
    margin: 0,
  } as const,
  
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  } as const,
  
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  } as const,
  
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  } as const,
  
  input: {
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    backgroundColor: "white",
  } as const,
  
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  } as const,
  
  passwordToggle: {
    position: "absolute",
    right: "0.75rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    fontSize: "1rem",
  } as const,
  
  passwordRequirements: {
    backgroundColor: "#f8fafc",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  } as const,
  
  requirementsTitle: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    margin: "0 0 0.5rem 0",
  } as const,
  
  requirementsList: {
    fontSize: "0.8rem",
    color: "#6b7280",
    margin: 0,
    paddingLeft: "1.25rem",
  } as const,
  
  errorMessage: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    border: "1px solid #fecaca",
  } as const,
  
  submitButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "0.5rem",
  } as const,
  
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  } as const,
  
  footer: {
    textAlign: "center",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e5e7eb",
  } as const,
  
  footerText: {
    color: "#6b7280",
    fontSize: "0.875rem",
    margin: 0,
    textAlign: "center",
  } as const,
  
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: "500",
  } as const,
}; 