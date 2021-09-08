// This implements a basic OAuth 2.0-compatible token server for use with this reference implementation.
// It only supports client_credentials grants and uses the static client_id/client_secret values that are
// configured in auth-settings.js.

const basicAuth = require('express-basic-auth');
const crypto = require('crypto');
const router = require('express').Router();

const { oauthServer, defaultOAuthExpiresSecs } = require('../../auth-settings');
const cache = require('./cache');

const staticAuth = basicAuth({
  users: oauthServer.clients
});

router.post(oauthServer.tokenPath, staticAuth, (req, res) => {
  const grantType = req.body.grant_type;
  if (!grantType || grantType !== 'client_credentials') {
    res.status(400).send({ error: 'invalid_grant' });
  } else {
    const token = crypto.randomBytes(16).toString('hex');
    const { auth } = req;
    if (auth.user) {
      cache.put(token, auth.user);
    }
    console.info(`Issued new access token: ${token} for client ${auth.user || 'unknown'}`);
    res.status(200).send({ access_token: token, expires_in: defaultOAuthExpiresSecs });
  }
});

function isTokenValid(token) {
  return cache.get(token) || false;
}

module.exports = {
  router,
  isTokenValid
};
