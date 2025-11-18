import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Truco Admin Panel API',
      version: '1.0.0',
      description: 'Complete API documentation for Truco Game Admin Panel. This API allows game developers to integrate with the admin panel for user management, matches, tournaments, and economy management.',
      contact: {
        name: 'API Support',
        email: 'support@truco.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://srv983121.hstgr.cloud',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['player', 'admin'],
              description: 'User role'
            },
            status: {
              type: 'string',
              enum: ['active', 'suspended'],
              description: 'User status'
            },
            coins: {
              type: 'number',
              description: 'User coin balance'
            },
            wins: {
              type: 'number',
              description: 'Total wins'
            },
            losses: {
              type: 'number',
              description: 'Total losses'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            }
          }
        },
        Match: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Match ID'
            },
            name: {
              type: 'string',
              description: 'Match name'
            },
            type: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Match type'
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'cancelled'],
              description: 'Match status'
            },
            player1Id: {
              type: 'string',
              description: 'Player 1 user ID'
            },
            player2Id: {
              type: 'string',
              description: 'Player 2 user ID'
            },
            cost: {
              type: 'number',
              description: 'Entry cost in coins'
            },
            prize: {
              type: 'number',
              description: 'Prize amount in coins'
            },
            winnerId: {
              type: 'string',
              description: 'Winner user ID'
            },
            matchDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Scheduled match date'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            }
          }
        },
        Tournament: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Tournament ID'
            },
            name: {
              type: 'string',
              description: 'Tournament name'
            },
            type: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Tournament type'
            },
            status: {
              type: 'string',
              enum: ['registration', 'active', 'completed', 'cancelled'],
              description: 'Tournament status'
            },
            maxPlayers: {
              type: 'number',
              enum: [4, 8],
              description: 'Maximum players (4 or 8)'
            },
            entryCost: {
              type: 'number',
              description: 'Entry cost in coins'
            },
            prizePool: {
              type: 'number',
              description: 'Total prize pool'
            },
            awardPercentage: {
              type: 'number',
              description: 'Prize percentage for champion (default 80%)'
            },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              description: 'Array of registered participants'
            },
            participantCount: {
              type: 'number',
              description: 'Number of registered participants'
            },
            bracket: {
              type: 'object',
              description: 'Tournament bracket structure'
            },
            currentRound: {
              type: 'number',
              description: 'Current round number'
            },
            winnerId: {
              type: 'string',
              nullable: true,
              description: 'Winner user ID'
            },
            winnerName: {
              type: 'string',
              nullable: true,
              description: 'Winner name'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Tournament start date'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            cancelledAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },
            cancellationReason: {
              type: 'string',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            userName: {
              type: 'string',
              description: 'User name'
            },
            userEmail: {
              type: 'string',
              description: 'User email'
            },
            type: {
              type: 'string',
              enum: ['match_entry', 'match_win', 'tournament_entry', 'tournament_win', 'coin_purchase', 'admin_add', 'admin_remove'],
              description: 'Transaction type'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount (positive for credit, negative for debit)'
            },
            description: {
              type: 'string',
              description: 'Transaction description'
            },
            matchId: {
              type: 'string',
              nullable: true,
              description: 'Related match ID (if applicable)'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction timestamp'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };

