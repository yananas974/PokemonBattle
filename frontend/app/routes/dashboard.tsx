import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Loader pour récupérer les données du dashboard
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Ici vous pourriez vérifier l'authentification et récupérer les données utilisateur
  // Pour l'instant, on retourne des données factices
  return json({
    user: {
      username: "Dresseur Pokémon",
      level: 25,
      badges: 3,
    },
    stats: {
      pokemonCaught: 15,
      battlesWon: 8,
      totalBattles: 12,
    },
  });
};

export default function Dashboard() {
  const { user, stats } = useLoaderData<typeof loader>();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Tableau de Bord Pokemon Battle</h1>
        <p style={styles.subtitle}>Bienvenue, {user.username}!</p>
      </header>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Niveau</h3>
            <p style={styles.statValue}>{user.level}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏆</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Badges</h3>
            <p style={styles.statValue}>{user.badges}/8</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>⚔️</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Combats Gagnés</h3>
            <p style={styles.statValue}>{stats.battlesWon}/{stats.totalBattles}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎪</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Pokémon Capturés</h3>
            <p style={styles.statValue}>{stats.pokemonCaught}</p>
          </div>
        </div>
      </div>

      <div style={styles.actionsGrid}>
        <Link to="/pokemon" style={styles.actionCard}>
          <div style={styles.actionIcon}>🔍</div>
          <h3 style={styles.actionTitle}>Explorer les Pokémon</h3>
          <p style={styles.actionDescription}>Découvrez et capturez de nouveaux Pokémon</p>
        </Link>

        <Link to="/battles" style={styles.actionCard}>
          <div style={styles.actionIcon}>⚔️</div>
          <h3 style={styles.actionTitle}>Commencer un Combat</h3>
          <p style={styles.actionDescription}>Défiez d'autres dresseurs</p>
        </Link>

        <Link to="/collection" style={styles.actionCard}>
          <div style={styles.actionIcon}>📚</div>
          <h3 style={styles.actionTitle}>Ma Collection</h3>
          <p style={styles.actionDescription}>Gérez vos Pokémon</p>
        </Link>

        <Link to="/profile" style={styles.actionCard}>
          <div style={styles.actionIcon}>👤</div>
          <h3 style={styles.actionTitle}>Mon Profil</h3>
          <p style={styles.actionDescription}>Paramètres et statistiques</p>
        </Link>
      </div>

      <div style={styles.footer}>
        <Link to="/logout" style={styles.logoutLink}>
          Se déconnecter
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "2rem",
  } as const,
  
  header: {
    textAlign: "center",
    marginBottom: "3rem",
    color: "white",
  } as const,
  
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "0 0 0.5rem 0",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  } as const,
  
  subtitle: {
    fontSize: "1.2rem",
    margin: 0,
    opacity: 0.9,
  } as const,
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
    maxWidth: "800px",
    margin: "0 auto 3rem auto",
  } as const,
  
  statCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  } as const,
  
  statIcon: {
    fontSize: "2rem",
    padding: "0.5rem",
    backgroundColor: "#f0f9ff",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const,
  
  statContent: {
    flex: 1,
  } as const,
  
  statTitle: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0 0 0.25rem 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  } as const,
  
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0,
  } as const,
  
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
  } as const,
  
  actionCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    cursor: "pointer",
  } as const,
  
  actionIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  } as const,
  
  actionTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0 0 0.5rem 0",
  } as const,
  
  actionDescription: {
    color: "#6b7280",
    fontSize: "0.9rem",
    margin: 0,
    lineHeight: 1.5,
  } as const,
  
  footer: {
    textAlign: "center",
    marginTop: "3rem",
  } as const,
  
  logoutLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    opacity: 0.8,
    transition: "opacity 0.2s",
  } as const,
}; 