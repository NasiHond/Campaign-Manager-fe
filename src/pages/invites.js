import { renderSidebar, setupSidebar } from '../components/sidebar.js'
import { acceptInvite, declineInvite, fetchInvites } from '../services/invites.js'

export function renderInvites({ isLoggedIn = false } = {}) {
  return `
    <main class="page-shell">
      ${renderSidebar({ isLoggedIn })}
      <section class="invites-page" aria-labelledby="invites-title">
        <h1 id="invites-title">Campaign invites</h1>
        <div class="invites-list" data-invites-list>
          <p class="invites-message">Loading invites...</p>
        </div>
      </section>
    </main>
  `
}

export function setupInvites(app) {
  const sidebarSetup = setupSidebar(app.querySelector('.sidebar'), {
    onLogout: () => {
      window.localStorage.removeItem('campaign-manager-access-token')
      window.localStorage.removeItem('campaign-manager-user')
      window.localStorage.removeItem('campaign-manager-authenticated')
      window.location.href = '/'
    },
  })

  const invitesList = app.querySelector('[data-invites-list]')
  fetchInvites()
    .then((invites) => setupInviteActions(invitesList, invites, sidebarSetup))
    .catch((error) => {
      invitesList.innerHTML = `<p class="invites-message is-error">${escapeHtml(error.message)}</p>`
    })
}

function setupInviteActions(invitesList, invites, sidebarSetup) {
  renderInvitesList(invitesList, invites)

  invitesList.querySelectorAll('[data-invite-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const inviteId = button.dataset.inviteId
      const action = button.dataset.inviteAction
      const card = button.closest('.invite-card')
      const message = card.querySelector('[data-invite-message]')

      button.disabled = true
      message.textContent = action === 'accept' ? 'Accepting invite...' : 'Declining invite...'
      message.classList.remove('is-error')

      try {
        if (action === 'accept') {
          await acceptInvite(inviteId)
          await sidebarSetup.loadCampaigns()
        } else {
          await declineInvite(inviteId)
        }
        await sidebarSetup.loadPendingInvites()
        card.remove()

        if (!invitesList.querySelector('.invite-card')) {
          invitesList.innerHTML = '<p class="invites-message">No pending campaign invites.</p>'
        }
      } catch (error) {
        button.disabled = false
        message.textContent = error.message
        message.classList.add('is-error')
      }
    })
  })
}

function renderInvitesList(invitesList, invites) {
  const inviteItems = Array.isArray(invites) ? invites : []
  const pendingInvites = inviteItems.filter((invite) => (
    (invite.status || invite.invitationStatus) === 'PENDING'
  ))

  if (!pendingInvites.length) {
    invitesList.innerHTML = '<p class="invites-message">No pending campaign invites.</p>'
    return
  }

  invitesList.innerHTML = pendingInvites.map((invite) => `
    <article class="invite-card" data-invite-id="${escapeHtml(invite.id)}">
      <h2>${escapeHtml(invite.campaign?.name || 'Unnamed campaign')}</h2>
      <p>${escapeHtml(invite.campaign?.description || 'No description available.')}</p>
      <dl class="invite-details">
        <div>
          <dt>Invited by</dt>
          <dd>${escapeHtml(invite.invitedBy?.username || 'Unknown user')}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>${escapeHtml(invite.role || 'Unknown')}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>${escapeHtml(invite.invitationStatus || 'Unknown')}</dd>
        </div>
      </dl>
      <div class="invite-actions">
        <button type="button" data-invite-action="accept" data-invite-id="${escapeHtml(invite.id)}">
          Accept
        </button>
        <button type="button" data-invite-action="decline" data-invite-id="${escapeHtml(invite.id)}">
          Decline
        </button>
      </div>
      <p class="form-message" data-invite-message role="status" aria-live="polite"></p>
    </article>
  `).join('')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
