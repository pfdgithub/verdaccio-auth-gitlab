class Queue {
  classProperties() {
    this.logger = null;
    this.userAuthQueue = null;
  }

  constructor(logger) {
    this.classProperties();

    this.logger = logger;
    this.userAuthQueue = new Map();
  }

  push(user, cb, authRequest) {
    // Queue the auth request
    let authQueue = this.userAuthQueue.get(user);
    let newAuthQueue = (authQueue || []).concat([cb]);
    this.userAuthQueue.set(user, newAuthQueue);

    // Allow the first auth request
    if (newAuthQueue.length > 1) {
      this.logger.info('[userAuthQueue]', `Queue user ${user}'s follow-up request: ${newAuthQueue.length}`);
      return;
    }
    this.logger.info('[userAuthQueue]', `Allow user ${user}'s first request: ${newAuthQueue.length}`);

    authRequest((error, roleList) => {
      // Clear queue
      let authQueue = this.userAuthQueue.get(user);
      this.userAuthQueue.delete(user);

      authQueue.forEach((cb) => {
        cb(error, roleList);
      });
    });
  }

}

module.exports = Queue;