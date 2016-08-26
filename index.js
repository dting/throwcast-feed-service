const logger = require('winston');
const CronJob = require('cron').CronJob;
const db = require('./db');
const feed = require('./feed');
const seed = require('./seed');
const utils = require('./utils');

const CRON_TIME = '0 0 * * * *';

db.connect()
  .then(() => {
    logger.info('Mongoose connection established...');
    logger.info(`${CRON_TIME} CronJob starting to update feeds...`);
  })
  .then(() => {
    if (process.argv.slice(2).indexOf('clean') !== -1) {
      logger.info('Cleaning DB before seeding');
      return utils.clean();
    }
    return null;
  })
  .then(seed)
  .then(() => new CronJob({
    cronTime: CRON_TIME,
    onTick: () => {
      logger.info('Updates started:', Date.now());
      feed().then(() => {
        logger.info('Updates complete:', Date.now());
      });
    },
    start: true,
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
