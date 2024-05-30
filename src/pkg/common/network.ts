import * as portfinder from 'portfinder'

export const canUsePort = async (port: number): Promise<boolean> => {
  const availablePort = await portfinder.getPortPromise({port, stopPort: port + 1})
  console.log(port, availablePort)
  return availablePort === port
}
