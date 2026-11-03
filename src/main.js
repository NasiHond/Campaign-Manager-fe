import './style.css'
import { renderHome, setupHome } from './pages/home.js'
import { renderProfile, setupProfile } from './pages/profile.js'
import { renderRegister, setupRegister } from './pages/register.js'
import { renderInvites, setupInvites } from './pages/invites.js'
import { renderCampaign, setupCampaign } from './pages/campaign.js'
import { hasAccessToken } from './services/auth.js'

const isLoggedIn = hasAccessToken()

const routes = {
  '/': {
    render: () => renderHome({ isLoggedIn }),
    setup: setupHome,
  },
  '/home': {
    render: () => renderHome({ isLoggedIn }),
    setup: setupHome,
  },
  '/register': {
    render: () => renderRegister({ isLoggedIn }),
    setup: setupRegister,
  },
  '/profile': {
    render: () => renderProfile({ isLoggedIn }),
    setup: setupProfile,
  },
  '/invites': {
    render: () => renderInvites({ isLoggedIn }),
    setup: setupInvites,
  },
  '/campaign': {
    render: () => renderCampaign({ isLoggedIn }),
    setup: setupCampaign,
  },
}

const route = routes[window.location.pathname] || routes['/']
const app = document.querySelector('#app')

app.innerHTML = route.render()
route.setup(app)