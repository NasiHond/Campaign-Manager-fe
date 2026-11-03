import { renderSidebar, setupSidebar } from '../components/sidebar.js'
import { renderConfirmModal, setupConfirmModal } from '../components/confirm-modal.js'
import {
  fetchCampaign,
  deleteCampaign,
  removeParticipant,
  updateCampaign,
  updateParticipantRole,
} from '../services/campaigns.js'
import { createInvite, revokeInvite } from '../services/invites.js'
import { getStoredUser } from '../services/auth.js'

export function renderCampaign({ isLoggedIn = false } = {}) {
  return `
    <main class="page-shell">
      ${renderSidebar({ isLoggedIn })}
      <section class="campaign-page" aria-labelledby="campaign-title">
        <div class="campaign-heading">
          <h1 id="campaign-title">Loading campaign...</h1>
          <div class="campaign-heading-actions">
            <button
              class="campaign-edit-button"
              type="button"
              data-action="edit-campaign"
              aria-label="Edit campaign"
              title="Edit campaign"
              hidden
            >
              <svg data-edit-icon viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5ZM20.7 6.8a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.4 0l-1.7 1.7 3.5 3.5 1.7-1.7Z" />
              </svg>
              <svg data-save-icon viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3h11l3 3v15H5V3Zm2 2v5h8V5H7Zm0 9v5h10v-5H7Z" />
              </svg>
            </button>
            <button
              class="campaign-delete-button"
              type="button"
              data-action="delete-campaign"
              aria-label="Delete campaign"
              title="Delete campaign"
              hidden
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 7h12v14H6V7Zm3-4h6l1 2h4v2H4V5h4l1-2Zm1 8v7h2v-7h-2Zm4 0v7h2v-7h-2Z" />
              </svg>
            </button>
          </div>
        </div>
        <p class="campaign-description" data-campaign-description></p>
        <p class="form-message campaign-edit-message" data-campaign-edit-message role="status" aria-live="polite"></p>
        <button class="invite-campaign-button" type="button" data-action="invite-campaign" hidden>
          Invite user
        </button>
        <button class="manage-invites-button" type="button" data-action="manage-invites" hidden>
          View invites
        </button>
        <button class="view-participants-button" type="button" data-action="view-participants" hidden>
          View participants
        </button>
        <div class="modal-backdrop" id="invite-modal" hidden>
          <section
            class="campaign-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
          >
            <button class="modal-close" type="button" aria-label="Close invite form">×</button>
            <h2 id="invite-modal-title">Invite user</h2>
            <form class="campaign-form" id="invite-form">
              <label class="field">
                <span>User identifier</span>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Username or email"
                  required
                />
              </label>
              <label class="field">
                <span>Role</span>
                <select name="role" required>
                  <option value="AUTHOR">AUTHOR</option>
                  <option value="PARTICIPANT">PARTICIPANT</option>
                </select>
              </label>
              <button type="submit">Send invite</button>
              <p class="form-message" id="invite-message" role="status" aria-live="polite"></p>
            </form>
          </section>
        </div>
        <div class="modal-backdrop" id="campaign-invites-modal" hidden>
          <section
            class="campaign-modal campaign-invites-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-invites-modal-title"
          >
            <button class="modal-close" type="button" aria-label="Close campaign invites">×</button>
            <h2 id="campaign-invites-modal-title">Campaign invites</h2>
            <div data-campaign-invites-content></div>
          </section>
        </div>
        <div class="modal-backdrop" id="campaign-participants-modal" hidden>
          <section
            class="campaign-modal campaign-participants-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-participants-modal-title"
          >
            <button class="modal-close" type="button" aria-label="Close campaign participants">×</button>
            <h2 id="campaign-participants-modal-title">Campaign participants</h2>
            <div data-campaign-participants-content></div>
          </section>
        </div>
        ${renderConfirmModal()}
      </section>
    </main>
  `
}

export function setupCampaign(app) {
  setupSidebar(app.querySelector('.sidebar'), {
    onLogout: () => {
      window.localStorage.removeItem('campaign-manager-access-token')
      window.localStorage.removeItem('campaign-manager-user')
      window.localStorage.removeItem('campaign-manager-authenticated')
      window.location.href = '/'
    },
  })

  const title = app.querySelector('#campaign-title')
  const description = app.querySelector('[data-campaign-description]')
  const editButton = app.querySelector('[data-action="edit-campaign"]')
  const editIcon = editButton.querySelector('[data-edit-icon]')
  const saveIcon = editButton.querySelector('[data-save-icon]')
  const editMessage = app.querySelector('[data-campaign-edit-message]')
  const deleteButton = app.querySelector('[data-action="delete-campaign"]')
  const inviteButton = app.querySelector('[data-action="invite-campaign"]')
  const manageInvitesButton = app.querySelector('[data-action="manage-invites"]')
  const participantsButton = app.querySelector('[data-action="view-participants"]')
  const inviteModal = app.querySelector('#invite-modal')
  const inviteCloseButton = inviteModal.querySelector('.modal-close')
  const inviteForm = app.querySelector('#invite-form')
  const inviteMessage = app.querySelector('#invite-message')
  const campaignInvitesModal = app.querySelector('#campaign-invites-modal')
  const campaignInvitesContent = app.querySelector('[data-campaign-invites-content]')
  const campaignInvitesCloseButton = campaignInvitesModal.querySelector('.modal-close')
  const campaignParticipantsModal = app.querySelector('#campaign-participants-modal')
  const campaignParticipantsContent = app.querySelector('[data-campaign-participants-content]')
  const campaignParticipantsCloseButton = campaignParticipantsModal.querySelector('.modal-close')
  const confirmModal = app.querySelector('[data-confirm-modal]')
  const campaignId = new URLSearchParams(window.location.search).get('campaignId')

  if (!campaignId) {
    title.textContent = 'Campaign not found'
    description.textContent = 'No campaign was selected.'
    return
  }

  let campaign
  let isEditing = false
  const confirmation = setupConfirmModal(confirmModal)

  fetchCampaign(campaignId)
    .then((campaignData) => {
      campaign = campaignData
      title.textContent = campaign?.name || 'Campaign not found'
      description.textContent = campaign?.description || 'No campaign was found for this ID.'
      const isOwner = isCampaignOwner(campaign)
      inviteButton.hidden = !isOwner
      manageInvitesButton.hidden = !isOwner
      participantsButton.hidden = false
      editButton.hidden = !isOwner
      deleteButton.hidden = !isOwner
    })
    .catch((error) => {
      title.textContent = 'Unable to load campaign'
      description.textContent = error.message
    })

  const setEditMode = (editing) => {
    isEditing = editing
    editButton.classList.toggle('is-editing', editing)
    editButton.setAttribute('aria-label', editing ? 'Save campaign' : 'Edit campaign')
    editButton.title = editing ? 'Save campaign' : 'Edit campaign'
    editIcon.style.display = editing ? 'none' : ''
    saveIcon.style.display = editing ? '' : 'none'

    if (editing) {
      title.innerHTML = `<input class="campaign-title-input" type="text" value="${escapeHtml(campaign.name)}" aria-label="Campaign name" required>`
      description.innerHTML = `<textarea class="campaign-description-input" aria-label="Campaign description" required>${escapeHtml(campaign.description || '')}</textarea>`
      title.querySelector('input').focus()
      return
    }

    title.textContent = campaign.name
    description.textContent = campaign.description || ''
  }

  editButton.addEventListener('click', async () => {
    if (isEditing) {
      const nameInput = title.querySelector('input')
      const descriptionInput = description.querySelector('textarea')
      if (!nameInput.reportValidity() || !descriptionInput.reportValidity()) {
        return
      }

      const name = nameInput.value.trim()
      const campaignDescription = descriptionInput.value.trim()
      const originalName = campaign.name || ''
      const originalDescription = campaign.description || ''

      if (name === originalName && campaignDescription === originalDescription) {
        setEditMode(false)
        return
      }

      editButton.disabled = true
      editMessage.textContent = 'Saving campaign...'
      editMessage.classList.remove('is-error')

      try {
        campaign = await updateCampaign(campaignId, {
          name,
          description: campaignDescription,
        })

        setEditMode(false)
        editMessage.textContent = ''
      } catch (error) {
        editMessage.textContent = error.message
        editMessage.classList.add('is-error')
      } finally {
        editButton.disabled = false
      }
      return
    }

    editMessage.textContent = ''
    editMessage.classList.remove('is-error')
    setEditMode(true)
  })

  deleteButton.addEventListener('click', () => {
    confirmation.open({
      heading: 'Delete campaign?',
      text: `Delete ${campaign.name}? This action cannot be undone.`,
      confirmLabel: 'Delete campaign',
    })
    confirmation.onConfirm = async () => {
      deleteButton.disabled = true
      try {
        await deleteCampaign(campaignId)
        window.location.href = '/'
      } finally {
        deleteButton.disabled = false
      }
    }
  })

  const closeInviteModal = () => {
    inviteModal.hidden = true
    inviteMessage.textContent = ''
    inviteMessage.classList.remove('is-error')
    inviteForm.reset()
  }

  inviteButton.addEventListener('click', () => {
    inviteModal.hidden = false
    inviteForm.querySelector('input').focus()
  })
  inviteCloseButton.addEventListener('click', closeInviteModal)
  inviteModal.addEventListener('click', (event) => {
    if (event.target === inviteModal) {
      closeInviteModal()
    }
  })

  inviteForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    inviteMessage.textContent = 'Sending invite...'
    inviteMessage.classList.remove('is-error')

    const data = new FormData(inviteForm)

    try {
      await createInvite({
        campaignId: Number(campaignId),
        identifier: data.get('identifier'),
        role: data.get('role'),
      })
      inviteMessage.textContent = 'Invite sent.'
      inviteForm.reset()
    } catch (error) {
      inviteMessage.textContent = error.message
      inviteMessage.classList.add('is-error')
    }
  })

  const closeCampaignInvitesModal = () => {
    campaignInvitesModal.hidden = true
    campaignInvitesContent.replaceChildren()
  }

  manageInvitesButton.addEventListener('click', async () => {
    campaignInvitesModal.hidden = false
    campaignInvitesContent.innerHTML = '<p class="invites-message">Loading invites...</p>'

    try {
      const campaignWithInvites = await fetchCampaign(campaignId)
      setupCampaignInvites(campaignInvitesContent, campaignWithInvites?.invites)
    } catch (error) {
      campaignInvitesContent.innerHTML = `
        <p class="invites-message is-error">${escapeHtml(error.message)}</p>
      `
    }
  })
  campaignInvitesCloseButton.addEventListener('click', closeCampaignInvitesModal)
  campaignInvitesModal.addEventListener('click', (event) => {
    if (event.target === campaignInvitesModal) {
      closeCampaignInvitesModal()
    }
  })

  const closeCampaignParticipantsModal = () => {
    campaignParticipantsModal.hidden = true
    campaignParticipantsContent.replaceChildren()
  }

  const refreshParticipants = async () => {
    campaign = await fetchCampaign(campaignId)
    setupCampaignParticipants(
      campaignParticipantsContent,
      campaign?.participants,
      isCampaignOwner(campaign),
      campaignId,
      confirmation,
      refreshParticipants,
    )
  }

  participantsButton.addEventListener('click', () => {
    campaignParticipantsModal.hidden = false
    setupCampaignParticipants(
      campaignParticipantsContent,
      campaign?.participants,
      isCampaignOwner(campaign),
      campaignId,
      confirmation,
      refreshParticipants,
    )
  })
  campaignParticipantsCloseButton.addEventListener('click', closeCampaignParticipantsModal)
  campaignParticipantsModal.addEventListener('click', (event) => {
    if (event.target === campaignParticipantsModal) {
      closeCampaignParticipantsModal()
    }
  })
}

function setupCampaignParticipants(
  content,
  participants,
  isOwner,
  campaignId,
  confirmation,
  refreshParticipants,
) {
  const campaignParticipants = Array.isArray(participants)
    ? participants
    : Object.entries(participants || {}).map(([participant, role]) => ({ participant, role }))

  if (!campaignParticipants.length) {
    content.innerHTML = '<p class="invites-message">No participants for this campaign.</p>'
    return
  }

  content.innerHTML = `
    <div class="campaign-participants-list">
      ${campaignParticipants.map((participant, index) => `
        <div class="campaign-participant-item">
          <span>${escapeHtml(getParticipantName(participant))}</span>
          <div class="participant-actions">
            <span class="participant-role">${escapeHtml(participant?.role || 'Unknown role')}</span>
            ${isOwner && !isParticipantOwner(participant) ? `
              <select class="participant-role-select" data-participant-role="${index}" aria-label="Role for ${escapeHtml(getParticipantName(participant))}">
                ${['AUTHOR', 'PARTICIPANT'].map((role) => `
                  <option value="${role}" ${participant?.role === role ? 'selected' : ''}>${role}</option>
                `).join('')}
              </select>
              <button class="remove-participant-button" type="button" data-remove-participant="${index}">
                Remove
              </button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `

  content.querySelectorAll('[data-participant-role]').forEach((select) => {
    select.addEventListener('change', () => {
      const participant = campaignParticipants[Number(select.dataset.participantRole)]
      const previousRole = participant.role
      const nextRole = select.value
      confirmation.open({
        heading: 'Change participant role?',
        text: `Change ${getParticipantName(participant)} to ${nextRole}?`,
        confirmLabel: 'Change role',
        onClose: () => {
          select.value = previousRole
        },
      })
      confirmation.onConfirm = async () => {
        await updateParticipantRole(campaignId, getParticipantId(participant), nextRole)
        participant.role = nextRole
        select.value = nextRole
      }
    })
  })

  content.querySelectorAll('[data-remove-participant]').forEach((button) => {
    button.addEventListener('click', () => {
      const participant = campaignParticipants[Number(button.dataset.removeParticipant)]
      confirmation.open({
        heading: 'Remove participant?',
        text: `Remove ${getParticipantName(participant)} from this campaign?`,
        confirmLabel: 'Remove participant',
      })
      confirmation.onConfirm = async () => {
        await removeParticipant(campaignId, getParticipantId(participant))
        await refreshParticipants()
      }
    })
  })
}

function getParticipantName(participant) {
  return participant?.user?.username
    || participant?.user?.email
    || participant?.username
    || participant?.email
    || participant?.user?.id
    || participant?.userId
    || participant?.participant
    || 'Unknown participant'
}

function getParticipantId(participant) {
  return participant?.user?.id
    || participant?.userId
    || participant?.id
    || participant?.participant
}

function isParticipantOwner(participant) {
  return participant?.role === 'OWNER'
}

function setupCampaignInvites(content, invites) {
  const campaignInvites = (Array.isArray(invites) ? invites : [])
    .sort((left, right) => Number(isPending(right)) - Number(isPending(left)))

  if (!campaignInvites.length) {
    content.innerHTML = '<p class="invites-message">No invites for this campaign.</p>'
    return
  }

  content.innerHTML = `
    <div class="campaign-invites-list">
      ${campaignInvites.map((invite, index) => `
        <button class="campaign-invite-item" type="button" data-invite-index="${index}">
          <span>${escapeHtml(getInviteRecipient(invite))}</span>
          <span class="invite-status ${isPending(invite) ? 'is-pending' : ''}">
            ${escapeHtml(getInviteStatus(invite))}
          </span>
        </button>
      `).join('')}
    </div>
    <div data-campaign-invite-detail hidden></div>
  `

  const list = content.querySelector('.campaign-invites-list')
  const detail = content.querySelector('[data-campaign-invite-detail]')
  content.querySelectorAll('[data-invite-index]').forEach((item) => {
    item.addEventListener('click', () => {
      renderInviteDetail(detail, list, campaignInvites[Number(item.dataset.inviteIndex)])
    })
  })
}

function renderInviteDetail(detail, list, invite) {
  list.hidden = true
  detail.hidden = false
  detail.innerHTML = `
    <button class="invite-back-button" type="button">Back to invites</button>
    <h3>${escapeHtml(getInviteRecipient(invite))}</h3>
    <dl class="invite-detail-list">
      <div>
        <dt>Status</dt>
        <dd>${escapeHtml(getInviteStatus(invite))}</dd>
      </div>
      <div>
        <dt>Role</dt>
        <dd>${escapeHtml(invite.role || 'Unknown')}</dd>
      </div>
    </dl>
    <pre class="invite-raw-details">${escapeHtml(JSON.stringify(invite, null, 2))}</pre>
    ${isPending(invite) ? `
      <button class="revoke-invite-button" type="button">Revoke invite</button>
      <p class="form-message" data-revoke-message role="status" aria-live="polite"></p>
    ` : ''}
  `

  detail.querySelector('.invite-back-button').addEventListener('click', () => {
    detail.hidden = true
    list.hidden = false
  })

  const revokeButton = detail.querySelector('.revoke-invite-button')
  if (revokeButton) {
    const revokeMessage = detail.querySelector('[data-revoke-message]')
    revokeButton.addEventListener('click', async () => {
      revokeButton.disabled = true
      revokeMessage.textContent = 'Revoking invite...'
      revokeMessage.classList.remove('is-error')

      try {
        const updatedInvite = await revokeInvite(invite.id)
        Object.assign(invite, updatedInvite || {}, {
          status: updatedInvite?.status || 'REVOKED',
          invitationStatus: updatedInvite?.invitationStatus || 'REVOKED',
        })
        renderInviteDetail(detail, list, invite)
      } catch (error) {
        revokeButton.disabled = false
        revokeMessage.textContent = error.message
        revokeMessage.classList.add('is-error')
      }
    })
  }
}

function getInviteRecipient(invite) {
  return invite.invitedUser?.username
    || invite.invitedUser?.email
    || invite.user?.username
    || invite.user?.email
    || invite.identifier
    || 'Unknown recipient'
}

function getInviteStatus(invite) {
  return invite.status || invite.invitationStatus || 'Unknown'
}

function isPending(invite) {
  return getInviteStatus(invite) === 'PENDING'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function isCampaignOwner(campaign) {
  const currentUser = getStoredUser()
  if (!currentUser || !campaign) {
    return false
  }

  if (campaign.ownerId !== undefined && campaign.ownerId !== null) {
    return String(campaign.ownerId) === String(currentUser.id)
  }

  if (!campaign.participants) {
    return false
  }

  if (Array.isArray(campaign.participants)) {
    return campaign.participants.some((participant) => (
      participant?.role === 'OWNER'
      && (
        String(participant.user?.id ?? participant.id) === String(currentUser.id)
        || participant.user?.username === currentUser.username
        || participant.user?.email === currentUser.email
      )
    ))
  }

  return Object.entries(campaign.participants).some(([participant, role]) => (
    role === 'OWNER'
    && (
      participant === String(currentUser.id)
      || participant === currentUser.username
      || participant === currentUser.email
    )
  ))
}
