<script setup lang="ts">
import { ref } from 'vue'
const email = ref('')
const busy = ref(false)

async function sendEmail() {
  busy.value = true
  await $fetch('https://roe.dev/api/hi', {
    method: 'POST',
    body: {
      body: email.value
    }
  })
  busy.value = false
  email.value = ''
}
</script>

<template>
  <div>
    <h1>Hi we are devs</h1>
    <p>
      The path is <code>{{ $route.fullPath }}</code>
    </p>
    <form @submit.prevent="sendEmail">
      <input type="textarea" placeholder="Enter some text" v-model="email" />
      <button :aria-busy="busy" type="submit">Send me an email</button>
    </form>
  </div>
</template>

