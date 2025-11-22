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
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['player', 'admin'],
              description: 'User role',
              example: 'player'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
              example: ''
            },
            emailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: false
            },
            status: {
              type: 'string',
              enum: ['active', 'suspended'],
              description: 'User status',
              example: 'active'
            },
            wallet: {
              type: 'object',
              properties: {
                balance: {
                  type: 'number',
                  description: 'Coin balance',
                  example: 100
                }
              }
            },
            stats: {
              type: 'object',
              properties: {
                wins: {
                  type: 'number',
                  description: 'Total wins',
                  example: 5
                },
                losses: {
                  type: 'number',
                  description: 'Total losses',
                  example: 2
                },
                matchesPlayed: {
                  type: 'number',
                  description: 'Total matches played',
                  example: 7
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        Match: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Match ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Match name',
              example: 'Championship Match'
            },
            type: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Match type',
              example: 'public'
            },
            cost: {
              type: 'number',
              description: 'Entry cost in coins',
              example: 50
            },
            prize: {
              type: 'number',
              description: 'Prize amount in coins',
              example: 100
            },
            matchDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Scheduled match date',
              example: '2024-03-15T10:00:00.000Z'
            },
            tournament: {
              type: 'object',
              nullable: true,
              description: 'Tournament reference (if match is part of tournament)',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                entryFee: { type: 'number' },
                maxPlayers: { type: 'number' },
                status: { type: 'string' }
              }
            },
            players: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              },
              description: 'Array of players (UserDto objects)',
              example: []
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'cancelled'],
              description: 'Match status',
              example: 'active'
            },
            winner: {
              $ref: '#/components/schemas/User',
              nullable: true,
              description: 'Match winner (UserDto object)'
            },
            finishedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Match completion date',
              example: '2024-03-15T11:00:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Match creation date',
              example: '2024-03-15T09:00:00.000Z'
            }
          }
        },
        Tournament: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Tournament ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Tournament name',
              example: 'Spring Championship'
            },
            description: {
              type: 'string',
              description: 'Tournament description',
              example: 'Annual spring tournament'
            },
            type: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Tournament type',
              example: 'public'
            },
            entryFee: {
              type: 'number',
              description: 'Entry fee in coins',
              example: 100
            },
            maxPlayers: {
              type: 'number',
              enum: [4, 8],
              description: 'Maximum players (4 or 8)',
              example: 8
            },
            status: {
              type: 'string',
              enum: ['registration', 'active', 'completed', 'cancelled'],
              description: 'Tournament status',
              example: 'registration'
            },
            players: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              },
              description: 'Array of registered players (UserDto objects)',
              example: []
            },
            champion: {
              $ref: '#/components/schemas/User',
              nullable: true,
              description: 'Tournament champion (UserDto object)'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Tournament start date',
              example: '2024-03-15T10:00:00.000Z'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Tournament end date',
              example: '2024-03-20T10:00:00.000Z'
            },
            tournamentAwardPercentage: {
              type: 'number',
              description: 'Prize percentage for champion (default 80%)',
              example: 80
            },
            prizePool: {
              type: 'number',
              description: 'Total prize pool for tournament',
              example: 800
            },
            matches: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Match'
              },
              description: 'Array of matches in this tournament',
              example: []
            },
            prizeDistributed: {
              type: 'boolean',
              description: 'Whether prize has been distributed',
              example: false
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Transaction ID',
              example: '507f1f77bcf86cd799439011'
            },
            user: {
              $ref: '#/components/schemas/User',
              nullable: true,
              description: 'User associated with transaction (UserDto object)'
            },
            type: {
              type: 'string',
              enum: ['match_entry', 'match_win', 'tournament_entry', 'tournament_win', 'coin_purchase', 'admin_add', 'admin_remove'],
              description: 'Transaction type',
              example: 'match_entry'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount (positive for credit, negative for debit)',
              example: 100
            },
            reason: {
              type: 'string',
              description: 'Transaction reason/description',
              example: 'Entry fee for match: Championship Match'
            },
            balanceBefore: {
              type: 'number',
              nullable: true,
              description: 'User balance before transaction',
              example: 200
            },
            balanceAfter: {
              type: 'number',
              nullable: true,
              description: 'User balance after transaction',
              example: 100
            },
            meta: {
              type: 'object',
              description: 'Additional transaction metadata',
              example: {}
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation date',
              example: '2024-03-15T10:00:00.000Z'
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

