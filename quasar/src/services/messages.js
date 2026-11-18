// Messages of the open channel from the database (use cases 3, 6, 7)
import { api } from '@/services/api.js'
import { notifyMessage } from '@/services/notifications.js'
import { currentUser, messages } from '@/data/mock.js'

const messagesPath = name => `/channels/${encodeURIComponent(name)}/messages`

// The server sends the time as text, the page formats a date
const withDate = message => ({
  ...message,
  createdAt: new Date(message.createdAt)
})

// The newest page, older ones with { before: id }, new ones with { after: id }
export async function loadMessages(name, { before, after } = {}) {
  const query = before ? `?before=${before}` : after ? `?after=${after}` : ''
  const page = await api(messagesPath(name) + query)
  return page.map(withDate)
}

export async function sendMessage(name, text) {
  const message = await api(messagesPath(name), {
    method: 'POST',
    body: { text }
  })
  return withDate(message)
}

// Sending and the websocket can bring the same message twice,
// the list stays sorted from the oldest
export function addMessages(list) {
  const known = new Set(messages.map(message => message.id))
  messages.push(...list.filter(message => !known.has(message.id)))
  messages.sort((a, b) => a.id - b.id)
}

export function receiveMessage(data) {
  if (currentUser.status === 'offline') return
  const message = withDate(data)
  addMessages([message])
  notifyMessage(message)
}
