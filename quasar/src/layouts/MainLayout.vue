<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Channels"
          @click="drawerOpen = !drawerOpen"
        />
        <q-toolbar-title>#{{ route.params.name }}</q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="logout"
          aria-label="Log out"
          to="/auth/login"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Channels</q-item-label>
        <q-item
          v-for="channel in sortedChannels"
          :key="channel.name"
          :to="`/channels/${channel.name}`"
          :class="{ 'bg-amber-1': channel.invited }"
        >
          <q-item-section avatar>
            <q-icon :name="channel.isPrivate ? 'lock' : 'tag'" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ channel.name }}</q-item-label>
            <q-item-label v-if="channel.invited" caption>
              Invitation
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white q-pa-sm">
      <q-input
        v-model="draft"
        :placeholder="`Message #${route.params.name}`"
        outlined
        dense
        @keyup.enter="send"
      >
        <template #append>
          <q-btn flat round dense icon="send" aria-label="Send" @click="send" />
        </template>
      </q-input>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { currentUser, channels, messages } from '@/data/mock.js'

const route = useRoute()

const drawerOpen = ref(false)
const draft = ref('')

// Invitations are highlighted and shown at the top of the list (use case 2)
const sortedChannels = computed(() => [
  ...channels.filter(channel => channel.invited),
  ...channels.filter(channel => !channel.invited)
])

function send() {
  const text = draft.value.trim()
  if (!text) return

  // Prototype: everything is sent as a message, commands (/join, ...) come later
  messages.push({
    id: messages.length + 1,
    channel: route.params.name,
    author: currentUser.nickName,
    text,
    createdAt: new Date()
  })
  draft.value = ''
}
</script>