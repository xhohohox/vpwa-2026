<template>
  <q-page class="q-pa-md">
    <!-- https://quasar.dev/vue-components/infinite-scroll -->
    <!-- reverse: starts at the bottom and loads older messages at the top -->
    <q-infinite-scroll
      :key="route.params.name"
      reverse
      :disable="firstVisible === 0"
      @load="loadOlder"
    >
      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="32px" />
        </div>
      </template>

      <div
        v-if="firstVisible === 0 && channelMessages.length > 0"
        class="text-caption text-grey text-center q-mb-md"
      >
        This is the beginning of #{{ route.params.name }}
      </div>

      <q-chat-message
        v-for="message in visibleMessages"
        :key="message.id"
        :name="message.author"
        :text="[message.text]"
        :stamp="formatTime(message.createdAt)"
        :sent="message.author === currentUser.nickName"
        :bg-color="mentionsMe(message) ? 'amber-3' : undefined"
      />
    </q-infinite-scroll>

    <div v-if="channelMessages.length === 0" class="text-grey text-center">
      No messages yet
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser, channels, messages } from '@/data/mock.js'

const PAGE_SIZE = 15

const route = useRoute()

// Messages only from a channel I am a member of
const channelMessages = computed(() => {
  const member = channels.some(
    channel =>
      channel.name === route.params.name &&
      channel.members.includes(currentUser.nickName)
  )
  if (!member) return []
  return messages.filter(message => message.channel === route.params.name)
})

// Complete history with infinite scroll (use case 7): only the newest messages
// are rendered, older ones are added in batches when scrolling up
const firstVisible = ref(0)

const visibleMessages = computed(() =>
  channelMessages.value.slice(firstVisible.value)
)

// Every opened channel starts again with only the newest batch
watch(
  () => route.params.name,
  () => {
    firstVisible.value = Math.max(0, channelMessages.value.length - PAGE_SIZE)
  },
  { immediate: true }
)

// Quasar passes the batch number (not needed here) and done() to call when loaded
function loadOlder(_index, done) {
  // Prototype: a short delay pretends the older messages come from the server
  setTimeout(() => {
    firstVisible.value = Math.max(0, firstVisible.value - PAGE_SIZE)
    done()
  }, 500)
}

// Keep the newest message in view when one arrives, unless the user
// is reading older history (then only their own message scrolls down)
watch(
  () => channelMessages.value.length,
  async (newLength, oldLength) => {
    if (newLength <= oldLength) return
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 150
    const mine = channelMessages.value.at(-1).author === currentUser.nickName
    if (!nearBottom && !mine) return

    await nextTick()
    window.scrollTo(0, document.body.scrollHeight)
  }
)

// Messages addressed to me with @nickname are highlighted (use case 6)
const mentionsMe = message =>
  message.author !== currentUser.nickName &&
  message.text.includes(`@${currentUser.nickName}`)

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