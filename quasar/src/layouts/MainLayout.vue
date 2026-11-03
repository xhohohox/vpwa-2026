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
                @click="saveSettings({ status: option.value })"
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
                  <q-toggle
                    :model-value="currentUser.notifyMentionsOnly"
                    @update:model-value="
                      value => saveSettings({ notifyMentionsOnly: value })
                    "
                  />
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
          @click="onLogout"
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
      <div class="relative-position">
        <CommandSuggestions
          v-if="!mentionOptions.length"
          :text="draft"
          @select="completeCommand"
        />

        <q-list
          v-if="mentionOptions.length"
          class="absolute bg-white shadow-2 rounded-borders"
          style="bottom: 100%; left: 0; right: 0; z-index: 6000"
        >
          <q-item
            v-for="(nick, index) in mentionOptions"
            :key="nick"
            clickable
            :active="index === mentionIndex"
            @mousedown.prevent="acceptMention(nick)"
          >
            <q-item-section avatar>
              <q-avatar size="24px" color="primary" text-color="white">
                {{ nick[0].toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section
              :class="
                index === mentionIndex
                  ? 'text-primary text-weight-medium'
                  : 'text-grey-7'
              "
            >
              {{ nick }}
            </q-item-section>
          </q-item>
        </q-list>

        <q-input
          ref="inputRef"
          v-model="draft"
          :placeholder="`Message #${route.params.name} or type a /command`"
          outlined
          dense
          @keydown="onKeydown"
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              icon="send"
              aria-label="Send"
              @click="send"
            />
          </template>
        </q-input>
      </div>
    </q-footer>
    <MembersDialog v-model="membersOpen" :channel="openChannel" />
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ChannelList from '@/components/ChannelList.vue'
import CommandSuggestions from '@/components/CommandSuggestions.vue'
import MembersDialog from '@/components/MembersDialog.vue'
import TypingIndicator from '@/components/TypingIndicator.vue'
import {
  currentUser,
  channels,
  messages,
  nextMessageId,
  users
} from '@/data/mock.js'
import { runCommand, matchCommands } from '@/data/commands.js'
import { nextChannelPath } from '@/data/channels.js'
import { fuzzyMatch } from '@/utils/fuzzy.js'
import { statusOptions } from '@/utils/status.js'
import { startTypingSimulation } from '@/data/typingSimulation.js'
import { logout, updateSettings } from '@/services/auth.js'
import { errorText } from '@/services/api.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

onMounted(startTypingSimulation)

// Invalidating token
async function onLogout() {
  await logout()
  router.push('/auth/login')
}

async function saveSettings(settings) {
  try {
    await updateSettings(settings)
  } catch (error) {
    $q.notify({ type: 'negative', message: errorText(error) })
  }
}

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

// Typing "@" in the command line fuzzy searches the nickNames; the results
// are shown above the field
const mentionIndex = ref(0)

const mention = computed(() => {
  const match = /(?:^|\s)@(\w*)$/.exec(draft.value)
  return match ? match[1] : null
})

const mentionOptions = computed(() => {
  if (mention.value === null) return []
  return users
    .map(user => user.nickName)
    .filter(nick => fuzzyMatch(nick, mention.value))
    .slice(0, 6)
})

watch(mentionOptions, () => {
  mentionIndex.value = 0
})

function acceptMention(nick) {
  draft.value = draft.value.replace(/@\w*$/, `@${nick} `)
  mentionIndex.value = 0
}

function moveMention(step) {
  const count = mentionOptions.value.length
  mentionIndex.value = (mentionIndex.value + step + count) % count
}

// Tab and Enter take the highlighted nickname, otherwise Enter sends the line
function onKeydown(event) {
  if (mentionOptions.value.length) {
    if (event.key === 'Tab') {
      event.preventDefault()
      acceptMention(mentionOptions.value[mentionIndex.value])
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveMention(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveMention(-1)
      return
    }
  }

  // Without nickname suggestions, Tab completes the suggested /command
  if (event.key === 'Tab') {
    completeOnTab(event)
    return
  }

  if (event.key === 'Enter') {
    if (mentionOptions.value.length) {
      event.preventDefault()
      acceptMention(mentionOptions.value[mentionIndex.value])
      return
    }
    send()
  }
}

// Leaving a channel takes access away: a channel I am neither a member of nor
// invited to cannot stay open. The server sends only my channels, so a channel
// missing from the list is not mine either.
watch(
  () => route.params.name,
  name => {
    const channel = channels.find(c => c.name === name)
    const member = channel?.members.includes(currentUser.nickName)
    const invited = channel?.invited.some(
      ([nick]) => nick === currentUser.nickName
    )
    const next = nextChannelPath()
    if (!member && !invited && next !== '/') router.replace(next)
  },
  { immediate: true }
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
