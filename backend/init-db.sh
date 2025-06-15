#!/bin/bash

echo "🚀 Vérification de l'initialisation de la base de données..."

# Fichier pour stocker le hash des migrations
HASH_FILE="/tmp/db_migrations_hash"
MIGRATION_DIR="./src/db/migrations"
SCHEMA_DIR="./src/db/schema"

# Calculer le hash actuel des fichiers de migration et schéma
calculate_current_hash() {
    if [ -d "$MIGRATION_DIR" ] && [ -d "$SCHEMA_DIR" ]; then
        find "$MIGRATION_DIR" "$SCHEMA_DIR" -type f \( -name "*.sql" -o -name "*.ts" -o -name "*.js" \) -exec md5sum {} \; | sort | md5sum | cut -d' ' -f1
    else
        echo "no_files"
    fi
}

# Vérifier si la base de données existe et a des tables
check_db_exists() {
    echo "🔍 Vérification de l'existence de la base de données..."
    
    # Attendre que la base soit prête
    echo "⏳ Attente de la base de données..."
    npx wait-on tcp:postgres:5432 -t 30000
    
    # Vérifier si des tables existent
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo "✅ Base de données existante avec $TABLE_COUNT tables"
        return 0
    else
        echo "❌ Base de données vide ou inexistante"
        return 1
    fi
}

# Calculer les hashs
CURRENT_HASH=$(calculate_current_hash)
PREVIOUS_HASH=""

if [ -f "$HASH_FILE" ]; then
    PREVIOUS_HASH=$(cat "$HASH_FILE")
fi

echo "🔍 Hash actuel: $CURRENT_HASH"
echo "🔍 Hash précédent: $PREVIOUS_HASH"

# Vérifier si on doit initialiser
SHOULD_INIT=false

if ! check_db_exists; then
    echo "🆕 Première initialisation - base de données vide"
    SHOULD_INIT=true
elif [ "$CURRENT_HASH" != "$PREVIOUS_HASH" ]; then
    echo "🔄 Modifications détectées dans les migrations/schémas"
    SHOULD_INIT=true
else
    echo "✅ Aucune modification détectée - initialisation ignorée"
    SHOULD_INIT=false
fi

# Initialiser si nécessaire
if [ "$SHOULD_INIT" = true ]; then
    echo "🔄 Exécution des migrations..."
    npm run db:migrate
    
    if [ $? -eq 0 ]; then
        echo "🌱 Lancement du seed..."
        npm run seed
        
        if [ $? -eq 0 ]; then
            # Sauvegarder le hash actuel
            echo "$CURRENT_HASH" > "$HASH_FILE"
            echo "✅ Initialisation terminée avec succès !"
        else
            echo "❌ Erreur lors du seed"
            exit 1
        fi
    else
        echo "❌ Erreur lors des migrations"
        exit 1
    fi
else
    echo "⏭️ Initialisation ignorée - base de données à jour"
fi 