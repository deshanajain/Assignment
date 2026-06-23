# Backend (Express)

Minimal Express backend scaffold for the Stock Alert app.

Environment variables: see `.env.example`.

Run:

```bash
npm install
npm run dev
```

Endpoints (minimal):
- `POST /api/auth/signup` {name,email,password}
- `POST /api/auth/login` {email,password}
- `GET /api/alerts` (auth)
- `POST /api/alerts` (auth)
