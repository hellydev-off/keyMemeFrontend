<template>
  <GameBackground />

  <div class="term-wrap">
    <div class="term-box">

      <!-- Titlebar -->
      <div class="term-titlebar">
        <span class="term-path">C:\KEYMEME\cmd.exe</span>
        <div class="term-win-btns">
          <span class="twb">─</span>
          <span class="twb">□</span>
          <span class="twb twb-x">✕</span>
        </div>
      </div>

      <!-- Body -->
      <div class="term-body">

        <p class="tc-dim">Microsoft(R) Key Meme [Version 1.0.2026]</p>
        <p class="tc-dim">(c) 2026 Avatar Lab. Все права защищены.</p>
        <div class="term-blank" />

        <!-- Boot sequence -->
        <div v-for="(item, i) in bootItems" :key="i" class="term-boot-line">
          <span class="tc-blue">&gt;&nbsp;</span>
          <span class="tc-white">{{ item.text }}</span>
          <span v-if="item.status === 'loading'" class="tc-dim term-blink-dots">...</span>
          <span v-else-if="item.status === 'ok'"   class="tc-ok">&nbsp;[OK]</span>
          <span v-else-if="item.status === 'done'" class="tc-ok">&nbsp;✓</span>
        </div>

        <!-- Buttons -->
        <template v-if="showButtons">
          <div class="term-blank" />
          <div class="term-btns">
            <button class="term-btn" @click="router.push('/create')">
              [ 🎮&nbsp;&nbsp;СОЗДАТЬ&nbsp;ИГРУ ]
            </button>
            <button class="term-btn" @click="toggleJoin">
              [ 🔗&nbsp;&nbsp;ВОЙТИ&nbsp;ПО&nbsp;ССЫЛКЕ ]
            </button>
          </div>

          <div v-if="showJoin" class="term-join">
            <div class="term-blank" />
            <div class="term-input-row">
              <span class="tc-blue">&gt;&nbsp;</span>
              <span class="tc-white">Код лобби:&nbsp;</span>
              <input
                class="term-input"
                v-model="joinCode"
                @keydown.enter="joinByCode"
                placeholder="________"
                maxlength="20"
                autofocus
              />
              <button class="term-btn-sm" @click="joinByCode" :disabled="!joinCode.trim()">
                [ ВОЙТИ ]
              </button>
            </div>
            <p v-if="joinError" class="tc-err">! ОШИБКА: {{ joinError }}</p>
          </div>
        </template>

        <!-- Cursor line -->
        <div class="term-blank" />
        <div class="term-cursor-line">
          <span class="tc-blue">C:\KEYMEME&gt;&nbsp;</span>
          <span class="term-caret">█</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GameBackground from '../components/GameBackground.vue'

const router   = useRouter()
const joinCode = ref('')
const joinError = ref('')
const showJoin  = ref(false)
const bootItems = ref([])
const showButtons = ref(false)

const steps = [
  { text: 'Инициализация системы',   loadMs: 550 },
  { text: 'Загрузка звуков (54/54)', loadMs: 380 },
  { text: 'Проверка соединения',     loadMs: 680 },
  { text: 'Система готова.',         loadMs: 0,   done: true },
]

onMounted(async () => {
  for (const step of steps) {
    bootItems.value.push({ text: step.text, status: step.done ? 'done' : 'loading' })
    const idx = bootItems.value.length - 1
    if (step.loadMs) {
      await new Promise(r => setTimeout(r, step.loadMs))
      bootItems.value[idx] = { ...bootItems.value[idx], status: 'ok' }
      await new Promise(r => setTimeout(r, 80))
    }
  }
  await new Promise(r => setTimeout(r, 280))
  showButtons.value = true
})

function toggleJoin() {
  showJoin.value = !showJoin.value
  if (!showJoin.value) joinCode.value = ''
}

function joinByCode() {
  const code = joinCode.value.trim()
  if (!code) return
  joinError.value = ''
  router.push(`/join/${code}`)
}
</script>

<style scoped>
/* ── Layout ── */
.term-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 5;
}

/* ── Terminal window ── */
.term-box {
  width: 620px;
  max-width: 100%;
  background: #0c0c0c;
  border: 1px solid #3a3a3a;
  box-shadow:
    0 0 0 1px #111,
    0 8px 40px rgba(0,0,0,0.8),
    0 0 60px rgba(80,180,255,0.08);
  animation: fadeScaleIn 0.25s ease both;
  font-family: 'Courier New', 'Lucida Console', monospace;
}

/* ── Titlebar ── */
.term-titlebar {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}
.term-path {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #808080;
}
.term-win-btns {
  display: flex;
  gap: 2px;
}
.twb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 20px;
  font-size: 11px;
  color: #808080;
  cursor: pointer;
  background: #2d2d2d;
  border: 1px solid #3a3a3a;
}
.twb:hover { background: #3a3a3a; color: #ddd; }
.twb-x:hover { background: #c42b1c; color: #fff; border-color: #c42b1c; }

/* ── Body ── */
.term-body {
  padding: 18px 22px 20px;
  font-size: 14px;
  line-height: 1.7;
}

/* ── Colors ── */
.tc-dim   { color: #636363; }
.tc-white { color: #cccccc; }
.tc-blue  { color: #569cd6; }
.tc-ok    { color: #4ec9b0; }
.tc-err   { color: #f44747; font-size: 13px; margin-top: 4px; }

.term-blank { height: 0.8em; }

/* ── Boot lines ── */
.term-boot-line {
  display: flex;
  align-items: baseline;
  gap: 0;
  font-size: 14px;
}
.term-blink-dots { animation: blinkDots 1s steps(3, end) infinite; }
@keyframes blinkDots {
  0%   { opacity: 0; }
  33%  { opacity: 0.4; }
  66%  { opacity: 0.8; }
  100% { opacity: 1; }
}

/* ── Buttons ── */
.term-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.term-btn {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  font-family: 'Courier New', monospace;
  font-size: 15px;
  padding: 10px 18px;
  cursor: pointer;
  text-align: left;
  letter-spacing: 0.05em;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.term-btn:hover {
  background: #1a1a1a;
  border-color: #569cd6;
  color: #ffffff;
}
.term-btn:active {
  background: #142030;
}

.term-btn-sm {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 3px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, border-color 0.1s;
}
.term-btn-sm:hover:not(:disabled) { background: #1a1a1a; border-color: #569cd6; color: #fff; }
.term-btn-sm:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Join input ── */
.term-join { }
.term-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.term-input {
  background: #0c0c0c;
  border: none;
  border-bottom: 1px solid #569cd6;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 2px 6px;
  outline: none;
  width: 140px;
  letter-spacing: 0.1em;
}
.term-input::placeholder { color: #3a3a3a; }

/* ── Cursor ── */
.term-cursor-line {
  display: flex;
  align-items: baseline;
  font-size: 14px;
}
.term-caret {
  color: #cccccc;
  animation: caretBlink 1s step-end infinite;
}
@keyframes caretBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

@media (max-width: 660px) {
  .term-wrap { padding: 8px; }
  .term-body { padding: 14px 14px 16px; font-size: 13px; }
  .term-btn  { font-size: 13px; }
}
</style>
