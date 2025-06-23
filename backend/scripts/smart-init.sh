#!/bin/bash
set -e

echo "🚀 === INITIALISATION INTELLIGENTE AVEC SEED ==="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Attendre que la base soit prête
log_info "Attente de la base de données..."
wait-on tcp:postgres:5432 -t 60000
log_success "Base de données prête"

# 2. Démarrer l'application en arrière-plan
log_info "Démarrage de l'application..."
npm start &
APP_PID=$!

# Attendre que l'app soit prête
sleep 10

# 3. Vérifier l'état de la base
log_info "Vérification de l'état de la base..."

# Fonction pour compter les enregistrements d'une table
count_records() {
    local table=$1
    psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs || echo "0"
}

# Vérifications
POKEMON_COUNT=$(count_records "pokemon_reference")
HACKS_COUNT=$(count_records "hacks")

log_info "État actuel de la base:"
log_info "  - Pokémon: $POKEMON_COUNT"
log_info "  - Hacks: $HACKS_COUNT"

# 4. Décider du seed nécessaire
NEED_SEED=false

if [ "$POKEMON_COUNT" -lt 10 ]; then
    NEED_SEED=true
    log_warning "Pokémon insuffisants détectés (< 10)"
fi

if [ "$HACKS_COUNT" -lt 5 ]; then
    NEED_SEED=true
    log_warning "Hacks insuffisants détectés (< 5)"
fi

# 5. Exécuter le seed si nécessaire
if [ "$NEED_SEED" = true ]; then
    log_info "🌱 Exécution du seed automatique..."
    npm run seed || log_error "Seed échoué (non critique)"
    
    # Vérification après seed
    FINAL_POKEMON_COUNT=$(count_records "pokemon_reference")
    FINAL_HACKS_COUNT=$(count_records "hacks")
    
    log_success "État après seed:"
    log_success "  - Pokémon: $FINAL_POKEMON_COUNT"
    log_success "  - Hacks: $FINAL_HACKS_COUNT"
else
    log_success "Base de données déjà remplie - aucun seed nécessaire"
fi

log_success "Initialisation terminée, application en cours d'exécution..."
wait $APP_PID 