// test OAuth server that supports only client_credentials grant type
// with a fixed set of client id and secret values configured in auth-settings.js

const basicAuth = require('express-basic-auth');
const crypto = require('crypto');
const router = require('express').Router();

const Cache = require('ttl');
const { oauthServer } = require('../../auth-settings');

const cache = new Cache({
  ttl: 3600 * 1000
});

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
    if (auth.user) cache.put(token, auth.user);
    console.info(`Issued new access token: ${token} for client ${auth.user || 'unknown'}`);
    res.status(200).send({ access_token: token, expires_in: 3600 });
  }
});

// This is just to confirm the token is valid and get the client info for the token
router.get('/userInfo', (req, res) => {
  const token = req.query.token;
  const user = cache.get(token);
  return user ? res.status(200).send({ user }) : res.sendStatus(400);
});

function isTokenValid(token) {
  return cache.get(token) || false;
}

module.exports = {
  router,
  isTokenValid
};
