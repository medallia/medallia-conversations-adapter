const crypto = require('crypto');

module.exports = function generateSignature(body, secret) {
  const signature = crypto.createHmac('sha1', secret).update(body).digest('hex');
  return `sha1=${signature}`;
};
