const logger = require('winston');
const utils = require('../utils');
const { connect, connection, Station, Podcast } = require('../db');

const feeds = [
  'http://feeds.themoth.org/themothpodcast',
  'http://feeds.serialpodcast.org/serialpodcast',
  'http://www.npr.org/templates/rss/podlayer.php?id=1014',
  'http://www.bloomberg.com/feeds/podcasts/masters_in_business.xml',
  'http://podcasts.cstv.com/feeds/fantasyfootball.xml',
  'http://podcasts.cstv.com/feeds/nba.xml',
];

const seedStation = function seedStation(feed) {
  let update;
  return () => utils.fetch(feed)
    .then(parsed => (update = parsed))
    .then(() => Station.create(Object.assign(update.station, { feed })))
    .then(station => {
      const newEpisodes = update.episodes.map(podcast => Object.assign(podcast, { station }));
      logger.info(`Creating ${newEpisodes.length} podcasts for ${station.title}...`);
      return newEpisodes.reduce((p, c) => p.then(() => Podcast.create(c)), Promise.resolve());
    })
    .catch(error => {
      logger.error(error, error.stack);
      throw error;
    });
};

const seed = function seed() {
  return feeds.reduce((p, c) => p.then(seedStation(c)), Promise.resolve([]));
};

const clean = function clean() {
  return Station.remove().then(() => Podcast.remove());
};

connect()
  .then(() => logger.info('Cleaning DB before seeding'))
  .then(clean)
  .then(seed)
  .then(() => connection.close());

module.exports = { seed, clean };
