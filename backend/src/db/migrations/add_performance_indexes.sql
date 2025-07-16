-- ✅ MIGRATIONS POUR OPTIMISER LES PERFORMANCES DE LA BASE DE DONNÉES

-- Index pour les recherches de Pokémon par type
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_type ON pokemon_reference(type);

-- Index pour les recherches de Pokémon par nom (français et anglais)
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_name_fr ON pokemon_reference USING gin(to_tsvector('french', name_fr));
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_name_en ON pokemon_reference USING gin(to_tsvector('english', name_en));

-- Index pour les recherches par pokeapi_id
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_pokeapi_id ON pokemon_reference(pokeapi_id);

-- Index pour les équipes par utilisateur
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);

-- Index composé pour les Pokémon d'équipe
CREATE INDEX IF NOT EXISTS idx_pokemon_teams_team_pokemon ON pokemon_teams(team_id, pokemon_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_teams_position ON pokemon_teams(team_id, position);

-- Index pour les attaques de Pokémon
CREATE INDEX IF NOT EXISTS idx_pokemon_moves_pokemon_id ON pokemon_moves(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_moves_level ON pokemon_moves(pokemon_id, level_learned_at);

-- Index pour les attaques par type
CREATE INDEX IF NOT EXISTS idx_moves_type ON moves(type);
CREATE INDEX IF NOT EXISTS idx_moves_power ON moves(power DESC) WHERE power IS NOT NULL;

-- Index pour les combats (si table existe)
-- CREATE INDEX IF NOT EXISTS idx_battles_user ON battles(player1_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status, created_at DESC);

-- Index pour améliorer les jointures fréquentes
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_composite ON pokemon_reference(type, generation, pokeapi_id);

-- Index partiel pour les Pokémon avec stats élevées
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_high_stats ON pokemon_reference(base_hp, base_attack) 
WHERE base_hp > 80 OR base_attack > 80;

-- Index pour optimiser les recherches par génération
CREATE INDEX IF NOT EXISTS idx_pokemon_reference_generation ON pokemon_reference(generation);

-- Index pour les sessions utilisateur (si table existe)
-- CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
-- CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at) WHERE expires_at IS NOT NULL;

-- Statistiques pour l'optimisateur de requêtes
ANALYZE pokemon_reference;
ANALYZE teams;
ANALYZE pokemon_teams;
ANALYZE moves;
ANALYZE pokemon_moves;

-- Commentaires pour documenter les index
COMMENT ON INDEX idx_pokemon_reference_type IS 'Optimise les filtres par type de Pokémon';
COMMENT ON INDEX idx_pokemon_reference_name_fr IS 'Optimise la recherche textuelle en français';
COMMENT ON INDEX idx_pokemon_reference_name_en IS 'Optimise la recherche textuelle en anglais';
COMMENT ON INDEX idx_teams_user_id IS 'Optimise la récupération des équipes par utilisateur';
COMMENT ON INDEX idx_pokemon_teams_team_pokemon IS 'Optimise les jointures équipe-Pokémon';
COMMENT ON INDEX idx_pokemon_moves_level IS 'Optimise la récupération des attaques par niveau';

-- Vérification des index créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;