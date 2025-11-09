/**
 * PM2 Ecosystem Configuration
 * Process manager configuration for production deployment
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'truco-admin-api',
      script: './src/server.js',
      instances: 1, // Set to 'max' for cluster mode
      exec_mode: 'fork', // 'cluster' for multiple instances
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
  ],
};

