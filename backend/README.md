# Award Seat Alerts - Backend

Node.js/Express API for award seat searches and alerts.

## Setup

```bash
npm install
npm run db:push # Create database
npm run dev # Start development server
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Search
- `POST /api/search` - Perform award search
- `GET /api/search/:searchSessionId` - Get search results
- `GET /api/search/history/user` - Get user's search history

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get user's alerts
- `GET /api/alerts/:alertId` - Get alert with matches
- `PATCH /api/alerts/:alertId` - Update alert
- `DELETE /api/alerts/:alertId` - Delete alert

## Environment Variables

See `.env.example`

- `DATABASE_URL` - PostgreSQL connection string
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - SMS notifications
- `JWT_SECRET` - JWT signing secret
