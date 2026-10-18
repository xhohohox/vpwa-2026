<template>
  <q-list
    v-if="suggestions.length"
    bordered
    dense
    class="rounded-borders bg-grey-1 text-black q-mb-xs"
  >
    <q-item
      v-for="command in suggestions"
      :key="command.name"
      clickable
      @click="emit('select', command.name)"
    >
      <q-item-section>
        <q-item-label class="text-weight-medium">{{
          command.usage
        }}</q-item-label>
        <q-item-label caption class="text-grey-8">
          {{ command.description }}
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { computed } from 'vue'
import { matchCommands } from '@/data/commands.js'

const props = defineProps({
  text: { type: String, required: true }
})

const emit = defineEmits(['select'])

const suggestions = computed(() => matchCommands(props.text))
</script>