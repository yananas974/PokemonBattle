CREATE TABLE "team" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" varchar(100) NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "battles" (
	"id" serial PRIMARY KEY NOT NULL,
	"pokemon1_id" integer,
	"pokemon2_id" integer,
	"winner_id" integer,
	"user_id" integer,
	"battle_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "friendships_user_id_friend_id_unique" UNIQUE("user_id","friend_id")
);
--> statement-breakpoint
CREATE TABLE "hacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_word" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "moves" (
	"id" serial PRIMARY KEY NOT NULL,
	"pokeapi_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_fr" varchar(100),
	"type" varchar(50) NOT NULL,
	"power" integer,
	"accuracy" integer,
	"pp" integer,
	"category" varchar(20),
	"description" text,
	"description_fr" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "moves_pokeapi_id_unique" UNIQUE("pokeapi_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon" (
	"id" serial PRIMARY KEY NOT NULL,
	"pokemon_reference_id" integer NOT NULL,
	"level" integer DEFAULT 1,
	"hp" integer DEFAULT 100,
	"attack" integer DEFAULT 50,
	"defense" integer DEFAULT 50,
	"speed" integer DEFAULT 50,
	"team_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "pokemon_team_id_pokemon_reference_id_unique" UNIQUE("team_id","pokemon_reference_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_moves" (
	"id" serial PRIMARY KEY NOT NULL,
	"pokemon_reference_id" integer NOT NULL,
	"move_id" integer NOT NULL,
	"learn_method" varchar(50) DEFAULT 'level-up',
	"level_learned" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "pokemon_moves_pokemon_reference_id_move_id_unique" UNIQUE("pokemon_reference_id","move_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_reference" (
	"id" serial PRIMARY KEY NOT NULL,
	"pokeapi_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(100) NOT NULL,
	"base_hp" integer,
	"base_attack" integer,
	"base_defense" integer,
	"base_speed" integer,
	"height" integer,
	"weight" integer,
	"sprite_url" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "pokemon_reference_pokeapi_id_unique" UNIQUE("pokeapi_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" integer,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"ip_address" "inet" DEFAULT '0.0.0.0' NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_pokemon1_id_pokemon_id_fk" FOREIGN KEY ("pokemon1_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_pokemon2_id_pokemon_id_fk" FOREIGN KEY ("pokemon2_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_winner_id_pokemon_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."pokemon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon" ADD CONSTRAINT "pokemon_pokemon_reference_id_pokemon_reference_id_fk" FOREIGN KEY ("pokemon_reference_id") REFERENCES "public"."pokemon_reference"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon" ADD CONSTRAINT "pokemon_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_moves" ADD CONSTRAINT "pokemon_moves_pokemon_reference_id_pokemon_reference_id_fk" FOREIGN KEY ("pokemon_reference_id") REFERENCES "public"."pokemon_reference"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_moves" ADD CONSTRAINT "pokemon_moves_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;