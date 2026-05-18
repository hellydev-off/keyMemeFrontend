<template>
  <!-- ── Start Menu ── -->
  <Teleport to="body">
    <div v-if="showStart" class="sm-backdrop" @mousedown.self="showStart = false">
      <div class="start-menu">
        <div class="sm-header">
          <div class="sm-avatar">😎</div>
          <div class="sm-username">Игрок</div>
        </div>

        <div class="sm-body">
          <!-- Left: programs -->
          <div class="sm-left">
            <button class="sm-item" @click="go('/create')">
              <span class="sm-ico">🎮</span>
              <div>
                <div class="sm-item-title">Создать игру</div>
                <div class="sm-item-sub">Новое лобби</div>
              </div>
            </button>
            <button class="sm-item" @click="showJoinInput = !showJoinInput">
              <span class="sm-ico">🔗</span>
              <div>
                <div class="sm-item-title">Войти по коду</div>
                <div class="sm-item-sub">Присоединиться к лобби</div>
              </div>
            </button>
            <div v-if="showJoinInput" class="sm-join-wrap">
              <input
                class="sm-input"
                v-model="smCode"
                placeholder="Код лобби..."
                @keydown.enter="smJoin"
                autofocus
              />
              <button class="sm-join-go" @click="smJoin">→</button>
            </div>

            <div class="sm-divider" />

            <button class="sm-item" @click="openTerm">
              <span class="sm-ico">💻</span>
              <div>
                <div class="sm-item-title">cmd.exe</div>
                <div class="sm-item-sub">Командная строка</div>
              </div>
            </button>

            <button class="sm-item sm-item-dim">
              <span class="sm-ico">📁</span>
              <div>
                <div class="sm-item-title">Мои документы</div>
                <div class="sm-item-sub">Личные файлы</div>
              </div>
            </button>
          </div>

          <!-- Right: places -->
          <div class="sm-right">
            <button class="sm-place sm-place-dim">🖥️&nbsp; Мой компьютер</button>
            <button class="sm-place sm-place-dim">🌐&nbsp; Интернет</button>
            <button class="sm-place sm-place-dim">🎵&nbsp; Моя музыка</button>
            <div class="sm-right-div" />
            <button class="sm-place sm-place-dim">🔧&nbsp; Панель управления</button>
            <button class="sm-place sm-place-dim">🖨️&nbsp; Принтеры</button>
            <button class="sm-place sm-place-dim">❓&nbsp; Справка</button>
          </div>
        </div>

        <div class="sm-footer">
          <button class="sm-foot-btn" @click="go('/')">
            <span>🚪</span> Выйти
          </button>
          <button class="sm-foot-btn sm-shutdown" @click="showStart = false">
            <span>⏻</span> Выключить
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── Floating terminal ── -->
  <Teleport to="body">
    <div
      v-if="showTerm"
      class="ft-win"
      :style="{ left: tPos.x + 'px', top: tPos.y + 'px' }"
    >
      <!-- Titlebar (drag handle) -->
      <div class="ft-titlebar" @mousedown="dragStart">
        <div class="ft-title-left">
          <span>💻</span>
          <span>C:\KEYMEME&gt; cmd.exe</span>
        </div>
        <div class="ft-ctrls">
          <span class="ft-ctrl" @mousedown.stop @click="showTerm = false">─</span>
          <span class="ft-ctrl" @mousedown.stop>□</span>
          <span class="ft-ctrl ft-ctrl-x" @mousedown.stop @click="showTerm = false">✕</span>
        </div>
      </div>

      <!-- Output -->
      <div class="ft-output" ref="ftOut">
        <div
          v-for="(l, i) in lines"
          :key="i"
          class="ft-line"
          :class="l.cls"
        >{{ l.text }}</div>
      </div>

      <!-- Input -->
      <div class="ft-input-row">
        <span class="ft-prompt">C:\KEYMEME&gt;&nbsp;</span>
        <input
          ref="ftIn"
          class="ft-input"
          v-model="cmd"
          @keydown.enter="run"
          @keydown.up.prevent="histUp"
          @keydown.down.prevent="histDown"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
    </div>
  </Teleport>

  <!-- ── Taskbar ── -->
  <div class="taskbar">
    <!-- Start button -->
    <button
      class="start-btn"
      :class="{ 'start-btn-active': showStart }"
      @click="showStart = !showStart"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="0" y="0" width="7" height="7" fill="#f25022"/>
        <rect x="9" y="0" width="7" height="7" fill="#7fba00"/>
        <rect x="0" y="9" width="7" height="7" fill="#00a4ef"/>
        <rect x="9" y="9" width="7" height="7" fill="#ffb900"/>
      </svg>
      Пуск
    </button>

    <div class="tb-sep" />

    <!-- Window buttons -->
    <div class="tb-wins">
      <button class="tb-win tb-win-active">
        🎮 Key Meme
      </button>
      <button
        class="tb-win"
        :class="{ 'tb-win-active': showTerm }"
        @click="toggleTerm"
      >
        💻 cmd.exe
      </button>
    </div>

    <div class="tb-spacer" />

    <!-- System tray -->
    <div class="tb-tray">
      <span class="tray-ico" title="Звук">🔊</span>
      <span class="tray-ico" title="Сеть">📶</span>
      <div class="tray-clock">
        <span class="tray-time">{{ clockTime }}</span>
        <span class="tray-date">{{ clockDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ── Start menu ─────────────────────────────────────────── */
const showStart    = ref(false)
const showJoinInput = ref(false)
const smCode       = ref('')

function go(path) {
  showStart.value = false
  showJoinInput.value = false
  smCode.value = ''
  router.push(path)
}
function smJoin() {
  const c = smCode.value.trim()
  if (!c) return
  showStart.value = false
  router.push(`/join/${c}`)
}

/* ── Clock ──────────────────────────────────────────────── */
const clockTime = ref('')
const clockDate = ref('')
let clockTimer
function tick() {
  const n = new Date()
  clockTime.value = n.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  clockDate.value = n.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

/* ── Terminal ───────────────────────────────────────────── */
const showTerm = ref(false)
const tPos     = ref({ x: 100, y: 80 })
const lines    = ref([])
const cmd      = ref('')
const history  = ref([])
const hIdx     = ref(-1)
const ftOut    = ref(null)
const ftIn     = ref(null)

const BOOT = [
  { text: 'Microsoft Windows XP [Version 5.1.2600]', cls: 'cl-dim' },
  { text: '(C) 2026 Avatar Lab. All rights reserved.', cls: 'cl-dim' },
  { text: '', cls: '' },
  { text: 'Введи "help" для списка команд.', cls: 'cl-white' },
  { text: '', cls: '' },
]

function scrollOut() {
  nextTick(() => { if (ftOut.value) ftOut.value.scrollTop = ftOut.value.scrollHeight })
}
function add(text = '', cls = 'cl-white') {
  lines.value.push({ text, cls })
  scrollOut()
}

const CMDS = {
  help() {
    add('Доступные команды:', 'cl-ok')
    ;[
      ['help',         'этот список'],
      ['ver',          'версия системы'],
      ['date',         'текущая дата и время'],
      ['dir',          'содержимое диска C:\\KEYMEME'],
      ['goto <путь>',  'перейти на страницу (/, /create)'],
      ['clear',        'очистить экран'],
      ['keymeme',      '???'],
    ].forEach(([c, d]) => add(`  ${c.padEnd(16)} — ${d}`, 'cl-dim'))
  },
  ver() {
    add('Key Meme Terminal [Version 1.0.2026]', 'cl-ok')
    add('(C) 2026 Avatar Lab.', 'cl-dim')
  },
  date() {
    const n = new Date()
    add(`Дата: ${n.toLocaleDateString('ru-RU')}`, 'cl-white')
    add(`Время: ${n.toLocaleTimeString('ru-RU')}`, 'cl-white')
  },
  dir() {
    add(' Содержимое C:\\KEYMEME', 'cl-white')
    add('', '')
    ;[
      ['<DIR>', 'sounds   ', '54 мем-звука готовы к бою'],
      ['<DIR>', 'lobbies  ', 'бесконечное число лобби'],
      ['<DIR>', 'players  ', 'ждут тебя прямо сейчас'],
      ['     ', 'game.exe ', 'запускает весёлый хаос'],
      ['     ', 'memes.bat', 'точка входа в безумие'],
    ].forEach(([t, n, d]) => add(`  ${t}  ${n}  ${d}`, t.includes('DIR') ? 'cl-ok' : 'cl-dim'))
    add('')
    add('  5 файл(ов). Нет места для скуки.', 'cl-dim')
  },
  clear() { lines.value = [] },
  keymeme() {
    add('')
    ;[
      '  ██╗  ██╗███████╗██╗   ██╗',
      '  ██║ ██╔╝██╔════╝╚██╗ ██╔╝',
      '  █████╔╝ █████╗   ╚████╔╝ ',
      '  ██╔═██╗ ██╔══╝    ╚██╔╝  ',
      '  ██║  ██╗███████╗   ██║   ',
      '  ╚═╝  ╚═╝╚══════╝   ╚═╝   ',
    ].forEach(r => add(r, 'cl-ok'))
    add('')
    add('  🎵  МЕМ · МЕМ · МЕМ  🎵', 'cl-white')
    add('')
  },
}

function run() {
  const raw = cmd.value.trim()
  if (!raw) return
  add(`C:\\KEYMEME> ${raw}`, 'cl-prompt')
  history.value.unshift(raw)
  hIdx.value = -1
  cmd.value = ''

  const [c, ...args] = raw.toLowerCase().split(/\s+/)
  if (c === 'goto') {
    const p = args[0] || '/'
    add(`Переход: ${p}`, 'cl-ok')
    router.push(p)
  } else if (CMDS[c]) {
    CMDS[c]()
  } else {
    add(`'${raw}' не является внутренней командой.`, 'cl-err')
    add('Введи "help" для справки.', 'cl-dim')
  }
  add('')
}

function histUp() {
  if (hIdx.value < history.value.length - 1) {
    hIdx.value++
    cmd.value = history.value[hIdx.value]
  }
}
function histDown() {
  if (hIdx.value > 0) { hIdx.value--; cmd.value = history.value[hIdx.value] }
  else { hIdx.value = -1; cmd.value = '' }
}

function openTerm() {
  showStart.value = false
  showTerm.value = true
  if (lines.value.length === 0) lines.value = [...BOOT]
  nextTick(() => ftIn.value?.focus())
}
function toggleTerm() { showTerm.value ? showTerm.value = false : openTerm() }

/* ── Drag ───────────────────────────────────────────────── */
let _drag = false, _ox = 0, _oy = 0
function dragStart(e) {
  _drag = true
  _ox = e.clientX - tPos.value.x
  _oy = e.clientY - tPos.value.y
  window.addEventListener('mousemove', dragMove)
  window.addEventListener('mouseup',  dragEnd)
}
function dragMove(e) {
  if (!_drag) return
  tPos.value = {
    x: Math.max(0, Math.min(window.innerWidth  - 560, e.clientX - _ox)),
    y: Math.max(0, Math.min(window.innerHeight - 320, e.clientY - _oy)),
  }
}
function dragEnd() {
  _drag = false
  window.removeEventListener('mousemove', dragMove)
  window.removeEventListener('mouseup',  dragEnd)
}

/* ── Lifecycle ──────────────────────────────────────────── */
onMounted(() => {
  tick()
  clockTimer = setInterval(tick, 1000)
  tPos.value = {
    x: Math.max(40, (window.innerWidth  - 560) / 2),
    y: Math.max(40, (window.innerHeight - 360) / 2 - 40),
  }
})
onUnmounted(() => clearInterval(clockTimer))
</script>

<style scoped>
/* ════════════════════════════════════════
   TASKBAR
   ════════════════════════════════════════ */
.taskbar {
  grid-area: sb;
  height: var(--sb-h);
  background: linear-gradient(180deg, #245ebc 0%, #1a4ea8 40%, #163ea0 100%);
  border-top: 1px solid #4a80d0;
  display: flex;
  align-items: center;
  padding: 0 2px;
  position: relative;
  z-index: 10;
  gap: 2px;
  user-select: none;
}

/* Start button */
.start-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px 0 10px;
  background: linear-gradient(180deg, #62b030 0%, #3e9010 45%, #4aaa18 100%);
  border: 1px solid #1e6008;
  border-radius: 0 14px 14px 0;
  color: white;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  box-shadow: 1px 1px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
  letter-spacing: 0.5px;
  flex-shrink: 0;
  transition: filter 0.1s;
}
.start-btn:hover { filter: brightness(1.1); }
.start-btn-active {
  background: linear-gradient(180deg, #3a8010 0%, #2a6808 100%);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
}

.tb-sep {
  width: 1px;
  height: 28px;
  background: linear-gradient(180deg, transparent, #4a80d0 30%, #4a80d0 70%, transparent);
  margin: 0 3px;
  flex-shrink: 0;
}

/* Window buttons */
.tb-wins { display: flex; gap: 2px; flex: 1; overflow: hidden; }

.tb-win {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  min-width: 100px;
  max-width: 180px;
  background: linear-gradient(180deg, #3a78d0 0%, #2860b8 100%);
  border: 1px solid #1a4898;
  border-bottom-color: #0a3080;
  color: rgba(255,255,255,0.85);
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
  transition: filter 0.1s;
}
.tb-win:hover { filter: brightness(1.15); }
.tb-win-active {
  background: linear-gradient(180deg, #1a4898 0%, #163880 100%);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.4);
  color: white;
  border-color: #0a2868;
}

.tb-spacer { flex: 1; }

/* System tray */
.tb-tray {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 8px;
  background: linear-gradient(180deg, #1a4898 0%, #102880 100%);
  border-left: 1px solid #0a2870;
  flex-shrink: 0;
}
.tray-ico {
  font-size: 14px;
  cursor: default;
  opacity: 0.9;
}
.tray-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 46px;
}
.tray-time {
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: white;
  line-height: 1.2;
}
.tray-date {
  font-family: Tahoma, sans-serif;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
  line-height: 1.2;
}

/* ════════════════════════════════════════
   START MENU
   ════════════════════════════════════════ */
.sm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 8000;
}
.start-menu {
  position: fixed;
  bottom: var(--sb-h);
  left: 0;
  width: 420px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  box-shadow: 4px 4px 16px rgba(0,0,0,0.5);
  animation: fadeScaleIn 0.15s ease both;
  transform-origin: bottom left;
}

/* Header strip */
.sm-header {
  background: linear-gradient(135deg, #1e4bcc 0%, #0a2080 100%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.sm-avatar {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.sm-username {
  font-family: Tahoma, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

/* Body */
.sm-body {
  display: flex;
  min-height: 240px;
}

/* Left column */
.sm-left {
  flex: 1;
  background: white;
  padding: 6px 0;
  border-right: 1px solid #bdb8b0;
}
.sm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.sm-item:hover { background: #316ac5; }
.sm-item:hover .sm-item-title,
.sm-item:hover .sm-item-sub { color: white; }
.sm-item-dim { opacity: 0.7; }
.sm-ico { font-size: 22px; flex-shrink: 0; width: 28px; text-align: center; }
.sm-item-title { font-family: Tahoma, sans-serif; font-size: 13px; font-weight: bold; color: #222; }
.sm-item-sub   { font-family: Tahoma, sans-serif; font-size: 11px; color: #666; }

.sm-divider {
  height: 1px;
  background: #bdb8b0;
  margin: 4px 10px;
}

/* Join input inside menu */
.sm-join-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px 8px;
}
.sm-input {
  flex: 1;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 3px 6px;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  outline: none;
}
.sm-join-go {
  width: 28px; height: 24px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  cursor: pointer;
  font-size: 13px;
}

/* Right column */
.sm-right {
  width: 170px;
  background: #d4d0c8;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
}
.sm-place {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  background: transparent;
  border: none;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #222;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.sm-place:hover { background: #316ac5; color: white; }
.sm-place-dim { opacity: 0.6; cursor: default; }
.sm-place-dim:hover { background: transparent; color: #222; }
.sm-right-div { height: 1px; background: #808080; margin: 4px 8px; }

/* Footer */
.sm-footer {
  background: linear-gradient(180deg, #1e4bcc 0%, #0a2080 100%);
  padding: 6px 10px;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}
.sm-foot-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.1s;
}
.sm-foot-btn:hover { background: rgba(255,255,255,0.22); }
.sm-shutdown:hover { background: rgba(220,60,60,0.6); border-color: #f88; }

/* ════════════════════════════════════════
   FLOATING TERMINAL WINDOW
   ════════════════════════════════════════ */
.ft-win {
  position: fixed;
  z-index: 8500;
  width: 560px;
  background: #0c0c0c;
  border: 1px solid #3a3a3a;
  box-shadow: 0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px #111;
  font-family: 'Courier New', monospace;
  animation: fadeScaleIn 0.15s ease both;
  display: flex;
  flex-direction: column;
}

.ft-titlebar {
  background: linear-gradient(180deg, #1e4bcc 0%, #0a2080 100%);
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
.ft-titlebar:active { cursor: grabbing; }
.ft-title-left {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 12px;
  font-family: Tahoma, sans-serif;
}
.ft-ctrls { display: flex; gap: 2px; }
.ft-ctrl {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 16px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  font-size: 9px;
  cursor: pointer;
  color: #222;
}
.ft-ctrl-x:hover { background: #cc0000; color: white; }

.ft-output {
  flex: 1;
  height: 260px;
  overflow-y: auto;
  padding: 10px 14px 4px;
  font-size: 13px;
  line-height: 1.55;
}
.ft-output::-webkit-scrollbar { width: 8px; }
.ft-output::-webkit-scrollbar-track { background: #0c0c0c; }
.ft-output::-webkit-scrollbar-thumb { background: #2a2a2a; }

.ft-line { white-space: pre-wrap; word-break: break-all; }
.cl-dim    { color: #555; }
.cl-white  { color: #ccc; }
.cl-ok     { color: #4ec9b0; }
.cl-err    { color: #f44747; }
.cl-prompt { color: #569cd6; }

.ft-input-row {
  display: flex;
  align-items: center;
  padding: 4px 14px 10px;
  border-top: 1px solid #1a1a1a;
  flex-shrink: 0;
}
.ft-prompt { color: #569cd6; font-size: 13px; white-space: nowrap; }
.ft-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #cccccc;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  outline: none;
  caret-color: #cccccc;
}
</style>
