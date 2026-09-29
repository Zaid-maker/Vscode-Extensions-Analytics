import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts: bundled with the app CSS so they load in the first
// paint pass — no third-party CSS chain, no late font swap re-layout
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import './index.css'
import App from './App.jsx'
import { COLLECTIONS } from './data/collections.js'

// Prerendered /best/<slug> collection pages are complete static documents —
// mounting the app over them would swap the listicle visitors came for back
// to the homepage UI. Known slugs stay static (trailing slash tolerated —
// local static servers keep it, Vercel's trailingSlash:false redirects it);
// unknown ones fall through to the app, which handles them as a friendly
// redirect to the homepage.
const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isStaticCollectionPage =
  path.startsWith('/best/') && COLLECTIONS.some((c) => `/best/${c.slug}` === path)

if (!isStaticCollectionPage) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
