const logger = require('winston');
const parsePodcast = require('node-podcast-parser');
const request = require('request');


const fetch = function fetch(feed) {
  return new Promise((resolve, reject) => {
    request(feed, (networkErr, res, xmlData) => {
      if (networkErr) {
        logger.error('Network Error', networkErr);
        return reject(networkErr);
      }

      return parsePodcast(xmlData, (parsingErr, jsonData) => {
        if (parsingErr) {
          logger.error('Parsing error', parsingErr);
          return reject(parsingErr);
        }

        const {
          categories,
          title,
          link,
          updated,
          description,
          image,
          episodes,
        } = jsonData;
        return resolve({
          station: {
            title,
            link,
            updated,
            description,
            image,
            categories,
            feed,
          },
          episodes,
        });
      });
    });
  });
};

module.exports = { fetch };
