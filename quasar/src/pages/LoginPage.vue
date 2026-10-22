<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Sign in</div>
    </q-card-section>

    <q-form @submit="onSubmit">
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
        <q-btn
          type="submit"
          label="Sign in"
          color="primary"
          unelevated
          :loading="loading"
        />
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
import { login } from '@/services/auth.js'
import { errorText } from '@/services/api.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (e) {
    // 400 = the server did not find the email or the password is wrong
    error.value = e.status === 400 ? 'Wrong email or password' : errorText(e)
  } finally {
    loading.value = false
  }
}
</script>