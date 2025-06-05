-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sessions table for secure cookie storage
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create Pokemon table
CREATE TABLE IF NOT EXISTS pokemon (
    id SERIAL PRIMARY KEY,
    pokemon_id INTEGER UNIQUE NOT NULL, -- ID du Pokémon de l'API
    name VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    hp INTEGER DEFAULT 100,
    attack INTEGER DEFAULT 50,
    defense INTEGER DEFAULT 50,
    speed INTEGER DEFAULT 50,
    height INTEGER DEFAULT 100,
    weight INTEGER DEFAULT 100,
    sprite_url VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Lier les pokemon aux utilisateurs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Battles table
CREATE TABLE IF NOT EXISTS battles (
    id SERIAL PRIMARY KEY,
    pokemon1_id INTEGER REFERENCES pokemon(id),
    pokemon2_id INTEGER REFERENCES pokemon(id),
    winner_id INTEGER REFERENCES pokemon(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    battle_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pokemon_pokemon_id ON pokemon(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_user_id ON pokemon(user_id);

-- Insert test user (password: pokemon123)
INSERT INTO users (email, username, password_hash) VALUES
('admin@pokemon.com', 'admin', '$2b$10$rB9.1yZ9.xJxOzYgDqFvmeN4E2K7.Jn.6CZYwL4FvXj8gXLdSj0Gm')
ON CONFLICT (email) DO NOTHING;

-- Insert some test data
INSERT INTO pokemon (pokemon_id, name, type, level, hp, attack, defense, speed, height, weight) VALUES
(25, 'Pikachu', 'Electric', 25, 120, 80, 60, 90, 4, 60),
(1, 'Bulbasaur', 'Grass/Poison', 5, 100, 65, 65, 45, 7, 69)
ON CONFLICT (pokemon_id) DO NOTHING; 