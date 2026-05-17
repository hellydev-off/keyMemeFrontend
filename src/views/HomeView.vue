<template>
  <GameBackground />

  <div class="home-wrap">
    <div class="xp-window home-dialog">
      <!-- Titlebar -->
      <div class="xp-titlebar">
        <div class="xp-titlebar-left">
          <span class="xp-title-icon">📄</span>
          <span class="xp-title-text">Key Meme — Добро пожаловать!</span>
        </div>
        <div class="xp-title-btns">
          <button class="xp-ctrl">&#x2014;</button>
          <button class="xp-ctrl">&#x25A1;</button>
          <button class="xp-ctrl xp-ctrl-close">&#x2715;</button>
        </div>
      </div>

      <!-- Body -->
      <div class="xp-body home-body">
        <button class="xp-btn xp-btn-lg" @click="router.push('/create')">
          🎮 Создать игру
        </button>

        <button class="xp-btn xp-btn-lg" @click="showJoin = !showJoin">
          🔗 Войти по ссылке
        </button>

        <div v-if="showJoin" class="join-expand">
          <div class="join-row">
            <input
              class="xp-input"
              v-model="joinCode"
              placeholder="Введи код лобби..."
              @keydown.enter="joinByCode"
              maxlength="20"
              style="flex:1"
              autofocus
            />
            <button class="xp-btn" @click="joinByCode" :disabled="!joinCode.trim()">Войти</button>
          </div>
          <p v-if="joinError" class="error-msg">⚠️ {{ joinError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GameBackground from '../components/GameBackground.vue'

const router = useRouter()
const joinCode = ref('')
const joinError = ref('')
const showJoin = ref(false)

function joinByCode() {
  const code = joinCode.value.trim()
  if (!code) return
  joinError.value = ''
  router.push(`/join/${code}`)
}
</script>

<style scoped>
.home-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 5;
}

.home-dialog {
  width: 580px;
  max-width: 100%;
}

.home-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
}

.join-expand {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: fadeScaleIn 0.15s ease both;
}

.join-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

@media (max-width: 600px) {
  .home-wrap { padding: 8px; }
}
</style>
