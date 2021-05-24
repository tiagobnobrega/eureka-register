/* eslint-disable no-process-exit */
const path = require('path')
const fs = require('fs')
const {Command, flags} = require('@oclif/command')
const eureka = require('../lib/eureka')

class RegisterCommand extends Command {
  async parseConfigFile(configFile) {
    const resolvedFilePath = path.resolve(process.cwd(), configFile)
    this.log(`reading config at ${resolvedFilePath}`)
    if (!fs.existsSync(resolvedFilePath)) this.error(`Could not find file at: ${resolvedFilePath}`)
    let rawData = fs.readFileSync(resolvedFilePath)
    return JSON.parse(rawData)
  }

  validateConfig(config) {
    // check for required parameters
    const {eureka: eurekaCfg, apps} = config
    const configErrors = []
    if (!eurekaCfg) configErrors.push('Required property "eureka" not found at root level')
    if (eurekaCfg.port && !Number.isFinite(eurekaCfg.port)) configErrors.push('Property "eureka.port" must be a number')
    if (eurekaCfg.heartbeatInterval && !Number.isFinite(eurekaCfg.heartbeatInterval)) configErrors.push('Property "eureka.heartbeatInterval" must be a number')
    if (!apps) configErrors.push('Required property "apps" not found at root level')
    if (apps.length === 0) configErrors.push('Property "apps" does not contain any record')

    apps.forEach((app, index) => {
      if (!app.name) configErrors.push(`Required property "name" not found  for app index ${index}`)
      if (!app.hostname) configErrors.push(`Required property "hostname" not found  for app index ${index}, name ${app.name || 'unknown'}`)
      if (!app.port) configErrors.push(`Required property "name" not found for app: index ${index}, name ${app.name || 'unknown'}`)
      if (!Number.isFinite(app.port)) configErrors.push(`Property "port" must be a number for app: index ${index}, name ${app.name || 'unknown'}`)
    })

    if (configErrors.length > 0) {
      this.error('Invalid config file. Following errors found:\n' + configErrors.join('\n'))
    } else {
      this.log('Configuration file is valid.')
    }
  }

  filterApps(apps, include, exclude) {
    if (include && exclude)
      this.error('Cannot use include and exclude flags together')
    if (include) {
      const includeRegex = new RegExp(include)
      return apps.filter(app => includeRegex.test(app.name))
    }
    if (exclude) {
      const excludeRegex = new RegExp(include)
      return apps.filter(app => !excludeRegex.test(app.name))
    }
    return apps
  }

  async registerApp(eurekaConfig, app) {
    const appHostname = app.hostname || 'localhost'
    const statusPageUrl = app.statusPageUrl || `http://${appHostname}:${app.port}${eurekaConfig.statusPageUrlPath ? eurekaConfig.statusPageUrlPath : '/actuator/status'}`
    const healthCheckUrl = app.statusPageUrl ||  `http://${appHostname}:${app.port}${eurekaConfig.healthCheckUrlPath ? eurekaConfig.healthCheckUrlPath : '/actuator/health'}`
    const vipAddr = app.vipAddr || app.name.toUpperCase()
    const registerOpts = {
      appName: app.name,
      hostname: app.hostname,
      port: app.port,
      eurekaHostname: eurekaConfig.hostname || 'localhost',
      eurekaPort: eurekaConfig.port || 8761,
      ip: app.ip || '127.0.0.1',
      statusPageUrl,
      healthCheckUrl,
      vipAddr,
      eurekaServicePath: eurekaConfig.servicePath || '/eureka/apps/',
      heartbeatInterval: eurekaConfig.heartbeatInterval || 30000,
      registerWithEureka: true,
      fetchRegistry: true,
    }
    this.log(`registering app: ${JSON.stringify({registerOpts}, null, 1)}`)
    const instance = await eureka.register(registerOpts)
    this.log(`registered app: ${JSON.stringify({name: app.name, vipAddr, hostname: appHostname, port: app.port})}`)
    return instance
  }

  async run() {
    try {
      const {flags} = this.parse(RegisterCommand)
      const {
        configFile,
        include,
        exclude,
        validateOnly,
        watch,
      } = flags

      const config = await this.parseConfigFile(configFile, include, exclude)
      this.validateConfig(config)

      if (validateOnly) {
        this.exit(0)
      }
      const filteredApps = this.filterApps(config.apps, include, exclude)
      const eurekaConfig = config.eureka

      const clientInstances = await Promise.all(filteredApps.map(async app => this.registerApp(eurekaConfig, app)))

      const unregisterInstances = () => {
        this.log('\nunregistering apps...')
        return Promise.all(
          clientInstances.map(instance => eureka.deregister(instance))
        )
      }

      if (watch) {
        this.log('watching app ... exit process to unregister')
        process.on('SIGINT', () => {
          unregisterInstances().then(() => process.exit()).catch(error => {
            this.error('(SIGINT) Error unregistering instances', error)
            process.exit(1)
          })
        })
        process.on('SIGTERM', () => {
          unregisterInstances().then(() => process.exit()).catch(error => {
            this.log('(SIGTERM) Error unregistering instances', error)
            process.exit(1)
          })
        })
      } else {
        this.log('Done registering apps !!')
        this.exit()
      }
    } catch (error) {
      this.log('Error running register-many:', error)
      return super.catch(error)
    }
  }
}

RegisterCommand.description = `Register many services to an single eureka instance
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
`

RegisterCommand.flags = {
  configFile: flags.string({char: 'c', description: 'path to configuration file', default: './eureka-registry.json'}),
  exclude: flags.string({char: 'x', description: 'Comma separated regex pattern to match against service names to EXCLUDE from command'}),
  include: flags.string({char: 'i', description: 'Comma separated regex pattern to match against service names to INCLUDE from command'}),
  validateOnly: flags.boolean({char: 'v', description: 'Enable validation mode. Only config file is validated'}),
  watch: flags.boolean({char: 'w', description: 'Watch clients and unregister on process exit'}),
}

module.exports = RegisterCommand
