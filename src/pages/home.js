import { renderLoginModal, setupLoginModal } from '../components/login-modal.js'
import { renderSidebar, setupSidebar } from '../components/sidebar.js'
import { createCampaign } from '../services/campaigns.js'

export function renderHome({ isLoggedIn = false } = {}) {
  return `
    <main class="page-shell">
      ${renderSidebar({ isLoggedIn })}
      ${isLoggedIn ? '' : renderLoginModal()}
      <section class="signup" aria-labelledby="page-title">
        <h1 id="page-title">Campaign Manager</h1>
        ${isLoggedIn ? `
          <button class="new-campaign-button" type="button" data-action="create-campaign">
            New campaign
          </button>
          <div class="modal-backdrop" id="campaign-modal" hidden>
            <section
              class="campaign-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="campaign-modal-title"
            >
              <button class="modal-close" type="button" aria-label="Close campaign form">×</button>
              <h2 id="campaign-modal-title">New campaign</h2>
              <form class="campaign-form" id="campaign-form">
                <label class="field">
                  <span>Name</span>
                  <input type="text" name="name" placeholder="Campaign name" required />
                </label>
                <label class="field">
                  <span>Description</span>
                  <textarea name="description" placeholder="Campaign description" required></textarea>
                </label>
                <button type="submit">Create campaign</button>
                <p class="form-message" id="campaign-message" role="status" aria-live="polite"></p>
              </form>
            </section>
          </div>
        ` : ''}
      </section>
    </main>
  `
}

export function setupHome(app) {
  const sidebarSetup = setupSidebar(app.querySelector('.sidebar'), {
    onLogout: () => {
      window.localStorage.removeItem('campaign-manager-access-token')
      window.localStorage.removeItem('campaign-manager-user')
      window.localStorage.removeItem('campaign-manager-authenticated')
      window.location.href = '/'
    },
  })

  if (app.querySelector('[data-action="login"]')) {
    setupLoginModal(app)
  }

  const campaignButton = app.querySelector('[data-action="create-campaign"]')
  if (!campaignButton) {
    return
  }

  const modal = app.querySelector('#campaign-modal')
  const closeButton = modal.querySelector('.modal-close')
  const form = modal.querySelector('#campaign-form')
  const message = modal.querySelector('#campaign-message')

  const close = () => {
    modal.hidden = true
    message.textContent = ''
    form.reset()
  }

  campaignButton.addEventListener('click', () => {
    modal.hidden = false
    form.querySelector('input').focus()
  })
  closeButton.addEventListener('click', close)
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      close()
    }
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    message.textContent = 'Creating campaign...'
    message.classList.remove('is-error')

    const data = new FormData(form)

    try {
      await createCampaign({
        name: data.get('name'),
        description: data.get('description'),
      })
      await sidebarSetup.loadCampaigns()
      close()
    } catch (error) {
      message.textContent = error.message
      message.classList.add('is-error')
    }
  })
}
