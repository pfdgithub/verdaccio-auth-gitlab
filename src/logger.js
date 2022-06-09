const PLUGIN_NAME = 'auth-gitlab';

class Logger {
  classProperties() {
    this.logger = null;
  }

  constructor(logger) {
    this.classProperties();

    this.logger = logger;
  }

  log(type, message, ...rest) {
    if (this.logger && this.logger[type]) {
      this.logger[type](`[${PLUGIN_NAME}] ${message}`, ...rest);
    }
    else if (console[type]) {
      console[type](`[${PLUGIN_NAME}] ${message}`, ...rest);
    }
    else {
      console.log(`[${PLUGIN_NAME}] [${type}] ${message}`, ...rest);
    }
  }

  trace(message, ...rest) {
    this.log('trace', message, ...rest);
  }

  debug(message, ...rest) {
    this.log('debug', message, ...rest);
  }

  info(message, ...rest) {
    this.log('info', message, ...rest);
  }

  http(message, ...rest) {
    this.log('http', message, ...rest);
  }

  warn(message, ...rest) {
    this.log('warn', message, ...rest);
  }

  error(message, ...rest) {
    this.log('error', message, ...rest);
  }

  fatal(message, ...rest) {
    this.log('fatal', message, ...rest);
  }

}

module.exports = Logger;