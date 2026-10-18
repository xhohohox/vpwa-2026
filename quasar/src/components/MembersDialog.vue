<template>
  <q-dialog v-model="open">
    <q-card style="width: 100%; max-width: 360px">
      <q-card-section class="text-h6">
        Members of #{{ channel?.name }}
      </q-card-section>

      <q-list>
        <q-item v-for="member in members" :key="member.nickName">
          <q-item-section avatar>
            <q-icon
              name="circle"
              :color="statusColor(member.status)"
              size="12px"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ member.nickName }}</q-item-label>
            <q-item-label caption>
              {{ member.invited ? 'invited' : member.status }}
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="member.nickName === channel.owner" side>
            <q-badge color="primary" label="admin" />
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-actions align="right">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { currentUser, users } from '@/data/mock.js'
import { statusColor } from '@/utils/status.js'

// v-model of the parent opens and closes the dialog
const open = defineModel({ type: Boolean })

const props = defineProps({
  channel: { type: Object, default: null }
})

// My status comes from my settings, the others from the user list
const statusOf = nick =>
  nick === currentUser.nickName
    ? currentUser.status
    : (users.find(user => user.nickName === nick)?.status ?? 'offline')

// Members of the channel and the users invited to it (use case 10)
const members = computed(() => {
  if (!props.channel) return []
  return [
    ...props.channel.members.map(nick => ({
      nickName: nick,
      status: statusOf(nick),
      invited: false
    })),
    ...props.channel.invites.map(nick => ({
      nickName: nick,
      status: statusOf(nick),
      invited: true
    }))
  ]
})
</script>