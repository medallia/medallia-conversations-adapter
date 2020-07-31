const _ = require('lodash');
const express = require('express');

const router = express.Router();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

router.post('/me/messages', (req, res) => {
  console.log(`/me/messages called with: ${JSON.stringify({
    body: req.body,
    access_token: req.query.access_token,
    req_query: req.query,
  })}`);

  if (_.isEqual(req.query.access_token, ACCESS_TOKEN)) {
    res.json({
      recipient_id: req.body.recipient.id, // Messaging service consumer id
      message_id: `${req.body.recipient.id}.${new Date().getTime()}` // Messaging service individual message id
    });
  } else {
    res.status(401).json({
      status: 'Invalid access token'
    });
  }
});

module.exports = router;
