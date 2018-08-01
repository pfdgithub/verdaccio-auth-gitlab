const rolePrefix = '$gitlab';

const getUserRole = (username) => {
  if (typeof (username) === 'string') {
    return `${rolePrefix}:user:${encodeURIComponent(username)}`;
  }
  else {
    return `${rolePrefix}:user`;
  }
};

const getGroupRole = (path, permission = 'owner') => {
  if (typeof (path) === 'string'
    && typeof (permission) === 'string') {
    return `${rolePrefix}:group:${encodeURIComponent(path)}:${encodeURIComponent(permission)}`;
  }
};

const getProjectRole = (path, permission = 'owner') => {
  if (typeof (path) === 'string'
    && typeof (permission) === 'string') {
    return `${rolePrefix}:project:${encodeURIComponent(path)}:${encodeURIComponent(permission)}`;
  }
};

const isPluginRole = (role) => {
  if (typeof (role) === 'string'
    && role.startsWith(rolePrefix)) {
    return true;
  }

  return false;
}

const replacePlaceholder = (role, data = {
  pkgScope: '',
  pkgName: ''
}) => {
  let newRole = role;

  if (typeof (role) === 'string'
    && typeof (data) === 'object') {
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