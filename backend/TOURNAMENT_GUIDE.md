# Tournament System - Technical Guide

## Overview
The tournament system supports 4 and 8 player tournaments with automatic bracket generation, coin management, and prize distribution.

## Features

### Tournament Types
- **4-Player Tournament**: 2 rounds (Semi-Finals → Final)
- **8-Player Tournament**: 3 rounds (Quarter-Finals → Semi-Finals → Final)

### Key Features
- Automatic bracket generation when tournament fills
- Automatic coin deduction on registration
- Automatic prize distribution (80% to champion)
- Server-side validation to prevent coin manipulation
- Duplicate tournament name prevention
- Automatic refund on cancellation

## Creating a Tournament

### Via Admin Panel
1. Navigate to **Tournaments** page
2. Click **Create Tournament**
3. Fill in the form:
   - **Name**: Unique tournament name
   - **Type**: Public or Private
   - **Number of Players**: 4 or 8
   - **Start Date**: Tournament start date
   - **Entry Cost**: Coins required to join
   - **Prize Pool**: Total prize pool (champion gets 80%)
4. Click **Create Tournament**

### Via API
```bash
POST /api/tournaments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Spring Championship",
  "type": "public",
  "maxPlayers": 8,
  "entryCost": 100,
  "prizePool": 500,
  "startDate": "2024-03-15"
}
```

## Tournament Lifecycle

### 1. Registration Phase
- Tournament status: `registration`
- Players can join until slots are full
- Coins are deducted immediately upon joining
- Transaction is logged

### 2. Active Phase
- Tournament status: `active`
- Starts automatically when all slots are filled
- Bracket is generated automatically
- Admin records match results round by round

### 3. Completion Phase
- Tournament status: `completed`
- Final match winner becomes champion
- 80% of prize pool is automatically distributed
- Champion's win count is incremented
- Transaction is logged

## Recording Match Results

### Via Admin Panel
1. View tournament details
2. Find the active match in the bracket
3. Click **Record Result**
4. Select the winner
5. Click **Record Result**

The system will:
- Mark the match as completed
- Progress to next round if all matches in current round are done
- Automatically distribute prize and complete tournament when final is done

### Via API
```bash
POST /api/tournaments/:tournamentId/record-match
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "roundNumber": 1,
  "matchIndex": 0,
  "winnerId": "user_id_here"
}
```

## Cancelling a Tournament

### Via Admin Panel
1. Click the cancel icon (X) on the tournament
2. Confirm cancellation
3. All participants are automatically refunded

### Via API
```bash
POST /api/tournaments/:tournamentId/cancel
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Optional cancellation reason"
}
```

## Economy Configuration

### Entry Fees
- Set when creating tournament
- Deducted immediately upon registration
- Refunded if tournament is cancelled

### Prize Distribution
- **Champion**: 80% of prize pool
- **Remaining 20%**: Stays in system (not distributed)

### Transaction Types
- `tournament_entry`: Entry fee deduction
- `tournament_win`: Prize distribution to champion

## Validation & Security

### Server-Side Validations
1. **Duplicate Tournament Names**: Enforced by unique index
2. **Sufficient Coins**: Checked before registration
3. **Tournament Capacity**: Validated before joining
4. **Duplicate Registration**: Prevented by checking participant list
5. **Coin Manipulation**: All coin operations happen server-side

### Error Handling
- Insufficient coins: Returns 400 with message
- Tournament full: Returns 400 with message
- Already registered: Returns 400 with message
- Invalid tournament: Returns 404

## Bracket Structure

### 4-Player Tournament
```
Round 1 (Semi-Finals):
  Match 1: Player 1 vs Player 2
  Match 2: Player 3 vs Player 4

Round 2 (Final):
  Match 1: Winner of Match 1 vs Winner of Match 2
```

### 8-Player Tournament
```
Round 1 (Quarter-Finals):
  Match 1: Player 1 vs Player 2
  Match 2: Player 3 vs Player 4
  Match 3: Player 5 vs Player 6
  Match 4: Player 7 vs Player 8

Round 2 (Semi-Finals):
  Match 1: Winner QF1 vs Winner QF2
  Match 2: Winner QF3 vs Winner QF4

Round 3 (Final):
  Match 1: Winner SF1 vs Winner SF2
```

## API Endpoints

### Get All Tournaments
```
GET /api/tournaments?status=active
Authorization: Bearer <token>
```

### Get Tournament Details
```
GET /api/tournaments/:id
Authorization: Bearer <token>
```

### Create Tournament (Admin Only)
```
POST /api/tournaments
Authorization: Bearer <admin_token>
```

### Join Tournament
```
POST /api/tournaments/:id/join
Authorization: Bearer <token>
```

### Record Match Result (Admin Only)
```
POST /api/tournaments/:id/record-match
Authorization: Bearer <admin_token>
```

### Cancel Tournament (Admin Only)
```
POST /api/tournaments/:id/cancel
Authorization: Bearer <admin_token>
```

## Database Schema

### Tournament Model
```javascript
{
  name: String (unique, required),
  type: String (enum: 'public', 'private'),
  maxPlayers: Number (enum: 4, 8),
  entryCost: Number (min: 1),
  prizePool: Number (min: 1),
  startDate: Date,
  status: String (enum: 'registration', 'active', 'completed', 'cancelled'),
  participants: [ObjectId] (ref: User),
  bracket: Object (bracket structure),
  currentRound: Number,
  winnerId: ObjectId (ref: User),
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}
```

## Troubleshooting

### Tournament Not Starting
- Check if all slots are filled
- Verify tournament status is 'registration'
- Check bracket generation logic

### Prize Not Distributed
- Verify tournament status is 'completed'
- Check if winnerId is set
- Review transaction logs

### Coin Issues
- Check user balance before registration
- Verify transaction logs
- Ensure server-side validation is working

## Best Practices

1. **Tournament Names**: Use unique, descriptive names
2. **Entry Costs**: Set reasonable costs based on prize pool
3. **Prize Pools**: Typically 4-5x entry cost for 4 players, 8-10x for 8 players
4. **Start Dates**: Set realistic dates for player availability
5. **Testing**: Test with small tournaments before large events

