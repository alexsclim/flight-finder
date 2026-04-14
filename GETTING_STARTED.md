# Getting Started Guide

## 🎯 Overview

This is a **full-stack award seat alert application** that allows you to:
1. **Search** for award flights across multiple airlines and transfer programs
2. **Set alerts** for specific routes and get SMS notifications when seats appear
3. **Track matches** with a dashboard showing all found awards

The app consists of:
- **Backend**: Python/FastAPI service with SQLAlchemy
- **Frontend**: React app with Tailwind CSS
- **Database**: SQLite by default (PostgreSQL optional)
- **Notifications**: Twilio SMS

---

## 📋 Prerequisites

Before starting, you'll need:

1. **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
2. **PostgreSQL** (local or remote) — [Download](https://www.postgresql.org/download/)
3. **Text Editor/IDE** — VS Code recommended
4. **Twilio Account** (free trial works) — [Sign up](https://www.twilio.com/try-twilio)
   - You'll need: Account SID, Auth Token, and a Twilio phone number

---

## 🔧 Step 1: Environment Setup

### 1.1 Create `.env` file

In the project root, copy the example and add your credentials:

```bash
cp .env.example .env
```

### 1.2 Edit `.env` with your values

```bash
# Database (create a PostgreSQL database first)
DATABASE_URL=postgresql://username:password@localhost:5432/award_seats

# Twilio (get from https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# JWT Secret (create any random string)
JWT_SECRET=your-super-secret-key-change-this

# Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api
```

### 1.3 Create PostgreSQL Database

```bash
createdb award_seats
# Or using psql:
# psql -U postgres
# CREATE DATABASE award_seats;
```

---

## 📦 Step 2: Install Dependencies

From the project root:

```bash
npm install
```

This installs dependencies for both backend and frontend.

---

## 🗄️ Step 3: Setup Database

The Python backend creates the database automatically when it starts.

If you want to use PostgreSQL instead of SQLite, set `DATABASE_URL` in `backend/.env`.

---

## 🚀 Step 4: Start Development

### Option A: Start both backend and frontend together

From the project root:

```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:3000`

### Option B: Start individually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

---

## ✅ Step 5: Verify Setup

1. **Visit the app**: Open http://localhost:3000 in your browser
2. **Register an account**: Use the Sign Up button
   - Email: any email
   - Password: any password
   - Phone: A valid phone number (e.g., +15551234567) for SMS alerts
3. **Test search**: Go to "Search" and try searching for awards
   - From: JFK
   - To: LHR
   - Dates: Pick any future dates
   - Cabins: Business
   - Airlines: United, Alaska
   - Click "Search Awards"

4. **Test alert creation** (requires login):
   - After searching, click an airline/result to create an alert
   - Or manage alerts from "My Alerts" tab

5. **Check backend health**:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok"}`

---

## 📱 Testing SMS Notifications

### To test Twilio SMS:

1. **Use Twilio console** (doesn't send real SMS):
   - Go to https://www.twilio.com/console/phone-numbers/verified
   - Add your phone number as a "Verified Caller ID"

2. **Or upgrade Twilio account**:
   - Free trial is limited to verified numbers
   - Upgrade account to send to any number

3. **Trigger a notification**:
   - Create an alert for a route
   - The background job checks alerts every hour
   - Manually test by running alert matcher:
   ```bash
   # In backend, add this to src/index.ts temporarily:
   # import { checkAndMatchAlerts } from './jobs/alertMatcher';
   # checkAndMatchAlerts();
   ```

---

## 🎨 Frontend Pages

Once the app is running:

1. **Home** (`/`) - Overview and quick links
2. **Search** (`/search`) - One-off award search (no login needed)
3. **Login** (`/login`) - Sign in to your account
4. **Register** (`/register`) - Create a new account
5. **Alerts** (`/alerts`) - View and manage your alerts (login required)
6. **Alert Detail** (`/alerts/:id`) - See matches for a specific alert

---

## 🔌 API Endpoints

All endpoints except search and health require authentication. Pass JWT token in header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Auth
```
POST   /api/auth/register    { email, password, phoneNumber }
POST   /api/auth/login       { email, password }
```

### Search (Public)
```
POST   /api/search           { departureAirport, arrivalAirport, startDate, endDate, cabinClasses, airlines, maxMilesCost }
GET    /api/search/:id       (Get cached results)
GET    /api/search/history/user (User's searches, requires auth)
```

### Alerts (Requires Auth)
```
POST   /api/alerts           Create new alert
GET    /api/alerts           Get user's alerts
GET    /api/alerts/:id       Get alert with matches
PATCH  /api/alerts/:id       Update alert
DELETE /api/alerts/:id       Delete alert
```

---

## 🛠️ Project Structure Quick Reference

```
award-seat-alerts/
├── backend/                  Express API
│   ├── src/adapters/        Airline search implementations
│   ├── src/services/        Business logic
│   ├── src/routes/          API endpoints
│   ├── src/jobs/            Background jobs
│   └── prisma/              Database schema
├── frontend/                React app
│   ├── src/pages/           React components
│   ├── src/api.ts           API client
│   └── src/store.ts         Auth state
└── database/                SQL schema reference
```

---

## 🔄 How It Works

### Search Flow
1. User enters search criteria (from, to, dates, airlines)
2. Frontend sends POST to `/api/search`
3. Backend calls all selected airline adapters in parallel
4. Results normalized and cached for 30 minutes
5. Frontend displays results

### Alert Flow
1. User creates alert from search or manually
2. Alert stored in database
3. Background job checks all active alerts every hour
4. For each alert, searches for new flights
5. New matches trigger SMS notification (with cooldown)
6. Matches logged in `AlertMatch` table

### Authentication
1. User registers/logs in
2. Backend creates JWT token (30-day expiry)
3. Frontend stores token in localStorage
4. Token sent with each authenticated request
5. Backend validates token in `authenticate` middleware

---

## 🚨 Troubleshooting

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# On macOS:
brew services start postgresql

# On Linux:
sudo systemctl start postgresql

# On Windows:
Use PostgreSQL installer or pgAdmin
```

### Port already in use
```
Error: listen EADDRINUSE :::3001
```
**Solution**: Kill the process or use different port
```bash
# Find process using port 3001
lsof -i :3001
kill -9 <PID>

# Or change PORT in .env
PORT=3002
```

### Twilio SMS not sending
- Check Twilio Account SID and Auth Token in .env
- Verify phone number format (international: +1234567890)
- Check Twilio console for errors
- Free trial requires verified phone numbers

### Frontend can't reach backend
- Ensure backend is running on `http://localhost:3001`
- Check VITE_API_URL in .env
- Check browser console for CORS errors

---

## 📚 Next Steps

After you have the MVP running:

1. **Add more airlines**: Extend `backend/src/adapters/` with adapters for:
   - Amex transfer partners (Flying Blue, Lufthansa, etc.)
   - Chase transfer partners
   - Citi transfer partners

2. **Improve search**: 
   - Add filtering/sorting options
   - Cache results more intelligently
   - Add seat map visualization

3. **Deploy**: 
   - Backend: Heroku, Railway, AWS Lambda
   - Frontend: Vercel, Netlify
   - Database: AWS RDS, Supabase

4. **Scale**:
   - Move background jobs to separate service
   - Add Redis caching layer
   - Implement rate limiting per airline

---

## 💡 Tips

- **Local development**: Start the Python backend from `backend/` with `uvicorn app.main:app --reload --host 0.0.0.0 --port 3001` and the frontend with `npm run dev`
- **Database setup**: The backend creates tables automatically on startup; use `DATABASE_URL` to switch database providers
- **Reset database**: Delete the local SQLite file and restart the backend
- **Test API**: Use Postman, Thunder Client, or `curl`

---

## 📞 Support

For issues or questions:
1. Check the error message carefully
2. Look at console logs (both frontend and backend)
3. Verify all `.env` variables are set
4. Check that all services (DB, backend, frontend) are running

Good luck! 🚀
