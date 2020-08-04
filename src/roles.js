const { Gitlab } = require('@gitbeaker/node');
const roleUtil = require('./roleUtil');

class Roles {
  classProperties() {
    this.logger = null;
    this.api = null;

    this.url = '';
    this.tokenType = '';
    this.token = '';
    this.pageCfg = {};
  }

  constructor(logger, url, tokenType, token, pageCfg) {
    this.classProperties();

    let cfg = {
      host: url,
    };
    if (tokenType === 'personal') {
      cfg.token = token;
    } else if (tokenType === 'oauth') {
      cfg.oauthToken = token;
    } else if (tokenType === 'job') {
      cfg.jobToken = token;
    }

    this.logger = logger;
    this.api = new Gitlab(cfg);

    this.url = url;
    this.tokenType = tokenType;
    this.token = token;

    if (pageCfg.perPage > 0) {
      this.pageCfg.perPage = pageCfg.perPage;
    }
    if (pageCfg.maxPages > 0) {
      this.pageCfg.maxPages = pageCfg.maxPages;
    }
  }

  userCurrent(user) {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Users.js#L29
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/users.md#for-normal-users-1
     */
    return this.api.Users.current(
    ).then((res) => {
      let roleList = [];

      let role = roleUtil.getUserRole();
      roleList.push(role);

      if (res && res.username === user) {
        let role = roleUtil.getUserRole(res.username);
        roleList.push(role);
      }
      else {
        throw new Error(`Username ${user} and token ${this.token} do not match`);
      }

      return roleList;
    });
  }

  groupOwner() {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Groups.js#L4
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/groups.md#list-groups
     */
    return this.api.Groups.all(Object.assign({
      owned: true
    }, this.pageCfg)).then((res) => {
      let roleList = [];
      if (res && res.length > 0) {
        res.forEach((item) => {
          let role = roleUtil.getGroupRole(item.path, 'owner');
          roleList.push(role);
        });
      }

      return roleList;
    });
  }

  groupMember() {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Groups.js#L4
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/groups.md#list-groups
     */
    return this.api.Groups.all(Object.assign({
      all_available: false
    }, this.pageCfg)).then((res) => {
      let roleList = [];

      if (res && res.length > 0) {
        res.forEach((item) => {
          let role = roleUtil.getGroupRole(item.path, 'member');
          roleList.push(role);
        });
      }

      return roleList;
    });
  }

  groupMinAccessLevel(level) {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Groups.js#L4
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/groups.md#list-groups
     */
    return this.api.Groups.all(Object.assign({
      min_access_level: level
    }, this.pageCfg)).then((res) => {
      let roleList = [];

      if (res && res.length > 0) {
        res.forEach((item) => {
          let role = roleUtil.getGroupRole(item.path, 'level', level);
          roleList.push(role);
        });
      }

      return roleList;
    });
  }

  projectOwner() {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Projects.js#L7
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/projects.md#list-all-projects
     */
    return this.api.Projects.all(Object.assign({
      owned: true
    }, this.pageCfg)).then((res) => {
      let roleList = [];

      if (res && res.length > 0) {
        res.forEach((item) => {
          let role = roleUtil.getProjectRole(item.path, 'owner');
          roleList.push(role);
        });
      }

      return roleList;
    });
  }

  projectMember() {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Projects.js#L7
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/projects.md#list-all-projects
     */
    return this.api.Projects.all(Object.assign({
      membership: true
    }, this.pageCfg)).then((res) => {
      let roleList = [];

      if (res && res.length > 0) {
        res.forEach((item) => {
          let role = roleUtil.getProjectRole(item.path, 'member');
          roleList.push(role);
        });
      }

      return roleList;
    });
  }

  projectMinAccessLevel(level) {
    /**
     * https://github.com/jdalrymple/node-gitlab/blob/3.6.0/src/services/Projects.js#L7
     * https://github.com/gitlabhq/gitlabhq/blob/master/doc/api/projects.md#list-all-projects
     */
    return this.api.Projects.all(Object.assign({
      min_access_level: level
    }, this.pageCfg)).then((res) => {

      let roleList = [];

      if (res && res.length > 0) {
        res.forEach((item) => {
          let role = roleUtil.getProjectRole(item.path, 'level', level);
          roleList.push(role);
        });
      }

      return roleList;
    });
  }

}

module.exports = Roles;