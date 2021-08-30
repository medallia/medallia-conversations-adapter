const got = require('got');
const Cache = require('ttl');
const qs = require('querystring');

const cache = new Cache({
  ttl: 3600 * 1000
});
if (process.env.NODE_ENV !== 'production') {
  cache.on('hit', (key, val) => {
    console.log(`Cache hit for key: ${key}; Value: ${val}`);
  });
  cache.on('miss', (key) => {
    console.log(`Cache miss for key: ${key}`);
  });
  cache.on('put', (key, val, ttl) => {
    console.log(`Cache put for key: ${key}; Value: ${val} with ttl: ${ttl}`);
  });
}

async function getAccessToken(authSettings) {
  let token = null;
  if (authSettings.oauthConfig) {
    const { tokenUrl, clientId, clientSecret } = authSettings.oauthConfig;
    token = cache.get(clientId);
    if (!token) {
      const payload = { grant_type: 'client_credentials', client_id: clientId };
      const cred = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
      console.log('Fetching new access token for client:', clientId, 'from token URL:', tokenUrl);
      try {
        const { body } = await got.post(tokenUrl, {
          body: qs.encode(payload),
          responseType: 'json',
          headers: {
            Authorization: `Basic ${cred}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log('Received /token response from MC: ', body);
        const res = JSON.parse(body);
        token = res.access_token;
        cache.put(clientId, token, res.expires_in * 1000);
      } catch (e) {
        console.error(`Error fetching access token from ${tokenUrl}`, e);
      }
    } else {
      console.log(`Returning cached token: ${token} for client: ${clientId}`);
    }
  }
  return token;
}

module.exports = {
  getAccessToken
};
