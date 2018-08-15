const Gitlab = require('gitlab/dist/es5').default;
const roleUtil = require('./roleUtil');

class Roles {
  classProperties() {
    this.logger = null;
    this.api = null;

    this.url = '';
    this.token = '';
  }

  constructor(logger, url, token) {
    this.classProperties();

    this.logger = logger;
    this.api = new Gitlab({
      url: url,
      token: token
    });

    this.url = url;
    this.token = token;
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
    return this.api.Groups.all({
      owned: true
    }).then((res) => {
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
    return this.api.Groups.all({
      all_available: false
    }).then((res) => {
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
    return this.api.Groups.all({
      min_access_level: level
    }).then((res) => {
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
    return this.api.Projects.all({
      owned: true
    }).then((res) => {
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
    return this.api.Projects.all({
      membership: true
    }).then((res) => {
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
    return this.api.Projects.all({
      min_access_level: level
    }).then((res) => {
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