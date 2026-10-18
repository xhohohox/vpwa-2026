<template>
  <q-dialog v-model="model">
    <q-card style="width: 100%; max-width: 440px">
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon :name="channel.isPrivate ? 'lock' : 'tag'" color="grey-7" />
        <div class="text-h6">#{{ channel.name }}</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="Close"
          @click="model = false"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-caption text-grey-7">
          Admin {{ channel.owner }} &middot; {{ channel.members.length }}
          members
        </div>
        <q-banner v-if="error" class="bg-red-1 text-negative q-mt-sm" dense>
          {{ error }}
        </q-banner>
      </q-card-section>

      <q-card-section v-if="canInvite" class="q-pt-none">
        <UserSelect v-model="invitees" label="Invite member" :exclude="taken" />
        <q-btn
          class="q-mt-sm"
          label="Invite"
          color="primary"
          dense
          size="sm"
          no-caps
          :disable="!invitees.length"
          @click="sendInvites"
        />
      </q-card-section>

      <q-list>
        <q-item-label header>Members</q-item-label>
        <q-item v-for="member in channel.members" :key="member">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ member[0].toUpperCase() }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ member }}
              <q-badge
                v-if="member === channel.owner"
                color="amber-8"
                label="Admin"
                class="q-ml-xs"
              />
            </q-item-label>
            <q-item-label v-if="votesFor(member)" caption>
              {{ votesFor(member) }}/{{ requiredVotes }} votes to ban
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="canKick(member)" side>
            <q-btn
              :label="kickLabel(member)"
              :color="isMyAdmin ? 'negative' : 'warning'"
              dense
              size="sm"
              no-caps
              @click="kickMember(member)"
            />
          </q-item-section>
        </q-item>

        <template v-if="channel.invited.length">
          <q-item-label header>Invited</q-item-label>
          <q-item
            v-for="[invitedNick, inviter] in channel.invited"
            :key="invitedNick"
          >
            <q-item-section avatar>
              <q-avatar color="grey-5" text-color="white">
                {{ invitedNick[0].toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ invitedNick }}</q-item-label>
              <q-item-label caption>invited by {{ inviter }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="isMyAdmin || inviter === nick" side>
              <q-btn
                label="Uninvite"
                color="warning"
                dense
                size="sm"
                no-caps
                @click="uninviteMember(invitedNick)"
              />
            </q-item-section>
          </q-item>
        </template>

        <template v-if="channel.banned.length">
          <q-item-label header>Banned</q-item-label>
          <q-item v-for="nickName in channel.banned" :key="nickName">
            <q-item-section avatar>
              <q-avatar color="negative" text-color="white">
                {{ nickName[0].toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section>{{ nickName }}</q-item-section>
            <q-item-section v-if="isMyAdmin" side>
              <q-btn
                label="Restore"
                color="positive"
                dense
                size="sm"
                no-caps
                @click="restoreMember(nickName)"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <q-card-actions v-if="isMember" align="right">
        <q-btn flat label="Close" v-close-popup />
        <q-btn
          :label="isMyAdmin ? 'Close channel' : 'Leave channel'"
          :color="isMyAdmin ? 'negative' : 'primary'"
          unelevated
          @click="quitNow"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { currentUser } from '@/data/mock.js'
import {
  kick,
  invite,
  uninvite,
  leaveChannel,
  quitChannel,
  kickVotesRequired
} from '@/data/channels.js'
import UserSelect from '@/components/UserSelect.vue'

const props = defineProps({
  channel: { type: Object, required: true }
})
const emit = defineEmits(['left'])
const model = defineModel()

const $q = useQuasar()
const error = ref('')
const invitees = ref([])

const nick = currentUser.nickName
const isMyAdmin = computed(() => props.channel.owner === nick)
const isMember = computed(() => props.channel.members.includes(nick))

// an admin invites in any channel, a plain member only in a public one
const canInvite = computed(
  () => isMember.value && (!props.channel.isPrivate || isMyAdmin.value)
)

// members, invited and banned nickNames are not selectable
const taken = computed(() => [
  ...props.channel.members,
  ...props.channel.invited.map(([invitedNick]) => invitedNick),
  ...props.channel.banned
])

const votesFor = member => props.channel.kickVotes[member]?.length ?? 0
const requiredVotes = computed(() => kickVotesRequired(props.channel))
const hasVoted = member =>
  props.channel.kickVotes[member]?.includes(nick) ?? false

// second press on "Vote kick" takes the vote back
const kickLabel = member =>
  isMyAdmin.value ? 'Ban' : hasVoted(member) ? 'Undo vote' : 'Vote kick'

// The admin bans right away, a member of a public channel only collects
// votes (half +1 of the members = ban), a private channel is off limits
function canKick(member) {
  if (!isMember.value) return false
  if (member === nick || member === props.channel.owner) return false
  return isMyAdmin.value || !props.channel.isPrivate
}

function run(action) {
  error.value = ''
  try {
    action()
    return true
  } catch (e) {
    error.value = e.message
    return false
  }
}

function kickMember(member) {
  run(() => kick(nick, props.channel.name, member))
}

function uninviteMember(invitedNick) {
  run(() => uninvite(nick, props.channel.name, invitedNick))
}

function sendInvites() {
  const selected = [...invitees.value]
  const done = run(() => {
    selected.forEach(nickName => invite(nick, props.channel.name, nickName))
  })
  if (done) invitees.value = []
}

// The admin lifting the ban restores access (the user gets an invitation)
function restoreMember(nickName) {
  run(() => invite(nick, props.channel.name, nickName))
}

function quitMessage() {
  if (isMyAdmin.value) {
    return 'You are the admin, so this closes the channel for everyone.'
  }
  if (props.channel.isPrivate)
    return 'The channel will disappear from your list.'
  return 'You can rejoin it with one click.'
}

function quitNow() {
  const channel = props.channel
  const admin = isMyAdmin.value
  $q.dialog({
    title: `Leave #${channel.name}?`,
    message: quitMessage(),
    cancel: true,
    persistent: true
  }).onOk(() => {
    const closed = run(() =>
      admin ? quitChannel(nick, channel.name) : leaveChannel(nick, channel.name)
    )
    if (!closed) return
    model.value = false
    emit('left', channel.name)
  })
}
</script>
