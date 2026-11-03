import { renderSidebar, setupSidebar } from '../components/sidebar.js'
import { getStoredUser } from '../services/auth.js'

export function renderProfile({ isLoggedIn = false } = {}) {
  const user = getStoredUser()
  const profileImage = user?.username === '大神ミオ'
    ? '<img class="profile-image" src="https://yt3.googleusercontent.com/JV8VdQFA7eZk5H1cRxHyIdLKQ5wD6EBywjxLzrne2EpY9LSiVgtapvh0iQA6plVNxdIKNxK0NRU=s160-c-k-c0x00ffffff-no-rj" alt="Profile" />'
    : 'Profile image'

  return `
    <main class="page-shell">
      ${renderSidebar({ isLoggedIn })}
      <section class="profile-page" aria-labelledby="profile-title">
        <h1 id="profile-title">Profile</h1>

        <div class="profile-image-placeholder" aria-label="Profile image placeholder">
          ${profileImage}
        </div>
        <button class="profile-image-button" type="button" disabled>
          Upload image
        </button>

        <div class="profile-fields">
          <label class="field">
            <span>Username</span>
            <input id="profile-username" type="text" placeholder="Username" disabled />
          </label>
          <label class="field">
            <span>Email</span>
            <input id="profile-email" type="email" placeholder="Email" disabled />
          </label>
        </div>
      </section>
    </main>
  `
}

export function setupProfile(app) {
  const user = getStoredUser()
  app.querySelector('#profile-username').value = user?.username || ''
  app.querySelector('#profile-email').value = user?.email || ''

  setupSidebar(app.querySelector('.sidebar'), {
    onLogout: () => {
      window.localStorage.removeItem('campaign-manager-access-token')
      window.localStorage.removeItem('campaign-manager-user')
      window.localStorage.removeItem('campaign-manager-authenticated')
      window.location.href = '/'
    },
  })
}
