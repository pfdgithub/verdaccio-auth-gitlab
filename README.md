# verdaccio-auth-gitlab

Verdaccio authentication plugin by gitlab personal access tokens.

## Installation

``` bash
npm install --global verdaccio-auth-gitlab
```

## Configure

config.yaml  
```yaml
auth:
  auth-gitlab:
    # Gitlab server (default: https://gitlab.com)
    url: https://gitlab.com
    # Check gitlab Role
    role:
      # Gitlab user role (default: true)
      # Warning: Set to false will disable all role
      user: true
      # Gitlab group role (default: false)
      # Warning: Set to true will cause performance degradation
      group: false
      # Gitlab project role (default: false)
      # Warning: Set to true will cause performance degradation
      project: false
    # Cache gitlab user
    cache:
      # Max cache count (default: 1000)
      # Warning: Set to 0 will cause performance degradation
      maxCount: 1000
      # Max cache second (default: 300)
      # Warning: Set to 0 will cause performance degradation
      maxSecond: 300
```

## Role

config.yaml  
```
packages:
  '@scope/*':
    access: $gitlab:user
    publish: $gitlab:user:xxx
```

```$gitlab:user``` All users  
```$gitlab:user:xxx``` The user whose username is ```xxx```  
```$gitlab:group:xxx:owner``` Owner of the group which path is ```xxx```  
```$gitlab:group:xxx:member``` Member of the group which path is ```xxx```  
```$gitlab:project:xxx:owner``` Owner of the project which path is ```xxx```  
```$gitlab:project:xxx:member``` Member of the project which path is ```xxx```  

The following placeholder is allowed in ```xxx```  
```[pkgScope]``` package scope  
```[pkgName]``` package name (without scope)  

e.g.  
Access or publish a package ```@scope/name```:  
```$gitlab:group:[pkgScope]:owner``` Owner of the group which path is ```scope```  
```$gitlab:project:[pkgName]:owner``` Owner of the project which path is ```name```  

## License

This project is licensed under MIT.
