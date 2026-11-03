import { renderBrandMark } from '../components/brand-mark.js'
import { renderLoginModal, setupLoginModal } from '../components/login-modal.js'
import { renderSidebar, setupSidebar } from '../components/sidebar.js'
import { registerUser, storeAccessToken } from '../services/auth.js'

export function renderRegister({ isLoggedIn = false } = {}) {
  return `
    <main class="page-shell">
      ${renderSidebar({ isLoggedIn })}
      ${isLoggedIn ? '' : renderLoginModal()}
      <section class="signup" aria-labelledby="page-title">
        ${renderBrandMark()}

        <form class="signup-form" id="signup-form">
          <label class="field">
            <span class="visually-hidden">Email</span>
            <input
              type="text"
              name="email"
              autocomplete="email"
              placeholder="Email"
              required
            />
          </label>

          <label class="field">
            <span class="visually-hidden">Username</span>
            <input
              type="text"
              name="username"
              autocomplete="username"
              placeholder="Username"
              required
            />
          </label>

          <label class="field">
            <span class="visually-hidden">Password</span>
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              placeholder="Password"
              minlength="8"
              required
            />
          </label>

          <label class="field">
            <span class="visually-hidden">Confirm password</span>
            <input
              type="password"
              name="passwordConfirmation"
              autocomplete="new-password"
              placeholder="Confirm password"
              minlength="8"
              required
            />
          </label>

          <button type="submit">Create account</button>
          <p class="form-message" id="form-message" role="status" aria-live="polite"></p>
        </form>
      </section>
    </main>
  `
}

export function setupRegister(app) {
  const sidebar = app.querySelector('.sidebar')

  setupSidebar(sidebar, {
    onLogout: () => {
      window.localStorage.removeItem('campaign-manager-access-token')
      window.localStorage.removeItem('campaign-manager-user')
      window.localStorage.removeItem('campaign-manager-authenticated')
      window.location.href = '/'
    },
  })

  if (sidebar.querySelector('[data-action="login"]')) {
    setupLoginModal(app)
  }

  const form = app.querySelector('#signup-form')
  const message = app.querySelector('#form-message')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const data = new FormData(form)
    const password = data.get('password')
    const confirmation = data.get('passwordConfirmation')

    if (password !== confirmation) {
      message.textContent = 'Passwords do not match.'
      message.classList.add('is-error')
      return
    }

    message.textContent = 'Creating account...'
    message.classList.remove('is-error')

    try {
      const response = await registerUser({
        username: data.get('username'),
        email: data.get('email'),
        password,
      })
      storeAccessToken(response)
      window.location.href = '/'
    } catch (error) {
      message.textContent = error.message
      message.classList.add('is-error')
    }
  })
}
