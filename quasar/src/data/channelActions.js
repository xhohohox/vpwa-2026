// Channel actions shared by the channel list (buttons) and the commands
import { currentUser, channels, otherChannels, messages } from '@/data/mock.js'

// The admin of a channel is the user who created it
export const isOwner = channel => channel.owner === currentUser.nickName

// channelName is unique among all existing channels, not only mine
export const channelExists = name =>
  [...channels, ...otherChannels].some(channel => channel.name === name)

export function createChannel(name, isPrivate) {
  channels.push({
    name,
    isPrivate,
    owner: currentUser.nickName,
    invited: false,
    members: [currentUser.nickName],
    invites: [],
    banned: [],
    kickVotes: {}
  })
}

export function acceptInvitation(channel) {
  channel.invited = false
  channel.invites = channel.invites.filter(
    nick => nick !== currentUser.nickName
  )
  channel.members.push(currentUser.nickName)
}

// Leaving: the channel disappears from my list, but still exists for the others.
// Deleting (also when the admin leaves): the channel and its messages are gone.
export function removeChannel(name, deleteChannel) {
  const index = channels.findIndex(channel => channel.name === name)
  const [channel] = channels.splice(index, 1)

  if (deleteChannel) {
    const kept = messages.filter(message => message.channel !== name)
    messages.splice(0, messages.length, ...kept)
    return
  }

  const me = currentUser.nickName
  channel.invited = false
  channel.members = channel.members.filter(nick => nick !== me)
  channel.invites = channel.invites.filter(nick => nick !== me)
  otherChannels.push(channel)
}

// Where to go when the open channel disappeared
export function nextChannelPath() {
  const next = channels.find(channel => !channel.invited)
  return next ? `/channels/${next.name}` : '/'
}