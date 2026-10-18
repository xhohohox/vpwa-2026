// Commands typed into the command line (use cases 4, 5, 10).
import { currentUser, channels } from '@/data/mock.js'
import {
  joinChannel,
  leaveChannel,
  invite as inviteUser,
  revoke as revokeUser,
  kick as kickUser,
  quitChannel,
  kickVotesRequired
} from '@/data/channels.js'

// Available commands with a short description, shown as suggestions while
// typing. Later this list can come from the server.
export const commandList = [
  {
    name: '/join',
    usage: '/join channelName [private]',
    description: 'Join a channel, or create it if it does not exist'
  },
  {
    name: '/invite',
    usage: '/invite nickName',
    description: 'Invite a user to this channel'
  },
  {
    name: '/revoke',
    usage: '/revoke nickName',
    description: 'Remove a user from this private channel (admin)'
  },
  {
    name: '/kick',
    usage: '/kick nickName',
    description: 'Vote to kick a user, the admin bans at once'
  },
  { name: '/quit', usage: '/quit', description: 'Close this channel (admin)' },
  { name: '/cancel', usage: '/cancel', description: 'Leave this channel' },
  {
    name: '/list',
    usage: '/list',
    description: 'Show the members of this channel'
  }
]

// While the command name is typed ("/jo"), all commands starting with it match.
// After a space ("/join ho") only that command is left, as a hint for its usage.
export function matchCommands(text) {
  if (!text.startsWith('/')) return []
  const word = text.split(' ')[0]
  return text.includes(' ')
    ? commandList.filter(command => command.name === word)
    : commandList.filter(command => command.name.startsWith(word))
}

const HELP = 'Commands: ' + commandList.map(command => command.name).join(', ')

// Every command returns a result for the command line:
// ok + text for the message to the user, optionally a channel to open,
// leftChannel when the open channel is gone, showMembers for /list
const ok = (text, extra = {}) => ({ ok: true, text, ...extra })
const fail = text => ({ ok: false, text })

export function runCommand(input, openChannelName) {
  // "/join hokej private" -> name "/join", args ["hokej", "private"]
  // a nickName can be written with or without the leading @
  const parts = input.trim().split(/\s+/)
  const name = parts[0]
  const args = parts.slice(1).map(arg => arg.replace(/^@/, ''))
  const me = currentUser.nickName
  const channel = channels.find(
    c => c.name === openChannelName && c.members.includes(me)
  )

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

  const existing = channels.find(c => c.name === name)
  const wasMember = existing?.members.includes(me)
  try {
    joinChannel(me, name, { isPrivate })
  } catch (e) {
    return fail(e.message)
  }

  if (wasMember) return ok(`You are already in #${name}`, { open: name })
  if (existing) return ok(`You joined #${name}`, { open: name })
  const type = isPrivate ? 'private' : 'public'
  return ok(`Created ${type} channel #${name}`, { open: name })
}

// /invite nickName
function invite(channel, nick) {
  const me = currentUser.nickName
  if (!nick) return fail('Usage: /invite nickName')

  const unbanned = channel.banned.includes(nick)
  try {
    inviteUser(me, channel.name, nick)
  } catch (e) {
    return fail(e.message)
  }
  const what = unbanned ? 'unbanned and invited' : 'invited'
  return ok(`${nick} was ${what} to #${channel.name}`)
}

// /revoke nickName - the admin takes access away (invitation or membership)
function revoke(channel, nick) {
  const me = currentUser.nickName
  if (!nick) return fail('Usage: /revoke nickName')
  try {
    revokeUser(me, channel.name, nick)
  } catch (e) {
    return fail(e.message)
  }
  return ok(`${nick} was removed from #${channel.name}`)
}

// /kick nickName - the admin bans at once, members vote (3 votes = ban)
function kick(channel, nick) {
  const me = currentUser.nickName
  if (!nick) return fail('Usage: /kick nickName')
  const required = kickVotesRequired(channel)
  const voted = channel.kickVotes[nick]?.includes(me) ?? false

  try {
    kickUser(me, channel.name, nick)
  } catch (e) {
    return fail(e.message)
  }

  if (channel.banned.includes(nick)) {
    return ok(`${nick} was banned from #${channel.name}`)
  }
  if (voted) return ok(`Your vote to kick ${nick} was taken back`)
  const votes = channel.kickVotes[nick]?.length ?? 0
  return ok(`Your vote to kick ${nick} was counted (${votes}/${required})`)
}

// /quit - the admin closes the channel
function quit(channel) {
  const me = currentUser.nickName
  try {
    quitChannel(me, channel.name)
  } catch (e) {
    return fail(e.message)
  }
  return ok(`#${channel.name} was closed`, { leftChannel: true })
}

// /cancel - leave the channel; when the admin leaves, the channel is closed
function cancel(channel) {
  const me = currentUser.nickName
  const owner = channel.owner === me
  try {
    leaveChannel(me, channel.name)
  } catch (e) {
    return fail(e.message)
  }
  const text = owner
    ? `You left #${channel.name}, so it was closed`
    : `You left #${channel.name}`
  return ok(text, { leftChannel: true })
}