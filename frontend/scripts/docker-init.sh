#!/bin/bash
set -e

echo "🚀 === INITIALISATION FRONTEND AVEC SHARED ==="

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }

# 1. Construire le package shared
log_info "Construction du package shared..."
cd /app/shared
npm run build
log_success "Package shared construit"

# 2. Installer le package shared dans le frontend
log_info "Installation du package shared dans le frontend..."
cd /app/frontend
npm install ../shared
log_success "Package shared installé"

# 3. Démarrer le frontend
log_info "Démarrage du frontend..."
npm run dev 