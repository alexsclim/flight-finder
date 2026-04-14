# Flight Finder Backend (Python / FastAPI)

This backend is implemented with FastAPI and SQLAlchemy.

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 3001
```

Or from root:
```bash
cd backend
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/search` - Perform an award search
- `GET /api/search/{searchSessionId}` - Retrieve cached search results
- `GET /api/search/history/user` - Get user search history
- `POST /api/alerts` - Create a new alert
- `GET /api/alerts` - List user alerts
- `GET /api/alerts/{alertId}` - Get an alert with matches
- `PATCH /api/alerts/{alertId}` - Update an alert
- `DELETE /api/alerts/{alertId}` - Delete an alert
- `GET /health` - Health check

## Notes

- The backend uses a local SQLite database by default.
- Set `DATABASE_URL` in `.env` to use PostgreSQL or another database.
- A simple alert matcher runs in the background at startup.
