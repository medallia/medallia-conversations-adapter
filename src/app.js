const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const hpp = require('hpp');
const helmet = require('helmet');
const skeletonRouter = require('./skeletonRouter');
const convoRouter = require('./convoRouter');
const oauthServer = require('./helpers/TestOAuthServer');

const app = express();

app.use([
  compression(),
  helmet({
    frameguard: false,
    dnsPrefetchControl: {
      allow: true,
    },
  }),
  bodyParser.urlencoded({ limit: '100kb', extended: true }),
  bodyParser.json({ limit: '100kb' }),
  hpp(),
]);

app.get('/state', (req, res) => {
  res.status(200).json({ state: 'Up and running!' });
});

app.use('/', skeletonRouter);
app.use('/custom', convoRouter);
app.use(oauthServer.router);

module.exports = app;
