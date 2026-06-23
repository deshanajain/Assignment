# Architecture & Clean Code Guide

## Project Overview

Stock Market Alert & Portfolio Tracker is built with a clear separation of concerns using industry best practices:

- **Frontend:** Next.js + TypeScript + React Hooks + Context API
- **Backend:** Express.js + Node.js + Mongoose
- **Database:** MongoDB with schema validation
- **Background Jobs:** node-cron for periodic alert evaluation
- **API:** RESTful design with JWT authentication

## Folder Structure

```
stockapp/
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route components
│   │   │   ├── _app.tsx       # App wrapper with providers
│   │   │   ├── login.tsx      # Auth form
│   │   │   ├── signup.tsx     # Auth form
│   │   │   ├── dashboard.tsx  # Home page
│   │   │   ├── watchlist.tsx  # Watchlist CRUD
│   │   │   ├── portfolio.tsx  # Holdings & P&L
│   │   │   └── alerts.tsx     # Alert management
│   │   │
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.tsx      # Main layout wrapper
│   │   │   ├── NavBar.tsx      # Navigation
│   │   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   │   ├── Input.tsx       # Form input component
│   │   │   ├── Button.tsx      # Button component
│   │   │   ├── Alert.tsx       # Alert/notification
│   │   │   ├── StockCard.tsx   # Stock display card
│   │   │   └── Loading.tsx     # Loading spinner
│   │   │
│   │   ├── context/            # Global state
│   │   │   └── AuthContext.tsx # Auth state & methods
│   │   │
│   │   ├── lib/                # Utilities & services
│   │   │   └── api.ts          # HTTP client
│   │   │
│   │   └── styles/
│   │       └── globals.css     # Tailwind imports
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.cjs
│   └── .env.example
│
├── backend/
│   ├── routes/                 # API endpoints
│   │   ├── auth.js            # Signup/Login
│   │   ├── stocks.js          # Stock quotes
│   │   ├── watchlist.js       # Watchlist CRUD
│   │   ├── holdings.js        # Holdings CRUD
│   │   └── alerts.js          # Alerts CRUD
│   │
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # JWT verification
│   │
│   ├── models/                # Mongoose schemas
│   │   ├── user.js
│   │   ├── watchlist.js
│   │   ├── alert.js
│   │   └── holding.js
│   │
│   ├── services/              # Business logic
│   │   └── stockService.js    # Finnhub API client
│   │
│   ├── index.js               # Server & cron worker
│   ├── package.json
│   └── .env.example
│
├── README.md                  # Project overview
├── SMOKE_TEST.md             # Testing guide
└── ARCHITECTURE.md           # This file
```

## Backend Architecture

### 1. Routes (API Layer)

Routes handle HTTP requests and delegate to middleware/models.

**Example: `routes/auth.js`**
```javascript
router.post('/signup', async (req, res) => {
  // Validate input
  // Hash password
  // Create user
  // Generate JWT
  // Return token
});
```

**Responsibilities:**
- Parse request body
- Call services/models
- Return JSON response
- Handle errors

**Best Practices:**
- Routes are thin (logic in models/services)
- Validation at route level
- Consistent error responses

### 2. Middleware (Cross-cutting Concerns)

Middleware handles concerns applicable across multiple routes.

**Example: `middleware/auth.js`**
```javascript
module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

Applied to protected routes:
```javascript
router.get('/', Auth, async (req, res) => {
  // req.user is now available
  const items = await Model.find({ userId: req.user._id });
  res.json(items);
});
```

**Benefits:**
- Centralized authentication logic
- Reusable across routes
- Consistent error handling

### 3. Models (Data Layer)

Mongoose schemas define data structure and relationships.

**Example: `models/alert.js`**
```javascript
const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symbol: { type: String, required: true },
  condition: { type: String, enum: ['GT', 'LT'], required: true },
  targetPrice: { type: Number, required: true },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date }
}, { timestamps: true });
```

**Responsibilities:**
- Define field types and constraints
- Relationships between collections
- Timestamp tracking

### 4. Services (Business Logic)

Services encapsulate complex logic and external API calls.

**Example: `services/stockService.js`**
```javascript
async function getQuote(symbol) {
  const key = process.env.FINNHUB_API_KEY;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`;
  const res = await axios.get(url);
  return {
    current: res.data.c,
    high: res.data.h,
    low: res.data.l,
    volume: res.data.v
  };
}
```

**Benefits:**
- External API logic isolated
- Easy to mock for testing
- Reusable across routes

### 5. Background Jobs (Async Processing)

The cron worker runs independently to evaluate alerts.

**In `index.js`:**
```javascript
cron.schedule('* * * * *', async () => {
  const alerts = await Alert.find({ isTriggered: false });
  for (const alert of alerts) {
    const price = await stockService.getQuote(alert.symbol);
    if (alert.condition === 'GT' && price > alert.targetPrice) {
      alert.isTriggered = true;
      alert.triggeredAt = new Date();
      await alert.save();
    }
  }
});
```

**Key Points:**
- Runs independently of HTTP requests
- Uses real Finnhub API data
- Updates database atomically
- Logs for monitoring

## Frontend Architecture

### 1. Pages (Route Components)

Pages are automatically routed based on filenames in `src/pages/`.

**Structure:**
- No page composition (pages don't call other pages)
- Pages use Layout wrapper
- Each page handles its own data fetching

**Example: `pages/dashboard.tsx`**
```typescript
export default function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch data
    loadData();
  }, []);
  
  return (
    <Layout>
      {/* Render content */}
    </Layout>
  );
}
```

### 2. Components (Reusable UI)

Components are pure, composable building blocks.

**Types:**

**Presentational Components** - No side effects
```typescript
// StockCard.tsx - Pure display component
export default function StockCard({ stock }) {
  return <div>{/* Render stock data */}</div>;
}
```

**Container Components** - Handle logic and state
```typescript
// Layout.tsx - Guards with auth check
export default function Layout({ children }) {
  const { token } = useAuth();
  if (!token) router.push('/login');
  return <NavBar />{children}</NavBar>;
}
```

**Best Practices:**
- Single responsibility
- Props-based configuration
- No side effects in presentation components
- Reusable across pages

### 3. Context API (Global State)

Used for auth state that spans the entire app.

**Example: `context/AuthContext.tsx`**
```typescript
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  
  const setAuth = (t: string, u: User) => {
    localStorage.setItem('token', t);
    setToken(t);
  };
  
  return (
    <AuthContext.Provider value={{ token, user, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Must be used within AuthProvider');
  return ctx;
}
```

**When to Use:**
- Global state (auth, theme)
- Avoid prop drilling
- Wrapped at app root in `_app.tsx`

**When NOT to Use:**
- Page-level state (use useState)
- Form state (use local state)
- Data that changes frequently (use API calls)

### 4. Services (API Client)

Centralized HTTP client with automatic auth headers.

**`lib/api.ts`:**
```typescript
export async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
  
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.json().message);
  return res.json();
}
```

**Benefits:**
- Token injection automatic
- Consistent error handling
- Centralized API URL
- Easy to mock in tests

## Clean Code Principles Applied

### 1. Separation of Concerns

**Backend:**
- Routes handle HTTP only
- Models define data structure
- Services handle business logic
- Middleware handles cross-cutting concerns

**Frontend:**
- Pages handle routing
- Components are presentation focused
- Context handles global state
- Services handle data fetching

### 2. DRY (Don't Repeat Yourself)

**Backend:**
```javascript
// ❌ Duplicated auth check
router.post('/watchlist', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = await User.findById(jwt.verify(token).id);
  // ...
});

// ✅ Centralized in middleware
router.post('/watchlist', Auth, async (req, res) => {
  const user = req.user; // Already verified
  // ...
});
```

**Frontend:**
```typescript
// ❌ Duplicated form validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// In multiple forms...

// ✅ Centralized in utils
export function validateEmail(email) { /* ... */ }
// Import where needed
```

### 3. SOLID Principles

**Single Responsibility:**
- `routes/auth.js` - Only handles auth endpoints
- `services/stockService.js` - Only handles stock API
- `components/Input.tsx` - Only renders form input

**Open/Closed:**
- Button component variants: `primary`, `secondary`, `danger`
- Easy to extend without modifying core

**Liskov Substitution:**
- All Mongoose models follow same schema pattern
- Interchangeable routes use same middleware

### 4. Error Handling

**Backend:**
```javascript
try {
  const data = await SomeModel.findById(id);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.json(data);
} catch (err) {
  res.status(500).json({ message: err.message });
}
```

**Frontend:**
```typescript
try {
  setError('');
  const data = await request('/api/endpoint');
  setData(data);
} catch (err: any) {
  setError(err.message || 'Something went wrong');
}
```

### 5. Type Safety (TypeScript)

Used consistently in frontend:

```typescript
// Define types
interface User {
  id: string;
  name: string;
  email: string;
}

// Use in components
export default function NavBar({ user }: { user: User }) {
  return <span>{user.name}</span>;
}

// Type context
interface AuthContextType {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
}
```

### 6. Naming Conventions

**Consistent naming improves readability:**

**Backend:**
- Routes: `auth.js`, `watchlist.js` (lowercase)
- Models: `User.js`, `Alert.js` (PascalCase)
- Functions: `getQuote()`, `validateEmail()` (camelCase)
- Constants: `JWT_SECRET`, `API_URL` (UPPER_CASE)

**Frontend:**
- Components: `NavBar.tsx`, `Button.tsx` (PascalCase)
- Pages: `index.tsx`, `dashboard.tsx` (lowercase)
- Hooks: `useAuth()`, `useRouter()` (use prefix)
- Functions: `loadData()`, `handleSubmit()` (camelCase)

## Testing Strategy

### Manual Testing
See [SMOKE_TEST.md](SMOKE_TEST.md) for comprehensive test cases.

### API Testing
Use Postman collection: `backend/postman_collection.json`

### Future: Automated Tests
```bash
# Backend tests
npm run test:backend    # Jest for unit/integration tests

# Frontend tests
npm run test:frontend   # Vitest for component tests
```

## Performance Considerations

### Backend
- Stock API calls cached (future: Redis)
- Cron worker batches alert checks
- Database indexes on frequently queried fields

### Frontend
- Lazy loading components
- Debounced search inputs
- Minimal re-renders with React.memo (future)
- Image optimization (future)

## Deployment Checklist

- [ ] Set environment variables securely
- [ ] Enable HTTPS in production
- [ ] Use secure HttpOnly cookies instead of localStorage
- [ ] Add rate limiting middleware
- [ ] Configure CORS properly
- [ ] Add request logging
- [ ] Set up monitoring/alerting
- [ ] Database backups enabled
- [ ] CDN for static assets (frontend)
- [ ] Load balancing for multiple backend instances

## Future Improvements

1. **Automated Testing**
   - Unit tests for services
   - Integration tests for API
   - Component tests for UI

2. **Documentation**
   - Swagger/OpenAPI for API
   - Storybook for components
   - Architecture diagrams

3. **Performance**
   - Redis caching
   - Database query optimization
   - Lazy loading components

4. **Features**
   - Email notifications
   - WebSockets for real-time updates
   - User preferences/settings
   - Advanced analytics

5. **DevOps**
   - Docker containerization
   - Kubernetes orchestration
   - CI/CD pipeline
   - Infrastructure as Code
