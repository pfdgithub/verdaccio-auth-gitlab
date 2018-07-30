const Logger = require('./logger');

class Users {
  classProperties() {
    this.users = null;
    this.logger = null

    this.maxCount = 0;
    this.maxSecond = 0;
  }

  constructor(logger, maxCount, maxSecond) {
    this.classProperties();

    this.users = new Map();
    this.logger = logger;

    this.maxCount = maxCount > 0 ? maxCount : 0;
    this.maxSecond = maxSecond > 0 ? maxSecond : 0;
  }

  getUser(user) {
    if (this.maxCount === 0) {
      return;
    }

    return this.users.get(user);
  }

  setUser(user, groups) {
    if (this.maxCount === 0) {
      return;
    }

    if (this.users.size >= this.maxCount) {
      if (this.maxSecond === 0) {
        let key = deleteOldestUser();
        this.logger.info('[cache]', `Cleaned the oldest user: ${key}`);
      }
      else {
        let count = this.deleteStaleUser();
        this.logger.info('[cache]', `Cleaned stale user count: ${count}`);
      }
    }

    this.users.set(user, {
      timestamp: Date.now(),
      groups: groups
    });
  }

  deleteOldestUser() {
    let mapIter = this.users.keys();
    let oldestKey = mapIter.next().value;

    this.users.delete(oldestKey);

    return oldestKey;
  }

  deleteStaleUser() {
    let keys = [];

    this.users.forEach((value, key) => {
      if (value && ((Date.now() - value.timestamp) >= (this.maxSecond * 1000))) {
        keys.push(key);
      }
    });

    keys.forEach((key) => {
      this.users.delete(key);
    });

    return keys.length;
  }

}

module.exports = Users;