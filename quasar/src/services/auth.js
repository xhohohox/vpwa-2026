// Registration, login and logout against the API
import { api, getToken, setToken } from '@/services/api.js'
import { currentUser } from '@/data/mock.js'

export const isLoggedIn = () => Boolean(getToken())

function useUser(user) {
  const { firstName, lastName, nickName, email, status, notifyMentionsOnly } =
    user
  Object.assign(currentUser, {
    firstName,
    lastName,
    nickName,
    email,
    status,
    notifyMentionsOnly
  })
}

function signIn({ user, token }) {
  setToken(token)
  useUser(user)
}

export async function login(email, password) {
  signIn(
    await api('/auth/login', { method: 'POST', body: { email, password } })
  )
}

export async function signup(form) {
  signIn(await api('/auth/signup', { method: 'POST', body: form }))
}

// After reloading the page
export async function loadProfile() {
  try {
    useUser(await api('/account/profile'))
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
  try {
    await api('/account/logout', { method: 'POST' })
  } finally {
    // server unreachable, forget token
    setToken(null)
  }
}
