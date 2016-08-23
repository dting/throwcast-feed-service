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

const seedStation = function seedStation({ station, episodes }) {
  logger.info(`Created station: ${station.title}`);
  return Station.create(station).then(created => ({ station: created, episodes }));
};

const seedEpisodes = function seedEpisodes({ station, episodes }) {
  const podcasts = episodes.map(podcast => {
    const props = { station, image: podcast.image || station.image };
    return Object.assign(podcast, props);
  });
  logger.info(`Creating ${podcasts.length} podcasts for ${station.title}...`);
  return Podcast.create(podcasts);
};

const feedHandler = function(p, feed) {
  return p.then(() => utils.fetch(feed))
    .then(seedStation)
    .then(seedEpisodes);
};

const seed = function seed() {
  return feeds.reduce(feedHandler, Promise.resolve())
    .catch(logger.error);
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
