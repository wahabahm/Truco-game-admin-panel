/**
 * Bracket Generator Utility
 * Generates tournament brackets for 4 and 8 player tournaments
 */

/**
 * Generate bracket structure for a tournament
 * @param {Number} maxPlayers - Number of players (4 or 8)
 * @param {Array} participantIds - Array of participant user IDs
 * @returns {Object} Bracket structure with rounds and matches
 */
export const generateBracket = (maxPlayers, participantIds) => {
  if (![4, 8].includes(maxPlayers)) {
    throw new Error('Tournament must have 4 or 8 players');
  }

  if (participantIds.length !== maxPlayers) {
    throw new Error(`Tournament requires exactly ${maxPlayers} players`);
  }

  const bracket = {
    rounds: [],
    totalRounds: maxPlayers === 4 ? 2 : 3, // 4 players = 2 rounds, 8 players = 3 rounds
    maxPlayers
  };

  if (maxPlayers === 4) {
    // 4-player tournament: Semi-finals (2 matches) -> Final (1 match)
    bracket.rounds = [
      {
        roundNumber: 1,
        name: 'Semi-Finals',
        matches: [
          {
            matchId: null,
            player1Id: participantIds[0],
            player2Id: participantIds[1],
            winnerId: null,
            status: 'pending'
          },
          {
            matchId: null,
            player1Id: participantIds[2],
            player2Id: participantIds[3],
            winnerId: null,
            status: 'pending'
          }
        ]
      },
      {
        roundNumber: 2,
        name: 'Final',
        matches: [
          {
            matchId: null,
            player1Id: null, // Will be winner of semi-final 1
            player2Id: null, // Will be winner of semi-final 2
            winnerId: null,
            status: 'pending'
          }
        ]
      }
    ];
  } else if (maxPlayers === 8) {
    // 8-player tournament: Quarter-finals (4 matches) -> Semi-finals (2 matches) -> Final (1 match)
    bracket.rounds = [
      {
        roundNumber: 1,
        name: 'Quarter-Finals',
        matches: [
          {
            matchId: null,
            player1Id: participantIds[0],
            player2Id: participantIds[1],
            winnerId: null,
            status: 'pending'
          },
          {
            matchId: null,
            player1Id: participantIds[2],
            player2Id: participantIds[3],
            winnerId: null,
            status: 'pending'
          },
          {
            matchId: null,
            player1Id: participantIds[4],
            player2Id: participantIds[5],
            winnerId: null,
            status: 'pending'
          },
          {
            matchId: null,
            player1Id: participantIds[6],
            player2Id: participantIds[7],
            winnerId: null,
            status: 'pending'
          }
        ]
      },
      {
        roundNumber: 2,
        name: 'Semi-Finals',
        matches: [
          {
            matchId: null,
            player1Id: null, // Winner of QF 1
            player2Id: null, // Winner of QF 2
            winnerId: null,
            status: 'pending'
          },
          {
            matchId: null,
            player1Id: null, // Winner of QF 3
            player2Id: null, // Winner of QF 4
            winnerId: null,
            status: 'pending'
          }
        ]
      },
      {
        roundNumber: 3,
        name: 'Final',
        matches: [
          {
            matchId: null,
            player1Id: null, // Winner of SF 1
            player2Id: null, // Winner of SF 2
            winnerId: null,
            status: 'pending'
          }
        ]
      }
    ];
  }

  return bracket;
};

/**
 * Progress tournament to next round
 * @param {Object} bracket - Current bracket structure
 * @param {Number} completedRound - Round number that just completed
 * @param {Array} winners - Array of winner IDs from completed round
 * @returns {Object} Updated bracket with next round populated
 */
export const progressToNextRound = (bracket, completedRound, winners) => {
  const bracketCopy = JSON.parse(JSON.stringify(bracket)); // Deep copy
  
  // Mark completed round matches as completed
  const completedRoundData = bracketCopy.rounds.find(r => r.roundNumber === completedRound);
  if (completedRoundData) {
    completedRoundData.matches.forEach((match, index) => {
      match.status = 'completed';
      match.winnerId = winners[index];
    });
  }

  // If there's a next round, populate it with winners
  const nextRound = bracketCopy.rounds.find(r => r.roundNumber === completedRound + 1);
  if (nextRound) {
    nextRound.matches.forEach((match, matchIndex) => {
      if (bracketCopy.maxPlayers === 8) {
        // 8-player: 4 QF winners -> 2 SF matches, 2 SF winners -> 1 Final
        if (completedRound === 1) {
          // QF completed, populate SF
          match.player1Id = winners[matchIndex * 2];
          match.player2Id = winners[matchIndex * 2 + 1];
        } else if (completedRound === 2) {
          // SF completed, populate Final
          match.player1Id = winners[0];
          match.player2Id = winners[1];
        }
      } else if (bracketCopy.maxPlayers === 4) {
        // 4-player: 2 SF winners -> 1 Final
        if (completedRound === 1) {
          match.player1Id = winners[0];
          match.player2Id = winners[1];
        }
      }
      match.status = 'active';
    });
  }

  return bracketCopy;
};

