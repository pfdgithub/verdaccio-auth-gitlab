const Auth = require('./auth');

module.exports = (config, options) => {
  return new Auth(config, options);
};