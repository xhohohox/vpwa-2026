// Commands typed into the command line (use cases 4, 5, 10).
import { currentUser, channels } from '@/data/mock.js'
import { kickVotesRequired } from '@/data/channels.js'
import {
  joinChannel,
  leaveChannel,
  deleteChannel,
  inviteUser,
  revokeUser,
  kickUser
} from '@/services/channels.js'
import { errorText } from '@/services/api.js'

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

export async function runCommand(input, openChannelName) {
  // "/join hokej private" -> name "/join", args ["hokej", "private"]
  // a nickName can be written with or without the leading @
  const parts = input.trim().split(/\s+/)
  const name = parts[0]
  const args = parts.slice(1).map(arg => arg.replace(/^@/, ''))
  const me = currentUser.nickName
  const channel = channels.find(
    c => c.name === openChannelName && c.members.includes(me)
  )

  try {
    if (name === '/join') return await join(args[0], args[1] === 'private')
    if (!channel) return fail('Open a channel you are a member of first')

    switch (name) {
      case '/invite':
        return await invite(channel, args[0])
      case '/revoke':
        return await revoke(channel, args[0])
      case '/kick':
        return await kick(channel, args[0])
      case '/quit':
        return await quit(channel)
      case '/cancel':
        return await cancel(channel)
      case '/list':
        return ok('', { showMembers: true })
      default:
        return fail(`Unknown command ${name}. ${HELP}`)
    }
  } catch (error) {
    // the server checks the rules, its message says what is not allowed
    return fail(errorText(error))
  }
}

// /join channelName [private]
async function join(name, isPrivate) {
  if (!name) return fail('Usage: /join channelName [private]')

  const { result } = await joinChannel(name, isPrivate)
  const text = {
    member: `You are already in #${name}`,
    joined: `You joined #${name}`,
    created: `Created ${isPrivate ? 'private' : 'public'} channel #${name}`
  }
  return ok(text[result], { open: name })
}

// /invite nickName
async function invite(channel, nick) {
  if (!nick) return fail('Usage: /invite nickName')

  const { unbanned } = await inviteUser(channel.name, nick)
  const what = unbanned ? 'unbanned and invited' : 'invited'
  return ok(`${nick} was ${what} to #${channel.name}`)
}

// /revoke nickName - the admin takes access away (invitation or membership)
async function revoke(channel, nick) {
  if (!nick) return fail('Usage: /revoke nickName')

  await revokeUser(channel.name, nick)
  return ok(`${nick} was removed from #${channel.name}`)
}

// /kick nickName - the admin bans at once, members vote (3 votes = ban)
async function kick(channel, nick) {
  if (!nick) return fail('Usage: /kick nickName')

  const { banned, undone, votes } = await kickUser(channel.name, nick)
  if (banned) return ok(`${nick} was banned from #${channel.name}`)
  if (undone) return ok(`Your vote to kick ${nick} was taken back`)
  const required = kickVotesRequired()
  return ok(`Your vote to kick ${nick} was counted (${votes}/${required})`)
}

// /quit - the admin closes the channel
async function quit(channel) {
  await deleteChannel(channel.name)
  return ok(`#${channel.name} was closed`, { leftChannel: true })
}

// /cancel - leave the channel; when the admin leaves, the channel is closed
async function cancel(channel) {
  const owner = channel.owner === currentUser.nickName

  await leaveChannel(channel.name)
  const text = owner
    ? `You left #${channel.name}, so it was closed`
    : `You left #${channel.name}`
  return ok(text, { leftChannel: true })
}