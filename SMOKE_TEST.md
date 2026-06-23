# Smoke Test & Verification Guide

This guide walks through a complete end-to-end test of all features in the Stock Market Alert & Portfolio Tracker application.

## Prerequisites

Before starting the smoke test:

1. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and Finnhub API key
   npm run dev
   ```
   Expected: Backend running on `http://localhost:4000`

2. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Expected: Frontend running on `http://localhost:3000`

3. **MongoDB:** Ensure MongoDB is running and connection string is correct

4. **Finnhub API Key:** Get a free key from https://finnhub.io

## Test Cases

### 1. Authentication

#### 1.1 Signup
- Navigate to `http://localhost:3000/signup`
- **Valid Input:**
  - Name: "Test User"
  - Email: "test@example.com"
  - Password: "password123"
  - Confirm Password: "password123"
- **Expected:** Redirects to dashboard, token stored in localStorage
- **Verify:** Check browser DevTools → Application → localStorage for "token"

#### 1.2 Login
- Navigate to `http://localhost:3000/login`
- **Valid Input:**
  - Email: "test@example.com"
  - Password: "password123"
- **Expected:** Redirects to dashboard
- **Verify:** User name appears in navbar

#### 1.3 Protected Routes
- Manually clear localStorage (DevTools → Application → Clear)
- Try accessing `http://localhost:3000/dashboard`
- **Expected:** Redirects to login page

#### 1.4 Logout
- Click "Logout" button in navbar
- **Expected:** Redirects to login, localStorage cleared

### 2. Stock Search

#### 2.1 Dashboard Quick Search
- Go to dashboard
- Search for "RELIANCE" (or any symbol)
- **Expected:** Stock card displays:
  - Current Price
  - Day High/Low
  - Trading Volume
  - Percentage Change (green if +, red if -)

#### 2.2 Invalid Symbol
- Search for "INVALID999"
- **Expected:** Error message displayed

### 3. Watchlist Management

#### 3.1 Add to Watchlist
- Go to Watchlist page (click "Watchlist" in navbar)
- Enter symbol: "TCS"
- Click "Add Stock"
- **Expected:**
  - Success message appears
  - Stock appears in list with live data
  - Form clears

#### 3.2 Multiple Watchlist Items
- Add "INFY", "HDFCBANK", "LT"
- **Expected:** All stocks display with current prices

#### 3.3 Remove from Watchlist
- Click "Remove" on one stock
- **Expected:**
  - Success message
  - Stock removed from list

#### 3.4 Form Validation
- Try adding empty symbol
- **Expected:** Error: "Symbol is required"

### 4. Portfolio & P&L Calculation

#### 4.1 Add Holding
- Go to Portfolio page (click "Portfolio" in navbar)
- **Fill form:**
  - Symbol: "RELIANCE"
  - Quantity: 10
  - Buy Price: 1500
- Click "Add Holding"
- **Expected:**
  - Success message
  - Holding appears in list
  - Portfolio summary cards update

#### 4.2 Verify P&L Calculation
- Check that Holding shows:
  - **Invested:** 1500 × 10 = 15,000
  - **Current Value:** Current Price × 10
  - **P/L:** Current Value - Invested (green if positive, red if negative)

#### 4.3 Portfolio Summary
- At top of page, verify three cards show:
  - **Total Invested:** Sum of all investments
  - **Current Value:** Sum of all holdings' current values
  - **Profit/Loss:** Overall P/L

#### 4.4 Add Multiple Holdings
- Add another holding (different symbol)
- **Expected:**
  - Portfolio summary updates correctly
  - P/L calculations are accurate

#### 4.5 Remove Holding
- Click "Remove" on a holding
- **Expected:**
  - Holding deleted
  - Portfolio summary recalculates

#### 4.6 Form Validation
- Try adding with:
  - Quantity: 0 → Error: "Quantity must be greater than 0"
  - Buy Price: -100 → Error: "Price must be greater than 0"

### 5. Price Alerts System

#### 5.1 Create Alert - Greater Than
- Go to Alerts page (click "Alerts" in navbar)
- **Fill form:**
  - Symbol: "RELIANCE"
  - Condition: "Greater Than"
  - Target Price: 10000 (high price unlikely to trigger soon)
- Click "Create Alert"
- **Expected:**
  - Success message
  - Alert appears in "Active Alerts" section

#### 5.2 Create Alert - Less Than
- **Fill form:**
  - Symbol: "TCS"
  - Condition: "Less Than"
  - Target Price: 100 (low price unlikely to trigger soon)
- Click "Create Alert"
- **Expected:** Alert added to active list

#### 5.3 Verify Active Alert Properties
- Each alert should show:
  - Stock symbol
  - Condition (> or <)
  - Target price
  - Created date

#### 5.4 Delete Alert
- Click "Delete" on an alert
- **Expected:** Alert removed from list

#### 5.5 Form Validation
- Try creating with empty symbol
- **Expected:** Error: "Symbol is required"

#### 5.6 Cron Worker - Alert Triggering
- Create an alert with a realistic target:
  ```
  Symbol: RELIANCE
  Condition: Less Than
  Target Price: 5000 (if current price is above 5000)
  ```
- Wait 60+ seconds (cron runs every minute)
- Refresh the page
- **Expected:** Alert moves to "Triggered Alerts" section with:
  - Green checkmark (✓)
  - Triggered timestamp
  - Status shows "Triggered"

#### 5.7 Triggered Alerts History
- View triggered alerts section
- **Expected:** Shows all previously triggered alerts with timestamps

### 6. Dashboard Summary

#### 6.1 Portfolio Summary Cards
- Verify three cards at top:
  - Total Invested Amount
  - Current Value
  - Overall P/L

#### 6.2 Active Alerts Count
- Shows count of active (non-triggered) alerts
- "View All" link navigates to Alerts page

#### 6.3 Watchlist Preview
- Shows up to 3 stocks from watchlist
- Each displays live data
- "View All" link navigates to Watchlist page

#### 6.4 Quick Stock Search
- Search for a stock
- Results display with live prices

#### 6.5 Quick Links
- Test clicking on Watchlist, Portfolio, Alerts cards
- **Expected:** Navigates to respective pages

### 7. Responsive Design

#### 7.1 Desktop View (1920px)
- All content displays properly
- Grid layouts work correctly
- No horizontal scrolling

#### 7.2 Tablet View (768px)
- Resize browser to 768px width
- Navigation collapses appropriately
- Forms stack vertically
- Cards maintain readability

#### 7.3 Mobile View (375px)
- Resize browser to 375px width
- All content readable
- Buttons and inputs accessible
- Forms are usable

### 8. Error Handling

#### 8.1 Network Error
- Start the app
- Stop the backend server
- Try any action (search, add to watchlist)
- **Expected:** Error message displayed

#### 8.2 Invalid API Key
- Remove FINNHUB_API_KEY or use invalid key
- Try searching for stock
- **Expected:** Error message

#### 8.3 Form Errors
- Submit forms with invalid data
- **Expected:** Inline error messages under fields

#### 8.4 Unauthorized Access
- Manually set localStorage token to invalid value
- Try accessing protected page
- **Expected:** Redirects to login

### 9. API Testing (Using Postman)

1. **Import Postman Collection:**
   - Open Postman
   - Import `backend/postman_collection.json`
   - Set `{{baseUrl}}` to `http://localhost:4000`

2. **Test Signup:**
   - Send POST `/api/auth/signup` with new user
   - Copy token from response into `{{token}}` variable

3. **Test Stock Quote:**
   - Send GET `/api/stocks/RELIANCE`
   - Verify response includes: symbol, currentPrice, high, low, volume, percentChange

4. **Test Protected Endpoints:**
   - All watchlist, holdings, alerts endpoints should require Authorization header
   - Without token: 401 Unauthorized
   - With valid token: 200 OK

### 10. Performance & Optimization

#### 10.1 Loading States
- Fast API calls show "Loading..." briefly
- Slow calls (network delay) show spinner

#### 10.2 Form Submission
- Button shows "⏳ Loading..." while processing
- Button disabled during submission

#### 10.3 Stock Search Debouncing
- Type search query slowly
- Only one API call for each symbol

### 11. Session Persistence

#### 11.1 Token Persistence
- Login
- Close browser tab
- Open new tab, go to `http://localhost:3000`
- **Expected:** Should not redirect to login (session preserved)

#### 11.2 Session Expiry Simulation
- Clear localStorage
- Try accessing dashboard
- **Expected:** Redirects to login

## Automated Test Flow (Quick Smoke Test)

If you want to run through everything quickly:

```
1. Signup with test@example.com / password123
2. Search RELIANCE in quick search
3. Add RELIANCE to watchlist
4. Add holding: RELIANCE, 10 qty, 1500 buy price
5. Create alert: RELIANCE > 3000
6. Create alert: RELIANCE < 500
7. Wait 60 seconds
8. Refresh page and check if alert with realistic target triggered
9. Delete one watchlist item
10. Delete one holding
11. Logout and verify redirect to login
```

## Verification Checklist

- [ ] All signup/login flows work
- [ ] Protected routes redirect unauthenticated users
- [ ] Stock search returns real Finnhub data
- [ ] Watchlist CRUD works correctly
- [ ] Portfolio P&L calculates accurately
- [ ] Alerts create and list properly
- [ ] Cron worker triggers alerts within 60 seconds
- [ ] Dashboard displays summary accurately
- [ ] Form validation shows errors
- [ ] Error handling displays messages
- [ ] Responsive design works on mobile/tablet
- [ ] Logout clears session
- [ ] Postman collection works for all endpoints

## Common Issues & Fixes

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in backend/.env

**"Invalid Finnhub API key"**
- Get free key from https://finnhub.io/
- Update FINNHUB_API_KEY in backend/.env

**"Frontend can't reach backend"**
- Check backend running on port 4000
- Verify NEXT_PUBLIC_API_URL in frontend/.env

**"Alerts not triggering"**
- Wait 60+ seconds for next cron run
- Check backend logs for errors
- Verify alert target price is realistic

**"Login redirects immediately"**
- Clear browser cache and localStorage
- Signup again with new email
