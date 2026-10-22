// Calls to the AdonisJS API (backend/)
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
const API_URL = 'http://localhost:3333/api/v1'
const TOKEN_KEY = 'vpwa-token'

// The token from login is kept in localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY)

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// An error answered by the server, with its messages (form validation)
export class ApiError extends Error {
  constructor(status, messages) {
    super(messages.join(' '))
    this.status = status
    this.messages = messages
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const options = { method, headers }
  if (body) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(API_URL + path, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const messages = data.errors?.map(error => error.message) ?? [
      response.statusText
    ]
    throw new ApiError(response.status, messages)
  }
  return data.data ?? data
}

// Text for the user
export const errorText = error =>
  error instanceof ApiError
    ? error.messages.join(' ')
    : 'The server is not reachable, is the backend running?'