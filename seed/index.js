const logger = require('winston');
const Promise = require('bluebird');

const utils = require('../utils');
const { Playlist, Podcast, Station } = require('../db');

const feeds = [
  'http://feeds.themoth.org/themothpodcast', // The Moth Podcast
  'http://feeds.serialpodcast.org/serialpodcast', // Serial
  'http://www.npr.org/templates/rss/podlayer.php?id=1014', // Politics : NPR
  'http://www.npr.org/rss/podcast.php?id=344098539', // Wait Wait... Don't Tell Me!
  'http://www.npr.org/rss/podcast.php?id=510313', // How I Built This
  'http://www.npr.org/rss/podcast.php?id=510307', // Invisibilia
  'http://www.npr.org/rss/podcast.php?id=381444908', // Fresh Air
  'http://www.bloomberg.com/feeds/podcasts/masters_in_business.xml', // Masters in Business
  'http://podcasts.cstv.com/feeds/fantasyfootball.xml', // Fantasy Football Today Podcast
  'http://podcasts.cstv.com/feeds/nba.xml', // CBS Sports Eye On Basketball Podcast
  'http://feeds.99percentinvisible.org/99percentinvisible', // 99% Invisible
  'http://feeds.feedburner.com/RevisionistHistory', // Revisionist History
  'http://feeds.feedburner.com/freakonomicsradio', // Freakonomics Radio
  'https://fivejs.codeschool.com/feed.rss', // 5 Minutes of JavaScript
  'https://feeds.feedwrench.com/AdventuresInAngular.rss', // Adventures in Angular
  'http://feeds.feedburner.com/boagworldpodcast', // The Boagworld UX Show
  'http://shoptalkshow.com/feed/podcast', // ShopTalk
  'https://feeds.feedwrench.com/JavaScriptJabber.rss', // JavaScript Jabber
  'http://feeds.feedburner.com/NodeUp', // NodeUp
  'http://feeds.5by5.tv/webahead', // The Web Ahead
  'http://feeds.feedburner.com/dancarlin/history', // Dan Carlin's Hardcore History
  'http://feeds.soundcloud.com/users/soundcloud:users:38128127/sounds.rss', // StarTalk Radio
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
