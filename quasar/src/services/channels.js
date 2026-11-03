// My channels and the other users from the database (use cases 2, 5, 9)
import { api } from '@/services/api.js'
import { channels, users } from '@/data/mock.js'

// Replaces the local lists
export async function loadChannels() {
  const [myChannels, otherUsers] = await Promise.all([
    api('/channels'),
    api('/users')
  ])
  channels.splice(0, channels.length, ...myChannels)
  users.splice(0, users.length, ...otherUsers)
}

async function change(method, name, action = '') {
  await api(`/channels/${encodeURIComponent(name)}${action}`, { method })
  await loadChannels()
}

export const acceptInvitation = name => change('POST', name, '/accept')

export const leaveChannel = name => change('POST', name, '/leave')

export const deleteChannel = name => change('DELETE', name)
