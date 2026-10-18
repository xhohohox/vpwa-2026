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
          v-if="openChannel"
          flat
          dense
          round
          icon="group"
          aria-label="Members"
          @click="membersOpen = true"
        />

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
      <ChannelList />
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
      <CommandSuggestions :text="draft" @select="completeCommand" />
      <q-input
        ref="inputRef"
        v-model="draft"
        :placeholder="`Message #${route.params.name} or type a /command`"
        outlined
        dense
        @keyup.enter="send"
        @keydown.tab="completeOnTab"
      >
        <template #append>
          <q-btn flat round dense icon="send" aria-label="Send" @click="send" />
        </template>
      </q-input>
    </q-footer>
    <MembersDialog v-model="membersOpen" :channel="openChannel" />
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ChannelList from '@/components/ChannelList.vue'
import CommandSuggestions from '@/components/CommandSuggestions.vue'
import MembersDialog from '@/components/MembersDialog.vue'
import TypingIndicator from '@/components/TypingIndicator.vue'
import { currentUser, channels, messages, nextMessageId } from '@/data/mock.js'
import { runCommand, matchCommands } from '@/data/commands.js'
import { nextChannelPath } from '@/data/channels.js'
import { statusOptions } from '@/utils/status.js'
import { startTypingSimulation } from '@/data/typingSimulation.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

onMounted(startTypingSimulation)

const drawerOpen = ref(false)
const membersOpen = ref(false)
const draft = ref('')
const inputRef = ref(null)

// Picking a suggested command puts it into the command line
function completeCommand(name) {
  draft.value = name + ' '
  inputRef.value.focus()
}

// Tab completes the first suggested command, like in a terminal
function completeOnTab(event) {
  const [first] = matchCommands(draft.value)
  if (!first || draft.value.includes(' ')) return
  event.preventDefault()
  completeCommand(first.name)
}

const currentStatus = computed(() =>
  statusOptions.find(option => option.value === currentUser.status)
)

// The open channel, if I am its member (not only invited)
const openChannel = computed(() =>
  channels.find(
    channel =>
      channel.name === route.params.name &&
      channel.members.includes(currentUser.nickName)
  )
)

// The command line: text starting with / is a command, anything else a message
function send() {
  const text = draft.value.trim()
  if (!text) return

  if (text.startsWith('/')) {
    runAndShow(text)
    return
  }

  messages.push({
    id: nextMessageId(),
    channel: route.params.name,
    author: currentUser.nickName,
    text,
    createdAt: new Date()
  })
  draft.value = ''
}

function runAndShow(text) {
  const result = runCommand(text, route.params.name)

  // A failed command stays in the command line, so it can be fixed
  if (!result.ok) {
    $q.notify({ type: 'negative', message: result.text })
    return
  }
  draft.value = ''

  if (result.showMembers) {
    membersOpen.value = true
    return
  }
  // https://quasar.dev/quasar-plugins/notify
  $q.notify({ type: 'positive', message: result.text })
  if (result.open) router.push(`/channels/${result.open}`)
  if (result.leftChannel) router.push(nextChannelPath())
}
</script>