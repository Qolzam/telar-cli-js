import * as express from 'express'
const app = express()
import * as http from 'node:http'
import * as path from 'node:path'
import {Server} from 'socket.io'
import * as fs from 'fs-extra'

const server = http.createServer(app)

const publicPath =  path.join(__dirname, '../../../public')
const assetsPath =  path.join(publicPath, 'assets')

// initalize web socket server
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

const uiemit = (action: any) => {
  io.sockets.emit('dispatch', action)
}

const getServer = (dispatcher: (action: any) => void, onConnect: ()=> void):  http.Server => {
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

    const solutionTitle = 'Telar Social Engine'
    const solutionDesc = 'Telar Social Engine is a scalable cloud native social network. Whatever your creative idea or unique bussiness model, you can build it by Telar running on any public or private cloud'
    let content = fileData.toString()
    content = content.replace(/__TELAR_INIT_STATE/g, `
    {
      common: {
        solution: {
          title: '${solutionTitle}',
          desc: '${solutionDesc}',
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
