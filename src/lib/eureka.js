const {promisify} = require('util')
const {Eureka} = require('eureka-js-client')

let client = null

const register = ({
  appName,
  hostname,
  port,
  eurekaHostname,
  eurekaPort = 8761,
  registerWithEureka = true,
  fetchRegistry = true,
  statusPageUrl,
  healthCheckUrl,
  ip,
  vipAddr,
  heartbeatInterval = 30000,
  eurekaServicePath = '/eureka/apps/',
}) => (
  new Promise((resolve, reject) => {
    const APP_NAME              = appName
    const IP                    = ip
    const HOSTNAME              = hostname
    const PORT                  = port
    const EUREKA_HOST           = eurekaHostname
    const EUREKA_PORT           = eurekaPort
    const EUREKA_REGISTER       = registerWithEureka
    const EUREKA_FETCH_REGISTRY = fetchRegistry

    const eureka = new Eureka({
      instance: {
        app: APP_NAME,
        hostName: IP,
        instanceId: `${HOSTNAME}:${PORT}`,
        ipAddr: IP,
        vipAddress: vipAddr || `${HOSTNAME.toUpperCase()}`,
        statusPageUrl: statusPageUrl || `http://${HOSTNAME}:${PORT}/actuator/info`,
        healthCheckUrl: healthCheckUrl || `http://${HOSTNAME}:${PORT}/actuator/health`,
        port: {
          $: PORT,
          '@enabled': true,
        },
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
        registerWithEureka: EUREKA_REGISTER,
        fetchRegistry: EUREKA_FETCH_REGISTRY,
      },
      eureka: {
        host: EUREKA_HOST,
        port: EUREKA_PORT,
        servicePath: eurekaServicePath,
        heartbeatInterval,
      },
    })

    eureka.stop = promisify(eureka.stop)

    // logger.info('Eureka registry starting...')
    eureka.start(err => {
      if (err) {
        // logger.error('Eureka start error', err)
        return reject(err)
      }
      client = eureka
      resolve(eureka)
    })
  })
)

const deregister = async () => {
  try {
    if (client) {
      // logger.info('Eureka deregister...')
      await client.stop()
      client = null

      return true
    }

    return null
  } catch (error) {
    throw error
  }
}

const getInstancesByAppId = appId => client.getInstancesByAppId(appId)

const getInstancesByVipAddress = vipAddress => client.getInstancesByVipAddress(vipAddress)

module.exports = {
  register,
  deregister,
  getInstancesByAppId,
  getInstancesByVipAddress,
  client: () => client,
}
