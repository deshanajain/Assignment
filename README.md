# Stock Market Alert & Portfolio Tracker

A full-stack application for tracking stocks, managing watchlists, creating price alerts, and monitoring investment portfolio with real-time P&L calculations.

**Tech Stack:**
- Frontend: Next.js 13 + TypeScript + Tailwind CSS
- Backend: Express.js + Node.js
- Database: MongoDB
- Stock API: Finnhub
- Background Job: node-cron

## Features

✅ **User Authentication**
- Secure signup/login with JWT
- Protected routes with automatic redirect to login
- Session persistence using localStorage

✅ **Stock Search & Quotes**
- Real-time stock data from Finnhub API
- View current price, day high/low, volume, and percentage change
- Quick stock search on dashboard

✅ **Watchlist Management**
- Add/remove stocks from personal watchlist
- View watchlist with live stock data
- Responsive UI for desktop and mobile

✅ **Price Alerts**
- Create alerts for "Greater Than" or "Less Than" conditions
- Background cron job evaluates alerts every minute
- Alerts marked as triggered with timestamp
- Separate views for active and triggered alerts

✅ **Portfolio Management**
- Add stock holdings with quantity and buy price
- Automatic current price calculation
- Real-time P&L (Profit/Loss) computation
- Portfolio summary: invested amount, current value, total P&L
- Individual holding performance tracking

✅ **Professional UI**
- Responsive design for all screen sizes
- Form validation with error messages
- Loading states and error handling
- Clean dashboard with summary cards
- Mobile-friendly navigation

## Documentation

📚 **Complete guides available:**

| Guide | Purpose |
|-------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 5 minutes |
| [SMOKE_TEST.md](SMOKE_TEST.md) | Full test cases and verification checklist |
| [API.md](API.md) | Complete API endpoint reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Clean code, design patterns, and project structure |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment to Docker/Heroku/AWS/VPS |

**Start with:** [QUICKSTART.md](QUICKSTART.md) if you're new to the project

## Project Structure

```
stockapp/
├── frontend/              # Next.js app
│   ├── src/
│   │   ├── pages/        # Auth, Dashboard, Watchlist, Portfolio, Alerts
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   ├── lib/          # API client
│   │   └── styles/       # Tailwind CSS
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.cjs
│   └── .env.example
│
├── backend/               # Express API
│   ├── routes/           # Auth, Alerts, Watchlist, Holdings, Stocks
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # Mongoose schemas
│   ├── services/         # Stock API service
│   ├── index.js          # Main server + cron worker
│   ├── package.json
│   ├── .env.example
│   ├── API_DOCS.md
│   └── postman_collection.json
│
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB running locally or cloud connection string
- Finnhub API key (get free key from https://finnhub.io)

### Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/stockapp
JWT_SECRET=your-super-secret-key-change-this
FINNHUB_API_KEY=your_finnhub_api_key
PORT=4000
```

Start backend:
```bash
npm run dev
```

Backend will listen on `http://localhost:4000`

### Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env.local` (optional if backend is on localhost:4000):
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

All endpoints documented in [backend/API_DOCS.md](backend/API_DOCS.md)

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Stocks
- `GET /api/stocks/:symbol` - Get stock quote (public)

### Watchlist (Protected)
- `POST /api/watchlist` - Add stock to watchlist
- `GET /api/watchlist` - List user's watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

### Holdings (Protected)
- `POST /api/holdings` - Add stock holding
- `GET /api/holdings` - List holdings with P&L
- `DELETE /api/holdings/:id` - Remove holding

### Alerts (Protected)
- `POST /api/alerts` - Create price alert
- `GET /api/alerts` - List alerts
- `DELETE /api/alerts/:id` - Delete alert

Protected routes require header: `Authorization: Bearer <token>`

## Database Schema

### Users
```
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed)
}
```

### Watchlists
```
{
  userId: ObjectId,
  symbol: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Alerts
```
{
  userId: ObjectId,
  symbol: String,
  condition: String (GT or LT),
  targetPrice: Number,
  isTriggered: Boolean,
  triggeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Holdings
```
{
  userId: ObjectId,
  symbol: String,
  quantity: Number,
  buyPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Background Worker

The backend runs a cron job every minute (`* * * * *`) that:
1. Fetches all non-triggered alerts
2. Groups alerts by symbol
3. Calls Finnhub API for current price
4. Compares price against target
5. Marks alert as triggered if condition met
6. Stores `triggeredAt` timestamp

This allows real-time price monitoring without polling from the frontend.

## Testing

### Manual Test Flow

1. **Signup** - Create account with email/password
2. **Login** - Get JWT token
3. **Search Stock** - Use quick search to view stock details
4. **Add Watchlist** - Add stocks like RELIANCE, TCS, INFY
5. **View Watchlist** - Confirm stocks display with live prices
6. **Create Holdings** - Add RELIANCE with 10 shares @ ₹1500
7. **Check Portfolio** - Verify P&L calculation
8. **Create Alerts**:
   - RELIANCE > ₹3000
   - TCS < ₹2000
9. **Monitor Alerts** - Wait ~60 seconds for cron to evaluate
10. **Check Triggered** - Alerts should show as triggered if condition met

### Using Postman

Import `backend/postman_collection.json` for API testing with pre-configured requests.

## Architecture & Clean Code

### Backend Separation of Concerns
- **Routes** - HTTP request handling
- **Middleware** - JWT auth, error handling
- **Models** - Data schemas using Mongoose
- **Services** - Business logic (stock API calls)

### Frontend Patterns
- **Pages** - Route components
- **Components** - Reusable UI building blocks (Input, Button, Alert, etc.)
- **Context** - Global auth state using React Context API
- **Services** - API abstraction layer (`lib/api.ts`)
- **Protected Routes** - Authentication guard component

### Code Quality
- TypeScript for type safety
- Proper error handling and validation
- Responsive Tailwind CSS
- Semantic HTML
- Consistent naming conventions

## Assumptions & Trade-offs

### Assumptions
1. Finnhub API provides accurate stock data
2. MongoDB available locally or via cloud connection
3. JWT secret stored securely in production (use env vars)
4. Cron job checks alerts every minute (sufficient for demo)

### Trade-offs
1. **localStorage for tokens** - Simple but not ideal for production (use secure HttpOnly cookies)
2. **Polling-based alerts** - Simpler than WebSockets for this demo
3. **No user email verification** - Demo feature, add in production
4. **No rate limiting** - Add rate limiting middleware in production
5. **Single cron worker** - Use Redis + Bull for distributed systems

## Improvements for Production

- [ ] Add email notifications for triggered alerts
- [ ] Implement Redis caching for stock prices
- [ ] Add WebSockets for real-time price updates
- [ ] Email verification during signup
- [ ] Rate limiting on API endpoints
- [ ] Request logging and monitoring
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] User activity audit logs

## Environment Variables

See `.env.example` files in `frontend/` and `backend/` directories.

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `FINNHUB_API_KEY` - Finnhub API key
- `PORT` - Server port (default: 4000)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000/api)

## Troubleshooting

**"Cannot find module" errors**
```bash
cd backend && npm install
cd frontend && npm install
```

**MongoDB connection error**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

**Finnhub API 401 error**
- Verify FINNHUB_API_KEY is valid
- Check API rate limits

**Frontend can't reach backend**
- Check backend is running on port 4000
- Verify NEXT_PUBLIC_API_URL matches backend URL

## License

MIT

## Support

For issues or questions, check the API docs at `backend/API_DOCS.md`
