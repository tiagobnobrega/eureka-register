const {Command, flags} = require('@oclif/command')
const eureka = require('../lib/eureka')

const replacePlaceholders = (str, flags) => {
  return str
  .replace('{HOSTNAME}', flags.hostname)
  .replace('{PORT}', flags.port)
  .replace('{NAME}', flags.name)
}

class RegisterCommand extends Command {
  convertIntArg(v, argName) {
    const asInt = Number.parseInt(v, 10)
    if (Number.isNaN(asInt)) this.error(`Wrong argument type for "${argName}" expected number, found: ${v}`, {exit: true})
    return asInt
  }

  async run() {
    const {flags} = this.parse(RegisterCommand)
    const {
      eurekaHostname,
      eurekaPort,
      eurekaServicePath,
      heartbeatInterval,
      name,
      hostname,
      ip,
      port,
      vipAddr,
      statusPageUrl,
      healthCheckUrl,
      watch,
    } = flags

    const registerOpts = {
      appName: name,
      hostname,
      port: this.convertIntArg(port, 'port'),
      eurekaHostname,
      eurekaPort: this.convertIntArg(eurekaPort, 'eurekaPort'),
      registerWithEureka: true,
      fetchRegistry: true,
      ip,
      statusPageUrl: replacePlaceholders(statusPageUrl, flags),
      healthCheckUrl: replacePlaceholders(healthCheckUrl, flags),
      vipAddr: replacePlaceholders(vipAddr, flags).toUpperCase(),
      eurekaServicePath,
      heartbeatInterval,
    }
    this.log(`Registering in eureka: \n${JSON.stringify(registerOpts, null, 1)}`)
    const instance = await eureka.register(registerOpts)
    this.log('client instance registered in eureka')
    if (watch) {
      this.log('watching instance ... exit process to unregister')
      process.on('SIGINT', () => {
        eureka.deregister(instance)
        this.exit()
      })
      process.on('SIGTERM', () => {
        eureka.deregister(instance)
        this.exit()
      })
    } else {
      this.exit()
    }
  }
}

RegisterCommand.description = `Register an service to an eureka instance
...
Register a single service
`

RegisterCommand.flags = {
  eurekaHostname: flags.string({char: 'o', description: 'eureka instance hostname.', default: 'localhost'}),
  eurekaPort: flags.string({char: 'r', description: 'eureka instance port.', default: '8761'}),
  eurekaServicePath: flags.string({char: 's', description: 'eureka servicePath.', default: '/eureka/apps/'}),
  heartbeatInterval: flags.string({char: 'b', description: 'eureka heartbeat interval in ms.', default: '30000'}),
  name: flags.string({char: 'n', description: 'Service name', required: true}),
  hostname: flags.string({char: 'h', description: 'Service hostname', default: 'localhost'}),
  ip: flags.string({char: 'i', description: 'Service ip.', default: '127.0.0.1'}),
  port: flags.string({char: 'p', description: 'Service port', required: true}),
  vipAddr: flags.string({char: 'v', description: 'Service vip address. Default value is upper cased', default: '{NAME}'}),
  statusPageUrl: flags.string({char: 't', description: 'Service status page url', default: 'http://{HOSTNAME}:{PORT}/actuator/info'}),
  healthCheckUrl: flags.string({char: 'c', description: 'Service health check url', default: 'http://{HOSTNAME}:{PORT}/actuator/health'}),
  watch: flags.boolean({char: 'w', description: 'Watch client and unregister on process exit'}),
}

module.exports = RegisterCommand
