import { pgTable, serial, varchar, timestamp, integer, text, inet } from "drizzle-orm/pg-core";

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

export const pokemon = pgTable("pokemon", {
  id: serial("id").primaryKey(),
  pokemon_id: integer("pokemon_id").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  level: integer("level").default(1),
  hp: integer("hp").default(100),
  attack: integer("attack").default(50),
  defense: integer("defense").default(50),
  speed: integer("speed").default(50),
  height: integer("height").default(100),
  weight: integer("weight").default(100),
  sprite_url: varchar("sprite_url", { length: 255 }),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  pokemon1_id: integer("pokemon1_id").references(() => pokemon.id),
  pokemon2_id: integer("pokemon2_id").references(() => pokemon.id),
  winner_id: integer("winner_id").references(() => pokemon.id),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  battle_date: timestamp("battle_date").defaultNow(),
});
