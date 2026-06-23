# API Documentation

Base: `/api`

## Auth
- `POST /api/auth/signup` {name,email,password} -> {token,user}
- `POST /api/auth/login` {email,password} -> {token,user}

## Watchlist
- `POST /api/watchlist` {symbol} (auth)
- `GET /api/watchlist` (auth)
- `DELETE /api/watchlist/:id` (auth)

## Holdings
- `POST /api/holdings` {symbol,quantity,buyPrice} (auth)
- `GET /api/holdings` (auth) -> {holdings, summary}
- `DELETE /api/holdings/:id` (auth)

## Alerts
- `POST /api/alerts` {symbol,condition, targetPrice} (auth)
- `GET /api/alerts` (auth)
- `DELETE /api/alerts/:id` (auth)

## Stocks
- `GET /api/stocks/:symbol` -> {symbol,currentPrice,high,low,volume,percentChange}

Notes:
- All protected routes require `Authorization: Bearer <token>` header.
- Stock data powered by Finnhub. Set `FINNHUB_API_KEY` in `.env`.
