<template>
  <q-page class="q-pa-md">
    <!-- https://quasar.dev/vue-components/infinite-scroll -->
    <!-- reverse: starts at the bottom and loads older messages at the top -->
    <q-infinite-scroll
      :key="route.params.name"
      reverse
      :disable="!hasOlder"
      @load="loadOlder"
    >
      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="32px" />
        </div>
      </template>

      <div
        v-if="loaded && !hasOlder && channelMessages.length > 0"
        class="text-caption text-grey text-center q-mb-md"
      >
        This is the beginning of #{{ route.params.name }}
      </div>

      <q-chat-message
        v-for="message in channelMessages"
        :key="message.id"
        :name="message.author"
        :text="[message.text]"
        :stamp="formatTime(message.createdAt)"
        :sent="message.author === currentUser.nickName"
        :bg-color="mentionsMe(message) ? 'amber-3' : undefined"
      />
    </q-infinite-scroll>

    <div
      v-if="loaded && channelMessages.length === 0"
      class="text-grey text-center"
    >
      No messages yet
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser, channels, messages } from '@/data/mock.js'
import { loadMessages, addMessages } from '@/services/messages.js'

// Until the WebSockets, new messages are asked for every few seconds
const POLL_MS = 3000

const route = useRoute()

const isMember = name =>
  channels.some(
    channel =>
      channel.name === name && channel.members.includes(currentUser.nickName)
  )

// Messages only from a channel I am a member of
const channelMessages = computed(() => {
  if (!isMember(route.params.name)) return []
  return messages.filter(message => message.channel === route.params.name)
})

const loaded = ref(false)
const hasOlder = ref(false)

const scrollToBottom = () => window.scrollTo(0, document.body.scrollHeight)

// Every opened channel starts with the newest page from the server
watch(
  () => route.params.name,
  async name => {
    messages.splice(0)
    loaded.value = false
    hasOlder.value = false
    if (!isMember(name)) return

    let page
    try {
      page = await loadMessages(name)
    } catch {
      return // the server is not reachable, nothing to show
    }
    // another channel was opened in the meantime
    if (route.params.name !== name) return
    addMessages(page)
    loaded.value = true
    hasOlder.value = page.length > 0

    await nextTick()
    scrollToBottom()
  },
  { immediate: true }
)

// Complete history with infinite scroll (use case 7): older messages are
// loaded from the server when scrolling up. Quasar passes the batch number
// (not needed here) and done() to call when loaded
async function loadOlder(_index, done) {
  const name = route.params.name
  const [oldest] = channelMessages.value
  try {
    const older = oldest ? await loadMessages(name, { before: oldest.id }) : []
    if (route.params.name === name) {
      addMessages(older)
      hasOlder.value = older.length > 0
    }
  } catch {
    hasOlder.value = false
  }
  done()
}

// An offline user receives nothing until they go online again (use case 9)
async function loadNewer() {
  const name = route.params.name
  if (!loaded.value || !isMember(name) || currentUser.status === 'offline')
    return
  const newest = channelMessages.value.at(-1)
  try {
    const newer = await loadMessages(name, newest ? { after: newest.id } : {})
    if (route.params.name === name) addMessages(newer)
  } catch {
    // the next try comes in a few seconds
  }
}

let timer
onMounted(() => {
  timer = setInterval(loadNewer, POLL_MS)
})
onUnmounted(() => clearInterval(timer))

// Keep the newest message in view when one arrives, unless the user
// is reading older history (then only their own message scrolls down)
watch(
  () => channelMessages.value.at(-1)?.id,
  async (id, oldId) => {
    if (!id || !oldId || id <= oldId) return
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 150
    const mine = channelMessages.value.at(-1).author === currentUser.nickName
    if (!nearBottom && !mine) return

    await nextTick()
    scrollToBottom()
  }
)

// Messages addressed to me with @nickname are highlighted (use case 6)
const mentionsMe = message =>
  message.author !== currentUser.nickName &&
  message.mentions.includes(currentUser.nickName)

// Today's messages show only the time, older ones also the date
const formatTime = date =>
  date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString([], {
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
</script>