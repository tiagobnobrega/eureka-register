eureka-register
===============

CLI for registering eureka services manually

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/eureka-register.svg)](https://npmjs.org/package/eureka-register)
[![Downloads/week](https://img.shields.io/npm/dw/eureka-register.svg)](https://npmjs.org/package/eureka-register)
[![License](https://img.shields.io/npm/l/eureka-register.svg)](https://github.com/tiagobnobrega/eureka-register/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g eureka-register
$ eureka-register COMMAND
running command...
$ eureka-register (-v|--version|version)
eureka-register/0.0.0 linux-x64 node-v12.16.1
$ eureka-register --help [COMMAND]
USAGE
  $ eureka-register COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`eureka-register help [COMMAND]`](#eureka-register-help-command)
* [`eureka-register register`](#eureka-register-register)
* [`eureka-register register-many`](#eureka-register-register-many)
* [`eureka-register unregister`](#eureka-register-unregister)

## `eureka-register help [COMMAND]`

display help for eureka-register

```
USAGE
  $ eureka-register help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `eureka-register register`

Register an service to an eureka instance

```
USAGE
  $ eureka-register register

OPTIONS
  -b, --heartbeatInterval=heartbeatInterval  [default: 30000] eureka heartbeat interval in ms.

  -c, --healthCheckUrl=healthCheckUrl        [default: http://{HOSTNAME}:{PORT}/actuator/health] Service health check
                                             url

  -h, --hostname=hostname                    [default: localhost] Service hostname

  -i, --ip=ip                                [default: 127.0.0.1] Service ip.

  -n, --name=name                            (required) Service name

  -o, --eurekaHostname=eurekaHostname        [default: localhost] eureka instance hostname.

  -p, --port=port                            (required) Service port

  -r, --eurekaPort=eurekaPort                [default: 8761] eureka instance port.

  -s, --eurekaServicePath=eurekaServicePath  [default: /eureka/apps/] eureka servicePath.

  -t, --statusPageUrl=statusPageUrl          [default: http://{HOSTNAME}:{PORT}/actuator/info] Service status page url

  -v, --vipAddr=vipAddr                      [default: {NAME}] Service vip address. Default value is upper cased

DESCRIPTION
  ...
  Register a single service
```

_See code: [src/commands/register.js](https://github.com/tiagobnobrega/eureka-register/blob/v0.0.0/src/commands/register.js)_

## `eureka-register register-many`

Register many services to an single eureka instance

```
USAGE
  $ eureka-register register-many

OPTIONS
  -c, --configFile=configFile  [default: ./eureka-registry.json] path to configuration file
  -i, --include=include        Comma separated regex pattern to match against service names to INCLUDE from command
  -v, --validateOnly           Enable validation mode. Only config file is validated
  -x, --exclude=exclude        Comma separated regex pattern to match against service names to EXCLUDE from command

DESCRIPTION
  ...
  Configurations must be defined in a config file in JSON format as such:
  {
     "eureka": {
       "hostname": "localhost",
       "port": 8761,
       "statusPageUrlPath": "",
       "healthCheckUrlPath": "",
       "servicePath": "/eureka/apps/",
       "heartbeatInterval": 30000
     },
     "apps": [
       {
         "name": "nomeDoApp",
         "ip": "127.0.0.1",
         "hostname": "localhost",
         "port": 80,
         "vipAddress": "MY-APP-VIP-ADDR",
         "statusPageUrl": "http://localhost:80/status",
         "healthCheckUrl": "http://localhost:80/health"
       }
       ]
     }
  }

  Properties descriptions:

  eureka.hostname:
     (string) [Default localhost]
      Eureka instance hostname
  eureka.port:
     (number) [Default 8761]
     Eureka instance port.
  eureka.statusPageUrlPath:
     (string) [Default see below]
     Default status page url to be used if app record does no set one.
     It will be concatenated as: "http://{APP_HOSTNAME}:{APP_PORT}{statusPageUrlPath}"
  eureka.healthCheckUrlPath:
     (string) [Default see below]
     Default health check url to be used if app record does no set one.
     it will be concatenated as: "http://{APP_HOSTNAME}:{APP_PORT}{statusPageUrlPath}"
  eureka.servicePath:
     (string) [Default: /eureka/apps/]
     Eureka instance service path.
  eureka.heartbeatInterval:
     (number) [Default: 30000]
     Client heartbeat interval in milliseconds.

  apps:
     (Array) [Required]
     Array of app config objects
  apps[n].name:
     (string) [Required]
     App name.
  apps[n].ip:
     (string) [Default: 127.0.0.1]
     App ip address.
  apps[n].port:
     (number) [Required]
     App port number.
  apps[n].hostname:
     (number) [Default localhost]
     App hostname.
  apps[n].vipAddress:
     (string) [Default: {apps[n].name} in uppercase of this record ex: MY-APP, MYAPP]
     App ip address.
  apps[n].statusPageUrl:
     (string) [Default: http://{HOSTNAME}:{PORT}/actuator/info]
     App status page url.
  apps[n].healthCheckUrl:
     (string) [Default: http://{HOSTNAME}:{PORT}/actuator/health]
     App status  health check url.
```

_See code: [src/commands/register-many.js](https://github.com/tiagobnobrega/eureka-register/blob/v0.0.0/src/commands/register-many.js)_

## `eureka-register unregister`

Unregister an service to an eureka instance

```
USAGE
  $ eureka-register unregister

OPTIONS
  -b, --heartbeatInterval=heartbeatInterval  [default: 30000] eureka heartbeat interval in ms.

  -c, --healthCheckUrl=healthCheckUrl        [default: http://{HOSTNAME}:{PORT}/actuator/health] Service health check
                                             url

  -h, --hostname=hostname                    [default: localhost] Service hostname

  -i, --ip=ip                                [default: 127.0.0.1] Service ip.

  -n, --name=name                            (required) Service name

  -o, --eurekaHostname=eurekaHostname        [default: localhost] eureka instance hostname.

  -p, --port=port                            (required) Service port

  -r, --eurekaPort=eurekaPort                [default: 8761] eureka instance port.

  -s, --eurekaServicePath=eurekaServicePath  [default: /eureka/apps/] eureka servicePath.

  -t, --statusPageUrl=statusPageUrl          [default: http://{HOSTNAME}:{PORT}/actuator/info] Service status page url

  -v, --vipAddr=vipAddr                      [default: {NAME}] Service vip address. Default value is upper cased

DESCRIPTION
  ...
  Unregister a single service
```

_See code: [src/commands/unregister.js](https://github.com/tiagobnobrega/eureka-register/blob/v0.0.0/src/commands/unregister.js)_
<!-- commandsstop -->
