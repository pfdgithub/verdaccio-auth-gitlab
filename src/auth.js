const Logger = require('./logger');
const Users = require('./users');
const Roles = require('./roles');
const Queue = require('./queue');
const roleUtil = require('./roleUtil');

const URL = 'https://gitlab.com';
const MAX_COUNT = 1000;
const MAX_SECOND = 300;

class Auth {
  classProperties() {
    this.config = null;
    this.options = null;

    this.logger = null;
    this.users = null;
    this.authQueue = null;

    this.url = URL;
    this.role = {
      user: true,
      groupOwner: false,
      groupMember: false,
      groupMinAccessLevel: [],
      projectOwner: false,
      projectMember: false,
      projectMinAccessLevel: []
    };
    this.cache = {
      maxCount: MAX_COUNT,
      maxSecond: MAX_SECOND
    };
  }

  constructor(config, options) {
    this.classProperties();

    this.config = config;
    this.options = options;

    this.initParams(config, options);
  }

  initParams(config, options) {
    let isType = (value, type) => {
      return Object.prototype.toString.call(value) === `[object ${type}]`;
    };

    if (isType(config.url, 'String')) {
      this.url = config.url;
    }

    if (isType(config.role, 'Object')) {
      if (isType(config.role.user, 'Boolean')) {
        this.role.user = config.role.user;
      }

      // Disable user role will make it impossible to check the relevance between username and token.
      if (config.role.user === true) {
        if (isType(config.role.groupOwner, 'Boolean')) {
          this.role.groupOwner = config.role.groupOwner;
        }

        if (isType(config.role.groupMember, 'Boolean')) {
          this.role.groupMember = config.role.groupMember;
        }

        if (isType(config.role.groupMinAccessLevel, 'Array')) {
          this.role.groupMinAccessLevel = config.role.groupMinAccessLevel;
        }

        if (isType(config.role.projectOwner, 'Boolean')) {
          this.role.projectOwner = config.role.projectOwner;
        }

        if (isType(config.role.projectMember, 'Boolean')) {
          this.role.projectMember = config.role.projectMember;
        }

        if (isType(config.role.projectMinAccessLevel, 'Array')) {
          this.role.projectMinAccessLevel = config.role.projectMinAccessLevel;
        }
      }
    }

    if (isType(config.cache, 'Object')) {
      if (isType(config.cache.maxCount, 'Number')) {
        this.cache.maxCount = config.cache.maxCount;
      }

      if (isType(config.cache.maxSecond, 'Number')) {
        this.cache.maxSecond = config.cache.maxSecond;
      }
    }

    this.logger = new Logger(options.logger);
    this.users = new Users(this.logger, this.cache.maxCount, this.cache.maxSecond);
    this.authQueue = new Queue(this.logger);

    this.logger.info('[initParams]', config);
  }

  authenticate(user, password, cb) {
    // Check cache
    let userCache = this.users.getUser(user);

    if (userCache) {
      this.logger.info('[authenticate]', `User ${user} hit cache`);

      return cb(null, userCache.groups);
    }
    else {
      this.logger.info('[authenticate]', `User ${user} missing cache`);
    }

    // Queue the auth request
    this.authQueue.push(user, cb, (cb) => {
      // Auth request
      this.checkRole(user, password, (error, roleList) => {
        if (!error) {
          // Update cache
          this.users.setUser(user, roleList);
        }

        cb(error, roleList);
      });
    });
  }

  add_user(user, password, cb) {
    let roles = new Roles(this.logger, this.url, password);

    roles.userCurrent(user).then(() => {
      this.logger.info('[add_user]', `Check gitlab user: ${user}`);

      return cb(null, true);
    }).catch((error) => {
      this.logger.info('[add_user]', `Check gitlab user ${user} failed: ${error.message}`);

      return cb(error);
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

    // '@scope/name' -> ['@scope/name', '@scope/', 'scope', 'name']
    let match = fullName.match(/^(@([^@\/]+)\/)?([^@\/]+)$/);
    if (match) {
      pkgScope = match[2] || '';
      pkgName = match[3] || '';
    }

    for (let i = 0; i < actionRoles.length; i++) {
      let actionRole = actionRoles[i];

      if (roleUtil.isPluginRole(actionRole)) {
        actionRole = roleUtil.replacePlaceholder(actionRole, {
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
    let roleList = [];
    let rolePromises = [];
    let roles = new Roles(this.logger, this.url, password);

    let addRole = (list) => {
      roleList = roleList.concat(list);
    };

    if (this.role.user) {
      let promise = roles.userCurrent(user).then(addRole);
      rolePromises.push(promise);
    }

    if (this.role.groupOwner) {
      let promise = roles.groupOwner().then(addRole);
      rolePromises.push(promise);
    }

    if (this.role.groupMember) {
      let promise = roles.groupMember().then(addRole);
      rolePromises.push(promise);
    }

    if (this.role.groupMinAccessLevel.length > 0) {
      for (let i = 0; i < this.role.groupMinAccessLevel.length; i++) {
        let level = this.role.groupMinAccessLevel[i];
        let promise = roles.groupMinAccessLevel(level).then(addRole);
        rolePromises.push(promise);
      }
    }

    if (this.role.projectOwner) {
      let promise = roles.projectOwner().then(addRole);
      rolePromises.push(promise);
    }

    if (this.role.projectMember) {
      let promise = roles.projectMember().then(addRole);
      rolePromises.push(promise);
    }

    if (this.role.projectMinAccessLevel.length > 0) {
      for (let i = 0; i < this.role.projectMinAccessLevel.length; i++) {
        let level = this.role.projectMinAccessLevel[i];
        let promise = roles.projectMinAccessLevel(level).then(addRole);
        rolePromises.push(promise);
      }
    }

    Promise.all(rolePromises).then(() => {
      this.logger.info('[checkRole]', `User ${user} role: ${roleList.toString()}`);

      return cb(null, roleList);
    }).catch((error) => {
      this.logger.info('[checkRole]', `Check user ${user} role failed: ${error.message}`, error);

      return cb(error);
    });
  }

}

module.exports = Auth;