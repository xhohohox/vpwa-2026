// Helpers for the channel components, the rules of the commands are checked on the server 
import { currentUser, channels } from '@/data/mock.js'

// The assignment: when at least 3 members kick a user from a public channel,
// the user gets a permanent ban (use case 4)
export function kickVotesRequired() {
  return 3
}

// Where to go when the open channel disappeared (closed or left)
export function nextChannelPath() {
  const next = channels.find(channel =>
    channel.members.includes(currentUser.nickName)
  )
  return next ? `/channels/${next.name}` : '/'
}