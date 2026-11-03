import { getAccessToken } from './auth.js'

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'

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

export async function fetchInvites() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to load invites.')
  }

  const response = await fetch(`${API_BASE_URL}/invites`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseResponse(response)
}

export async function createInvite({ campaignId, identifier, role }) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to send an invite.')
  }

  const response = await fetch(`${API_BASE_URL}/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      campaignId,
      identifier,
      role,
    }),
  })

  return parseResponse(response)
}

export async function acceptInvite(inviteId) {
  return updateInviteStatus(inviteId, 'accept')
}

export async function declineInvite(inviteId) {
  return updateInviteStatus(inviteId, 'decline')
}

export async function revokeInvite(inviteId) {
  return updateInviteStatus(inviteId, 'revoke')
}

async function updateInviteStatus(inviteId, action) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to update an invite.')
  }

  const response = await fetch(`${API_BASE_URL}/invites/${encodeURIComponent(inviteId)}/${action}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseResponse(response)
}
