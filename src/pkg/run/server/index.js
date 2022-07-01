const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const defaultMaxSize = '100kb' // body-parser default

const jsonLimit = process.env.MAX_JSON_SIZE || defaultMaxSize

module.exports = async function (fastify, options) {
  for (const method of ['DELETE', 'GET', 'PATCH', 'POST', 'PUT', 'OPTIONS'])  fastify.route({
    method,
    url: '*',
    handler: function (request, reply) {
      reply.send()
    },
  })

  // [micro-routers]
  // router.all('/micro-name', (req, res) => {
  //   require('/Users/project/path/handler.js')(req, res)
  // })

  router.use('*', (req, res) => {
    res.status(404)
    res.json({msg: 'not found', req: req.originalUrl})
  })

  fastify.register(require('@fastify/express'))
  .after(() => {
    fastify.use(bodyParser.text({type: 'text/*'}))
    fastify.use(bodyParser.json({limit: jsonLimit}))
    fastify.use(bodyParser.urlencoded({extended: true}))
    fastify.express.disabled('x-powered-by')
    fastify.use(cookieParser())
    fastify.use(router)
  })
}
