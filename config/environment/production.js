module.exports = {
  mongo: {
    uri: process.env.MONGO_URL || 'mongodb://localhost/throwcast',
  },
  elastic: {
    hosts: process.env.ELASTICSEARCH_URL ? [process.env.ELASTICSEARCH_URL] : undefined,
  },
};
