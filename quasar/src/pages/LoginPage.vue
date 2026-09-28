<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Sign in</div>
    </q-card-section>

    <q-form @submit="onSubmit">
      <q-card-section>
        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          lazy-rules
          :rules="[required, isEmail]"
        />
        <q-input
          v-model="password"
          type="password"
          label="Password"
          outlined
          lazy-rules
          :rules="[required]"
        />
      </q-card-section>

      <q-card-actions vertical class="q-px-md q-pb-md">
        <q-btn type="submit" label="Sign in" color="primary" unelevated />
        <q-btn
          to="/auth/register"
          label="Create an account"
          color="primary"
          flat
          no-caps
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { required, isEmail } from '@/utils/validation.js'

const router = useRouter()

const email = ref('')
const password = ref('')

function onSubmit() {
  // Prototype: there is no backend yet, so any valid form signs the user in
  router.push('/')
}
</script>