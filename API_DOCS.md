# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Tokens are obtained from `/auth/login` or `/auth/register` endpoints.

---

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "phoneNumber": "+15551234567"  // optional, required for alerts
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "phoneNumber": "+15551234567"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "phoneNumber": "+15551234567"
  }
}
```

---

### Search

#### Perform Award Search
```http
POST /search
Content-Type: application/json

{
  "departureAirport": "JFK",
  "arrivalAirport": "LHR",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-14T23:59:59Z",
  "cabinClasses": ["Business", "First"],
  "airlines": ["United", "Alaska"],
  "maxMilesCost": 65000
}
```

**Response (200):**
```json
{
  "searchSessionId": "search_cuid123",
  "results": [
    {
      "id": "result_cuid",
      "searchSessionId": "search_cuid123",
      "airline": "United",
      "departureDate": "2024-06-05T14:30:00Z",
      "departureTime": "14:30",
      "arrivalTime": "02:45",
      "cabinClass": "Business",
      "milesCost": 62500,
      "availableSeats": 1,
      "externalId": "UNITED_FLIGHT_123"
    }
  ],
  "totalResults": 1
}
```

#### Get Cached Search Results
```http
GET /search/{searchSessionId}
```

**Response (200):**
```json
{
  "session": {
    "id": "search_cuid123",
    "departureAirport": "JFK",
    "arrivalAirport": "LHR",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-06-14T23:59:59Z",
    "cabinClasses": ["Business", "First"],
    "airlines": ["United", "Alaska"],
    "createdAt": "2024-04-14T10:30:00Z"
  },
  "results": [
    // ... results array
  ]
}
```

#### Get Search History
```http
GET /search/history/user
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "search_cuid123",
    "departureAirport": "JFK",
    "arrivalAirport": "LHR",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-06-14T23:59:59Z",
    "cabinClasses": ["Business"],
    "airlines": ["United"],
    "createdAt": "2024-04-14T10:30:00Z",
    "_count": {
      "results": 3
    }
  }
]
```

---

### Alerts

#### Create Alert
```http
POST /alerts
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "departureAirport": "JFK",
  "arrivalAirport": "LHR",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-14T23:59:59Z",
  "cabinClasses": ["Business"],
  "airlines": ["United", "Alaska", "Flying Blue"],
  "maxMilesCost": 65000
}
```

**Response (201):**
```json
{
  "id": "alert_cuid123",
  "userId": "user_cuid",
  "departureAirport": "JFK",
  "arrivalAirport": "LHR",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-14T23:59:59Z",
  "cabinClasses": ["Business"],
  "airlines": ["United", "Alaska", "Flying Blue"],
  "maxMilesCost": 65000,
  "active": true,
  "createdAt": "2024-04-14T10:30:00Z",
  "updatedAt": "2024-04-14T10:30:00Z",
  "lastChecked": null
}
```

#### Get User's Alerts
```http
GET /alerts
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
[
  {
    "id": "alert_cuid123",
    "userId": "user_cuid",
    "departureAirport": "JFK",
    "arrivalAirport": "LHR",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-06-14T23:59:59Z",
    "cabinClasses": ["Business"],
    "airlines": ["United"],
    "maxMilesCost": 65000,
    "active": true,
    "createdAt": "2024-04-14T10:30:00Z",
    "updatedAt": "2024-04-14T10:30:00Z",
    "lastChecked": null,
    "_count": {
      "matches": 2
    }
  }
]
```

#### Get Alert with Recent Matches
```http
GET /alerts/{alertId}
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "id": "alert_cuid123",
  "userId": "user_cuid",
  "departureAirport": "JFK",
  "arrivalAirport": "LHR",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-14T23:59:59Z",
  "cabinClasses": ["Business"],
  "airlines": ["United"],
  "maxMilesCost": null,
  "active": true,
  "createdAt": "2024-04-14T10:30:00Z",
  "updatedAt": "2024-04-14T10:30:00Z",
  "lastChecked": "2024-04-14T11:45:00Z",
  "matches": [
    {
      "id": "match_cuid",
      "alertId": "alert_cuid123",
      "userId": "user_cuid",
      "airline": "United",
      "departureDate": "2024-06-05T14:30:00Z",
      "cabinClass": "Business",
      "milesCost": 62500,
      "availableSeat": true,
      "notificationSent": true,
      "notificationTime": "2024-04-14T11:45:00Z",
      "createdAt": "2024-04-14T11:45:00Z"
    }
  ]
}
```

#### Update Alert
```http
PATCH /alerts/{alertId}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "maxMilesCost": 50000,
  "active": true,
  "cabinClasses": ["Business", "First"]
}
```

**Response (200):**
```json
{
  "id": "alert_cuid123",
  "userId": "user_cuid",
  "departureAirport": "JFK",
  "arrivalAirport": "LHR",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-14T23:59:59Z",
  "cabinClasses": ["Business", "First"],
  "airlines": ["United"],
  "maxMilesCost": 50000,
  "active": true,
  "createdAt": "2024-04-14T10:30:00Z",
  "updatedAt": "2024-04-14T11:50:00Z",
  "lastChecked": null
}
```

#### Delete Alert
```http
DELETE /alerts/{alertId}
Authorization: Bearer <TOKEN>
```

**Response (200):**
```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: departureAirport, arrivalAirport, ..."
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Alert not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Search failed"
}
```

---

## Testing with curl

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "+15551234567"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Search (no auth needed)
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "departureAirport": "JFK",
    "arrivalAirport": "LHR",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-06-14T23:59:59Z",
    "cabinClasses": ["Business"],
    "airlines": ["United"],
    "maxMilesCost": 65000
  }'
```

### Create Alert (auth required)
```bash
TOKEN="your_jwt_token_here"
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "departureAirport": "JFK",
    "arrivalAirport": "LHR",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-06-14T23:59:59Z",
    "cabinClasses": ["Business"],
    "airlines": ["United"],
    "maxMilesCost": 65000
  }'
```

---

## Rate Limits

Currently no built-in rate limiting. Each airline adapter may have its own API rate limits:
- **United**: Varies by API tier
- **Alaska**: Varies by API tier

---

## Pagination

Currently not implemented. Search results and alert lists return all items. To implement pagination in the future, specify `limit` and `offset` query parameters.

---

## Sorting

Results are automatically sorted by:
1. Departure date (ascending)
2. Miles cost (ascending)

---

## Filtering

Use the request body parameters:
- `maxMilesCost` - Filter by maximum miles
- `cabinClasses` - Filter by cabin type
- `airlines` - Filter by specific airlines

---

## Real-Time Updates

Results are cached for 30 minutes. The background job checks alerts hourly. For real-time results:
1. Make a new search request (bypasses cache if data is older than 30 min)
2. Check `expiresAt` in SearchSession to see when cache expires
