#!/bin/bash
set -e

echo "🚀 === INITIALISATION DOCKER AVEC AUTO-SEED ==="

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# 1. Attendre que la base soit prête
log_info "Attente de la base de données..."
wait-on tcp:postgres:5432 -t 60000
log_success "Base de données prête"

# 2. Générer et appliquer les migrations si nécessaire
log_info "Vérification des migrations..."
npm run db:generate || log_warning "Génération échouée"
npm run db:migrate || log_warning "Migration échouée"

# 3. Démarrer l'application en arrière-plan
log_info "Démarrage de l'application..."
npm start &
APP_PID=$!

# Attendre que l'app soit prête
sleep 15

# 4. Vérifier si c'est une première installation
log_info "Vérification de l'état du projet..."

# Fonction pour compter les enregistrements
count_records() {
    local table=$1
    psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs || echo "0"
}

# Vérifier l'état des tables principales
POKEMON_COUNT=$(count_records "pokemon_reference")
HACKS_COUNT=$(count_records "hacks")

log_info "État actuel du projet:"
log_info "  - Pokémon: $POKEMON_COUNT"
log_info "  - Hacks: $HACKS_COUNT"

# 5. Déterminer si c'est une première installation
IS_FIRST_INSTALL=false

if [ "$POKEMON_COUNT" -eq 0 ] && [ "$HACKS_COUNT" -eq 0 ]; then
    IS_FIRST_INSTALL=true
    log_warning "🎉 PREMIÈRE INSTALLATION DÉTECTÉE !"
fi

# 6. Exécuter l'auto-seed si nécessaire
if [ "$IS_FIRST_INSTALL" = true ]; then
    log_info "🌱 AUTO-SEED - Initialisation des données..."
    
    # Seed complet
    npm run seed || log_warning "Seed échoué (peut être ignoré)"
    
    # Vérification finale
    FINAL_POKEMON_COUNT=$(count_records "pokemon_reference")
    FINAL_HACKS_COUNT=$(count_records "hacks")
    
    log_success "🎉 AUTO-SEED TERMINÉ AVEC SUCCÈS !"
    log_success "  - Pokémon installés: $FINAL_POKEMON_COUNT"
    log_success "  - Hacks installés: $FINAL_HACKS_COUNT"
    log_success ""
    log_success "🌟 Votre application Pokemon Battle est prête !"
    log_success "   Frontend: http://localhost:3000"
    log_success "   Backend:  http://localhost:3001"
    log_success "   PgAdmin:  http://localhost:5050"
    
else
    log_success "✅ Données déjà présentes - aucun seed nécessaire"
fi

log_success "🚀 Application en cours d'exécution..."
wait $APP_PID 