# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development Workflow
```bash
# Start all services in development
npm run dev
# OR
make dev

# Development by service
npm run dev:backend      # Backend only (Hono API on port 3001)
npm run dev:frontend     # Frontend only (Remix on port 3000)
npm run dev:shared       # Shared package in watch mode

# Build and type checking
npm run build           # Build all workspaces (shared -> backend -> frontend)
npm run typecheck       # TypeScript checks across all workspaces
npm run lint            # ESLint for frontend and backend
```

### Database Operations
```bash
# Database setup and management
npm run db:setup        # Generate + migrate (for new setups)
npm run db:generate     # Generate migration files from schema changes
npm run db:migrate      # Apply pending migrations
npm run db:reset        # Reset database completely
npm run seed           # Seed database with Pokemon data
npm run db:studio      # Open Drizzle Studio (database GUI)

# Database workspace commands (backend)
npm run db:fresh        # Reset + generate + migrate + seed
```

### Docker Development
```bash
# Recommended for full environment
docker-compose up -d    # Start all services (includes auto-seed)
make docker-up         # Same as above
make docker-logs       # View logs from all services
make docker-down       # Stop all services
```

### Testing and Quality
```bash
npm run test           # Run tests (currently placeholder)
npm run lint           # ESLint across frontend/backend
npm run typecheck      # TypeScript validation
```

## Architecture Overview

### Monorepo Structure
- **Frontend**: Remix React app with Vite, TailwindCSS, TypeScript
- **Backend**: Hono REST API with PostgreSQL via Drizzle ORM
- **Shared**: Common types, utilities, and constants used by both frontend and backend

### Backend Architecture (Hono + Drizzle)
- **Entry point**: `backend/src/index.ts` - Hono server setup with middleware
- **Routes**: `backend/src/routes/` - Modular route definitions
  - `/api/auth` - JWT authentication
  - `/api/pokemon` - Pokemon data and management
  - `/api/teams` - Team creation and management
  - `/api/battle` - Battle simulation
  - `/api/interactive-battle` - Turn-based battle system
  - `/api/friends` - Friendship system
  - `/api/weather` - OpenWeatherMap integration
- **Database**: Drizzle ORM with PostgreSQL schema in `backend/src/db/schema.ts`
- **Services**: Business logic organized in `backend/src/services/`
- **Handlers**: Route handlers in `backend/src/handlers/`

### Frontend Architecture (Remix)
- **Entry point**: `frontend/app/root.tsx` - App shell with global layout
- **Routes**: File-based routing in `frontend/app/routes/`
  - Dashboard layout with nested routes
  - Authentication routes (login, register, logout)
  - Pokemon browsing and team management
  - Battle interfaces (interactive and simulation)
- **Components**: Reusable UI in `frontend/app/components/`
- **Services**: API communication layer in `frontend/app/services/`
- **Hooks**: Custom React hooks in `frontend/app/hooks/`

### Shared Package
- **Types**: TypeScript definitions for API contracts, Pokemon data, battles
- **Utils**: Common validation and helper functions
- **Constants**: Shared constants like error messages, battle mechanics

### Key Integrations
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Weather**: OpenWeatherMap API integration for battle effects
- **Audio**: Global audio manager for battle sounds and music
- **Real-time**: Turn-based battle system with state management

### Development Patterns
- **Shared types**: All API contracts defined in shared package, imported by both frontend and backend
- **Error handling**: Centralized error handling with typed error responses
- **Validation**: Zod schemas for request/response validation
- **Authentication**: JWT middleware protecting authenticated routes
- **Database migrations**: Schema changes via Drizzle migrations

### File Structure Notes
- Backend uses `.ts` files, frontend uses `.tsx` for React components
- Shared package must be built before frontend/backend development
- Database schema changes require running `npm run db:generate` then `npm run db:migrate`
- Seeding includes 151 Pokemon with moves, types, and battle mechanics

### Environment Setup
- Copy `backend/.env.example` to `backend/.env` for local development
- PostgreSQL connection configured via environment variables
- OpenWeatherMap API key optional (falls back to default weather)
- Docker auto-seeds database on first run