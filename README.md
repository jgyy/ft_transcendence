# FT_TRANSCENDENCE - Multiplayer Pong Game

*This project has been created as part of the 42 curriculum.*

## 🎮 Project Overview

**FT_TRANSCENDENCE** is a full-stack multiplayer Pong game web application built with modern web technologies. It provides a comprehensive gaming experience with single-player AI opponents, real-time multiplayer matches, tournament systems, and advanced customization features.

### Key Highlights
- ✅ **Multiplayer Pong** - Real-time gameplay between players across different computers
- ✅ **AI Opponent** - Configurable difficulty levels (Easy, Medium, Hard)
- ✅ **Tournament System** - Single-elimination brackets with automatic bracket generation
- ✅ **Game Customization** - Themes, power-ups, adjustable game settings
- ✅ **User Management** - Profiles, friends system, rankings, and statistics
- ✅ **OAuth Integration** - Google and GitHub authentication
- ✅ **Docker Deployment** - Single-command deployment with full orchestration
- ✅ **WebSocket Real-time** - Low-latency game synchronization

---

## 📋 Module Points Breakdown (16+ Points)

### Gaming Modules (6 points)
| Module | Points | Status | Description |
|--------|--------|--------|-------------|
| Web-based Pong game | 2 | ✅ | Canvas-based multiplayer Pong with physics |
| Remote players | 2 | ✅ | Real-time gameplay synchronization via WebSocket |
| AI Opponent | 2 | ✅ | 3 difficulty levels with prediction and error simulation |
| Tournament system | 1 | ✅ | Single-elimination brackets for 4-32 players |
| Game customization | 1 | ✅ | Themes, power-ups, ball/paddle size & speed |

### User Management Modules (4 points)
| Module | Points | Status | Description |
|--------|--------|--------|-------------|
| Standard user management | 2 | ✅ | User profiles, avatars, friends, online status |
| Game statistics | 1 | ✅ | Match history, win/loss ratio, leaderboard |
| OAuth 2.0 integration | 1 | ✅ | Google & GitHub authentication |

### Web Framework Modules (6 points)
| Module | Points | Status | Description |
|--------|--------|--------|-------------|
| Next.js full-stack | 2 | ✅ | Full-stack framework (frontend + API backend) |
| Prisma ORM | 1 | ✅ | Type-safe database with migrations |
| WebSocket real-time | 2 | ✅ | Real-time game synchronization |
| Notification system | 1 | ✅ | Friend requests, tournament updates |

**Total: 16 Points** (2-point buffer beyond 14-point requirement)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 19, TypeScript | Web interface and game rendering |
| **Backend** | Next.js API Routes, Node.js | REST API and game logic |
| **Real-time** | Socket.io, WebSocket | Game synchronization |
| **Database** | PostgreSQL 16, Prisma ORM | Data persistence |
| **Caching** | Redis 7 | Session management, real-time data |
| **Styling** | Tailwind CSS 4 | UI components and responsive design |
| **Auth** | NextAuth.js v4, OAuth 2.0 | User authentication and sessions |
| **Deployment** | Docker, Docker Compose, NGINX | Containerization and reverse proxy |
| **Validation** | Zod | Schema validation |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (v2.0+)
- OR Node.js 24+ and PostgreSQL 16+

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd ft_transcendence

# Setup environment
cp .env.example .env.local

# Start all services
./scripts/docker-setup.sh start

# Run migrations
./scripts/docker-setup.sh migrate

# Access application
# Web: https://localhost
# API: https://localhost/api
# WebSocket: wss://localhost/ws
```

#### Option 2: Local Development

```bash
# Install dependencies
npm install

# Setup database
cp .env.example .env.local
npx prisma migrate dev

# Run dev server
npm run dev          # Next.js app on port 3000
npm run ws:dev       # WebSocket server on port 3001 (separate terminal)

# Access application
# Web: http://localhost:3000
# API: http://localhost:3000/api
# WebSocket: ws://localhost:3001
```

---

## 📚 API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "displayName": "Display Name"
}

# Login (via NextAuth)
GET /api/auth/signin

# Logout
GET /api/auth/signout

# Get session
GET /api/auth/session
```

### Users

```bash
# List users (paginated, searchable)
GET /api/users?page=1&limit=10&sort=ranking

# Get user profile
GET /api/users/[id]

# Update profile
PATCH /api/users/[id]
{
  "displayName": "New Name",
  "bio": "Biography",
  "avatarUrl": "https://..."
}

# Get game preferences
GET /api/users/[id]/preferences

# Update preferences
PATCH /api/users/[id]/preferences
{
  "theme": "neon",
  "ballSpeed": 4,
  "paddleSpeed": 3
}
```

### Games

```bash
# List user's games
GET /api/games?page=1&limit=10

# Create game
POST /api/games
{
  "mode": "SINGLE_PLAYER",
  "aiDifficulty": "MEDIUM",
  "settings": {
    "ballSpeed": 3,
    "maxScore": 11,
    "theme": "classic"
  }
}

# Get game details
GET /api/games/[id]

# Get customization options
GET /api/games/customize
```

### Tournaments

```bash
# List tournaments
GET /api/tournaments?status=PENDING&page=1

# Create tournament
POST /api/tournaments
{
  "name": "Summer Cup 2026",
  "maxParticipants": 8,
  "gameSettings": { ... }
}

# Get tournament details
GET /api/tournaments/[id]

# Join tournament
POST /api/tournaments/[id]/join

# Leave tournament
DELETE /api/tournaments/[id]/join

# Get bracket
GET /api/tournaments/[id]/bracket

# Start tournament (organizer)
POST /api/tournaments/[id]/start
```

### Statistics

```bash
# Get leaderboard
GET /api/statistics/leaderboard?sort=ranking&limit=50
```

---

## 🎮 Game Features

### Game Modes
1. **Single Player** - Play against AI with 3 difficulty levels
2. **Multiplayer** - Real-time 1v1 against other players
3. **Tournament** - Single-elimination bracket (4, 8, 16, 32 players)

### Customization
- **Themes**: Classic, Neon, Retro, Space
- **Ball**: Size (1-5) and Speed (1-5)
- **Paddle**: Size (1-5) and Speed (1-5)
- **Scoring**: 5, 7, 11, 15, or 21 points to win

### AI Difficulty

| Difficulty | Reaction Time | Accuracy | Prediction Error |
|------------|---------------|----------|------------------|
| Easy       | 200ms         | 60%      | 50px             |
| Medium     | 100ms         | 80%      | 20px             |
| Hard       | 50ms          | 95%      | 5px              |

---

## 🐳 Docker Deployment

### Services
- **PostgreSQL**: Database (Port 5432)
- **Redis**: Caching (Port 6379)
- **Next.js App**: Web & API (Port 3000)
- **WebSocket Server**: Real-time (Port 3001)
- **NGINX**: Reverse Proxy (Ports 80, 443)

### Commands

```bash
# Start services
./scripts/docker-setup.sh start

# View logs
./scripts/docker-setup.sh logs app

# Run migrations
./scripts/docker-setup.sh migrate

# Stop services
./scripts/docker-setup.sh stop

# See all commands
./scripts/docker-setup.sh help
```

See [DOCKER.md](DOCKER.md) for comprehensive Docker documentation.

---

## 🔒 Security Features

✅ HTTPS/TLS encryption
✅ JWT token authentication
✅ Password hashing (bcrypt, 12 rounds)
✅ SQL injection protection (Prisma ORM)
✅ XSS protection (React auto-escaping)
✅ CORS properly configured
✅ Rate limiting (5-30 req/s by endpoint)
✅ Secure HTTP headers
✅ Non-root Docker containers

---

## 📄 Legal Pages

- **Privacy Policy**: `/privacy`
- **Terms of Service**: `/terms`

---

## 🆘 Support

For issues or questions:
1. Check [DOCKER.md](DOCKER.md) for deployment help
2. Review API documentation above
3. Check browser console for errors
4. Review application logs: `./scripts/docker-setup.sh logs`

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
