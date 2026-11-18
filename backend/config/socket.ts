import app from '@adonisjs/core/services/app'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@rlanz/socket'
import User from '#models/user'

/**
 * Websockets (https://github.com/RomainLanz/socket). The server uses them only
 * to push news to the clients, see app/channels.
 */
const socketConfig = defineConfig({
  websocket: {
    /**
     * WebSocket endpoint (ws://localhost:3333/socket)
     */
    path: '/socket',

    origin: app.inDev ? true : [],

    async authenticate({ httpContext }) {
      const token = httpContext.request.input('token')
      if (typeof token !== 'string') return null

      const accessToken = await User.accessTokens.verify(new Secret(token))
      return accessToken ? User.find(accessToken.tokenableId) : null
    },
  },
})

export default socketConfig
