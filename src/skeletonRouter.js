const got = require('got');
const express = require('express');
const convoApiFactory = require('./helpers/convoApiFactory');
const authSettings = require('../auth-settings');

const url = process.env.CONVO_WEBHOOK_URL;

const router = express.Router();

router.post('/messages', (req, res) => {
  console.log(`Receiving post to skeleton webhook (/messages): ${JSON.stringify(req.body)}`);
  const body = req.body;
  console.log(`Receiving post to skeleton webhook (/messages): ${JSON.stringify(authSettings)}`);

  const convoApi = convoApiFactory(url, body.page_id, authSettings, { got });
  convoApi.sendText(body.consumer_id, body)
    .then((response) => {
      console.log(`response from sendText: ${JSON.stringify(response.body)}`);
      res.status(200).json({
        status: 'received'
      });
    });
});

router.post('/deliveries', (req, res) => {
  console.log(`Receiving post to skeleton webhook (/deliveries): ${JSON.stringify(req.body)}`);
  const body = req.body;
  console.log(`Receiving post to skeleton webhook (/deliveries): ${JSON.stringify(authSettings)}`);

  const convoApi = convoApiFactory(url, body.page_id, authSettings, { got });
  convoApi.sendDelivery(body.consumer_id, body.mid)
    .then((response) => {
      console.log(`response from sendDelivery: ${JSON.stringify(response.body)}`);
      res.status(200).json({
        status: 'received'
      });
    });
});

module.exports = router;
