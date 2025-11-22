/**
 * DTO Transformers to match Game Developer's API models
 * These functions transform database models to match the Unity C# DTOs
 */

/**
 * Transform User to UserDto format
 */
export function transformUserToDto(user) {
    if (!user) return null;
    
    const userObj = user.toObject ? user.toObject() : user;
    
    return {
      _id: userObj._id?.toString() || userObj.id?.toString() || userObj._id || userObj.id,
      username: userObj.name || userObj.username || '',
      email: userObj.email || '',
      role: userObj.role || 'player',
      avatar: userObj.avatar || '', // Non-nullable string to match C# structure
      emailVerified: userObj.emailVerified || false,
      status: userObj.status || 'active', // Include status field
      wallet: {
        balance: userObj.coins !== null && userObj.coins !== undefined ? userObj.coins : 100 // Default 100 to match C# WalletDto
      },
      stats: {
        wins: userObj.wins || 0,
        losses: userObj.losses || 0,
        matchesPlayed: (userObj.wins || 0) + (userObj.losses || 0)
      },
      createdAt: userObj.createdAt ? new Date(userObj.createdAt).toISOString() : null
    };
  }
  
  /**
   * Transform Tournament to TournamentDto format
   */
  export async function transformTournamentToDto(tournament, Match, User) {
    if (!tournament) return null;
    
    const tournamentObj = tournament.toObject ? tournament.toObject() : tournament;
    
    // Populate players (participants) as UserDto objects
    let players = [];
    if (tournamentObj.participants && tournamentObj.participants.length > 0) {
      // Check if participants are already populated (have _id and other fields)
      const firstParticipant = tournamentObj.participants[0];
      if (firstParticipant && (firstParticipant._id || firstParticipant.name || firstParticipant.email)) {
        // Already populated
        players = tournamentObj.participants.map(p => transformUserToDto(p));
      } else {
        // Need to populate
        const participantIds = tournamentObj.participants.map(p => p._id || p);
        const participants = await User.find({ 
          _id: { $in: participantIds } 
        }).lean();
        players = participants.map(p => transformUserToDto(p));
      }
    }
    
    // Populate champion (winnerId) as UserDto
    let champion = null;
    if (tournamentObj.winnerId) {
      // Check if winnerId is already populated
      if (tournamentObj.winnerId._id || tournamentObj.winnerId.name || tournamentObj.winnerId.email) {
        // Already populated
        champion = transformUserToDto(tournamentObj.winnerId);
      } else {
        // Need to populate
        const winner = await User.findById(tournamentObj.winnerId._id || tournamentObj.winnerId).lean();
        if (winner) {
          champion = transformUserToDto(winner);
        }
      }
    }
    
    // Get matches for this tournament
    let matches = [];
    if (Match) {
      const tournamentMatches = await Match.find({ 
        tournamentId: tournamentObj._id || tournamentObj.id 
      }).lean();
      matches = tournamentMatches.map(m => transformMatchToDto(m, null, User));
    }
    
    return {
      _id: tournamentObj._id?.toString() || tournamentObj.id?.toString() || tournamentObj._id || tournamentObj.id,
      name: tournamentObj.name || '',
      description: tournamentObj.description || '',
      type: tournamentObj.type || 'public',
      entryFee: tournamentObj.entryCost || tournamentObj.entryFee || 0,
      maxPlayers: tournamentObj.maxPlayers || 0,
      status: tournamentObj.status || 'registration',
      players: players,
      champion: champion,
      startDate: tournamentObj.startDate ? new Date(tournamentObj.startDate).toISOString() : null,
      endDate: tournamentObj.endDate ? new Date(tournamentObj.endDate).toISOString() : null,
      tournamentAwardPercentage: tournamentObj.awardPercentage || tournamentObj.tournamentAwardPercentage || 80,
      prizePool: tournamentObj.prizePool || 0,
      matches: matches,
      prizeDistributed: tournamentObj.prizeDistributed || false
    };
  }
  
  /**
   * Transform Match to MatchDto format
   */
  export function transformMatchToDto(match, Tournament, User) {
    if (!match) return null;
    
    const matchObj = match.toObject ? match.toObject() : match;
    
    // Build players array from player1Id and player2Id
    const players = [];
    if (matchObj.player1Id) {
      const player1 = matchObj.player1Id;
      if (player1._id || player1.id || player1) {
        players.push(transformUserToDto(player1));
      }
    }
    if (matchObj.player2Id) {
      const player2 = matchObj.player2Id;
      if (player2._id || player2.id || player2) {
        players.push(transformUserToDto(player2));
      }
    }
    
    // Transform tournament reference
    let tournament = null;
    if (matchObj.tournamentId) {
      const tournamentObj = matchObj.tournamentId;
      if (tournamentObj._id || tournamentObj.id || tournamentObj) {
        // If tournament is populated, transform it; otherwise just return the ID
        if (tournamentObj.name) {
          tournament = {
            _id: tournamentObj._id?.toString() || tournamentObj.id?.toString(),
            name: tournamentObj.name || '',
            description: tournamentObj.description || '',
            entryFee: tournamentObj.entryCost || tournamentObj.entryFee || 0,
            maxPlayers: tournamentObj.maxPlayers || 0,
            status: tournamentObj.status || 'registration'
          };
        } else {
          tournament = null; // Just ID, will be populated separately if needed
        }
      }
    }
    
    // Transform winner
    let winner = null;
    if (matchObj.winnerId) {
      const winnerObj = matchObj.winnerId;
      if (winnerObj._id || winnerObj.id || winnerObj) {
        winner = transformUserToDto(winnerObj);
      }
    }
    
    return {
      _id: matchObj._id?.toString() || matchObj.id?.toString() || matchObj._id || matchObj.id,
      name: matchObj.name || '',
      type: matchObj.type || 'public',
      cost: matchObj.cost || 0,
      prize: matchObj.prize || 0,
      matchDate: matchObj.matchDate ? new Date(matchObj.matchDate).toISOString() : null,
      tournament: tournament,
      players: players,
      status: matchObj.status || 'active',
      winner: winner,
      finishedAt: matchObj.completedAt ? new Date(matchObj.completedAt).toISOString() : null,
      createdAt: matchObj.createdAt ? new Date(matchObj.createdAt).toISOString() : null
    };
  }
  
  /**
   * Transform Transaction to TransactionDto format
   */
  export function transformTransactionToDto(transaction, User) {
    if (!transaction) return null;
    
    const transactionObj = transaction.toObject ? transaction.toObject() : transaction;
    
    // Transform user
    let user = null;
    if (transactionObj.userId) {
      const userObj = transactionObj.userId;
      if (userObj._id || userObj.id || userObj) {
        user = transformUserToDto(userObj);
      }
    }
    
    return {
      _id: transactionObj._id?.toString() || transactionObj.id?.toString() || transactionObj._id || transactionObj.id,
      user: user,
      type: transactionObj.type || '',
      amount: transactionObj.amount || 0,
      reason: transactionObj.description || transactionObj.reason || '',
      balanceBefore: transactionObj.balanceBefore !== null && transactionObj.balanceBefore !== undefined 
        ? transactionObj.balanceBefore 
        : null,
      balanceAfter: transactionObj.balanceAfter !== null && transactionObj.balanceAfter !== undefined 
        ? transactionObj.balanceAfter 
        : null,
      meta: transactionObj.meta || {},
      createdAt: transactionObj.createdAt ? new Date(transactionObj.createdAt).toISOString() : null
    };
  }
  
  