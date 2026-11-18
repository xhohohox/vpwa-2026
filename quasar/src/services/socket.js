// One websocket connection to the server. The server only pushes news over it
// (backend/app/services/push.ts), all requests go over HTTP (services/api.js).
// https://github.com/RomainLanz/socket
import { reactive } from 'vue'
import { Socket } from '@rlanz/socket/client'
import { SERVER_URL, getToken } from '@/services/api.js'
import { loadChannels } from '@/services/channels.js'
import { receiveMessage } from '@/services/messages.js'
import { currentUser } from '@/data/mock.js'

let socket = null

export const connection = reactive({ count: 0 })

function refresh() {
  if (currentUser.status !== 'offline') loadChannels().catch(() => {})
}

export async function connectSocket() {
  disconnectSocket()

  const token = encodeURIComponent(getToken())
  socket = new Socket({ url: `${SERVER_URL}?token=${token}` })

  socket.onStateChange(state => {
    if (state !== 'connected') return
    connection.count++
    if (connection.count > 1) refresh()
  })

  const mine = socket.channel(`users/${currentUser.id}`)
  mine.listen('message', receiveMessage)

  const updates = socket.channel('updates')
  updates.listen('refresh', refresh)

  await socket.connect()
  await Promise.all([mine.subscribe(), updates.subscribe()])
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
