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
      :to="isInvited(channel) ? undefined : `/channels/${channel.name}`"
      :class="{ 'bg-amber-1': isInvited(channel) }"
      @click="joinPublic(channel)"
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
            @click="removeAndLeave(channel.name, false)"
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
import { channels } from '@/data/mock.js'
import {
  isOwner,
  channelExists,
  createChannel,
  acceptInvitation,
  removeChannel,
  nextChannelPath
} from '@/data/channelActions.js'
import { required, noSpaces } from '@/utils/validation.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const isMember = channel => channel.members.includes(currentUser.nickName)

// invited - [nickName, inviter] pairs, only the listed nickName is invited
const isInvited = channel =>
  channel.invited.some(([nick]) => nick === currentUser.nickName)

// --- Create ---

const createOpen = ref(false)
const newName = ref('')
const newIsPrivate = ref(false)

const isUnique = val => !channelExists(val) || 'Channel already exists'

function create() {
  createChannel(newName.value, newIsPrivate.value)
  router.push(`/channels/${newName.value}`)

  createOpen.value = false
  newName.value = ''
  newIsPrivate.value = false
}

// --- Invitations ---

function accept(channel) {
  acceptInvitation(channel)
  router.push(`/channels/${channel.name}`)
}

function decline(channel) {
  channel.invited = channel.invited.filter(
    ([nick]) => nick !== currentUser.nickName
  )
}

// Clicking a public channel you are not in yet behaves like /join
function joinPublic(channel) {
  if (!channel.isPrivate && !isInvited(channel) && !isMember(channel)) {
    joinChannel(currentUser.nickName, channel.name)
  }
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
    () => removeAndLeave(channel.name, owner)
  )
}

function leaveMessage(channel) {
  // A private channel drops out of the list, a public one can be rejoined
  if (channel.isPrivate) return 'The channel will disappear from your list.'
  return 'You can rejoin it with one click.'
}

function remove(channel) {
  confirmThen(
    `Delete #${channel.name}?`,
    'The channel and its messages will be deleted for everyone.',
    () => removeAndLeave(channel.name, true)
  )
}

// https://quasar.dev/quasar-plugins/dialog
function confirmThen(title, message, onOk) {
  $q.dialog({ title, message, cancel: true, persistent: true }).onOk(onOk)
}

function removeAndLeave(name, deleteChannel) {
  removeChannel(name, deleteChannel)
  // The open channel is gone, so switch to another one
  if (route.params.name === name) router.push(nextChannelPath())
}
</script>
