/* eslint-disable no-console */
const k8s = require('@kubernetes/client-node')
const net = require('net')
const kc = new k8s.KubeConfig()
const {promisify} = require('util')
kc.loadFromDefault()

const forward = new k8s.PortForward(kc)
const runningServers = []

//kub -n gsg-hml get pod insurance-compensation-service-77cbcb648b-w85nn --template='{{(index (index .spec.containers 0).ports 0).containerPort}}{{"\n"}}'

// This simple server just forwards traffic from itself to a service running in kubernetes
// -> localhost:8080 -> port-forward-tunnel -> kubernetes-pod
// This is basically equivalent to 'kubectl port-forward ...' but in Javascript.
const kubeForward = async ({namespace = 'default', podName = '', portMap}) => {
  Object.entries(portMap).forEach(([localPortStr, targetPortStr]) => {
    const localPort = Number.parseInt(localPortStr, 10)
    if (!Number.isFinite(localPort)) throw new Error(`Invalid local port number to forward. Expected number, found: ${localPortStr}.`)
    const targetPort = Number.parseInt(targetPortStr.toString(), 10)
    if (!Number.isFinite(targetPort)) throw new Error(`Invalid target number to forward. Expected number, found: ${targetPortStr}.`)

    const server = net.createServer(socket => {
      forward.portForward(namespace, podName, [targetPort], socket, null, socket)
    })

    server.listen(localPort, '127.0.0.1')
    runningServers.push(server)
  }
  )
}

const forwardShutdown = async type => {
  try {
    console.log(`Receive ${type} signal. `)
    const closeServersPromises = runningServers.map(async server => {
      try {
        await promisify(server.close)()
      } catch (error) {
        console.warn('Error closing server:', error)
      }
    })
    await Promise.all(closeServersPromises)
    console.warn('Graceful EXIT')
  } catch (error) {
    console.error(error)
  }
}
module.exports = {
  kubeForward,
  forwardShutdown,
}
