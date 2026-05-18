<template>
  <GameBackground />

  <Teleport to="body">
    <div v-if="showConfirm" class="dlg-overlay" @mousedown.self="showConfirm = false">
      <div class="dlg-box">
        <div class="dlg-titlebar">
          <span class="term-path">C:\KEYMEME\warn&gt; cmd.exe</span>
          <span class="twb twb-x" @click="showConfirm = false">✕</span>
        </div>
        <div class="dlg-body">
          <p class="tc-white">! Выйти из игры? Прогресс раунда потеряется.</p>
          <div class="dlg-btns">
            <button class="term-btn term-btn-danger" @click="confirmLeave">[ ДА, ВЫЙТИ ]</button>
            <button class="term-btn" @click="showConfirm = false">[ ОТМЕНА ]</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <div class="term-wrap">
    <div class="term-box">

      <!-- Titlebar -->
      <div class="term-titlebar">
        <span class="term-path">C:\KEYMEME\{{ lobbyId }}&gt; cmd.exe</span>
        <div class="term-win-btns">
          <span class="twb">─</span>
          <span class="twb">□</span>
          <span class="twb twb-x" @click="showConfirm = true">✕</span>
        </div>
      </div>

      <div class="term-body">

        <!-- Phase bar -->
        <div class="term-phase-bar">
          <span class="tc-blue">&gt;&nbsp;</span>
          <span class="tc-white">{{ phaseLabel }}</span>
          <span v-if="isHost" class="tc-host">&nbsp;&nbsp;[HOST]&nbsp;👑</span>
          <span v-if="errorMsg" class="tc-err">&nbsp;&nbsp;! {{ errorMsg }}</span>
        </div>

        <div class="term-sep" />

        <!-- Two-column layout: main + sidebar -->
        <div class="term-game-layout">

          <!-- ── MAIN AREA ── -->
          <div class="term-main">

            <!-- SITUATION PHASE -->
            <div v-if="phase === 'situation'" class="phase-pad">
              <p class="tc-dim">&gt; Генерируется жизненная ситуация<span class="blink-dot">...</span></p>
              <div class="term-blank" />
              <p class="tc-white">&gt; Твои карты в этом раунде:</p>
              <div class="hand-grid">
                <div v-for="s in myHand" :key="s.id" class="sound-card sound-card-preview">
                  <span class="sound-card-name tc-ok">{{ s.name }}</span>
                  <button class="term-btn-xs" @click="previewSound(s.file)">[ ▶ ]</button>
                </div>
              </div>
            </div>

            <!-- CHOOSING PHASE -->
            <div v-else-if="phase === 'choosing'" class="phase-pad">
              <div class="situation-box">
                <span class="tc-blue">&gt;&nbsp;</span>
                <span class="tc-dim">СИТУАЦИЯ: </span>
                <span class="tc-white situation-text">{{ currentSituation?.text }}</span>
              </div>

              <div class="term-blank" />

              <div v-if="!submitted">
                <p class="tc-white">&gt; Выбери реакцию:</p>
                <div class="hand-grid">
                  <div
                    v-for="s in myHand" :key="s.id"
                    class="sound-card"
                    :class="{ 'sound-card-selected': selectedSoundId === s.id }"
                  >
                    <span class="sound-card-name tc-white">{{ s.name }}</span>
                    <div class="sound-card-btns">
                      <button class="term-btn-xs" @click="previewSound(s.file)">[ ▶ ]</button>
                      <button class="term-btn-xs term-btn-select" @click="selectSound(s.id)">
                        {{ selectedSoundId === s.id ? '[ ✓ ВЫБРАНО ]' : '[ ВЫБРАТЬ ]' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="submitted-box">
                <span class="tc-ok">✓ Ответ отправлен! Ждём остальных...</span>
              </div>

              <div class="term-blank" />
              <div class="submit-progress">
                <span class="tc-dim">&gt; Ответили:&nbsp;</span>
                <span class="tc-ok">{{ '█'.repeat(submitCount) }}</span>
                <span class="tc-dim">{{ '░'.repeat(Math.max(0, totalPlayers - submitCount)) }}</span>
                <span class="tc-dim">&nbsp;{{ submitCount }}/{{ totalPlayers }}</span>
              </div>
            </div>

            <!-- PLAYBACK PHASE -->
            <div v-else-if="phase === 'playback'" class="phase-pad">
              <div class="situation-box">
                <span class="tc-blue">&gt;&nbsp;</span>
                <span class="tc-dim">СИТУАЦИЯ: </span>
                <span class="tc-white situation-text">{{ currentSituation?.text }}</span>
              </div>

              <div class="term-blank" />

              <div v-if="ttsPlaying" class="tc-dim">
                <span class="tc-blue">&gt;&nbsp;</span>Озвучивается ситуация<span class="blink-dot">...</span>
              </div>
              <div v-else>
                <p class="tc-white">&gt; Озвучиваем реакции:</p>
                <div class="playback-list">
                  <div
                    v-for="(item, idx) in orderedSounds" :key="idx"
                    class="playback-row"
                    :class="{
                      'pb-active':  activePlaybackIndex === idx,
                      'pb-done':    activePlaybackIndex > idx,
                      'pb-waiting': activePlaybackIndex < idx && activePlaybackIndex !== -1
                    }"
                  >
                    <span class="pb-icon">
                      {{ activePlaybackIndex === idx ? '►' : (activePlaybackIndex > idx || playbackDone ? '✓' : '○') }}
                    </span>
                    <span class="pb-player tc-white">&nbsp;{{ item.playerNick }}&nbsp;</span>
                    <span class="tc-dim">→&nbsp;</span>
                    <span :class="activePlaybackIndex === idx ? 'tc-ok' : 'tc-dim'">
                      {{ item.sound?.name || '???' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="term-blank" />
              <div v-if="playbackDone && isHost">
                <button class="term-btn term-btn-primary" @click="startVoting">
                  [ 🗳&nbsp;&nbsp;НАЧАТЬ ГОЛОСОВАНИЕ ]
                </button>
              </div>
              <div v-else-if="playbackDone && !isHost">
                <p class="tc-dim">&gt; Ждём хоста для голосования...</p>
              </div>
            </div>

            <!-- VOTING PHASE -->
            <div v-else-if="phase === 'voting'" class="phase-pad">
              <div class="situation-box">
                <span class="tc-blue">&gt;&nbsp;</span>
                <span class="tc-dim">СИТУАЦИЯ: </span>
                <span class="tc-white situation-text">{{ currentSituation?.text }}</span>
              </div>

              <div class="term-blank" />

              <div v-if="!voted">
                <p class="tc-white">&gt; Выбери лучший звук:</p>
                <div class="vote-list">
                  <div
                    v-for="(item, idx) in orderedSounds" :key="idx"
                    class="vote-row"
                    :class="{
                      'vote-row-mine':     isMySound(item),
                      'vote-row-selected': selectedVoteIndex === idx
                    }"
                  >
                    <span class="tc-dim">{{ String(idx + 1).padStart(2, '0') }}&nbsp;│&nbsp;</span>
                    <span class="tc-white vote-name">{{ item.sound?.name || '???' }}</span>
                    <span class="tc-dim">&nbsp;──&nbsp;</span>
                    <button
                      v-if="!isMySound(item)"
                      class="term-btn-xs"
                      :class="{ 'btn-voted': selectedVoteIndex === idx }"
                      @click="selectVote(idx)"
                    >
                      {{ selectedVoteIndex === idx ? '[ ✓ ВЫБРАН ]' : '[ ГОЛОСОВАТЬ ]' }}
                    </button>
                    <span v-else class="tc-dim">[мой ответ]</span>
                  </div>
                </div>
                <div class="term-blank" />
                <button
                  class="term-btn term-btn-primary"
                  :disabled="selectedVoteIndex === null"
                  @click="castVote"
                >
                  [ 🗳&nbsp;&nbsp;ПОДТВЕРДИТЬ ГОЛОС ]
                </button>
              </div>
              <div v-else class="submitted-box">
                <span class="tc-ok">✓ Голос принят!</span>
                <span class="tc-dim">&nbsp;Проголосовало: {{ voteCount }}/{{ totalPlayers }}</span>
              </div>
            </div>

            <!-- RESULTS PHASE -->
            <div v-else-if="phase === 'results'" class="phase-pad">
              <p class="tc-ok">&gt; Раунд завершён!</p>
              <div class="term-blank" />

              <div v-if="roundResult?.winnerId">
                <div class="winner-box">
                  <span class="tc-blue">&gt;&nbsp;</span>
                  <span class="tc-dim">ПОБЕДИТЕЛЬ: </span>
                  <span class="tc-ok winner-name">{{ roundResult.winnerNick }}</span>
                </div>
                <div class="winner-sound">
                  <span class="tc-dim">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Звук: </span>
                  <span class="tc-white">{{ roundResult.sound?.name }}</span>
                </div>
              </div>
              <div v-else>
                <p class="tc-dim">&gt; Ничья — победителя нет.</p>
              </div>

              <div class="term-sep" />
              <p class="tc-dim">&gt; Счёт:</p>
              <div class="scores-list">
                <div v-for="(p, i) in sortedScores" :key="p.socketId" class="score-row"
                     :class="{ 'score-row-winner': p.socketId === roundResult?.winnerId }">
                  <span class="tc-dim">{{ String(i + 1).padStart(2, '0') }}&nbsp;│&nbsp;</span>
                  <span class="tc-white score-nick">{{ p.nickname }}</span>
                  <span class="tc-dim">&nbsp;│&nbsp;</span>
                  <span class="tc-ok">{{ '★'.repeat(p.score) }}{{ '☆'.repeat(Math.max(0, settings_pts - p.score)) }}</span>
                </div>
              </div>

              <div class="term-sep" />
              <div v-if="isHost">
                <button class="term-btn term-btn-primary" @click="requestNextRound">
                  [ ▶&nbsp;&nbsp;СЛЕДУЮЩИЙ РАУНД ]
                </button>
              </div>
              <p v-else class="tc-dim">&gt; Ждём хоста...</p>
            </div>

            <!-- GAMEOVER PHASE -->
            <div v-else-if="phase === 'gameover'" class="phase-pad">
              <p class="tc-ok">&gt;&gt; ИГРА ЗАВЕРШЕНА!</p>
              <div class="term-blank" />
              <div class="winner-box">
                <span class="tc-blue">&gt;&nbsp;</span>
                <span class="tc-dim">ЧЕМПИОН: </span>
                <span class="tc-ok winner-name">{{ gameOver?.winnerNick }}</span>
              </div>

              <div class="term-sep" />
              <p class="tc-dim">&gt; Итоговый счёт:</p>
              <div class="scores-list">
                <div v-for="(p, i) in sortedGameOver" :key="p.socketId" class="score-row"
                     :class="{ 'score-row-winner': p.socketId === gameOver?.winnerId }">
                  <span class="tc-dim">{{ String(i + 1).padStart(2, '0') }}&nbsp;│&nbsp;</span>
                  <span class="tc-white score-nick">{{ p.nickname }}</span>
                  <span class="tc-dim">&nbsp;│&nbsp;</span>
                  <span class="tc-ok">{{ '★'.repeat(p.score) }}{{ '☆'.repeat(Math.max(0, settings_pts - p.score)) }}</span>
                </div>
              </div>

              <div class="term-sep" />
              <div v-if="isHost">
                <button class="term-btn term-btn-primary" @click="restartGame">
                  [ 🔄&nbsp;&nbsp;СЫГРАТЬ СНОВА ]
                </button>
              </div>
              <p v-else class="tc-dim">&gt; Ждём хоста...</p>
            </div>

          </div><!-- /term-main -->

          <!-- ── SIDEBAR: Players ── -->
          <div class="term-sidebar">
            <p class="tc-dim sidebar-header">&gt; Игроки:</p>
            <div class="sidebar-sep" />
            <div
              v-for="(p, i) in players" :key="p.socketId"
              class="sidebar-player"
              :class="{ 'sidebar-me': p.socketId === mySocketId }"
            >
              <span class="tc-dim">{{ String(i + 1).padStart(2, '0') }}&nbsp;</span>
              <span class="sidebar-nick tc-white">{{ p.nickname }}</span>
              <span v-if="p.socketId === hostSocketId" class="tc-host">&nbsp;👑</span>
              <span v-if="phase === 'choosing' && submittedSocketIds.includes(p.socketId)"
                    class="tc-ok">&nbsp;✓</span>
              <span class="tc-ok sidebar-score">&nbsp;{{ p.score }}★</span>
            </div>
          </div>

        </div><!-- /term-game-layout -->

        <!-- Cursor -->
        <div class="term-blank" />
        <div class="term-cursor-line">
          <span class="tc-blue">C:\KEYMEME\{{ lobbyId }}&gt;&nbsp;</span>
          <span class="term-caret">█</span>
        </div>

      </div><!-- /term-body -->
    </div><!-- /term-box -->
  </div><!-- /term-wrap -->
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import GameBackground from '../components/GameBackground.vue'

const route   = useRoute()
const router  = useRouter()
const lobbyId = computed(() => route.params.id)

// ── State ──
const phase             = ref(gameState.phase || 'situation')
const currentSituation  = ref(gameState.situation || null)
const myHand            = ref(gameState.hand || [])
const players           = ref([])
const hostSocketId      = ref(null)
const mySocketId        = ref(socket.id || '')
const totalPlayers      = ref(0)
const settings_pts      = ref(3)

const submitted         = ref(false)
const selectedSoundId   = ref(null)
const submittedSoundId  = ref(null)
const submitCount       = ref(0)
const submittedSocketIds = ref([])

const orderedSounds     = ref([])
const activePlaybackIndex = ref(-1)
const ttsPlaying        = ref(false)
const playbackDone      = ref(false)
let   playbackAborted   = false

const voted             = ref(false)
const selectedVoteIndex = ref(null)
const voteCount         = ref(0)

const roundResult       = ref(null)
const gameOver          = ref(null)
const errorMsg          = ref('')
const showConfirm       = ref(false)

const isHost = computed(() => mySocketId.value && mySocketId.value === hostSocketId.value)

const sortedScores   = computed(() => [...(roundResult.value?.scores || [])].sort((a, b) => b.score - a.score))
const sortedGameOver = computed(() => [...(gameOver.value?.scores   || [])].sort((a, b) => b.score - a.score))

const phaseLabel = computed(() => ({
  situation: '⏳ Генерация ситуации...',
  choosing:  '🎵 Выбор реакции',
  playback:  '🔊 Воспроизведение',
  voting:    '🗳 Голосование',
  results:   '🏆 Результаты раунда',
  gameover:  '🎉 Игра завершена'
}[phase.value] || phase.value))

// ── Audio utils ──
function speakText(text) {
  return new Promise(resolve => {
    if (!window.speechSynthesis) return resolve()
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang  = 'ru-RU'
    utt.rate  = 0.92
    utt.onend   = resolve
    utt.onerror = resolve
    window.speechSynthesis.speak(utt)
  })
}

function playAudio(url) {
  return new Promise(resolve => {
    if (!url) return resolve()
    const audio = new Audio(url)
    audio.onended = resolve
    audio.onerror = resolve
    audio.play().catch(resolve)
  })
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

function previewSound(url) {
  if (!url) return
  const a = new Audio(url)
  a.play().catch(() => {})
}

// ── Playback sequence ──
async function runPlayback(sounds) {
  playbackAborted = false
  playbackDone.value = false
  activePlaybackIndex.value = -1

  // 1. TTS situation
  if (currentSituation.value?.text) {
    ttsPlaying.value = true
    await speakText(currentSituation.value.text)
    ttsPlaying.value = false
  }

  if (playbackAborted) return
  await delay(400)

  // 2. Play sounds one by one
  for (let i = 0; i < sounds.length; i++) {
    if (playbackAborted) return
    activePlaybackIndex.value = i
    await playAudio(sounds[i]?.sound?.file || '')
    await delay(350)
  }

  activePlaybackIndex.value = -1
  playbackDone.value = true
}

// ── Actions ──
function selectSound(soundId) {
  if (submitted.value) return
  selectedSoundId.value  = soundId
  submittedSoundId.value = soundId
  submitted.value        = true
  socket.emit('submit_sound', { lobbyId: lobbyId.value, soundId })
}

function isMySound(item) {
  return item.socketId === mySocketId.value ||
         (submittedSoundId.value && item.soundId === submittedSoundId.value)
}

function selectVote(idx) {
  if (voted.value) return
  selectedVoteIndex.value = idx
}

function castVote() {
  if (selectedVoteIndex.value === null || voted.value) return
  voted.value = true
  socket.emit('cast_vote', { lobbyId: lobbyId.value, shuffleIndex: selectedVoteIndex.value })
}

function startVoting() {
  socket.emit('request_voting', { lobbyId: lobbyId.value })
}

function requestNextRound() {
  socket.emit('next_round', { lobbyId: lobbyId.value })
}

function restartGame() {
  socket.emit('restart_game', { lobbyId: lobbyId.value })
}

function confirmLeave() {
  showConfirm.value = false
  playbackAborted = true
  window.speechSynthesis?.cancel()
  socket.emit('leave_lobby', { lobbyId: lobbyId.value })
  router.push('/')
}

function showError(msg) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 4000)
}

function resetRound() {
  submitted.value          = false
  selectedSoundId.value    = null
  submittedSoundId.value   = null
  submitCount.value        = 0
  submittedSocketIds.value = []
  voted.value              = false
  selectedVoteIndex.value  = null
  voteCount.value          = 0
  orderedSounds.value      = []
  activePlaybackIndex.value = -1
  playbackDone.value       = false
  playbackAborted          = false
  roundResult.value        = null
  ttsPlaying.value         = false
}

// ── Socket listeners ──
onMounted(() => {
  mySocketId.value = socket.id

  socket.on('game_started', ({ situation, hand, phase: ph }) => {
    phase.value           = ph || 'situation'
    currentSituation.value = situation
    myHand.value          = hand || []
    gameState.situation   = situation
    gameState.hand        = hand || []
    resetRound()
  })

  socket.on('situation_revealed', ({ situation }) => {
    phase.value            = 'choosing'
    currentSituation.value = situation
  })

  socket.on('player_submitted', ({ count, total, socketId }) => {
    submitCount.value  = count
    totalPlayers.value = total
    if (socketId && !submittedSocketIds.value.includes(socketId)) {
      submittedSocketIds.value = [...submittedSocketIds.value, socketId]
    }
  })

  socket.on('playback_start', ({ orderedSounds: os, situation }) => {
    phase.value            = 'playback'
    orderedSounds.value    = os || []
    if (situation) currentSituation.value = situation
    runPlayback(os || [])
  })

  socket.on('voting_start', ({ shuffledSounds, situation }) => {
    phase.value            = 'voting'
    orderedSounds.value    = shuffledSounds || []
    if (situation) currentSituation.value = situation
    voted.value            = false
    selectedVoteIndex.value = null
    voteCount.value        = 0
  })

  socket.on('vote_cast', ({ count, total }) => {
    voteCount.value    = count
    totalPlayers.value = total
  })

  socket.on('round_result', (data) => {
    phase.value       = 'results'
    roundResult.value = data
    players.value     = (data.scores || []).map(s => ({ ...s }))
    playbackAborted   = true
  })

  socket.on('game_over', (data) => {
    phase.value    = 'gameover'
    gameOver.value = data
    players.value  = (data.scores || []).map(s => ({ ...s }))
  })

  socket.on('lobby_updated', ({ players: p, settings: s, hostSocketId: h }) => {
    players.value      = p || []
    hostSocketId.value = h
    totalPlayers.value = (p || []).length
    if (s?.pointsToWin) settings_pts.value = s.pointsToWin
  })

  socket.on('game_restarted', ({ players: p, hostSocketId: h }) => {
    players.value      = p || []
    hostSocketId.value = h
    router.push(`/lobby/${lobbyId.value}`)
  })

  socket.on('player_kicked', ({ socketId }) => {
    if (socketId === socket.id) router.push('/')
  })
  socket.on('lobby_closed', () => router.push('/'))
  socket.on('error', ({ message }) => showError(message))

  // Load lobby info
  const base = import.meta.env.VITE_SERVER_URL || ''
  fetch(`${base}/api/lobby/${lobbyId.value}`)
    .then(r => r.ok ? r.json() : null)
    .then(lobby => {
      if (!lobby) return router.push('/')
      players.value      = lobby.players || []
      hostSocketId.value = lobby.hostSocketId
      mySocketId.value   = socket.id
      totalPlayers.value = (lobby.players || []).length
      settings_pts.value = lobby.settings?.pointsToWin || 3
      if (lobby.phase === 'waiting') router.push(`/lobby/${lobbyId.value}`)
      if (myHand.value.length === 0 && lobby.phase !== 'waiting') {
        router.push(`/lobby/${lobbyId.value}`)
      }
    })
    .catch(() => {})
})

onUnmounted(() => {
  playbackAborted = true
  window.speechSynthesis?.cancel()
  ;['game_started','situation_revealed','player_submitted','playback_start',
    'voting_start','vote_cast','round_result','game_over','lobby_updated',
    'game_restarted','player_kicked','lobby_closed','error'].forEach(e => socket.off(e))
})
</script>

<style scoped>
/* ── Layout ── */
.term-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 8px 12px;
  z-index: 5;
}

.term-box {
  width: 100%;
  max-width: 900px;
  background: #0c0c0c;
  border: 1px solid #3a3a3a;
  box-shadow:
    0 0 0 1px #111,
    0 8px 40px rgba(0,0,0,0.8),
    0 0 60px rgba(80,180,255,0.06);
  font-family: 'Courier New', 'Lucida Console', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Titlebar ── */
.term-titlebar {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  user-select: none;
}
.term-path { font-size: 12px; color: #808080; }
.term-win-btns { display: flex; gap: 2px; }
.twb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 20px;
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
  padding: 12px 16px 14px;
  font-size: 13px;
  line-height: 1.65;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ── Colors ── */
.tc-dim   { color: #555; }
.tc-white { color: #ccc; }
.tc-blue  { color: #569cd6; }
.tc-ok    { color: #4ec9b0; }
.tc-err   { color: #f44747; }
.tc-host  { color: #dcdcaa; }

.term-blank { height: 0.5em; }
.term-sep {
  border: none;
  border-top: 1px solid #222;
  margin: 8px 0;
}

/* ── Phase bar ── */
.term-phase-bar {
  display: flex;
  align-items: baseline;
  font-size: 13px;
  flex-shrink: 0;
}

/* ── Two-column layout ── */
.term-game-layout {
  display: flex;
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.term-main {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.term-sidebar {
  width: 170px;
  flex-shrink: 0;
  font-size: 12px;
  border-left: 1px solid #1e1e1e;
  padding-left: 10px;
}

/* ── Phase content ── */
.phase-pad { display: flex; flex-direction: column; gap: 6px; }

/* Situation box */
.situation-box {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  font-size: 13px;
  line-height: 1.7;
}
.situation-text {
  font-weight: bold;
  font-size: 14px;
}

/* ── Sound cards ── */
.hand-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.sound-card {
  background: #111;
  border: 1px solid #2a2a2a;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  flex: 1;
  max-width: 220px;
  transition: border-color 0.1s;
}
.sound-card:hover { border-color: #3a3a3a; }
.sound-card-selected { border-color: #4ec9b0 !important; background: #081818; }
.sound-card-preview { border-style: dashed; opacity: 0.75; }

.sound-card-name {
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sound-card-btns { display: flex; gap: 6px; flex-wrap: wrap; }

/* ── Submit progress ── */
.submit-progress { font-size: 12px; letter-spacing: 1px; }

/* Submitted banner */
.submitted-box {
  border: 1px solid #1e3a1e;
  background: #0a1a0a;
  padding: 8px 12px;
  font-size: 13px;
}

/* ── Playback ── */
.blink-dot { animation: caretBlink 1s step-end infinite; }
@keyframes caretBlink { 0%,100% { opacity:1; } 50% { opacity:0; } }

.playback-list { display: flex; flex-direction: column; gap: 4px; }
.playback-row {
  display: flex;
  align-items: baseline;
  font-size: 13px;
  padding: 3px 0;
  transition: background 0.2s;
}
.pb-icon { font-size: 12px; width: 16px; flex-shrink: 0; }
.pb-player { font-size: 13px; }
.pb-active {
  background: #0a1a0a;
  border-left: 2px solid #4ec9b0;
  padding-left: 4px;
}
.pb-active .pb-icon { color: #4ec9b0; }
.pb-done { opacity: 0.5; }
.pb-waiting { opacity: 0.6; }

/* ── Voting ── */
.vote-list { display: flex; flex-direction: column; gap: 4px; }
.vote-row {
  display: flex;
  align-items: baseline;
  font-size: 13px;
  padding: 2px 0;
}
.vote-name { flex: 1; }
.vote-row-mine { opacity: 0.5; }
.vote-row-selected { background: #0a1a0a; }

/* ── Results ── */
.winner-box { display: flex; align-items: baseline; font-size: 14px; }
.winner-name { font-size: 16px; font-weight: bold; }
.winner-sound { font-size: 13px; margin-top: 2px; }

.scores-list { display: flex; flex-direction: column; gap: 2px; }
.score-row {
  display: flex;
  align-items: baseline;
  font-size: 13px;
}
.score-nick { min-width: 120px; }
.score-row-winner .score-nick { color: #4ec9b0; }

/* ── Sidebar ── */
.sidebar-header { font-size: 12px; margin-bottom: 2px; }
.sidebar-sep { border-top: 1px solid #1e1e1e; margin: 4px 0; }
.sidebar-player {
  display: flex;
  align-items: baseline;
  font-size: 11px;
  padding: 2px 0;
  line-height: 1.6;
}
.sidebar-nick {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
}
.sidebar-score { margin-left: auto; flex-shrink: 0; }
.sidebar-me .sidebar-nick { color: #fff; }

/* ── Buttons ── */
.term-btn {
  background: transparent;
  border: 1px solid #3a3a3a;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 8px 14px;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.term-btn:hover { background: #1a1a1a; border-color: #569cd6; color: #fff; }
.term-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.term-btn-primary { border-color: #4ec9b0; color: #4ec9b0; }
.term-btn-primary:hover:not(:disabled) { background: #0a2020; color: #7fffdf; }
.term-btn-danger { border-color: #c42b1c; color: #f44747; }
.term-btn-danger:hover { background: #1a0a0a; }

.term-btn-xs {
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 2px 6px;
  cursor: pointer;
  transition: border-color 0.1s, color 0.1s;
}
.term-btn-xs:hover { border-color: #569cd6; color: #ccc; }
.term-btn-xs.term-btn-select { border-color: #3a3a3a; }
.term-btn-xs.term-btn-select:hover { border-color: #4ec9b0; color: #4ec9b0; }
.term-btn-xs.btn-voted { border-color: #4ec9b0; color: #4ec9b0; }

/* ── Cursor ── */
.term-cursor-line { display: flex; align-items: baseline; font-size: 12px; flex-shrink: 0; }
.term-caret { color: #ccc; animation: caretBlink 1s step-end infinite; }

/* ── Dialog ── */
.dlg-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.dlg-box {
  background: #0c0c0c;
  border: 1px solid #3a3a3a;
  width: 360px;
  font-family: 'Courier New', monospace;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
.dlg-titlebar {
  background: #1e1e1e;
  border-bottom: 1px solid #333;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}
.dlg-body { padding: 16px 18px 14px; }
.dlg-btns { display: flex; gap: 8px; margin-top: 12px; }

@media (max-width: 680px) {
  .term-sidebar { display: none; }
  .term-wrap { padding: 4px; }
  .term-body { padding: 8px 10px 10px; font-size: 12px; }
  .sound-card { min-width: 120px; }
}
</style>
