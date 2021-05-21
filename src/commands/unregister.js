const {Command, flags} = require('@oclif/command')
const eureka = require('../lib/eureka')

const replacePlaceholders = (str, flags) => {
  return str
  .replace('{HOSTNAME}', flags.hostname)
  .replace('{PORT}', flags.port)
  .replace('{NAME}', flags.name)
}

class UnregisterCommand extends Command {
  convertIntArg(v, argName) {
    const asInt = Number.parseInt(v, 10)
    if (Number.isNaN(asInt)) this.error(`Wrong argument type for "${argName}" expected number, found: ${v}`, {exit: true})
    return asInt
  }

  async run() {
    const {flags} = this.parse(UnregisterCommand)
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
    this.log(`Unregistering in eureka: \n${JSON.stringify(registerOpts, null, 1)}`)
    await eureka.register(registerOpts)
    await eureka.deregister()
    this.log('Done!')
    this.exit()
  }
}

UnregisterCommand.description = `Unregister an service to an eureka instance
...
Unregister a single service
`

UnregisterCommand.flags = {
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
}

module.exports = UnregisterCommand
