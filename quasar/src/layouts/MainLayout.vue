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

        <q-btn flat dense no-caps aria-label="Status and settings">
          <q-avatar size="32px" color="white" text-color="primary">
            {{ currentUser.nickName[0].toUpperCase() }}
            <q-badge :color="currentStatus.color" rounded floating />
          </q-avatar>
          <span class="gt-xs q-ml-sm">{{ currentUser.nickName }}</span>

          <q-menu>
            <q-list style="min-width: 260px">
              <q-item-label header>Status</q-item-label>
              <q-item
                v-for="option in statusOptions"
                :key="option.value"
                :active="currentUser.status === option.value"
                clickable
                v-close-popup
                @click="currentUser.status = option.value"
              >
                <q-item-section avatar>
                  <q-icon name="circle" :color="option.color" size="12px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ option.label }}</q-item-label>
                  <q-item-label v-if="option.description" caption>
                    {{ option.description }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item tag="label">
                <q-item-section>
                  <q-item-label>Only mentions</q-item-label>
                  <q-item-label caption>
                    Notify me only about messages with @{{
                      currentUser.nickName
                    }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="currentUser.notifyMentionsOnly" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

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
      <TypingIndicator :channel="route.params.name" />
      <div
        v-if="currentUser.status === 'offline'"
        class="text-caption text-grey-8 q-mb-xs"
      >
        You are offline. New messages will show up when you go online.
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TypingIndicator from '@/components/TypingIndicator.vue'
import { currentUser, channels, messages } from '@/data/mock.js'
import { startTypingSimulation } from '@/data/typingSimulation.js'

const route = useRoute()

onMounted(startTypingSimulation)

const drawerOpen = ref(false)
const draft = ref('')

// User status (use case 9): DND pauses notifications, offline pauses messages
const statusOptions = [
  { value: 'online', label: 'Online', color: 'green' },
  {
    value: 'dnd',
    label: 'Do not disturb',
    color: 'red',
    description: 'No notifications'
  },
  {
    value: 'offline',
    label: 'Offline',
    color: 'grey',
    description: 'No new messages'
  }
]

const currentStatus = computed(() =>
  statusOptions.find(option => option.value === currentUser.status)
)

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