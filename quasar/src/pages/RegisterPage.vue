<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Create an account</div>
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
          v-model="firstName"
          label="First name"
          outlined
          lazy-rules
          :rules="[required]"
        />
        <q-input
          v-model="lastName"
          label="Last name"
          outlined
          lazy-rules
          :rules="[required]"
        />
        <q-input
          v-model="nickName"
          label="Nickname"
          hint="Others will mention you as @nickname"
          outlined
          lazy-rules
          :rules="[required, noSpaces]"
        />
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
          :rules="[required, minLength(8)]"
        />
        <q-input
          v-model="passwordConfirm"
          type="password"
          label="Confirm password"
          outlined
          lazy-rules
          :rules="[required, passwordsMatch]"
        />
      </q-card-section>

      <q-card-actions vertical class="q-px-md q-pb-md">
        <q-btn
          type="submit"
          label="Sign up"
          color="primary"
          unelevated
          :loading="loading"
        />
        <q-btn
          to="/auth/login"
          label="Already have an account? Sign in"
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
import { required, isEmail, minLength, noSpaces } from '@/utils/validation.js'
import { signup } from '@/services/auth.js'
import { errorText } from '@/services/api.js'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const nickName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const error = ref('')
const loading = ref(false)

const passwordsMatch = val => val === password.value || 'Passwords do not match'

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await signup({
      firstName: firstName.value,
      lastName: lastName.value,
      nickName: nickName.value,
      email: email.value,
      password: password.value,
      passwordConfirmation: passwordConfirm.value
    })
    router.push('/')
  } catch (e) {
    error.value = errorText(e)
  } finally {
    loading.value = false
  }
}
</script>