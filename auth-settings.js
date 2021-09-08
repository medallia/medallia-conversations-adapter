module.exports = {
  // OAuth config for inbound
  oauthConfig: {
    tokenUrl: `${process.env.CONVO_API_GATEWAY}/oauth/token`,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  },

  // authTypeOutbound can be 'OAuth' or 'API-Token'
  authTypeOutbound: process.env.AUTH_TYPE_OUTBOUND,

  // Default OAuth Expire time in secs
  defaultOAuthExpiresSecs: process.env.DEFAULT_OAUTH_EXPIRES_SECS,

  // For requests coming from Medallia Conversations with API-Token verification
  accessToken: process.env.ACCESS_TOKEN,

  // This is the OAuth 2.0 configuration used by Medallia Conversations to connect with the channel adapter.
  // This is for a dummy OAuth server that will be used to issue this fixed access token
  // and verify that Medallia Conversations sends it in the Authorization header
  oauthServer: {
    tokenPath: '/token',
    clients: {
      'ConversationsClient': 'S3cr3t123!'
    }
  }
};
