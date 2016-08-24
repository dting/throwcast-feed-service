const logger = require('winston');
const Promise = require('bluebird');

const utils = require('../utils');
const { Playlist, Podcast, Station } = require('../db');

const feeds = [
  'http://feeds.themoth.org/themothpodcast',
  'http://feeds.serialpodcast.org/serialpodcast',
  'http://www.npr.org/templates/rss/podlayer.php?id=1014',
  'http://www.bloomberg.com/feeds/podcasts/masters_in_business.xml',
  'http://podcasts.cstv.com/feeds/fantasyfootball.xml',
  'http://podcasts.cstv.com/feeds/nba.xml',
  'http://feeds.99percentinvisible.org/99percentinvisible',
];

const opts = {
  upsert: true,
  new: true,
  runValidators: true,
  setDefaultsOnInsert: true,
  passRawResult: true,
};

const upsertStation = function upsertStation({ station, episodes }) {
  return new Promise((resolve, reject) => {
    Station.findOneAndUpdate({ feed: station.feed }, station, opts, (err, doc, raw) => {
      if (err) {
        return reject(err);
      }
      if (!raw.lastErrorObject.updatedExisting) {
        logger.info(`Station created: ${station.title}`);
      } else {
        logger.debug(`Station updated: ${station.title}`);
      }
      return resolve({ station: doc, episodes });
    });
  });
};

const feedHandler = function feedHandler(p, feed) {
  return p.then(() => utils.fetch(feed))
    .then(upsertStation)
    .then(utils.updateEpisodes);
};

module.exports = function seed() {
  logger.info('Seeding db started...');
  return feeds.reduce(feedHandler, Promise.resolve())
    .then(utils.sync(Playlist, 'Playlists'))
    .then(utils.sync(Podcast, 'Podcasts'))
    .then(utils.sync(Station, 'Stations'))
    .then(() => logger.info('Seeding db completed...'))
    .catch(logger.error);
};
