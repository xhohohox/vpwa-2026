<template>
  <q-list>
    <div class="row items-center q-pl-md q-pr-sm q-pt-sm text-grey-7">
      Channels
      <q-space />
      <q-btn
        flat
        round
        dense
        icon="add"
        aria-label="Create channel"
        @click="createOpen = true"
      />
    </div>

    <q-item
      v-for="channel in sortedChannels"
      :key="channel.name"
      :to="channel.invited ? undefined : `/channels/${channel.name}`"
      :class="{ 'bg-amber-1': channel.invited }"
    >
      <q-item-section avatar>
        <q-icon :name="channel.isPrivate ? 'lock' : 'tag'" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ channel.name }}</q-item-label>
        <q-item-label v-if="channel.invited" caption>Invitation</q-item-label>
      </q-item-section>

      <q-item-section side>
        <div v-if="channel.invited" class="row no-wrap">
          <q-btn
            flat
            round
            dense
            color="positive"
            icon="check"
            aria-label="Accept invitation"
            @click="accept(channel)"
          />
          <q-btn
            flat
            round
            dense
            color="negative"
            icon="close"
            aria-label="Decline invitation"
            @click="removeChannel(channel.name, false)"
          />
        </div>

        <q-btn
          v-else
          flat
          round
          dense
          icon="more_vert"
          aria-label="Channel actions"
          @click.stop.prevent
        >
          <q-menu>
            <q-list style="min-width: 170px">
              <q-item clickable v-close-popup @click="leave(channel)">
                <q-item-section>Leave channel</q-item-section>
              </q-item>
              <q-item
                v-if="isOwner(channel)"
                clickable
                v-close-popup
                @click="remove(channel)"
              >
                <q-item-section class="text-negative">
                  Delete channel
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>

  <q-dialog v-model="createOpen">
    <q-card style="width: 100%; max-width: 360px">
      <q-form @submit="create">
        <q-card-section class="text-h6">Create channel</q-card-section>
        <q-card-section>
          <q-input
            v-model="newName"
            label="Channel name"
            outlined
            autofocus
            lazy-rules
            :rules="[required, noSpaces, isUnique]"
          />
          <q-toggle v-model="newIsPrivate" label="Private channel" />
          <div class="text-caption text-grey-7">
            {{
              newIsPrivate
                ? 'Only you can invite people.'
                : 'Anyone can join with /join.'
            }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn type="submit" color="primary" unelevated label="Create" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { currentUser, channels, messages } from '@/data/mock.js'
import { required, noSpaces } from '@/utils/validation.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// Invitations are highlighted and shown at the top of the list (use case 2)
const sortedChannels = computed(() => [
  ...channels.filter(channel => channel.invited),
  ...channels.filter(channel => !channel.invited)
])

// The admin of a channel is the user who created it
const isOwner = channel => channel.owner === currentUser.nickName

// --- Create ---

const createOpen = ref(false)
const newName = ref('')
const newIsPrivate = ref(false)

// channelName is unique
const isUnique = val =>
  !channels.some(channel => channel.name === val) || 'Channel already exists'

function create() {
  channels.push({
    name: newName.value,
    isPrivate: newIsPrivate.value,
    owner: currentUser.nickName,
    invited: false
  })
  router.push(`/channels/${newName.value}`)

  createOpen.value = false
  newName.value = ''
  newIsPrivate.value = false
}

// --- Invitations ---

function accept(channel) {
  channel.invited = false
  router.push(`/channels/${channel.name}`)
}

// --- Leave / delete ---

function leave(channel) {
  // When the admin leaves, the channel ceases to exist (use case 5)
  const owner = isOwner(channel)
  confirmThen(
    `Leave #${channel.name}?`,
    owner
      ? 'You are the admin, so leaving deletes the channel for everyone.'
      : 'The channel will disappear from your list.',
    () => removeChannel(channel.name, owner)
  )
}

function remove(channel) {
  confirmThen(
    `Delete #${channel.name}?`,
    'The channel and its messages will be deleted for everyone.',
    () => removeChannel(channel.name, true)
  )
}

// https://quasar.dev/quasar-plugins/dialog
function confirmThen(title, message, onOk) {
  $q.dialog({ title, message, cancel: true, persistent: true }).onOk(onOk)
}

function removeChannel(name, deleteMessages) {
  channels.splice(
    channels.findIndex(channel => channel.name === name),
    1
  )

  if (deleteMessages) {
    const kept = messages.filter(message => message.channel !== name)
    messages.splice(0, messages.length, ...kept)
  }

  // The open channel is gone, so switch to another one
  if (route.params.name === name) {
    const next = channels.find(channel => !channel.invited)
    router.push(next ? `/channels/${next.name}` : '/')
  }
}
</script>