import express from 'express'
const app = express()
import * as fs from 'fs-extra'
import * as http from 'node:http'
import * as path from 'node:path'
import {fileURLToPath} from 'node:url'
import {Server} from 'socket.io'

import {AppInfo} from '../common/types.js'

const server = http.createServer(app)
const __dirname = fileURLToPath(import.meta.url)
const publicPath =  path.join(__dirname, '../../../public')
const assetsPath =  path.join(publicPath, 'assets')

// initalize web socket server
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

const uiemit = (action: unknown) => {
  io.sockets.emit('dispatch', action)
}

const getServer = (appInfo:AppInfo, dispatcher: (action: unknown) => void, onConnect: ()=> void):  http.Server => {
// Serve the static files from the React app
  app.use(express.static(assetsPath))

  // Handles any requests that don't match the ones above
  app.get('*', async (req, res) => {
    let fileData
    try {
      fileData = await fs.readFile(path.join(publicPath, 'index.html'))
    } catch (error) {
      return res
      .status(500)
      .send(error)
    }

    let content = fileData.toString()
    content = content.replaceAll('__TELAR_INIT_STATE', `
    {
      common: {
        solution: {
          title: '${appInfo.title}',
          desc: '${appInfo.description}',
          links: [
            {
              label: 'Frontend'
            },
            {
              label: 'Backend'
            },
            {
              label: 'Websocket'
            }
          ]
        }
      }
    }
    
    `)
    res.set('Content-Type', 'text/html').status(200).send(content)
  })

  io.on('connection', socket => {
    console.log('a user connected')
    onConnect()
    socket.on('dispatch', msg => {
      console.log('Action from UI: ' + JSON.stringify(msg))
      dispatcher(msg)
    })
  })
  return server
}

export {getServer, uiemit}
