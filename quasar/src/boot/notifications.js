// Notification about every new message (use case 8)
// https://quasar.dev/quasar-plugins/app-visibility
// https://developer.mozilla.org/en-US/docs/Web/API/Notification
import { watch } from 'vue'
import { AppVisibility } from 'quasar'
import { defineBoot } from '#q-app'
import { currentUser, channels, messages } from '@/data/mock.js'

const PREVIEW_LENGTH = 80

function shouldNotify(message) {
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
    !message.text.includes(`@${currentUser.nickName}`)
  ) {
    return false
  }
  return Notification.permission === 'granted'
}

export default defineBoot(({ router }) => {
  if (!('Notification' in window)) return

  document.addEventListener(
    'click',
    () => {
      if (Notification.permission === 'default')
        Notification.requestPermission()
    },
    { once: true }
  )

  watch(
    () => messages.length,
    (newLength, oldLength) => {
      if (newLength <= oldLength) return
      const message = messages.at(-1)
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
  )
})
