const Cache = require('ttl');
const { defaultOAuthExpiresSecs } = require('../../auth-settings');

const cache = new Cache({
  ttl: defaultOAuthExpiresSecs * 1000
});

module.exports = cache;