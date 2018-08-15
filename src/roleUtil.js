const rolePrefix = '$gitlab';

const getUserRole = (username) => {
  let role = `${rolePrefix}:user`;

  if (typeof (username) === 'string') {
    role = `${role}:${encodeURIComponent(username)}`;
  }

  return role;
};

const getGroupRole = (path, permission, level) => {
  let role = `${rolePrefix}:group:${encodeURIComponent(path)}:${permission}`;

  if (typeof (level) === 'number') {
    role = `${role}:${level}`;
  }

  return role;
};

const getProjectRole = (path, permission, level) => {
  let role = `${rolePrefix}:project:${encodeURIComponent(path)}:${permission}`;

  if (typeof (level) === 'number') {
    role = `${role}:${level}`;
  }

  return role;
};

const isPluginRole = (role) => {
  if (typeof (role) === 'string' && role.startsWith(rolePrefix)) {
    return true;
  }

  return false;
}

const replacePlaceholder = (role, data = {
  pkgScope: '',
  pkgName: ''
}) => {
  let newRole = role;

  if (typeof (role) === 'string' && typeof (data) === 'object') {
    for (let key in data) {
      let val = data[key];
      let reg = new RegExp(`\\[${key}\\]`, 'g');

      newRole = newRole.replace(reg, val);
    }
  }

  return newRole;
};

module.exports = {
  getUserRole,
  getGroupRole,
  getProjectRole,
  isPluginRole,
  replacePlaceholder
};