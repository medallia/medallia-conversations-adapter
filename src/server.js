const http = require('http');

const app = require('./app');

const serverPort = process.env.PORT || 1338;

const start = () => {
  http.createServer(app).listen(serverPort, () => {
    console.log(`App listening on port http://localhost:${serverPort}/`);
  });
};

start();
