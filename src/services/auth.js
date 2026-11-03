const API_BASE_URL = 'http://localhost:8080/api'
const ACCESS_TOKEN_KEY = 'campaign-manager-access-token'
const USER_KEY = 'campaign-manager-user'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof body === 'string' ? body : body.message
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return body
}

export async function registerUser({ username, email, password }) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  return parseResponse(response)
}

export async function loginUser({ identifier, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier,
      password,
    }),
  })

  return parseResponse(response)
}

export function storeAccessToken({ accessToken, user }) {
  if (!accessToken) {
    throw new Error('Authentication response did not include an access token.')
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
  window.localStorage.setItem('campaign-manager-authenticated', 'true')
}

export function hasAccessToken() {
  return Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY))
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser() {
  const user = window.localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}
