# Quick Start Guide

Get the Stock Market Alert & Portfolio Tracker running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm 9+
- MongoDB (local or cloud)
- Free Finnhub API key from https://finnhub.io

## Setup in 5 Steps

### 1. Backend Setup (Terminal 1)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/stockapp
JWT_SECRET=your_secret_key_here
FINNHUB_API_KEY=your_api_key_from_finnhub
PORT=4000
```

Start backend:
```bash
npm run dev
```

Expected output:
```
Connected to MongoDB
Backend listening on 4000
```

### 2. Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env.local` (create if it doesn't exist):
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start frontend:
```bash
npm run dev
```

Expected output:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3. Open Application

Navigate to: **http://localhost:3000**

### 4. Create Account

- Click "Sign Up"
- Enter: Name, Email, Password (6+ chars)
- Click "Sign Up"
- Redirects to Dashboard

### 5. Start Using

**Test Flow (2 minutes):**

1. **Dashboard** - See portfolio summary
2. **Quick Search** - Search "RELIANCE" (or any symbol)
3. **Watchlist** - Add "TCS" to watchlist
4. **Portfolio** - Add holding: RELIANCE, quantity 10, buy price 1500
5. **Alerts** - Create alert: RELIANCE > 3000
6. **Wait 60 seconds** - Refresh to see alert evaluation

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Cannot connect to MongoDB" | `mongod` in another terminal |
| "Invalid Finnhub API key" | Get key from https://finnhub.io, update .env |
| Frontend can't reach backend | Check backend on port 4000, verify API URL |
| "CORS error" | Backend CORS is enabled by default |
| Port already in use | Change PORT in .env or .env.local |

## File Structure Reference

```
backend/
  index.js          ← Start here to understand flow
  routes/           ← API endpoints
  models/           ← Database schemas
  services/         ← Business logic
  .env              ← Configuration

frontend/
  src/pages/        ← User-facing pages
  src/components/   ← Reusable UI
  src/context/      ← Global state
  src/lib/          ← Utilities
  .env.local        ← Configuration
```

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header (except `/auth` and `/stocks/:symbol`).

**Authentication:**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login

**Stocks:**
- `GET /api/stocks/:symbol` - Get quote (public)

**Watchlist:**
- `POST /api/watchlist` - Add stock
- `GET /api/watchlist` - List stocks
- `DELETE /api/watchlist/:id` - Remove stock

**Portfolio:**
- `POST /api/holdings` - Add holding
- `GET /api/holdings` - List holdings with P&L
- `DELETE /api/holdings/:id` - Remove holding

**Alerts:**
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - List alerts
- `DELETE /api/alerts/:id` - Delete alert

## Next Steps

- Run full smoke tests: See [SMOKE_TEST.md](SMOKE_TEST.md)
- Understand architecture: See [ARCHITECTURE.md](ARCHITECTURE.md)
- View detailed docs: See [README.md](README.md)
- Test with Postman: Import `backend/postman_collection.json`

## Common Commands

```bash
# Backend
cd backend && npm run dev     # Start dev server with hot reload
npm install                   # Install dependencies
npm start                     # Production start

# Frontend
cd frontend && npm run dev    # Start dev server
npm run build                 # Production build
npm start                     # Start production server

# Database
mongosh                       # Connect to MongoDB shell
db.users.find()              # View users collection
db.alerts.find()             # View alerts collection
```

## Data Flow

```
User (Browser) 
  ↓ (HTTP)
Frontend (Next.js)
  ↓ (API calls)
Backend (Express)
  ↓ (Database queries)
MongoDB
  ↓ (Stock data)
Finnhub API
  ↓ (Alert evaluation)
Cron Worker (Every 60 sec)
  ↓ (Update alerts)
Database
```

## Authentication Flow

1. User signs up → Password hashed (bcryptjs) → User stored
2. User logs in → Password verified → JWT token generated
3. Token stored in localStorage
4. Each API request includes `Authorization: Bearer <token>`
5. Backend verifies token → Allows request

## Real-time Features

- **Stock Prices**: Fetched from Finnhub API (live market data)
- **Portfolio P&L**: Calculated with current Finnhub prices
- **Price Alerts**: Evaluated every 60 seconds by background cron job

## Monitoring

Check backend logs:
```bash
# View cron job activity
# Look for: "Alert triggered for SYMBOL > PRICE"
# Look for: "Alert checker error" (if something fails)
```

That's it! You now have a fully functional stock market app. 🚀
