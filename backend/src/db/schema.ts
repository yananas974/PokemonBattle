import { pgTable, serial, varchar, timestamp, integer, text, inet, foreignKey, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  session_token: varchar("session_token", { length: 255 }).notNull().unique(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  ip_address: inet("ip_address").notNull().default("0.0.0.0"), // ou nullable si tu veux
  user_agent: text("user_agent").notNull().default(""),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friend_id: integer("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, blocked
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  unique_friendship: unique().on(table.user_id, table.friend_id),
}));

export const pokemon = pgTable("pokemon", {
  id: serial("id").primaryKey(),
  pokemon_reference_id: integer("pokemon_reference_id")
    .notNull()
    .references(() => pokemonReference.id, { onDelete: "cascade" }),
  level: integer("level").default(1),
  hp: integer("hp").default(100),
  attack: integer("attack").default(50),
  defense: integer("defense").default(50),
  speed: integer("speed").default(50),

  team_id: integer("team_id").references(() => Team.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  unique_pokemon_per_team: unique().on(table.team_id, table.pokemon_reference_id),
}));

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  pokemon1_id: integer("pokemon1_id").references(() => pokemon.id),
  pokemon2_id: integer("pokemon2_id").references(() => pokemon.id),
  winner_id: integer("winner_id").references(() => pokemon.id),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  battle_date: timestamp("battle_date").defaultNow(),
});

export const Team = pgTable("team", {
  id: serial("id").primaryKey(),
  team_name: varchar("team_name", { length: 100 }).notNull(),
  user_id: integer("user_id").notNull(), // ✅ Champ user_id ajouté
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  user_fk: foreignKey({
    columns: [table.user_id],
    foreignColumns: [users.id],
    name: "user_fk"
  }).onDelete("cascade")
}));

export const pokemonReference = pgTable("pokemon_reference", {
  id: serial("id").primaryKey(),
  pokeapi_id: integer("pokeapi_id").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  base_hp: integer("base_hp"),
  base_attack: integer("base_attack"),
  base_defense: integer("base_defense"),
  base_speed: integer("base_speed"),
  height: integer("height"),
  weight: integer("weight"),
  sprite_url: varchar("sprite_url", { length: 255 }),
  created_at: timestamp("created_at").defaultNow()
});

export const hacks = pgTable("hacks", {
  id: serial("id").primaryKey(),
  base_word: varchar("base_word", { length: 100 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// ✅ TABLE MOVES - Stockage unique des attaques
export const moves = pgTable("moves", {
  id: serial("id").primaryKey(),
  pokeapi_id: integer("pokeapi_id").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  name_fr: varchar("name_fr", { length: 100 }),
  type: varchar("type", { length: 50 }).notNull(),
  power: integer("power"),
  accuracy: integer("accuracy"),
  pp: integer("pp"),
  category: varchar("category", { length: 20 }), // physical, special, status
  description: text("description"),
  description_fr: text("description_fr"),
  created_at: timestamp("created_at").defaultNow()
});

// ✅ TABLE POKEMON_MOVES - Relation many-to-many
export const pokemonMoves = pgTable("pokemon_moves", {
  id: serial("id").primaryKey(),
  pokemon_reference_id: integer("pokemon_reference_id")
    .notNull()
    .references(() => pokemonReference.id, { onDelete: "cascade" }),
  move_id: integer("move_id")
    .notNull()
    .references(() => moves.id, { onDelete: "cascade" }),
  learn_method: varchar("learn_method", { length: 50 }).default("level-up"), // level-up, machine, tutor, egg
  level_learned: integer("level_learned").default(1),
  created_at: timestamp("created_at").defaultNow()
}, (table) => ({
  unique_pokemon_move: unique().on(table.pokemon_reference_id, table.move_id),
}));
