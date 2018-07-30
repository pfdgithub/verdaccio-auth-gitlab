const Gitlab = require('gitlab/dist/es5').default;

const Logger = require('./logger');
const Users = require('./users');
const roles = require('./roles');

const URL = 'https://gitlab.com';
const MAX_COUNT = 1000;
const MAX_SECOND = 300;

class Auth {
  classProperties() {
    this.config = null;
    this.options = null;

    this.users = null;
    this.logger = null

    this.url = URL;
    this.role = {
      user: true,
      group: false,
      project: false
    };
    this.cache = {
      maxCount: MAX_COUNT,
      maxSecond: MAX_SECOND
    };
  }

  constructor(config = {
    url: URL,
    role: {
      user: true,
      group: false,
      project: false
    },
    cache: {
      maxCount: MAX_COUNT,
      maxSecond: MAX_SECOND
    }
  }, options = {
    logger: null
  }) {
    this.classProperties();

    this.config = config;
    this.options = options;

    this.initParams(config, options);
  }

  initParams(config, options) {
    if (typeof (config.url) === 'string') {
      this.url = config.url;
    }

    if (typeof (config.role) === 'object') {
      if (typeof (config.role.user) === 'boolean') {
        this.role.user = config.role.user;
      }

      // Disable user role will make it impossible to check the relevance between username and token.
      if (config.role.user === false) {
        this.role.group = false;
        this.role.project = false;
      }
      else {
        if (typeof (config.role.group) === 'boolean') {
          this.role.group = config.role.group;
        }

        if (typeof (config.role.project) === 'boolean') {
          this.role.project = config.role.project;
        }
      }
    }

    if (typeof (config.cache) === 'object') {
      if (typeof (config.cache.maxCount) === 'number') {
        this.cache.maxCount = config.cache.maxCount;
      }

      if (typeof (config.cache.maxSecond) === 'number') {
        this.cache.maxSecond = config.cache.maxSecond;
      }
    }

    this.logger = new Logger(options.logger);
    this.users = new Users(this.logger, this.cache.maxCount, this.cache.maxSecond);

    this.logger.info('[initParams]', config);
  }

  authenticate(user, password, cb) {
    let userCache = this.users.getUser(user);

    if (userCache) {
      this.logger.info('[authenticate]', `User ${user} hit cache`);

      return cb(null, userCache.groups);
    }
    else {
      this.logger.info('[authenticate]', `User ${user} missing cache`);
    }

    this.checkRole(user, password, cb);
  }

  add_user(user, password, cb) {
    this.checkRole(user, password, (error, groups) => {
      if (error) {
        this.logger.info('[add_user]', `Add user ${user} failed: ${error.message}`);

        return cb(error, false);
      }
      else {
        this.logger.info('[add_user]', `Add user: ${user}`);

        return cb(null, true);
      }
    });
  }

  allow_access(user, pkg, cb) {
    this.allowAction('access', user, pkg, cb);
  }

  allow_publish(user, pkg, cb) {
    this.allowAction('publish', user, pkg, cb);
  }

  allowAction(action, user, pkg, cb) {
    let userName = user.name || '';
    let groups = user.groups || [];
    let actionRoles = pkg[action] || [];

    let pkgScope = '';
    let pkgName = '';
    let fullName = pkg.name || '';
    let match = fullName.match(/^(@([^@\/]+)\/)?([^@\/]+)$/);
    if (match) {
      pkgScope = match[2] || '';
      pkgName = match[3] || '';
    }

    for (let i = 0; i < actionRoles.length; i++) {
      let actionRole = actionRoles[i];

      if (roles.isPluginRole(actionRole)) {
        actionRole = roles.replacePlaceholder(actionRole, {
          pkgScope,
          pkgName
        });
      }

      if (groups.includes(actionRole)) {
        this.logger.info(`[allow_${action}]`, `Allow user ${userName || 'anonymous'} ${action} ${fullName}`);

        return cb(null, true);
      }
    }

    this.logger.info(`[allow_${action}]`, `Block user ${userName || 'anonymous'} ${action} ${fullName}`);

    return cb(null, false);
  }

  checkRole(user, password, cb) {
    let api = new Gitlab({
      url: this.url,
      token: password
    });

    let roleList = [];
    let rolePromises = [];

    if (this.role.user) {
      /**
       * https://github.com/jdalrymple/node-gitlab/blob/master/src/services/Users.js#L29
       * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/users.md#for-normal-users-1
       */
      let promise = api.Users.current(
      ).then((res) => {
        let role = roles.getUserRole();
        roleList.push(role);

        if (res && res.username === user) {
          let role = roles.getUserRole(res.username);
          roleList.push(role);
        }
        else {
          throw new Error(`Username ${user} and token ${password} do not match`);
        }
      });
      rolePromises.push(promise);
    }

    if (this.role.group) {
      /**
       * https://github.com/jdalrymple/node-gitlab/blob/master/src/services/Groups.js#L4
       * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/groups.md#list-groups
       */
      let promise_owner = api.Groups.all({
        owned: true
      }).then((res) => {
        if (res && res.length > 0) {
          res.forEach((item) => {
            let role = roles.getGroupRole(item.path, 'owner');
            roleList.push(role);
          });
        }
      });
      rolePromises.push(promise_owner);

      let promise_member = api.Groups.all(
      ).then((res) => {
        if (res && res.length > 0) {
          res.forEach((item) => {
            let role = roles.getGroupRole(item.path, 'member');
            roleList.push(role);
          });
        }
      });
      rolePromises.push(promise_member);
    }

    if (this.role.project) {
      /**
       * https://github.com/jdalrymple/node-gitlab/blob/master/src/services/Projects.js#L7
       * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/projects.md#list-all-projects
       */
      let promise_owner = api.Projects.all({
        owned: true
      }).then((res) => {
        if (res && res.length > 0) {
          res.forEach((item) => {
            let role = roles.getProjectRole(item.path, 'owner');
            roleList.push(role);
          });
        }
      });
      rolePromises.push(promise_owner);

      let promise_member = api.Projects.all({
        membership: true
      }).then((res) => {
        if (res && res.length > 0) {
          res.forEach((item) => {
            let role = roles.getProjectRole(item.path, 'member');
            roleList.push(role);
          });
        }
      });
      rolePromises.push(promise_member);
    }

    Promise.all(rolePromises).then(() => {
      this.logger.info('[checkRole]', `User ${user} role: ${roleList.toString()}`);

      this.users.setUser(user, roleList);

      return cb(null, roleList);
    }).catch((error) => {
      this.logger.info('[checkRole]', `Check user ${user} role failed: ${error.message}`, error);

      return cb(error);
    });
  }

}

module.exports = Auth;