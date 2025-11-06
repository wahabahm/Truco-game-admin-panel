# Truco Admin Panel - API Documentation

## Base URL

**Development:**
```
http://localhost:3000/api
```

**Production:**
```
https://your-production-domain.com/api
```

## Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require authentication via JWT token.

### How to Authenticate

1. **Login** to get JWT token:
   ```http
   POST /api/auth/login
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Response:**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "user_id",
       "email": "user@example.com",
       "name": "User Name",
       "role": "player"
     }
   }
   ```

3. **Use Token in Requests:**
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## API Endpoints

### 🔐 Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "player"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

Request:
{
  "name": "Player Name",
  "email": "player@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "player@example.com",
    "name": "Player Name",
    "role": "player"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "player",
    "coins": 1000,
    "wins": 5,
    "losses": 3,
    "status": "active"
  }
}
```

#### Check Admin
```http
GET /api/auth/check-admin
Authorization: Bearer <token>

Response:
{
  "success": true,
  "isAdmin": false
}
```

---

### 🎮 Tournament Endpoints

#### List Tournaments
```http
GET /api/tournaments?status=active
Authorization: Bearer <token>

Query Parameters:
- status (optional): registration, active, completed, cancelled

Response:
{
  "success": true,
  "tournaments": [
    {
      "id": "tournament_id",
      "name": "Spring Championship",
      "type": "public",
      "maxPlayers": 8,
      "entryCost": 100,
      "prizePool": 500,
      "startDate": "2024-03-15",
      "status": "registration",
      "participantCount": 3,
      "currentRound": 0,
      "winnerId": null,
      "createdAt": "2024-03-01T10:00:00Z"
    }
  ]
}
```

#### Get Tournament by ID
```http
GET /api/tournaments/{id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "tournament": {
    "id": "tournament_id",
    "name": "Spring Championship",
    "type": "public",
    "maxPlayers": 8,
    "entryCost": 100,
    "prizePool": 500,
    "startDate": "2024-03-15",
    "status": "active",
    "participants": [
      {
        "id": "user_id",
        "name": "Player Name",
        "email": "player@example.com"
      }
    ],
    "participantCount": 8,
    "bracket": {
      "rounds": [...],
      "totalRounds": 3,
      "maxPlayers": 8
    },
    "currentRound": 1,
    "winnerId": null,
    "createdAt": "2024-03-01T10:00:00Z"
  }
}
```

#### Join Tournament
**Note:** Game developer's ApiConfig.cs uses `/tournaments/{id}/enter`, but actual endpoint is `/tournaments/{id}/join`

```http
POST /api/tournaments/{id}/join
Authorization: Bearer <token>
Content-Type: application/json

Request:
{}

Response:
{
  "success": true,
  "message": "Successfully joined tournament!",
  "tournament": {
    "id": "tournament_id",
    "participantCount": 4,
    "status": "active"
  }
}

Error Responses:
- 400: "Insufficient coins"
- 400: "Tournament is full"
- 400: "You are already registered for this tournament"
- 404: "Tournament not found"
```

#### Get Tournament Players
```http
GET /api/tournaments/{id}/players
Authorization: Bearer <token>

Response:
{
  "success": true,
  "players": [
    {
      "id": "user_id",
      "name": "Player Name",
      "email": "player@example.com",
      "coins": 1000,
      "wins": 5,
      "losses": 3,
      "status": "active"
    }
  ],
  "totalPlayers": 8,
  "maxPlayers": 8
}
```

#### Update Tournament Award Percentage (Admin Only)
```http
POST /api/tournaments/{id}/update-award-percentage
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "percentage": 75
}

Response:
{
  "success": true,
  "message": "Award percentage updated to 75%",
  "tournament": {
    "id": "tournament_id",
    "awardPercentage": 75
  }
}
```

#### Record Tournament Match Result (Admin Only)
**Note:** Game developer's ApiConfig.cs uses `/tournaments/{id}/finalize-match`, but actual endpoint is `/tournaments/{id}/record-match`

```http
POST /api/tournaments/{id}/record-match
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "roundNumber": 1,
  "matchIndex": 0,
  "winnerId": "user_id"
}

Response:
{
  "success": true,
  "message": "Match result recorded. Tournament progressed to next round.",
  "tournament": {
    "id": "tournament_id",
    "status": "active",
    "currentRound": 2
  }
}
```

#### Cancel Tournament (Admin Only)
```http
POST /api/tournaments/{id}/cancel
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "reason": "Cancellation reason (optional)"
}

Response:
{
  "success": true,
  "message": "Tournament cancelled. All participants have been refunded.",
  "refundedCount": 8
}
```

---

### ⚔️ Match Endpoints

#### List Matches
```http
GET /api/matches?status=active
Authorization: Bearer <token>

Query Parameters:
- status (optional): active, completed

Response:
{
  "success": true,
  "matches": [
    {
      "id": "match_id",
      "name": "Match #1",
      "type": "public",
      "cost": 50,
      "prize": 100,
      "matchDate": "2024-03-15",
      "status": "active",
      "players": 1,
      "player1Id": "user_id",
      "player2Id": null,
      "player1Name": "Player 1",
      "player2Name": null,
      "winnerId": null,
      "createdAt": "2024-03-01T10:00:00Z"
    }
  ]
}
```

#### Get Match by ID
```http
GET /api/matches/{id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "match": {
    "id": "match_id",
    "name": "Match #1",
    "type": "public",
    "cost": 50,
    "prize": 100,
    "matchDate": "2024-03-15",
    "status": "active",
    "players": 2,
    "player1Id": "user_id",
    "player2Id": "user_id_2",
    "player1Name": "Player 1",
    "player2Name": "Player 2",
    "player1Email": "player1@example.com",
    "player2Email": "player2@example.com",
    "winnerId": null,
    "createdAt": "2024-03-01T10:00:00Z",
    "completedAt": null
  }
}
```

#### Create Match (Admin Only)
```http
POST /api/matches
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "Match #1",
  "type": "public",
  "cost": 50,
  "prize": 100,
  "matchDate": "2024-03-15"
}

Response:
{
  "success": true,
  "match": {
    "id": "match_id",
    "name": "Match #1",
    "type": "public",
    "cost": 50,
    "prize": 100,
    "matchDate": "2024-03-15",
    "status": "active",
    "players": 0,
    "createdAt": "2024-03-01T10:00:00Z"
  }
}
```

#### Auto-Join Match (Automatic Matchmaking)
```http
POST /api/matches/auto-join
Authorization: Bearer <token>
Content-Type: application/json

Request:
{}

Response:
{
  "success": true,
  "message": "Successfully joined match!",
  "match": {
    "id": "match_id",
    "name": "Match #1",
    "type": "public",
    "cost": 50,
    "prize": 100,
    "status": "active",
    "player1Id": "user_id_1",
    "player2Id": "user_id_2",
    "player1Name": "Player 1",
    "player2Name": "Player 2"
  }
}

Error Responses:
- 404: "No available matches found. Create a new match or wait for one to become available."
- 400: "Insufficient coins. You need 50 coins to join this match."
```

#### Join Match
```http
POST /api/matches/{id}/join
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "userId": "user_id"
}

Response:
{
  "success": true,
  "message": "Successfully joined match"
}

Error Responses:
- 400: "Match is full"
- 400: "Insufficient coins"
- 400: "User is already in this match"
```

#### Record Match Result (Admin Only)
```http
POST /api/matches/{id}/result
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "winnerId": "user_id",
  "loserId": "user_id_2"
}

Response:
{
  "success": true,
  "message": "Match result recorded successfully"
}
```

---

### 👥 User Endpoints

#### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Player Name",
    "email": "player@example.com",
    "coins": 1000,
    "wins": 5,
    "losses": 3,
    "status": "active",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

#### Get User Statistics (Admin Only)
```http
GET /api/users/{id}/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "stats": {
    "user": {
      "id": "user_id",
      "name": "Player Name",
      "email": "player@example.com",
      "coins": 1000,
      "status": "active",
      "role": "player",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    "matches": {
      "total": 10,
      "won": 7,
      "lost": 3,
      "winRate": "70.00"
    },
    "tournaments": {
      "joined": 5,
      "won": 2,
      "winRate": "40.00"
    },
    "economy": {
      "currentBalance": 1000,
      "totalEarned": 2000,
      "totalSpent": 1000,
      "netCoins": 1000
    },
    "activity": {
      "recentTransactions": 15
    }
  }
}
```

---

### 💰 Transaction Endpoints

#### Get Transactions
```http
GET /api/transactions?userId=user_id
Authorization: Bearer <token>

Query Parameters:
- userId (optional): Filter by user ID

Response:
{
  "success": true,
  "transactions": [
    {
      "id": "transaction_id",
      "userId": "user_id",
      "type": "match_win",
      "amount": 100,
      "description": "Prize for winning match: Match #1",
      "timestamp": "2024-03-01T10:00:00Z"
    }
  ]
}
```

---

### 📊 Dashboard Endpoints

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalCoins": 50000,
    "activePlayers": 120,
    "ongoingMatches": 5,
    "ongoingTournaments": 2,
    "completedMatches": 500,
    "completedTournaments": 50
  }
}
```

#### Get Economy Stats
```http
GET /api/dashboard/economy
Authorization: Bearer <token>

Response:
{
  "success": true,
  "economy": {
    "totalCoinsInCirculation": 50000,
    "totalCoinsIssued": 100000,
    "coinsUsedInTournaments": 20000,
    "coinsUsedInMatches": 10000,
    "prizesDistributed": 15000,
    "totalCoinsUsed": 30000
  }
}
```

#### Get System Status (Admin Only)
```http
GET /api/dashboard/system/status
Authorization: Bearer <token>

Response:
{
  "success": true,
  "status": {
    "system": "operational",
    "database": "connected",
    "uptime": 3600,
    "timestamp": "2024-03-01T10:00:00Z",
    "metrics": {
      "users": {
        "total": 150,
        "active": 120,
        "suspended": 30
      },
      "matches": {
        "total": 505,
        "active": 5,
        "completed": 500
      },
      "tournaments": {
        "total": 52,
        "active": 2,
        "completed": 50
      },
      "transactions": {
        "total": 2000
      }
    },
    "memory": {
      "heapUsed": 50,
      "heapTotal": 100,
      "rss": 150
    }
  }
}
```

---

### 🔔 Alert Endpoints (Optional)

#### Create Alert
```http
POST /api/alerts/create
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": "System Alert",
  "message": "Alert message",
  "type": "warning",
  "severity": "high"
}

Response:
{
  "success": true,
  "alert": {
    "id": "alert_id",
    "title": "System Alert",
    "message": "Alert message",
    "type": "warning",
    "severity": "high",
    "status": "active",
    "createdAt": "2024-03-01T10:00:00Z"
  }
}
```

#### List Alerts
```http
GET /api/alerts?status=active&type=warning
Authorization: Bearer <token>

Query Parameters:
- status (optional): active, acknowledged, resolved, dismissed
- type (optional): info, warning, error, success, system
- severity (optional): low, medium, high, critical

Response:
{
  "success": true,
  "alerts": [...]
}
```

---

## Endpoint Mapping: Game Developer's ApiConfig.cs vs Actual Endpoints

| Game Developer (ApiConfig.cs) | Actual Endpoint | Notes |
|-------------------------------|-----------------|-------|
| `/auth/login` | `/api/auth/login` | ✅ Match |
| `/auth/register` | `/api/auth/register` | ✅ Match |
| `/auth/logout` | `/api/auth/logout` | ✅ Match |
| `/auth/me` | `/api/auth/me` | ✅ Match |
| `/auth/check-admin` | `/api/auth/check-admin` | ✅ Match |
| `/tournaments` | `/api/tournaments` | ✅ Match |
| `/tournaments/{id}` | `/api/tournaments/{id}` | ✅ Match |
| `/tournaments/{id}/enter` | `/api/tournaments/{id}/join` | ⚠️ Different name (`enter` vs `join`) |
| `/tournaments/{id}/players` | `/api/tournaments/{id}/players` | ✅ Match |
| `/tournaments/{id}/finalize` | `/api/tournaments/{id}/record-match` | ⚠️ Different name (`finalize` vs `record-match`) |
| `/tournaments/{id}/finalize-match` | `/api/tournaments/{id}/record-match` | ⚠️ Different name |
| `/tournaments/{id}/update-award-percentage` | `/api/tournaments/{id}/update-award-percentage` | ✅ Match |
| `/matches` | `/api/matches` | ✅ Match |
| `/matches/{id}` | `/api/matches/{id}` | ✅ Match |
| `/matches/player/my-matches` | ❌ Not available | Player-specific endpoint (not implemented) |
| `/admin/users` | `/api/users` | ✅ Match (no `/admin` prefix) |
| `/admin/users/{id}/stats` | `/api/users/{id}/stats` | ✅ Match |
| `/admin/users/{id}/coins` | `/api/users/{id}/coins` | ✅ Match |
| `/admin/tournaments` | `/api/tournaments` | ✅ Match (no `/admin` prefix) |
| `/admin/matches` | `/api/matches` | ✅ Match (no `/admin` prefix) |
| `/admin/transactions` | `/api/transactions` | ✅ Match (no `/admin` prefix) |
| `/admin/system/status` | `/api/dashboard/system/status` | ⚠️ Different path |

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

### Validation Errors

When validation fails:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## Authentication Flow Example

### Complete Flow:

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'player@example.com',
    password: 'password123'
  })
});
const loginData = await loginResponse.json();
const token = loginData.token; // Save this token

// 2. Use token in subsequent requests
const tournamentsResponse = await fetch('http://localhost:3000/api/tournaments', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const tournamentsData = await tournamentsResponse.json();
```

---

## CORS Configuration

The API is configured to accept requests from:
- Development: `http://localhost:8080`
- Production: Set `FRONTEND_URL` in `.env` file

If game developer's client runs on different port/domain, update `FRONTEND_URL` in backend `.env` file.

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

---

## Testing

### Test Endpoints:

1. **Health Check:**
   ```http
   GET /health
   ```
   Returns: `{ "status": "ok", "message": "Truco Admin API is running" }`

2. **Test Login:**
   ```
   Email: admin@truco.com
   Password: admin123
   ```

---

## Notes for Game Developer

1. **Base URL:** Always use `/api` prefix (e.g., `http://localhost:3000/api/auth/login`)

2. **Endpoint Naming Differences:**
   - Use `/tournaments/{id}/join` instead of `/tournaments/{id}/enter`
   - Use `/tournaments/{id}/record-match` instead of `/tournaments/{id}/finalize`

3. **Admin Endpoints:** Most endpoints don't have `/admin` prefix (e.g., use `/api/users` not `/api/admin/users`)

4. **Token Expiration:** JWT tokens expire in 7 days (configurable via `JWT_EXPIRES_IN`)

5. **Error Handling:** Always check `success` field in response before processing data

6. **Production Setup:** Update Base URL to production domain before deploying

---

## Support

For API issues or questions:
- Check backend logs for detailed error messages
- Verify MongoDB connection is active
- Ensure JWT token is valid and not expired
- Check CORS configuration if requests are blocked

