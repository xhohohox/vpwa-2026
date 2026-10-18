<template>
  <q-dialog v-model="model">
    <q-card style="width: 100%; max-width: 360px">
      <q-form @submit="create">
        <q-card-section class="text-h6">Create channel</q-card-section>
        <q-card-section>
          <q-input
            v-model="name"
            label="Channel name"
            outlined
            autofocus
            lazy-rules
            :rules="[required, noSpaces, isUnique]"
          />
          <q-toggle v-model="isPrivate" label="Private channel" />
          <div class="text-caption text-grey-7">
            {{
              isPrivate
                ? 'Only you can invite people.'
                : 'Anyone can join with /join.'
            }}
          </div>

          <UserSelect v-model="invitees" class="q-mt-md" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { currentUser, channels } from '@/data/mock.js'
import { required, noSpaces } from '@/utils/validation.js'
import { joinChannel, invite } from '@/data/channels.js'
import UserSelect from '@/components/UserSelect.vue'

const model = defineModel()
const router = useRouter()

const name = ref('')
const isPrivate = ref(false)
const invitees = ref([])

// channelName is unique
const isUnique = val =>
  !channels.some(channel => channel.name === val) || 'Channel already exists'

function create() {
  joinChannel(currentUser.nickName, name.value, {
    isPrivate: isPrivate.value
  })
  invitees.value.forEach(nick => invite(currentUser.nickName, name.value, nick))
  router.push(`/channels/${name.value}`)

  model.value = false
  name.value = ''
  isPrivate.value = false
  invitees.value = []
}
</script>
