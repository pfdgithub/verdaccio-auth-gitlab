const PLUGIN_NAME = 'auth-gitlab';

class Logger {
  classProperties() {
    this.logger = null;
  }

  constructor(logger) {
    this.classProperties();

    this.logger = logger;
  }

  log(type, ...rest) {
    if (this.logger && this.logger[type]) {
      this.logger[type](`[${PLUGIN_NAME}]`, ...rest);
    }
    else if (console[type]) {
      console[type](`[${PLUGIN_NAME}]`, ...rest);
    }
    else {
      console.log(`[${PLUGIN_NAME}]`, `[${type}]`, ...rest);
    }
  }

  trace(...rest) {
    this.log('trace', ...rest);
  }

  debug(...rest) {
    this.log('debug', ...rest);
  }

  info(...rest) {
    this.log('info', ...rest);
  }

  http(...rest) {
    this.log('http', ...rest);
  }

  warn(...rest) {
    this.log('warn', ...rest);
  }

  error(...rest) {
    this.log('error', ...rest);
  }

  fatal(...rest) {
    this.log('fatal', ...rest);
  }

}

module.exports = Logger;