module.exports = {
  apps: [{
    name: process.env.PM2_APP_NAME || 'barwaqt-customer',
    cwd: __dirname,
    script: './node_modules/next/dist/bin/next',
    args: ['start', '--hostname', '127.0.0.1', '--port', process.env.WEB_PORT || '3000'],
    interpreter: process.execPath,
    env: { NODE_ENV: 'production' },
  }],
};
