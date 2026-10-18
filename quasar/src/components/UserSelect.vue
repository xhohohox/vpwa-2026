<template>
  <q-select
    v-model="model"
    :options="options"
    :label="label"
    hint="Type to fuzzy search nicknames"
    placeholder="e.g. zigo"
    outlined
    multiple
    use-chips
    use-input
    input-debounce="0"
    menu-anchor="top left"
    menu-self="bottom left"
    @filter="filterUsers"
  />
</template>

<script setup>
import { ref } from 'vue'
import { currentUser, users } from '@/data/mock.js'
import { fuzzyMatch } from '@/utils/fuzzy.js'

const props = defineProps({
  label: { type: String, default: 'Invite members' },
  exclude: { type: Array, default: () => [] }
})
const model = defineModel({ type: Array })

const options = ref([])

// Fuzzy search over the registered nickNames (nickName itself is unique)
function filterUsers(val, update) {
  update(() => {
    options.value = users
      .map(user => user.nickName)
      .filter(
        nick =>
          nick !== currentUser.nickName &&
          !props.exclude.includes(nick) &&
          !model.value.includes(nick) &&
          fuzzyMatch(nick, val)
      )
  })
}
</script>
