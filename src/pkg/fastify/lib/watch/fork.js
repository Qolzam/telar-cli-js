import {runFastify, stop} from '../../start.js'

const {GRACEFUL_SHUT, READY, TIMEOUT} = {
  GRACEFUL_SHUT: 'GRACEFUL SHUTDOWN',
  READY: 'ready',
  TIMEOUT: 5000,
}

let fastify

function exit() {
  if (this) {
    console.log(this.message)
  }

  process.exit(1)
}

process.on('message', (event) => {
  if (event === GRACEFUL_SHUT) {
    const message = '[fastify-cli] process forced end'
    setTimeout(exit.bind({message}), TIMEOUT).unref()
    if (fastify) {
      fastify.close(() => {
        process.exit(0)
      })
    } else {
      process.exit(0)
    }
  }
})

process.on('uncaughtException', (err) => {
  console.log(err)
  const message = '[fastify-cli] app crashed - waiting for file changes before starting...'
  exit.bind({message})()
})

const main = async () => {
  fastify = await runFastify(process.argv.splice(2))
  const type = process.env.childEvent

  process.send({err: null, type})

  try {
    await fastify.ready()
    process.send({type: READY})
  } catch (error) {
    stop(error)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
