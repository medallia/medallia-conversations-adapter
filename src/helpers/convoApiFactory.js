const _ = require('lodash');
const oauthClient = require('./OAuthClient');
const generateSignature = require('../helpers/generateSignature');

function buildBody(senderId, pageId, inBody, type = 'message') {
  console.log(`parameters to buildBody: ${JSON.stringify({
    senderId, pageId, inBody, type
  })}`);

  const currentTime = Date.now();

  const baseMessage = {
    mid: currentTime,
  };

  if (inBody.mids) {
    delete baseMessage.mid;
  }

  const finalMessage = _.merge(baseMessage, { text: inBody.text });

  const body = {
    object: 'page',
    entry: [
      {
        id: pageId,
        time: currentTime,
        messaging: [
          {
            sender: {
              id: senderId,
            },
            recipient: {
              id: pageId
            },
            timestamp: currentTime,
            [type]: finalMessage,
            trigger_params: inBody.trigger_params,
          }
        ]
      }
    ]
  };

  return body;
}

async function getAuthorization(authSettings) {
  let authzVal = null;
  if (authSettings && authSettings.authTypeInbound === 'Oauth2') {
    console.log('getting access token');
    const token = await oauthClient.getAccessToken(authSettings);
    authzVal = `Bearer ${token}`;
  }
  return authzVal;
}

async function sendPostRequest(got, url, authSettings, body) {
  const headers = {};
  const newRequest = {
    url,
    options: {
      body: JSON.stringify(body),
      headers
    }
  };
  const authzVal = await getAuthorization(authSettings);
  console.debug('Adding Authorization header value', authzVal);
  if (authzVal) {
    headers.Authorization = authzVal;
  }
  console.debug('Sending POST request to ', newRequest.url, ' with options: ', newRequest.options);
  return got.post(newRequest.url, newRequest.options);
}

function convoApiFactory(url, pageId, authSettings, dependencies) {
  const got = dependencies.got.extend({
    headers: {
      'content-type': 'application/json'
    },
    hooks: {
      // Next hook will generate and add a valid signature to every
      beforeRequest: [
        (options) => {
          if (authSettings.authType === 'Signature' && options.body) {
            const signature = generateSignature(options.body, authSettings.secret);
            const updatedOptions = {
              headers: {
                ...options.headers,
                'X-Hub-Signature': signature
              }
            };
            // eslint-disable-next-line no-param-reassign
            options.headers = updatedOptions.headers;
            console.log('Updated request headers to ', options.headers);
          }
        }
      ]
    }
  });

  return {
    sendText: (senderId, inBody) => {
      const body = buildBody(senderId, pageId, inBody);
      console.log(`sending text message to Convo: ${JSON.stringify({
        body, url
      })}`);
      return sendPostRequest(got, url, authSettings, body);
    },
    sendImage: (senderId, imageUrl) => {
      const body = buildBody(senderId, pageId, {
        attachments: [
          {
            type: 'image',
            payload: {
              url: imageUrl
            }
          }
        ]
      });
      console.log(`sending image message to Convo ${JSON.stringify({ body, url })}`);
      return sendPostRequest(got, url, authSettings, body);
    },
    sendMedia: (senderId, mediaUrl, mediaType) => {
      const body = buildBody(senderId, pageId, {
        attachments: [
          {
            type: mediaType,
            payload: {
              url: mediaUrl
            }
          }
        ]
      });
      console.log(`sending  ${mediaType} message to Convo ${JSON.stringify({ body, url })}`);
      return sendPostRequest(got, url, authSettings, body);
    },
    sendDelivery: (senderId, mid) => {
      const body = buildBody(senderId, pageId, {
        mids: [
          mid // The message id that is delivered
        ],
        watermark: Date.now(),

      }, 'delivery');
      console.log(`sending Delivery: ${JSON.stringify({ body, url })}`);
      return sendPostRequest(got, url, authSettings, body);
    },
    sendDeliveryFailure: () => {
      console.log('sending Delivery failure not implemented in conversations side.');
      return Promise.resolve();
    },
    sendRead: (senderId) => {
      const currentTime = Date.now();
      const body = buildBody(senderId, pageId,
        {
          watermark: currentTime,
        }, 'read'
      );
      console.log(`sending Read ${JSON.stringify({ body, url })}`);
      return sendPostRequest(got, url, authSettings, body);
    }
  };
}

module.exports = convoApiFactory;
