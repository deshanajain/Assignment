# Deployment Guide

Instructions for deploying the Stock Market Alert & Portfolio Tracker to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] HTTPS enabled (don't use HTTP in production)
- [ ] CORS properly configured (only allow your domain)
- [ ] Rate limiting enabled on API
- [ ] Database backups configured
- [ ] Error logging and monitoring set up
- [ ] Secrets stored in secure vault (not in .env file)
- [ ] Frontend build optimized and tested
- [ ] Backend tested under load
- [ ] Security headers configured

## Environment Variables

### Backend (.env)

```
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stockapp

# Security
JWT_SECRET=your_very_secure_secret_key_at_least_32_chars
PORT=4000

# External APIs
FINNHUB_API_KEY=your_finnhub_api_key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (optional, for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (.env.production)

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Stock Tracker
```

## Option 1: Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose (optional)

### Dockerize Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

### Dockerize Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json .
EXPOSE 3000
CMD ["next", "start"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: stockapp
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/stockapp
      JWT_SECRET: ${JWT_SECRET}
      FINNHUB_API_KEY: ${FINNHUB_API_KEY}
      PORT: 4000
    depends_on:
      - mongodb
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:4000/api
    depends_on:
      - backend
    restart: always

volumes:
  mongo_data:
```

### Deploy with Docker Compose

```bash
# Set environment variables
export JWT_SECRET="your_secret"
export FINNHUB_API_KEY="your_key"

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Option 2: Cloud Deployment (Heroku/Vercel)

### Deploy Backend to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET="your_secret"
heroku config:set FINNHUB_API_KEY="your_key"
heroku config:set MONGODB_URI="your_mongodb_uri"

# Deploy
git push heroku main
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api
```

## Option 3: VPS Deployment (AWS EC2/DigitalOcean)

### Prerequisites

- SSH access to VPS
- Node.js 18+ installed
- MongoDB running (locally or Atlas)

### Backend Setup

```bash
# SSH into VPS
ssh ubuntu@your_vps_ip

# Clone repository
git clone https://github.com/yourusername/stockapp.git
cd stockapp/backend

# Install dependencies
npm install --production

# Create .env file
cp .env.example .env
nano .env  # Edit with your values

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start index.js --name "backend"
pm2 save
pm2 startup
```

### Frontend Setup

```bash
cd ../frontend

# Build frontend
npm install
npm run build

# Start with PM2
pm2 start npm --name "frontend" -- start

# Or use Nginx as reverse proxy
# See section below
```

### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/stockapp`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/stockapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (runs automatically)
sudo systemctl enable certbot.timer
```

## Security Best Practices

### 1. HTTPS Only

```javascript
// backend/index.js
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
```

### 2. Secure Headers

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 3. CORS Configuration

 ```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-project.vercel.app"
  ],
  credentials: true
}));
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. Secrets Management

Never commit `.env` files. Use:
- **Heroku**: `heroku config:set`
- **Vercel**: Environment variables in dashboard
- **AWS**: AWS Secrets Manager
- **VPS**: Keep .env in secure location, add to .gitignore

### 6. Password Security

Already implemented:
- bcryptjs for password hashing
- 6+ character minimum
- Salting (bcryptjs default)

### 7. JWT Best Practices

Current implementation:
- Bearer token in Authorization header ✓
- Tokens verified on each request ✓

Improvements:
- Add token expiration (e.g., 24 hours)
- Implement refresh tokens
- Use HttpOnly cookies instead of localStorage

### 8. Database Security

MongoDB Atlas:
- Enable IP whitelist
- Use strong database password
- Enable encryption at rest
- Enable backups

## Monitoring & Logging

### Application Monitoring

```javascript
// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error logging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Send to error tracking service (Sentry, DataDog, etc.)
});
```

### Performance Monitoring

Track:
- Response times
- Error rates
- Database query times
- API request frequencies

### Recommended Tools

- **Error Tracking**: Sentry
- **Application Monitoring**: New Relic, DataDog
- **Log Aggregation**: ELK Stack, Splunk
- **Uptime Monitoring**: Uptime Robot, StatusCake

## Database Backups

### MongoDB Atlas (Recommended)

- Automated backups every 12 hours
- Point-in-time recovery
- No additional configuration needed

### Manual Backups

```bash
# Export database
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/stockapp" \
          --out ./backups/$(date +%Y%m%d)

# Restore database
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/stockapp" \
             ./backups/20240115
```

## Performance Optimization

### Frontend

```bash
# Frontend build
npm run build

# Analyze bundle size
npm run build -- --analyze
```

### Backend

```javascript
// Add caching for stock quotes (Redis)
// Batch database queries
// Use indexes on frequently queried fields
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          appdir: "backend"
```

## Troubleshooting Production Issues

| Issue | Solution |
|-------|----------|
| High memory usage | Check for memory leaks, restart service |
| Slow queries | Add database indexes, optimize queries |
| CORS errors | Verify ALLOWED_ORIGINS in .env |
| Token expiration | Implement refresh token flow |
| Finnhub rate limit | Implement caching, upgrade plan |
| Database connection | Check connection string, IP whitelist |

## Rollback Procedure

```bash
# If deployment fails, revert to previous version
git revert HEAD
git push heroku main

# Or with Docker
docker run -d -p 4000:4000 your-app:previous-tag
```

## Post-Deployment Checklist

- [ ] Test all features in production
- [ ] Verify SSL certificate
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Set up alerting
- [ ] Test database backups
- [ ] Verify CORS and security headers
- [ ] Load test the application
- [ ] Create runbook for common issues
- [ ] Set up maintenance window procedure

## Support & Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Heroku**: https://devcenter.heroku.com/
- **Vercel**: https://vercel.com/docs
- **Nginx**: https://nginx.org/en/docs/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Docker**: https://docs.docker.com/

