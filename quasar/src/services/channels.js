// My channels and the other users from the database (use cases 2, 5, 9)
import { api } from '@/services/api.js'
import { channels, users } from '@/data/mock.js'

// Replaces the local lists, the commands still change only this local copy
export async function loadChannels() {
  const [myChannels, otherUsers] = await Promise.all([
    api('/channels'),
    api('/users')
  ])
  channels.splice(0, channels.length, ...myChannels)
  users.splice(0, users.length, ...otherUsers)
}
