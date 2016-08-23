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

const seedEpisodes = function seedEpisodes({ station, episodes }) {
  logger.info(`Creating ${episodes.length} podcasts for ${station.title}...`);
  return episodes.reduce((p, c) => p.then(() => Podcast.create(c)), Promise.resolve());
};

const seedStation = function seedStation(feed) {
  return parsed => Station.create(Object.assign(parsed.station, { feed }))
    .then(station => {
      logger.info(`Creating station: ${station.title}`);
      const episodes = parsed.episodes
        .map(podcast => Object.assign(podcast, { station }))
        .map(podcast => Object.assign(podcast, { image: podcast.image || station.image }));
      return {
        station,
        episodes,
      };
    });
};

const seed = function seed() {
  return feeds.reduce((p, feed) => p
    .then(() => utils.fetch(feed))
    .then(seedStation(feed))
    .then(seedEpisodes), Promise.resolve([]))
    .catch(error => {
      logger.error(error, error.stack);
      throw error;
    });
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
