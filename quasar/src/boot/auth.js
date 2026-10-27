// Runs before the app starts
// https://quasar.dev/quasar-cli-vite/boot-files
import { defineBoot } from '#q-app'
import { isLoggedIn, loadProfile } from '@/services/auth.js'

export default defineBoot(async ({ router }) => {
  // load the user, so the page reload keeps them logged in
  if (isLoggedIn()) await loadProfile()

  // only logged-in users get into the chat, logged-in users skip the login
  router.beforeEach(to => {
    const authPage = to.path.startsWith('/auth')
    if (!authPage && !isLoggedIn()) return '/auth/login'
    if (authPage && isLoggedIn()) return '/'
  })
})