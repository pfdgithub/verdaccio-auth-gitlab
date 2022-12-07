const stringHash = require('./string-hash');

class Users {
  classProperties() {
    this.logger = null;
    this.users = null;

    this.maxCount = 0;
    this.maxSecond = 0;
  }

  constructor(logger, options) {
    this.classProperties();

    let maxCount = options.maxCount;
    let maxSecond = options.maxSecond;

    this.logger = logger;
    this.users = new Map();

    this.maxCount = maxCount > 0 ? maxCount : 0;
    this.maxSecond = maxSecond > 0 ? maxSecond : 0;
  }

  getUser(user, password) {
    if (this.maxCount === 0) {
      return;
    }

    let value = this.users.get(user);
    if (this.isStaleUser(value) || !this.isSameHash(password)) {
      this.users.delete(user);
      return;
    }

    return value;
  }

  setUser(user, password, groups) {
    if (this.maxCount === 0) {
      return;
    }

    // First check
    if (this.users.size >= this.maxCount && this.maxSecond > 0) {
      let keys = this.deleteAllStaleUser();
      this.logger.info(`[userCache] Cleaned all stale user: ${keys.toString()}`);
    }

    // Second check
    if (this.users.size >= this.maxCount) {
      let key = deleteOldestUser();
      this.logger.info(`[userCache] Cleaned the oldest user: ${key}`);
    }

    this.users.set(user, {
      lastModified: Date.now(),
      hash: this.hashPwd(password),
      groups: groups
    });
  }

  isStaleUser(value) {
    return value && ((Date.now() - value.lastModified) >= (this.maxSecond * 1000));
  }

  isSameHash(value, password) {
    return value && (value.hash === this.hashPwd(password));
  }

  hashPwd(password) {
    return password ? stringHash(password) : 0;
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

    return keys;
  }

}

module.exports = Users;