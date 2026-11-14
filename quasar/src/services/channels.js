// My channels and the other users from the database (use cases 2, 4, 5, 9)
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

const channelPath = name => `/channels/${encodeURIComponent(name)}`

// The server saves the change, then my list is loaded again
async function change(method, path, body) {
  const result = await api(path, { method, body })
  await loadChannels()
  return result
}

// /join channelName [private], the result says "created", "joined" or "member"
export const joinChannel = (name, isPrivate = false) =>
  change('POST', '/channels', { name, private: isPrivate })

export const acceptInvitation = name =>
  change('POST', channelPath(name) + '/accept')

// /cancel, also declines an invitation, the admin leaving deletes the channel
export const leaveChannel = name => change('POST', channelPath(name) + '/leave')

// /quit
export const deleteChannel = name => change('DELETE', channelPath(name))

// /invite, /revoke, /kick and taking an invitation back
export const inviteUser = (name, nickName) =>
  change('POST', channelPath(name) + '/invite', { nickName })

export const uninviteUser = (name, nickName) =>
  change('POST', channelPath(name) + '/uninvite', { nickName })

export const revokeUser = (name, nickName) =>
  change('POST', channelPath(name) + '/revoke', { nickName })

export const kickUser = (name, nickName) =>
  change('POST', channelPath(name) + '/kick', { nickName })
