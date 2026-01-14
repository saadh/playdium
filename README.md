# DuoPlay - Async-Friendly 2-Player Gaming Platform

A web-based gaming platform designed for two players (like a parent and child in different time zones) to play together. Supports both synchronous (real-time) and asynchronous (turn-based) gameplay.

## Features

- **Three Games**: Secret Garden, Doodle Duo, and Treasure Hunters
- **Async-First Design**: Play anytime, even when your partner is offline
- **Real-time Play**: Voice chat and live interaction when both online
- **Partnership System**: Connect with invite codes
- **Voice Messages**: Attach voice notes to gifts, drawings, and map markers
- **Achievements**: Earn individual and shared accomplishments

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- Socket.io-client for real-time
- Framer Motion for animations

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL + Prisma ORM
- Socket.io for WebSockets
- JWT authentication

### Infrastructure
- Docker + Docker Compose

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Quick Start with Docker

1. **Clone and setup environment**
   ```bash
   cp .env.example .env
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations and seed**
   ```bash
   docker-compose exec server npm run db:push
   docker-compose exec server npm run db:seed
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   # Server
   cd server && npm install

   # Client
   cd ../client && npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start PostgreSQL** (locally or use Docker)
   ```bash
   docker run -d --name duoplay-postgres \
     -e POSTGRES_USER=duoplay \
     -e POSTGRES_PASSWORD=duoplay_dev_password \
     -e POSTGRES_DB=duoplay \
     -p 5432:5432 \
     postgres:15-alpine
   ```

4. **Setup database**
   ```bash
   cd server
   npm run db:push
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev

   # Terminal 2 - Client
   cd client && npm run dev
   ```

## Demo Accounts

After seeding the database, you can use these demo accounts:

- **Parent Account**: parent@demo.com / demo1234
- **Child Account**: child@demo.com / demo1234

Both accounts are pre-connected as partners.

## Project Structure

```
duoplay/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── features/       # Feature modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── games/
│   │   │   │   ├── secret-garden/
│   │   │   │   ├── doodle-duo/
│   │   │   │   └── treasure-hunters/
│   │   │   ├── partnership/
│   │   │   └── profile/
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript types
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # Socket.io handlers
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── ...
├── shared/                 # Shared types
│   └── types/
├── docker-compose.yml
└── .env.example
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Partnership
- `POST /api/partnerships/create-invite` - Generate invite code
- `POST /api/partnerships/join` - Join with invite code
- `GET /api/partnerships/current` - Get current partnership
- `GET /api/partnerships/activity-feed` - Get activity feed

### Games (to be expanded)
- `GET /api/games/garden` - Get shared garden
- `POST /api/games/garden/plant` - Plant a seed
- `POST /api/games/garden/water` - Water a plant
- Similar endpoints for Doodle Duo and Treasure Hunters

## Socket Events

### Presence
- `partner:online` - Partner came online
- `partner:offline` - Partner went offline
- `presence:typing` - Partner is typing

### Notifications
- `notification` - New notification received

### Game-specific events
- Garden: plant, water, gift events
- Doodle: drawing updates, turn changes
- Treasure: discovery events, marker additions

## Development

### Adding a New Feature
1. Create types in `shared/types/`
2. Add Prisma models if needed
3. Create service in `server/src/services/`
4. Add routes in `server/src/routes/`
5. Create React components in `client/src/features/`
6. Add socket handlers if real-time needed

### Database Migrations
```bash
cd server
npx prisma migrate dev --name your_migration_name
```

### Code Style
- ESLint for linting
- TypeScript strict mode
- Prettier for formatting

## Games Overview

### Secret Garden
Plant seeds, water plants, and grow a magical garden together. Send gifts and voice messages attached to plants.

### Doodle Duo
Four game modes:
- **Finish My Drawing**: One starts, other completes
- **Guess My Doodle**: Pictionary-style guessing
- **Copy Cat**: Replicate a reference image
- **Collaborative Canvas**: Build art together over time

### Treasure Hunters
Explore illustrated worlds, find hidden objects, solve puzzles, and leave treasures for your partner to discover.

## License

MIT
