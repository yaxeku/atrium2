const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

module.exports = {
  apps: [
    {
      name: 'atrium-frontend',
      script: 'build/index.js',
      cwd: __dirname,
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'atrium-backend',
      script: 'server.js',
      cwd: __dirname,
      // Manually merge the environment variables
      env: {
        ...envConfig,
        NODE_ENV: 'production',
      },
    },
  ],
};
