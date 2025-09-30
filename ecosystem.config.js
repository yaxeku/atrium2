module.exports = {
  apps: [
    {
      name: 'atrium-frontend',
      script: 'build/index.js',
      env: {
        PORT: 3001,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'atrium-backend',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
      },
      // Tell PM2 to load variables from .env
      env_file: '.env',
    },
  ],
};
