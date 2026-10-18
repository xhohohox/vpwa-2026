<template>
  <q-card>
    <q-card-section>
      <div class="text-h5">Create an account</div>
    </q-card-section>

    <q-form @submit="onSubmit">
      <q-card-section>
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
          :rules="[required, noSpaces, isNickUnique]"
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
        <q-btn type="submit" label="Sign up" color="primary" unelevated />
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
import { users } from '@/data/mock.js'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const nickName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const passwordsMatch = val => val === password.value || 'Passwords do not match'

const isNickUnique = val =>
  !users.some(user => user.nickName === val) || 'Nickname is already taken'

function onSubmit() {
  // Prototype: there is no backend yet, so the account is not stored anywhere
  router.push('/')
}
</script>