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

    let value = this.users.get(user);
    if (this.isStaleUser(value)) {
      this.users.delete(user);
      return;
    }
    else {
      return value;
    }
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
        let count = this.deleteAllStaleUser();
        this.logger.info('[cache]', `Cleaned stale user count: ${count}`);
      }
    }

    this.users.set(user, {
      lastModified: Date.now(),
      groups: groups
    });
  }

  isStaleUser(value) {
    return value && ((Date.now() - value.lastModified) >= (this.maxSecond * 1000));
  }

  deleteOldestUser() {
    let mapIter = this.users.keys();
    let oldestKey = mapIter.next().value;

    this.users.delete(oldestKey);

    return oldestKey;
  }

  deleteAllStaleUser() {
    let keys = [];

    this.users.forEach((value, key) => {
      if (this.isStaleUser(value)) {
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