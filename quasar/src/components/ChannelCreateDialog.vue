<template>
  <q-dialog v-model="model">
    <q-card style="width: 100%; max-width: 360px">
      <q-form @submit="create">
        <q-card-section class="text-h6">Create channel</q-card-section>
        <q-card-section>
          <q-banner
            v-if="error"
            dense
            rounded
            class="bg-red-1 text-negative q-mb-md"
          >
            {{ error }}
          </q-banner>
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
          <q-btn
            type="submit"
            color="primary"
            unelevated
            label="Create"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { channels } from '@/data/mock.js'
import { required, noSpaces } from '@/utils/validation.js'
import { joinChannel, inviteUser } from '@/services/channels.js'
import { errorText } from '@/services/api.js'
import UserSelect from '@/components/UserSelect.vue'

const model = defineModel()
const router = useRouter()
const $q = useQuasar()

const name = ref('')
const isPrivate = ref(false)
const invitees = ref([])
const error = ref('')
const loading = ref(false)

// channelName is unique, the server checks also the channels I am not in
const isUnique = val =>
  !channels.some(channel => channel.name === val) || 'Channel already exists'

// The same as /join channelName [private], then the selected users are invited
async function create() {
  error.value = ''
  loading.value = true
  try {
    const { result } = await joinChannel(name.value, isPrivate.value)
    for (const nick of invitees.value) await inviteUser(name.value, nick)
    // a public channel with this name already existed, so I joined it
    if (result === 'joined') {
      $q.notify({ message: `#${name.value} already existed, you joined it` })
    }
  } catch (e) {
    error.value = errorText(e)
    return
  } finally {
    loading.value = false
  }
  router.push(`/channels/${name.value}`)

  model.value = false
  name.value = ''
  isPrivate.value = false
  invitees.value = []
}
</script>
