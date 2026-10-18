// Commands typed into the command line (use cases 4, 5, 10).
import { currentUser, channels, otherChannels, users } from '@/data/mock.js'
import {
  isOwner,
  createChannel,
  acceptInvitation,
  removeChannel
} from '@/data/channelActions.js'

const HELP = 'Commands: /join, /invite, /revoke, /kick, /quit, /cancel, /list'

// Every command returns a result for the command line:
// ok + text for the message to the user, optionally a channel to open,
// leftChannel when the open channel is gone, showMembers for /list
const ok = (text, extra = {}) => ({ ok: true, text, ...extra })
const fail = text => ({ ok: false, text })

export function runCommand(input, openChannelName) {
  // "/join hokej private" -> name "/join", args ["hokej", "private"]
  const [name, ...args] = input.trim().split(/\s+/)
  const channel = channels.find(c => c.name === openChannelName && !c.invited)

  if (name === '/join') return join(args[0], args[1] === 'private')
  if (!channel) return fail('Open a channel you are a member of first')

  switch (name) {
    case '/invite':
      return invite(channel, args[0])
    case '/revoke':
      return revoke(channel, args[0])
    case '/kick':
      return kick(channel, args[0])
    case '/quit':
      return quit(channel)
    case '/cancel':
      return cancel(channel)
    case '/list':
      return ok('', { showMembers: true })
    default:
      return fail(`Unknown command ${name}. ${HELP}`)
  }
}

// /join channelName [private]
function join(name, isPrivate) {
  if (!name) return fail('Usage: /join channelName [private]')
  const me = currentUser.nickName

  const mine = channels.find(c => c.name === name)
  if (mine) {
    if (!mine.invited) return ok(`You are already in #${name}`, { open: name })
    acceptInvitation(mine)
    return ok(`You joined #${name}`, { open: name })
  }

  const existing = otherChannels.find(c => c.name === name)
  if (existing) {
    if (existing.banned.includes(me)) {
      return fail(`You are banned from #${name}`)
    }
    if (existing.isPrivate && !existing.invites.includes(me)) {
      return fail(`#${name} is private, ask its admin for an invite`)
    }
    otherChannels.splice(otherChannels.indexOf(existing), 1)
    channels.push(existing)
    acceptInvitation(existing)
    return ok(`You joined #${name}`, { open: name })
  }

  // The channel does not exist yet, so it is created and I am its admin
  createChannel(name, isPrivate)
  const type = isPrivate ? 'private' : 'public'
  return ok(`Created ${type} channel #${name}`, { open: name })
}

// /invite nickName
function invite(channel, nick) {
  if (!nick) return fail('Usage: /invite nickName')
  if (!users.some(user => user.nickName === nick)) {
    return fail(`User ${nick} does not exist`)
  }
  if (channel.isPrivate && !isOwner(channel)) {
    return fail('Only the admin can invite to a private channel')
  }

  let unbanned = false
  if (channel.banned.includes(nick)) {
    // Only the admin can let a banned user back into the channel
    if (!isOwner(channel)) {
      return fail(`${nick} is banned, only the admin can invite them back`)
    }
    channel.banned = channel.banned.filter(n => n !== nick)
    delete channel.kickVotes[nick]
    unbanned = true
  }

  if (channel.members.includes(nick)) {
    return fail(`${nick} is already in #${channel.name}`)
  }
  if (channel.invites.includes(nick)) {
    return fail(`${nick} is already invited to #${channel.name}`)
  }

  channel.invites.push(nick)
  const what = unbanned ? 'unbanned and invited' : 'invited'
  return ok(`${nick} was ${what} to #${channel.name}`)
}

// /revoke nickName - only the admin of a private channel
function revoke(channel, nick) {
  if (!nick) return fail('Usage: /revoke nickName')
  if (!channel.isPrivate) {
    return fail('/revoke works in private channels, use /kick here')
  }
  if (!isOwner(channel)) return fail('Only the admin can revoke users')
  if (nick === currentUser.nickName) return fail('Use /cancel to leave')

  if (channel.members.includes(nick)) {
    channel.members = channel.members.filter(n => n !== nick)
  } else if (channel.invites.includes(nick)) {
    channel.invites = channel.invites.filter(n => n !== nick)
  } else {
    return fail(`${nick} is not in #${channel.name}`)
  }
  return ok(`${nick} was removed from #${channel.name}`)
}

// /kick nickName - the admin bans at once, members vote (3 votes = ban)
function kick(channel, nick) {
  if (!nick) return fail('Usage: /kick nickName')
  const me = currentUser.nickName
  if (nick === me) return fail('Use /cancel to leave the channel')
  if (!channel.members.includes(nick)) {
    return fail(`${nick} is not a member of #${channel.name}`)
  }
  if (nick === channel.owner) return fail('The admin cannot be kicked')

  if (isOwner(channel)) {
    ban(channel, nick)
    return ok(`${nick} was banned from #${channel.name}`)
  }
  if (channel.isPrivate) {
    return fail('Only the admin can remove users from a private channel')
  }

  if (!channel.kickVotes[nick]) channel.kickVotes[nick] = []
  const votes = channel.kickVotes[nick]
  if (votes.includes(me)) return fail(`You already voted to kick ${nick}`)
  votes.push(me)

  if (votes.length >= 3) {
    ban(channel, nick)
    return ok(`${nick} got 3 votes and was banned from #${channel.name}`)
  }
  return ok(`Your vote to kick ${nick} was counted (${votes.length}/3)`)
}

function ban(channel, nick) {
  channel.members = channel.members.filter(n => n !== nick)
  channel.banned.push(nick)
  delete channel.kickVotes[nick]
}

// /quit - the admin closes the channel
function quit(channel) {
  if (!isOwner(channel)) return fail('Only the admin can close the channel')
  removeChannel(channel.name, true)
  return ok(`#${channel.name} was closed`, { leftChannel: true })
}

// /cancel - leave the channel; when the admin leaves, the channel is closed
function cancel(channel) {
  const owner = isOwner(channel)
  removeChannel(channel.name, owner)
  const text = owner
    ? `You left #${channel.name}, so it was closed`
    : `You left #${channel.name}`
  return ok(text, { leftChannel: true })
}