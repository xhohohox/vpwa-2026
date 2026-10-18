<template>
  <!-- Floats above the command line like the @mention list
       (the parent element has the relative-position class) -->
  <q-list
    v-if="suggestions.length"
    dense
    class="absolute bg-white text-black shadow-2 rounded-borders"
    style="bottom: 100%; left: 0; right: 0; z-index: 6000"
  >
    <!-- mousedown.prevent keeps the focus in the command line -->
    <q-item
      v-for="command in suggestions"
      :key="command.name"
      clickable
      @mousedown.prevent
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
