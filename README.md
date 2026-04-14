# AI Trainer English

A full-stack AI-powered English learning platform built with Node.js, React, and Google Gemini AI.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (Access + Refresh Token), Google OAuth, Facebook OAuth |
| DevOps | Docker, Docker Compose |

## Features

- **AI Chat Tutor** — Conversational English tutor powered by Gemini
- **Grammar Check** — Detect and correct grammar errors with explanations
- **Exercise Generator** — Multiple-choice, fill-in-the-blank, sentence reorder, error correction
- **Vocabulary Lookup** — Word meaning, pronunciation, examples, synonyms with TTS
- **Writing Feedback** — Detailed scoring across grammar, vocabulary and coherence
- **Learning History** — Auto-saved sessions with progress statistics
- **OAuth Login** — Google and Facebook sign-in
- **Text-to-Speech** — Browser-native pronunciation for any word or sentence

## Project Structure

```
AI trainer English/
├── BE/                      # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # Database, Gemini, Passport
│   │   ├── controllers/     # Auth, AI, Session
│   │   ├── middleware/      # JWT protect, adminOnly
│   │   ├── models/          # User, Session (Mongoose)
│   │   ├── routes/          # auth, ai, sessions
│   │   └── services/        # ai.service.js (Gemini prompts)
│   ├── .env.example
│   └── Dockerfile
├── FE/                      # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance + interceptors
│   │   ├── context/         # AuthContext
│   │   ├── components/      # PrivateRoute, Sidebar, Layout
│   │   ├── hooks/           # useTTS
│   │   └── pages/           # Landing, Dashboard, Chat, Grammar...
│   └── Dockerfile
├── docker-compose.yml       # Development
├── docker-compose.prod.yml  # Production
└── Makefile                 # CLI shortcuts
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose
- Google Gemini API key — [Get one here](https://aistudio.google.com/)
- (Optional) Google OAuth credentials
- (Optional) Facebook App credentials

### Setup

**1. Clone the repository**
```bash
git clone <repo-url>
cd ai-trainer-english
```

**2. Configure environment**
```bash
cp BE/.env.example BE/.env
```

Edit `BE/.env`:
```env
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://mongo:27017/ai_trainer_english

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES=30m
REFRESH_TOKEN_EXPIRES=7d

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Optional — OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/redirect/google
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
FACEBOOK_REDIRECT_URL=http://localhost:3000/api/auth/redirect/facebook
SESSION_SECRET=your_session_secret
```

**3. Start the application**
```bash
make up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| MongoDB | mongodb://localhost:27017 |

### Makefile Commands

```bash
make up            # Start all services (dev)
make down          # Stop all services
make build         # Rebuild Docker images
make restart       # Restart services
make logs          # Follow all logs
make logs-be       # Backend logs only
make logs-fe       # Frontend logs only
make logs-db       # MongoDB logs only
make shell-be      # Open shell in backend container
make shell-fe      # Open shell in frontend container
make shell-db      # Open mongosh in MongoDB container
make prod-up       # Start production build
make prod-build    # Build production images
make nuke          # Remove everything including volumes
```

## API Overview

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/me
GET  /api/auth/google
GET  /api/auth/facebook
```

### AI Features
```
POST /api/ai/chat
POST /api/ai/grammar-check
POST /api/ai/exercise
POST /api/ai/vocabulary
POST /api/ai/writing-feedback
```

### Sessions
```
POST /api/sessions
POST /api/sessions/:id/submit
GET  /api/sessions
GET  /api/sessions/stats
```

## Token Strategy

| Token | Storage | Expiry |
|---|---|---|
| Access Token | JS memory (not localStorage) | 30 minutes |
| Refresh Token | httpOnly cookie | 7 days |

The access token is automatically refreshed via an Axios interceptor when it expires. The refresh token cookie is scoped to `/api/auth/refresh-token` only.

## Production Deployment

```bash
make prod-build
make prod-up
```

Production uses Nginx to serve the React build and proxy `/api` requests to the backend.

> Remember to set `NODE_ENV=production` and use strong secrets in your `.env` before deploying.

## License

MIT
