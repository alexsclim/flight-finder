# Flight Finder

Global award seat search and notification app built with React, Node.js, Express, and PostgreSQL.

## 📁 Project Structure

```
flight-finder/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── adapters/          # Airline-specific search adapters
│   │   │   ├── AirlineAdapter.ts    # Base class
│   │   │   ├── UnitedAdapter.ts     # United Airlines implementation
│   │   │   ├── AlaskaAdapter.ts     # Alaska Airlines implementation
│   │   │   └── index.ts             # Registry & exports
│   │   ├── services/          # Business logic
│   │   │   ├── SearchService.ts     # Award search logic
│   │   │   ├── AlertService.ts      # Alert CRUD & matching
│   │   │   ├── NotificationService.ts # SMS via Twilio
│   │   │   └── index.ts
│   │   ├── routes/            # API endpoints
│   │   │   ├── search.ts      # /api/search
│   │   │   ├── alerts.ts      # /api/alerts
│   │   │   ├── auth.ts        # /api/auth
│   │   │   └── index.ts
│   │   ├── jobs/              # Background jobs
│   │   │   └── alertMatcher.ts      # Periodic alert checking
│   │   ├── middleware/        # Auth middleware
│   │   └── index.ts           # Express app entry
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── pages/            # Route components
│   │   │   ├── HomePage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── AlertDetailPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── api.ts            # API client
│   │   ├── store.ts          # Zustand auth store
│   │   ├── App.tsx           # Main app + routing
│   │   ├── main.tsx          # React entry
│   │   ├── App.css           # Tailwind extensions
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── database/                  # Database schema (SQL files)
├── .env.example              # Environment variables template
├── package.json              # Root monorepo config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Twilio account (for SMS notifications)

### Backend Setup

```bash
cd backend
npm install
cp ../.env.example ../.env
# Edit .env with your credentials
npm run db:push              # Create database tables
npm run dev                  # Start API on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev                  # Start app on http://localhost:3000
```

### Full Stack

From root directory:
```bash
npm install
npm run dev                   # Runs both backend and frontend
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
  - Body: `{ email, password, phoneNumber? }`
- `POST /api/auth/login` - Login
  - Body: `{ email, password }`

### Search
- `POST /api/search` - Search awards
  - Body: `{ departureAirport, arrivalAirport, startDate, endDate, cabinClasses, airlines, maxMilesCost? }`
  - Returns: `{ searchSessionId, results, totalResults }`
- `GET /api/search/:searchSessionId` - Get cached results
- `GET /api/search/history/user` - Get user's search history (requires auth)

### Alerts
- `POST /api/alerts` - Create alert (requires auth)
- `GET /api/alerts` - Get user's alerts (requires auth)
- `GET /api/alerts/:alertId` - Get alert detail with matches (requires auth)
- `PATCH /api/alerts/:alertId` - Update alert (requires auth)
- `DELETE /api/alerts/:alertId` - Delete alert (requires auth)

## 🗄️ Database Schema

Key tables:
- `User` - Registered users with phone/notification settings
- `SearchSession` - Cached search queries (30-min TTL)
- `AvailabilityResult` - Award flight results
- `Alert` - User-created alert subscriptions
- `AlertMatch` - Award matches found by background job
- `AirlineAPIKey` - Stored airline API credentials

## ✈️ Supported Airlines (MVP)

- United Airlines (via API adapter)
- Alaska Airlines (via API adapter)
- Extended support (transfer partners): Amex, Chase, Citi (to be implemented)

## 🔄 Background Job

The `alertMatcher` background job:
1. Runs every hour
2. Fetches all active alerts
3. Performs searches for each alert
4. Detects new matches (deduplicates)
5. Sends SMS notifications via Twilio (respects user cooldown)
6. Marks alert as checked

## 🔐 Security

- JWT-based authentication (Bearer tokens)
- Passwords hashed with bcrypt (10 rounds)
- Protected API routes with `authenticate` middleware
- User isolation (can only access own alerts)

## 📱 Frontend Features

- Public search (no login required)
- User registration/login
- Alert creation from search results
- Alert dashboard with match history
- SMS notification preferences
- Responsive design with Tailwind CSS

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt for auth
- Twilio for SMS
- Axios for HTTP requests

**Frontend:**
- React 18
- React Router v6
- Zustand for state management
- Axios for API calls
- Tailwind CSS
- Vite for build tools
- TypeScript

## 🎯 Next Steps (Post-MVP)

1. **Add more airline adapters:**
   - Amex transfer partners (Flying Blue, Lufthansa, etc.)
   - Citi transfer partners (Hyatt, etc.)
   - Chase transfer partners
   - Other programs

2. **Advanced features:**
   - Email notifications
   - Push notifications
   - Price/value analysis
   - Seat maps visualization
   - Upgrade availability search

3. **Scraping infrastructure:**
   - Web scraper for airlines without APIs
   - Rotating proxies
   - Rate limiting
   - Error handling & retries

4. **Scaling:**
   - Move background jobs to separate service (Bull, RabbitMQ)
   - Add caching layer (Redis)
   - Horizontal scaling for API
   - Database optimization (indices, partitioning)

5. **Monitoring:**
   - Error tracking (Sentry)
   - Performance monitoring
   - Alerting for job failures

## 📝 Environment Variables

See `.env.example` for full list. Key variables:

```
DATABASE_URL=postgresql://user:pass@localhost/award_seats
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
JWT_SECRET=your-secret-key
PORT=3001
```

## 📄 License

MIT
