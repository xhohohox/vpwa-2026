// Registration, login and logout against the API
import { api, getToken, setToken } from '@/services/api.js'
import { loadChannels } from '@/services/channels.js'
import { connectSocket, disconnectSocket } from '@/services/socket.js'
import { currentUser } from '@/data/mock.js'

export const isLoggedIn = () => Boolean(getToken())

function useUser(user) {
  const {
    id,
    firstName,
    lastName,
    nickName,
    email,
    status,
    notifyMentionsOnly
  } = user
  Object.assign(currentUser, {
    id,
    firstName,
    lastName,
    nickName,
    email,
    status,
    notifyMentionsOnly
  })
}

// My channels are loaded before the chat opens. The websocket connects in the
// background: without it the chat still works, only the news do not come by themselves.
async function start() {
  await loadChannels()
  connectSocket().catch(() => {})
}

async function signIn({ user, token }) {
  setToken(token)
  useUser(user)
  await start()
}

export async function login(email, password) {
  await signIn(
    await api('/auth/login', { method: 'POST', body: { email, password } })
  )
}

export async function signup(form) {
  await signIn(await api('/auth/signup', { method: 'POST', body: form }))
}

// After reloading the page
export async function loadProfile() {
  try {
    useUser(await api('/account/profile'))
    await start()
  } catch (error) {
    // no longer valid token
    if (error.status === 401) setToken(null)
  }
}

// Status and notification setting
export async function updateSettings(settings) {
  useUser(await api('/account/profile', { method: 'PATCH', body: settings }))
}

export async function logout() {
  disconnectSocket()
  try {
    await api('/account/logout', { method: 'POST' })
  } finally {
    // server unreachable, forget token
    setToken(null)
  }
}
