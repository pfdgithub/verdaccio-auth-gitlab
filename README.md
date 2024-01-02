**Apologies, due to changes in my work environment, I no longer use Verdaccio and GitLab. Consequently, I am unable to continue maintaining this package. Please feel free to fork and maintain it on your own.**

# verdaccio-auth-gitlab

Verdaccio authentication plugin by gitlab personal access token or oauth token or ci job token.

## Installation

```bash
npm install --global verdaccio-auth-gitlab
```

## Configure

config.yaml  
```yaml
auth:
  auth-gitlab:
    # Gitlab server (default: https://gitlab.com)
    url: https://gitlab.com

    # Gitlab token type (default: personal)
    tokenType: personal # options: personal/oauth/job

    # Use full group path (default: false)
    fullGroupPath: false

    # Use full project path with namespace (default: false)
    fullProjectPath: false

    # Any group list api options (default: null)
    extendGroupOptions: null

    # Any project list api options (default: null)
    extendProjectOptions: null

    # Check gitlab Role
    role:
      # Gitlab user role (default: true)
      # Warning: Set to false will disable all role
      #          Disable user role will make it impossible to check the relevance between username and token
      user: true

      # Gitlab group owner role (default: false)
      # Warning: Set to true will cause performance degradation
      groupOwner: false

      # Gitlab group member role (default: false)
      # Warning: Set to true will cause performance degradation
      groupMember: false

      # Gitlab group minimal access level (default: [])
      # Warning: Set to non-empty array will cause performance degradation
      #          Supported by gitlab 11.2
      groupMinAccessLevel: [] # access level array e.g. [30, 40]

      # Gitlab project owner role (default: false)
      # Warning: Set to true will cause performance degradation
      projectOwner: false

      # Gitlab project member role (default: false)
      # Warning: Set to true will cause performance degradation
      projectMember: false

      # Gitlab project minimal access level (default: [])
      # Warning: Set to non-empty array will cause performance degradation
      #          Supported by gitlab 11.2
      projectMinAccessLevel: [] # access level array e.g. [30, 40]

    # Cache gitlab user
    cache:
      # Max cache count (default: 1000)
      # Warning: Set to 0 will cause performance degradation
      maxCount: 1000

      # Max cache second (default: 300)
      # Warning: Set to 0 will cause performance degradation
      maxSecond: 300

    # Limit the scope of the all function
    page:
      # Number of items to list per page (default: 100)
      # Warning: The maximum value is 100
      perPage: 100
      # Max page number (default: 0)
      # Warning: Set to 0 will get all data
      maxPages: 0
```

## Role

config.yaml  
```yaml
packages:
  '@scope/*':
    access: $gitlab:user
    publish: $gitlab:user:xxx
```

`$gitlab:user` All users  
`$gitlab:user:xxx` The user whose username is `encodeURIComponent(xxx)`  
`$gitlab:group:xxx:owner` Owner of the group which path is `encodeURIComponent(xxx)`  
`$gitlab:group:xxx:member` Member of the group which path is `encodeURIComponent(xxx)`  
`$gitlab:group:xxx:level:40` Maintainer(Master) or owner of the group which path is `encodeURIComponent(xxx)`  
`$gitlab:project:xxx:owner` Owner of the project which path is `encodeURIComponent(xxx)`  
`$gitlab:project:xxx:member` Member of the project which path is `encodeURIComponent(xxx)`  
`$gitlab:project:xxx:level:30` Developer or maintainer(master) or owner of the project which path is `encodeURIComponent(xxx)`  

The following placeholder is allowed in `xxx`  
`[pkgScope]` package scope  
`[pkgName]` package name (without scope)  

e.g.  
Access or publish a package `@scope/name`:  
`$gitlab:group:[pkgScope]:owner` Owner of the group which path is `scope`  
`$gitlab:project:[pkgName]:owner` Owner of the project which path is `name`  

## [Valid access levels](https://docs.gitlab.com/ce/api/members.html)

The access levels are defined in the `Gitlab::Access` module. Currently, these levels are recognized:
```
10 => Guest access
20 => Reporter access
30 => Developer access
40 => Maintainer access
50 => Owner access # Only valid for groups
```

## Use

```bash
npm login --registry=http://xxx

Username: gitlab username
Password: gitlab personal/oauth/job token
```

## License

This project is licensed under MIT.
