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
      :class="{ 'bg-amber-1': isInvited(channel) }"
      @click="open(channel)"
    >
      <q-item-section avatar>
        <q-icon :name="channel.isPrivate ? 'lock' : 'tag'" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ channel.name }}</q-item-label>
        <q-item-label v-if="isInvited(channel)" caption>
          Invitation
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <div v-if="isInvited(channel)" class="row no-wrap">
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
            @click="decline(channel)"
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
              <q-item clickable v-close-popup @click="openDetails(channel)">
                <q-item-section>Details</q-item-section>
              </q-item>
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

  <ChannelCreateDialog v-model="createOpen" />

  <ChannelDetails
    v-if="detailsChannel"
    v-model="detailsOpen"
    :channel="detailsChannel"
    @left="goAwayFrom"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { currentUser, channels } from '@/data/mock.js'
import {
  joinChannel,
  leaveChannel,
  quitChannel,
  nextChannelPath
} from '@/data/channels.js'
import ChannelCreateDialog from '@/components/ChannelCreateDialog.vue'
import ChannelDetails from '@/components/ChannelDetails.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const isMember = channel => channel.members.includes(currentUser.nickName)

// invited - [nickName, inviter] pairs, only the listed nickName is invited
const isInvited = channel =>
  channel.invited.some(([nick]) => nick === currentUser.nickName)

// The admin of a channel is the user who created it
const isOwner = channel => channel.owner === currentUser.nickName

// Only channels I am a member of or invited to (use case 2). After leaving
// or being banned the channel drops out; other channels are joined with /join.
const listedChannels = computed(() =>
  channels.filter(channel => isMember(channel) || isInvited(channel))
)

// Invitations are highlighted and shown at the top of the list (use case 2)
const sortedChannels = computed(() => [
  ...listedChannels.value.filter(isInvited),
  ...listedChannels.value.filter(channel => !isInvited(channel))
])

// --- Create ---

const createOpen = ref(false)

// --- Details ---

const detailsOpen = ref(false)
const detailsChannel = ref(null)

function openDetails(channel) {
  detailsChannel.value = channel
  detailsOpen.value = true
}

// --- Invitations ---

function accept(channel) {
  joinChannel(currentUser.nickName, channel.name)
  router.push(`/channels/${channel.name}`)
}

function decline(channel) {
  channel.invited = channel.invited.filter(
    ([nick]) => nick !== currentUser.nickName
  )
}

// Clicking a channel opens it; an invitation has to be accepted first
function open(channel) {
  if (isInvited(channel)) return
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
      : leaveMessage(channel),
    () => {
      leaveChannel(currentUser.nickName, channel.name)
      goAwayFrom(channel.name)
    }
  )
}

function leaveMessage(channel) {
  // The channel drops out of the list, a public one can be rejoined
  if (channel.isPrivate) return 'The channel will disappear from your list.'
  return `The channel will disappear from your list, /join ${channel.name} brings you back.`
}

function remove(channel) {
  confirmThen(
    `Delete #${channel.name}?`,
    'The channel and its messages will be deleted for everyone.',
    () => {
      quitChannel(currentUser.nickName, channel.name)
      goAwayFrom(channel.name)
    }
  )
}

// https://quasar.dev/quasar-plugins/dialog
function confirmThen(title, message, onOk) {
  $q.dialog({ title, message, cancel: true, persistent: true }).onOk(onOk)
}

// The open channel is gone, so switch to another one I am a member of
function goAwayFrom(name) {
  if (route.params.name !== name) return
  router.push(nextChannelPath())
}
</script>