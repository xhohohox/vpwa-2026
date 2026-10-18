// Channel management logic for /commands
import { channels, messages, users } from '@/data/mock.js'

// half of the members +1 votes are needed for a valid vote kick
export function kickVotesRequired(channel) {
  return Math.floor(channel.members.length / 2) + 1
}

function findChannel(channelName) {
  const channel = channels.find(channel => channel.name === channelName)
  if (!channel) throw new Error(`Channel #${channelName} does not exist`)
  return channel
}

function findUser(nickName) {
  if (!users.includes(nickName))
    throw new Error(`User ${nickName} does not exist`)
  return nickName
}

function isOwner(channel, nickName) {
  return channel.owner === nickName
}

// unban by admin /invite.
function ban(channel, nickName) {
  if (!channel.banned.includes(nickName)) channel.banned.push(nickName)
  channel.members = channel.members.filter(nick => nick !== nickName)
  channel.invited = channel.invited.filter(([nick]) => nick !== nickName)
  delete channel.kickVotes[nickName]
}

// /join channelName [private]
// Creates the channel when it does not exist yet (the creator becomes the
// admin).
export function joinChannel(nickName, channelName, { isPrivate = false } = {}) {
  if (!channelName) throw new Error('Channel name is required')

  let channel = channels.find(channel => channel.name === channelName)

  if (!channel) {
    channel = {
      name: channelName,
      isPrivate,
      owner: nickName,
      invited: [],
      members: [nickName],
      banned: [],
      kickVotes: {}
    }
    channels.push(channel)
    return channel
  }

  if (isPrivate) throw new Error(`Channel #${channelName} already exists`)
  if (channel.banned.includes(nickName)) {
    throw new Error(`You are banned from #${channelName}`)
  }
  if (
    channel.isPrivate &&
    nickName !== channel.owner &&
    !channel.members.includes(nickName) &&
    !channel.invited.some(([nick]) => nick === nickName)
  ) {
    throw new Error(`#${channelName} is private, you need an invitation`)
  }

  if (!channel.members.includes(nickName)) {
    channel.members.push(nickName)
    channel.invited = channel.invited.filter(([nick]) => nick !== nickName)
  }
  return channel
}

// A member leaves on their own; the admin leaving closes the channel
export function leaveChannel(nickName, channelName) {
  const channel = findChannel(channelName)
  if (isOwner(channel, nickName)) return quitChannel(nickName, channelName)

  channel.members = channel.members.filter(nick => nick !== nickName)
  channel.invited = channel.invited.filter(([nick]) => nick !== nickName)
  return channel
}

// /invite nick
export function invite(nickName, channelName, targetName) {
  const channel = findChannel(channelName)
  findUser(targetName)

  if (!channel.members.includes(nickName)) {
    throw new Error(`You are not a member of #${channelName}`)
  }
  if (channel.isPrivate && !isOwner(channel, nickName)) {
    throw new Error('Only the admin of a private channel can invite')
  }
  if (channel.members.includes(targetName)) {
    throw new Error(`${targetName} is already a member of #${channelName}`)
  }

  if (channel.banned.includes(targetName)) {
    if (!isOwner(channel, nickName)) {
      throw new Error(`${targetName} is banned from #${channelName}`)
    }
    channel.banned = channel.banned.filter(nick => nick !== targetName)
  }

  if (!channel.invited.some(([nick]) => nick === targetName)) {
    channel.invited.push([targetName, nickName])
  }
  return channel
}

// /revoke nickName
// Only the admin can take away access (invitation or membership)
export function revoke(nickName, channelName, targetName) {
  const channel = findChannel(channelName)
  findUser(targetName)

  if (!isOwner(channel, nickName)) {
    throw new Error('Only the admin can revoke access to the channel')
  }
  if (targetName === channel.owner) {
    throw new Error('The admin of the channel cannot be removed')
  }

  channel.members = channel.members.filter(nick => nick !== targetName)
  channel.invited = channel.invited.filter(([nick]) => nick !== targetName)
  return channel
}

// the member who invited someone (or always the admin) takes the invite back
export function uninvite(nickName, channelName, targetName) {
  const channel = findChannel(channelName)
  findUser(targetName)

  const entry = channel.invited.find(([nick]) => nick === targetName)
  if (!entry) throw new Error(`${targetName} has no pending invitation`)
  if (nickName !== entry[1] && !isOwner(channel, nickName)) {
    throw new Error('Only the admin or the member who invited can uninvite')
  }

  channel.invited = channel.invited.filter(([nick]) => nick !== targetName)
  return channel
}

// /kick nickName
export function kick(nickName, channelName, targetName) {
  const channel = findChannel(channelName)
  findUser(targetName)

  if (nickName === targetName) throw new Error('You cannot kick yourself')
  if (targetName === channel.owner) {
    throw new Error('The admin of the channel cannot be kicked')
  }
  if (!channel.members.includes(nickName)) {
    throw new Error(`You are not a member of #${channelName}`)
  }
  if (channel.banned.includes(targetName)) {
    throw new Error(`${targetName} is already banned from #${channelName}`)
  }

  if (isOwner(channel, nickName)) {
    ban(channel, targetName)
    return channel
  }

  if (channel.isPrivate) {
    throw new Error('Only the admin can kick from a private channel')
  }

  const votes = channel.kickVotes[targetName] ?? []

  // pressing kick again takes the vote back
  if (votes.includes(nickName)) {
    const rest = votes.filter(vote => vote !== nickName)
    if (rest.length) channel.kickVotes[targetName] = rest
    else delete channel.kickVotes[targetName]
    return channel
  }

  channel.kickVotes[targetName] = [...votes, nickName]
  if (channel.kickVotes[targetName].length >= kickVotesRequired(channel)) {
    ban(channel, targetName)
  }
  return channel
}

// /quit
export function quitChannel(nickName, channelName) {
  const channel = findChannel(channelName)

  if (!isOwner(channel, nickName)) {
    throw new Error('Only the admin can close the channel')
  }

  channels.splice(channels.indexOf(channel), 1)

  const kept = messages.filter(message => message.channel !== channelName)
  messages.splice(0, messages.length, ...kept)
  return channel
}