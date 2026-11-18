// Notification about every new message (use case 8)
// https://quasar.dev/quasar-plugins/app-visibility
// https://developer.mozilla.org/en-US/docs/Web/API/Notification
import { AppVisibility } from 'quasar'
import { currentUser, channels } from '@/data/mock.js'

const PREVIEW_LENGTH = 80

// clicking a notification opens its channel
let router = null

// Called once when the app starts (boot/notifications.js)
export function initNotifications(appRouter) {
  router = appRouter
  if (!('Notification' in window)) return

  document.addEventListener(
    'click',
    () => {
      if (Notification.permission === 'default')
        Notification.requestPermission()
    },
    { once: true }
  )
}

function shouldNotify(message) {
  if (!('Notification' in window)) return false
  if (message.author === currentUser.nickName) return false
  // Only from channels I am a member of (not after leaving or being invited)
  const mine = channels.some(
    channel =>
      channel.name === message.channel &&
      channel.members.includes(currentUser.nickName)
  )
  if (!mine) return false
  // Only when the app is not visible (another tab, minimized window)
  if (AppVisibility.appVisible) return false
  // DND: no notifications, offline: no messages at all (use case 9)
  if (currentUser.status !== 'online') return false
  if (
    currentUser.notifyMentionsOnly &&
    !message.mentions.includes(currentUser.nickName)
  ) {
    return false
  }
  return Notification.permission === 'granted'
}

// A new message came over the websocket, from any of my channels
export function notifyMessage(message) {
  if (!shouldNotify(message)) return

  const text =
    message.text.length > PREVIEW_LENGTH
      ? message.text.slice(0, PREVIEW_LENGTH) + '...'
      : message.text
  const notification = new Notification(
    `${message.author} in #${message.channel}`,
    { body: text }
  )

  notification.onclick = () => {
    window.focus()
    router.push(`/channels/${message.channel}`)
  }
}
