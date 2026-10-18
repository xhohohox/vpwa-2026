<template>
  <div
    v-for="typist in typists"
    :key="typist.nickName"
    class="text-caption text-grey-8 q-mb-xs"
  >
    <span
      class="text-primary text-weight-bold cursor-pointer"
      @click="togglePreview(typist.nickName)"
    >
      {{ typist.nickName }}
    </span>
    is typing...
    <div
      v-if="previewNick === typist.nickName"
      class="text-body2 text-black bg-grey-2 rounded-borders q-pa-sm q-mt-xs"
    >
      {{ typist.draft }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { currentUser, typing } from '@/data/mock.js'

const props = defineProps({
  channel: { type: String, required: true }
})

// Who is typing in the open channel; an offline user sees nobody (use case 9)
const typists = computed(() =>
  currentUser.status === 'offline'
    ? []
    : typing.filter(typist => typist.channel === props.channel)
)

// Clicking a nickname shows their unsent text, updated on every keystroke
const previewNick = ref(null)

function togglePreview(nickName) {
  previewNick.value = previewNick.value === nickName ? null : nickName
}
</script>