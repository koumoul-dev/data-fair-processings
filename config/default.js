module.exports = {
  mode: 'server_worker', // can be server_worker, server or worker
  port: 5600,
  sessionDomain: null,
  publicUrl: 'http://localhost:5600',
  dataDir: '/data',
  directoryUrl: 'http://localhost:5600/simple-directory',
  dataFairUrl: 'http://localhost:5600/data-fair',
  dataFairAPIKey: null,
  dataFairAdminMode: false,
  mongo: {
    host: 'localhost',
    port: 27017,
    db: 'data-fair-processings-' + (process.env.NODE_ENV || 'development'),
  },
  worker: {
    interval: 1000,
    concurrency: 4,
  },
  locks: {
    // in seconds
    ttl: 60,
  },
}
