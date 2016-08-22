const db = require('./db');
const logger = require('winston');
const CronJob = require('cron').CronJob;
const feed = require('./feed');

const CRON_TIME = '0 */1 * * * *';

db.connect()
  .then(() => {
    logger.info('Mongoose connection established...');
    logger.info(`${CRON_TIME} CronJob starting to update feeds...`);
  })
  .then(() => new CronJob({
    cronTime: CRON_TIME,
    onTick: () => {
      logger.info('Updates started:', Date.now());
      feed.updater.update().then(() => {
        logger.info('Updates complete:', Date.now());
      });
    },
    start: false,
    runOnInit: true,
    timeZone: 'America/Los_Angeles',
  }))
  .catch(logger.error);

// http://theholmesoffice.com/mongoose-connection-best-practice/
const shutdown = function shutdown(msg, cb) {
  return function gracefulShutdown() {
    db.connection.close(() => {
      logger.info(`Mongoose disconnected through ${msg}`);
      cb();
    });
  };
};

process.once('SIGUSR2', shutdown('Nodemon Restart', () => process.kill(process.pid, 'SIGUSR2')));
process.on('SIGINT', shutdown('App Termination', () => process.exit(0)));
process.on('SIGTERM', shutdown('Heroku App Termination', () => process.exit(0)));
