import { fetchCampaigns } from '../services/campaigns.js'
import { fetchInvites } from '../services/invites.js'

export function renderSidebar({ isLoggedIn = false } = {}) {
  return `
    <aside class="sidebar" aria-label="Primary navigation">
      <button
        class="sidebar-toggle"
        type="button"
        aria-label="Collapse sidebar"
        aria-expanded="true"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <a class="sidebar-logo" href="/" aria-label="Campaign Manager home">LOGO</a>

      <nav class="sidebar-nav">
        ${isLoggedIn ? `
          <div class="campaign-list" data-campaign-list>
            <p class="campaign-list-message">Loading campaigns...</p>
          </div>
        ` : ''}

        ${isLoggedIn ? '' : `
          <button class="sidebar-button" type="button" data-action="login">Login</button>
        `}

        ${isLoggedIn ? `
          <a class="sidebar-button invites-button" href="/invites">
            <span>Campaign invites</span>
            <span class="invite-count" data-pending-invite-count hidden aria-label="Pending invites"></span>
          </a>
          <div class="profile-menu">
            <button
              class="sidebar-button profile-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="profile-menu"
            >
              Profile
            </button>
            <div class="profile-dropdown" id="profile-menu" hidden>
              <a href="/profile">View profile</a>
              <button type="button" data-action="logout">Logout</button>
            </div>
          </div>
        ` : ''}
      </nav>
    </aside>
  `
}

export function setupSidebar(sidebar, { onLogout } = {}) {
  const sidebarToggle = sidebar.querySelector('.sidebar-toggle')
  const profileToggle = sidebar.querySelector('.profile-toggle')
  const profileDropdown = sidebar.querySelector('.profile-dropdown')

  sidebarToggle?.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('is-collapsed')
    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed))
    sidebarToggle.setAttribute(
      'aria-label',
      isCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
    )
  })

  if (profileToggle && profileDropdown) {
    profileToggle.addEventListener('click', () => {
      const isOpen = profileToggle.getAttribute('aria-expanded') === 'true'
      profileToggle.setAttribute('aria-expanded', String(!isOpen))
      profileDropdown.hidden = isOpen
    })

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.profile-menu')) {
        profileToggle.setAttribute('aria-expanded', 'false')
        profileDropdown.hidden = true
      }
    })
  }

  const logoutButton = sidebar.querySelector('[data-action="logout"]')
  logoutButton?.addEventListener('click', () => {
    onLogout?.()
  })

  const campaignList = sidebar.querySelector('[data-campaign-list]')
  const pendingInviteCount = sidebar.querySelector('[data-pending-invite-count]')
  const setCampaignError = (error) => {
    if (campaignList) {
      campaignList.innerHTML = `<p class="campaign-list-message is-error">${escapeHtml(error.message)}</p>`
    }
  }

  const setCampaigns = (campaigns) => {
    if (!campaignList) {
      return
    }

    campaigns = Array.isArray(campaigns) ? campaigns : []

    if (!campaigns.length) {
      campaignList.innerHTML = '<p class="campaign-list-message">No campaigns yet.</p>'
      return
    }

    campaignList.innerHTML = campaigns.map((campaign) => `
      <div class="campaign-item">
        <div class="campaign-header">
          <a
            class="campaign-name"
            href="/campaign?campaignId=${encodeURIComponent(campaign.id)}"
            title="${escapeHtml(campaign.name)}"
          >
            ${escapeHtml(campaign.name)}
          </a>
          <button
            class="campaign-toggle"
            type="button"
            aria-expanded="false"
            aria-label="Show navigation for ${escapeHtml(campaign.name)}"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
        <div class="campaign-links" hidden>
          <a href="/map?campaignId=${encodeURIComponent(campaign.id)}">Map</a>
          <a href="/notes?campaignId=${encodeURIComponent(campaign.id)}">Notes</a>
        </div>
      </div>
    `).join('')

    campaignList.querySelectorAll('.campaign-item').forEach((item) => {
      const toggle = item.querySelector('.campaign-toggle')
      const links = item.querySelector('.campaign-links')
      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
        toggle.setAttribute('aria-expanded', String(!isExpanded))
        links.hidden = isExpanded
      })
    })
  }

  const loadCampaigns = () => {
    if (!campaignList) {
      return Promise.resolve()
    }

    return fetchCampaigns()
      .then(setCampaigns)
      .catch(setCampaignError)
  }

  loadCampaigns()

  const setPendingInviteCount = (invites) => {
    if (!pendingInviteCount) {
      return
    }

    const pendingCount = (Array.isArray(invites) ? invites : [])
      .filter((invite) => (invite.status || invite.invitationStatus) === 'PENDING')
      .length

    pendingInviteCount.textContent = String(pendingCount)
    pendingInviteCount.hidden = pendingCount === 0
    pendingInviteCount.setAttribute(
      'aria-label',
      `${pendingCount} pending invite${pendingCount === 1 ? '' : 's'}`,
    )
  }

  const loadPendingInvites = () => {
    if (!pendingInviteCount) {
      return Promise.resolve()
    }

    return fetchInvites()
      .then(setPendingInviteCount)
      .catch((error) => {
        console.error('Unable to load pending invites for sidebar.', error)
      })
  }

  loadPendingInvites()

  return {
    hasCampaignList: Boolean(campaignList),
    setCampaigns,
    setCampaignError,
    loadCampaigns,
    setPendingInviteCount,
    loadPendingInvites,
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
