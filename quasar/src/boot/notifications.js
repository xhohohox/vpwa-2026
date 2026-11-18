// Prepares the notifications about new messages (use case 8) before the app starts
// https://quasar.dev/quasar-cli-vite/boot-files
import { defineBoot } from '#q-app'
import { initNotifications } from '@/services/notifications.js'

export default defineBoot(({ router }) => {
  initNotifications(router)
})
