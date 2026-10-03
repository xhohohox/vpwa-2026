<template>
  <q-page class="q-pa-md">
    <q-chat-message
      v-for="message in channelMessages"
      :key="message.id"
      :name="message.author"
      :text="[message.text]"
      :stamp="formatTime(message.createdAt)"
      :sent="message.author === currentUser.nickName"
      :bg-color="mentionsMe(message) ? 'amber-3' : undefined"
    />
    <div v-if="channelMessages.length === 0" class="text-grey text-center">
      No messages yet
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser, messages } from '@/data/mock.js'

const route = useRoute()

const channelMessages = computed(() =>
  messages.filter(message => message.channel === route.params.name)
)

// Messages addressed to me with @nickname are highlighted (use case 6)
const mentionsMe = message =>
  message.author !== currentUser.nickName &&
  message.text.includes(`@${currentUser.nickName}`)

const formatTime = date =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
</script>