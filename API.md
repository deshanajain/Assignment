# API Documentation

Complete reference for all REST API endpoints.

## Base URL

```
http://localhost:4000/api
```

## Authentication

All endpoints except `/auth/signup`, `/auth/login`, and `/stocks/:symbol` require JWT authentication.

### Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Getting a Token

1. Sign up or login to get a JWT token
2. Include token in all subsequent requests

---

## Authentication Endpoints

### Sign Up

Create a new user account.

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid email format
- 400: Password must be 6+ characters
- 409: Email already exists

---

### Login

Authenticate existing user.

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- 400: Missing email or password
- 401: User not found
- 401: Invalid password

---

## Stock Endpoints

### Get Stock Quote

Fetch current stock price and market data (Public endpoint - no auth required).

```
GET /api/stocks/:symbol
```

**Example:**
```
GET /api/stocks/RELIANCE
```

**Response (200):**
```json
{
  "symbol": "RELIANCE",
  "currentPrice": 2850.50,
  "high": 2900.00,
  "low": 2800.00,
  "volume": 15000000,
  "percentChange": 2.45
}
```

**Errors:**
- 404: Stock not found
- 500: Finnhub API error

---

## Watchlist Endpoints

### Add Stock to Watchlist

Add a stock to your watchlist.

```
POST /api/watchlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "TCS"
}
```

**Response (201):**
```json
{
  "_id": "507f2f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "symbol": "TCS",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- 400: Missing symbol
- 400: Stock already in watchlist
- 401: Unauthorized (missing token)

---

### List Watchlist

Get all stocks in your watchlist with current prices.

```
GET /api/watchlist
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "stocks": [
    {
      "_id": "507f2f77bcf86cd799439012",
      "symbol": "TCS",
      "currentPrice": 3500.00,
      "high": 3550.00,
      "low": 3450.00,
      "volume": 8000000,
      "percentChange": 1.75
    },
    {
      "_id": "507f2f77bcf86cd799439013",
      "symbol": "INFY",
      "currentPrice": 1900.00,
      "high": 1950.00,
      "low": 1875.00,
      "volume": 12000000,
      "percentChange": -0.50
    }
  ]
}
```

**Errors:**
- 401: Unauthorized

---

### Remove from Watchlist

Remove a stock from your watchlist.

```
DELETE /api/watchlist/:id
Authorization: Bearer <token>
```

**Example:**
```
DELETE /api/watchlist/507f2f77bcf86cd799439012
```

**Response (200):**
```json
{
  "message": "Removed from watchlist"
}
```

**Errors:**
- 404: Watchlist item not found
- 401: Unauthorized
- 403: Not your watchlist item

---

## Portfolio (Holdings) Endpoints

### Add Holding

Add a stock holding to your portfolio.

```
POST /api/holdings
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "quantity": 10,
  "buyPrice": 1500
}
```

**Response (201):**
```json
{
  "_id": "507f3f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "symbol": "RELIANCE",
  "quantity": 10,
  "buyPrice": 1500,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- 400: Missing required fields
- 400: Quantity must be > 0
- 400: Buy price must be > 0
- 401: Unauthorized

---

### List Holdings with P&L

Get all holdings with current prices and profit/loss calculation.

```
GET /api/holdings
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "holdings": [
    {
      "_id": "507f3f77bcf86cd799439014",
      "symbol": "RELIANCE",
      "quantity": 10,
      "buyPrice": 1500,
      "invested": 15000,
      "currentPrice": 2850.50,
      "currentValue": 28505,
      "pl": 13505,
      "plPercentage": 90.03
    },
    {
      "_id": "507f3f77bcf86cd799439015",
      "symbol": "TCS",
      "quantity": 5,
      "buyPrice": 3200,
      "invested": 16000,
      "currentPrice": 3500,
      "currentValue": 17500,
      "pl": 1500,
      "plPercentage": 9.38
    }
  ],
  "summary": {
    "totalInvested": 31000,
    "totalCurrentValue": 46005,
    "totalPl": 15005,
    "totalPlPercentage": 48.40
  }
}
```

**Errors:**
- 401: Unauthorized

---

### Remove Holding

Remove a stock from your portfolio.

```
DELETE /api/holdings/:id
Authorization: Bearer <token>
```

**Example:**
```
DELETE /api/holdings/507f3f77bcf86cd799439014
```

**Response (200):**
```json
{
  "message": "Holding removed"
}
```

**Errors:**
- 404: Holding not found
- 401: Unauthorized
- 403: Not your holding

---

## Price Alert Endpoints

### Create Alert

Create a price alert for a stock.

```
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "condition": "GT",
  "targetPrice": 3000
}
```

**Parameters:**
- `symbol`: Stock symbol (required)
- `condition`: "GT" (greater than) or "LT" (less than) (required)
- `targetPrice`: Target price threshold (required, must be > 0)

**Response (201):**
```json
{
  "_id": "507f4f77bcf86cd799439016",
  "userId": "507f1f77bcf86cd799439011",
  "symbol": "RELIANCE",
  "condition": "GT",
  "targetPrice": 3000,
  "isTriggered": false,
  "triggeredAt": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- 400: Missing required fields
- 400: Invalid condition (must be GT or LT)
- 400: Target price must be > 0
- 401: Unauthorized

---

### List Alerts

Get all your price alerts (active and triggered).

```
GET /api/alerts
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "alerts": [
    {
      "_id": "507f4f77bcf86cd799439016",
      "symbol": "RELIANCE",
      "condition": "GT",
      "targetPrice": 3000,
      "isTriggered": false,
      "triggeredAt": null,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f4f77bcf86cd799439017",
      "symbol": "TCS",
      "condition": "LT",
      "targetPrice": 3200,
      "isTriggered": true,
      "triggeredAt": "2024-01-15T10:35:00Z",
      "createdAt": "2024-01-15T10:32:00Z"
    }
  ]
}
```

**Errors:**
- 401: Unauthorized

---

### Delete Alert

Remove a price alert.

```
DELETE /api/alerts/:id
Authorization: Bearer <token>
```

**Example:**
```
DELETE /api/alerts/507f4f77bcf86cd799439016
```

**Response (200):**
```json
{
  "message": "Alert deleted"
}
```

**Errors:**
- 404: Alert not found
- 401: Unauthorized
- 403: Not your alert

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

---

## Error Response Format

All errors return JSON with a message:

```json
{
  "message": "Error description here"
}
```

---

## Example: Complete Flow

### 1. Sign Up
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response includes `token`.

### 2. Search Stock (No auth needed)
```bash
curl http://localhost:4000/api/stocks/RELIANCE
```

### 3. Add to Watchlist (Use token)
```bash
curl -X POST http://localhost:4000/api/watchlist \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE"
  }'
```

### 4. Create Alert (Use token)
```bash
curl -X POST http://localhost:4000/api/alerts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "condition": "GT",
    "targetPrice": 3000
  }'
```

### 5. Get Holdings with P&L (Use token)
```bash
curl http://localhost:4000/api/holdings \
  -H "Authorization: Bearer <token>"
```

---

## Rate Limiting & Performance

- No explicit rate limiting (production should add)
- Finnhub API has 60 calls/minute free tier limit
- Cron job groups requests to minimize API calls
- Stock data cached per request (future: Redis caching)

---

## Postman Collection

Pre-built requests available in `backend/postman_collection.json`.

To import:
1. Open Postman
2. Click "Import"
3. Select `backend/postman_collection.json`
4. Set environment variable `{{token}}` after signup

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token missing or expired. Login again. |
| 404 Not Found | Resource ID incorrect or deleted. |
| CORS Error | Backend CORS is enabled by default. |
| Finnhub Error | API key invalid or rate limit exceeded. |
| MongoDB Error | Connection string incorrect or DB offline. |

