import { loginUser, storeAccessToken } from '../services/auth.js'

export function renderLoginModal() {
  return `
    <div class="modal-backdrop" id="login-modal" hidden>
      <section
        class="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button class="modal-close" type="button" aria-label="Close login">×</button>
        <h2 id="login-modal-title">Login</h2>

        <form class="login-form" id="login-form">
          <label class="field">
            <span class="visually-hidden">Username</span>
            <input
              type="text"
              name="identifier"
              autocomplete="username"
              placeholder="Username"
              pattern="[^@]+"
              title="Username must not contain @"
              required
            />
          </label>

          <label class="field">
            <span class="visually-hidden">Password</span>
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              placeholder="Password"
              required
            />
          </label>

          <button class="login-submit" type="submit">Login</button>
          <p class="login-links">
            <a href="/register">Create an account</a>
            <span aria-hidden="true"> | </span>
            <button class="forgot-password-link" type="button" disabled>Forgot Password?</button>
          </p>
          <p class="form-message" id="login-message" role="status" aria-live="polite"></p>
        </form>
      </section>
    </div>
  `
}

export function setupLoginModal(app) {
  const modal = app.querySelector('#login-modal')
  const closeButton = modal.querySelector('.modal-close')
  const form = modal.querySelector('#login-form')
  const message = modal.querySelector('#login-message')

  const close = () => {
    modal.hidden = true
    message.textContent = ''
    form.reset()
  }

  const open = () => {
    modal.hidden = false
    form.querySelector('input').focus()
  }

  app.querySelector('[data-action="login"]').addEventListener('click', open)
  closeButton.addEventListener('click', close)
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      close()
    }
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    message.textContent = 'Logging in...'
    message.classList.remove('is-error')

    const data = new FormData(form)

    try {
      const response = await loginUser({
        identifier: data.get('identifier'),
        password: data.get('password'),
      })
      storeAccessToken(response)
      window.location.href = '/'
    } catch (error) {
      message.textContent = error.message
      message.classList.add('is-error')
    }
  })
}
