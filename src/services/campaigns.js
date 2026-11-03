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

function authHeaders(accessToken, contentType = false) {
  return {
    ...(contentType ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${accessToken}`,
  }
}

export async function createCampaign({ name, description }) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to create a campaign.')
  }

  const response = await fetch(`${API_BASE_URL}/campaigns`, {
    method: 'POST',
    headers: authHeaders(accessToken, true),
    body: JSON.stringify({ name, description }),
  })

  return parseResponse(response)
}

export async function fetchCampaigns() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to load campaigns.')
  }

  const response = await fetch(`${API_BASE_URL}/campaigns`, {
    headers: authHeaders(accessToken),
  })

  return parseResponse(response)
}

export async function fetchCampaign(campaignId) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to load a campaign.')
  }

  const response = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}`, {
    headers: authHeaders(accessToken),
  })

  return parseResponse(response)
}

export async function updateCampaign(campaignId, { name, description }) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to update a campaign.')
  }

  const response = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'PUT',
    headers: authHeaders(accessToken, true),
    body: JSON.stringify({ name, description }),
  })

  return parseResponse(response)
}

export async function deleteCampaign(campaignId) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to delete a campaign.')
  }

  const response = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  })

  return parseResponse(response)
}

export async function updateParticipantRole(campaignId, userId, role) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to update a participant role.')
  }

  const response = await fetch(
    `${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}/participants/${encodeURIComponent(userId)}/role?role=${encodeURIComponent(role)}`,
    {
      method: 'PUT',
      headers: authHeaders(accessToken),
    },
  )

  return parseResponse(response)
}

export async function removeParticipant(campaignId, userId) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('You must be logged in to remove a participant.')
  }

  const response = await fetch(
    `${API_BASE_URL}/campaigns/${encodeURIComponent(campaignId)}/participants/${encodeURIComponent(userId)}`,
    {
      method: 'PUT',
      headers: authHeaders(accessToken),
    },
  )

  return parseResponse(response)
}
