<template>
  <!-- Confirm leave dialog -->
  <Teleport to="body">
    <div v-if="showConfirm" class="overlay" @mousedown.self="showConfirm = false">
      <div class="win-window dlg-win">
        <div class="win-titlebar">
          <div class="win-titlebar-left">
            <span class="win-title-icon"><PixelIcon name="warning" :size="14" /></span>
            <span class="win-title-text">Выход из игры</span>
          </div>
          <div class="win-title-btns">
            <button class="win-ctrl win-ctrl-close" @click="showConfirm = false">✕</button>
          </div>
        </div>
        <div class="dlg-body">
          <p class="dlg-msg">Выйти из игры? Прогресс раунда потеряется.</p>
          <div class="dlg-btns">
            <button class="xp-btn xp-btn-danger" @click="confirmLeave">Выйти</button>
            <button class="xp-btn" @click="showConfirm = false">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <div class="game-wrap">
    <div class="win-window game-window">

      <!-- ══ Titlebar ══ -->
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <span class="win-title-icon"><PixelIcon name="gamepad" :size="14" /></span>
          <span class="win-title-text">KeyMeme — {{ phaseLabel }}</span>
          <span v-if="isHost" class="host-badge">
            <PixelIcon name="crown" :size="11" color="#f4a800" /> Стример
          </span>
          <span v-if="errorMsg" class="error-badge">! {{ errorMsg }}</span>
        </div>
        <div class="win-title-btns">
          <button class="win-ctrl">─</button>
          <button class="win-ctrl">□</button>
          <button class="win-ctrl win-ctrl-close" @click="showConfirm = true">✕</button>
        </div>
      </div>

      <!-- ══ Phase progress bar ══ -->
      <div class="phase-bar">
        <div v-for="step in phaseSteps" :key="step.key"
             class="phase-step"
             :class="{ 'step-active': step.active, 'step-done': step.done }">
          <span class="step-num">{{ step.n }}</span>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>

      <!-- ══ Main body ══ -->
      <div class="game-body">

        <!-- ── SITUATION: loading ── -->
        <div v-if="phase === 'situation'" class="phase-content">
          <div class="loading-box">
            <PixelIcon name="hourglass" :size="28" color="#003399" />
            <span class="loading-text">Генерируется ситуация<span class="blink-dots">...</span></span>
          </div>
          <hr class="win-sep" />
          <div class="section-lbl"><PixelIcon name="music" :size="14" /> Твои карты в этом раунде:</div>
          <div class="hand-grid">
            <div v-for="s in myHand" :key="s.id" class="sound-card sound-preview">
              <div class="card-name">{{ s.name }}</div>
              <button class="xp-btn card-btn-sm preview-btn"
                      :class="{ 'preview-btn--playing': previewingId === s.id && previewPlaying }"
                      @click.stop="togglePreview(s)">
                <PixelIcon :name="previewingId === s.id && previewPlaying ? 'pause' : 'speaker'" :size="12" />
                {{ previewingId === s.id && previewPlaying ? 'Пауза' : previewingId === s.id ? 'Продолжить' : 'Слушать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── CHOOSING ── -->
        <div v-else-if="phase === 'choosing'" class="phase-content">
          <div class="situation-panel">
            <div class="sit-meta">Ситуация:</div>
            <div class="sit-text">{{ currentSituation?.text }}</div>
          </div>

          <hr class="win-sep" />

          <div v-if="!submitted">
            <div class="section-lbl"><PixelIcon name="music" :size="14" /> Выбери реакцию:</div>
            <div class="hand-grid">
              <div v-for="s in myHand" :key="s.id"
                   class="sound-card"
                   :class="{ 'card-selected': selectedSoundId === s.id }"
                   @click="highlightSound(s.id)">
                <div class="card-name">{{ s.name }}</div>
                <div class="card-actions">
                  <button class="xp-btn card-btn-sm preview-btn"
                          :class="{ 'preview-btn--playing': previewingId === s.id && previewPlaying }"
                          @click.stop="togglePreview(s)">
                    <PixelIcon :name="previewingId === s.id && previewPlaying ? 'pause' : 'speaker'" :size="12" />
                    {{ previewingId === s.id && previewPlaying ? 'Пауза' : previewingId === s.id ? '▶' : '▶' }}
                  </button>
                  <span v-if="selectedSoundId === s.id" class="card-chosen-tag">
                    <PixelIcon name="check" :size="11" color="#008000" /> Выбрано
                  </span>
                </div>
              </div>
            </div>

            <div class="confirm-row">
              <button class="xp-btn confirm-btn"
                      :disabled="!selectedSoundId"
                      @click="submitSound">
                <PixelIcon name="check" :size="14" /> Подтвердить выбор
              </button>
            </div>
          </div>

          <div v-else class="ok-banner">
            <PixelIcon name="check" :size="20" color="#008000" />
            <span>Ответ отправлен! Ждём остальных...</span>
          </div>

          <hr class="win-sep" />

          <div class="progress-row">
            <span class="progress-lbl">Ответили: <strong>{{ submitCount }}</strong> из <strong>{{ totalPlayers }}</strong></span>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill"
                   :style="{ width: totalPlayers > 0 ? (submitCount / totalPlayers * 100) + '%' : '0%' }" />
            </div>
          </div>
        </div>

        <!-- ── PLAYBACK ── -->
        <div v-else-if="phase === 'playback'" class="phase-content">

          <div class="situation-panel situation-sm">
            <div class="sit-meta">Ситуация:</div>
            <div class="sit-text">{{ currentSituation?.text }}</div>
          </div>

          <hr class="win-sep" />

          <!-- Situation TTS playing -->
          <div v-if="ttsPlaying" class="info-banner">
            <PixelIcon name="speaker" :size="22" color="#003399" />
            <span>Озвучивается ситуация<span class="blink-dots">...</span></span>
          </div>

          <!-- Host: press to start -->
          <div v-else-if="isHost && !playbackStarted" class="start-area">
            <button class="xp-btn start-btn" @click="startPlayback">
              <PixelIcon name="rocket" :size="16" /> Начать воспроизведение
            </button>
          </div>

          <!-- Active playback (host after start, non-host immediately) -->
          <template v-else-if="activePlaybackIndex >= 0">

            <!-- Big "now playing" card -->
            <div class="now-playing-card" :class="{ 'np-active': isPlaying }">
              <div class="np-status-row">
                <PixelIcon :name="isPlaying ? 'speaker' : 'check'" :size="14"
                           :color="isPlaying ? '#003399' : '#008000'" />
                <span class="np-status-text">{{ isPlaying ? 'Играет' : 'Готово' }}</span>
              </div>
              <div class="np-player">{{ currentPlayingItem?.playerNick }}</div>
              <div class="np-sound">{{ currentPlayingItem?.sound?.name }}</div>
              <div v-if="isPlaying" class="eq-wrap">
                <div v-for="i in 10" :key="i" class="eq-bar"
                     :style="{ animationDelay: (i * 0.055) + 's', animationDuration: (0.38 + i * 0.042) + 's' }" />
              </div>
            </div>

            <!-- Host controls (shown after sound finishes) -->
            <div v-if="isHost && !isPlaying" class="host-btns">
              <button class="xp-btn btn-replay" @click="replayCurrentSound">
                <PixelIcon name="speaker" :size="13" /> Переслушать
              </button>
              <button v-if="hasNextPlayer" class="xp-btn btn-next" @click="nextPlayer">
                Следующий →
              </button>
              <button v-else class="xp-btn btn-vote" @click="startVoting">
                <PixelIcon name="star" :size="14" /> Начать голосование
              </button>
            </div>

            <div v-else-if="!isHost" class="streamer-hint">
              <PixelIcon name="monitor" :size="13" /> Стример управляет воспроизведением
            </div>

            <hr class="win-sep" />

            <!-- Mini player cards row -->
            <div class="section-lbl"><PixelIcon name="people" :size="14" /> Все участники:</div>
            <div class="mini-grid">
              <div v-for="(item, idx) in orderedSounds" :key="idx"
                   class="mini-card"
                   :class="{
                     'mini-active': idx === activePlaybackIndex,
                     'mini-done':   idx < activePlaybackIndex,
                     'mini-wait':   idx > activePlaybackIndex
                   }">
                <div class="mini-icon">
                  <PixelIcon v-if="idx < activePlaybackIndex" name="check" :size="11" color="#008000" />
                  <PixelIcon v-else-if="idx === activePlaybackIndex" name="speaker" :size="11" color="#003399" />
                  <span v-else class="mini-num">{{ idx + 1 }}</span>
                </div>
                <div class="mini-nick">{{ item.playerNick }}</div>
                <div class="mini-snd">{{ item.sound?.name || '???' }}</div>
              </div>
            </div>
          </template>

        </div>

        <!-- ── VOTING ── -->
        <div v-else-if="phase === 'voting'" class="phase-content">
          <div class="situation-panel situation-sm">
            <div class="sit-meta">Ситуация:</div>
            <div class="sit-text">{{ currentSituation?.text }}</div>
          </div>

          <hr class="win-sep" />

          <div v-if="!voted">
            <div class="section-lbl"><PixelIcon name="star" :size="14" /> Выбери лучший звук:</div>
            <div class="vote-list">
              <div v-for="(item, idx) in orderedSounds" :key="idx"
                   class="vote-row"
                   :class="{
                     'vote-mine':     isMySound(item),
                     'vote-selected': selectedVoteIndex === idx && !isMySound(item)
                   }">
                <span class="vote-num">{{ idx + 1 }}.</span>
                <span class="vote-name">{{ item.sound?.name || '???' }}</span>
                <span v-if="isMySound(item)" class="vote-mine-tag">мой звук</span>
                <button v-else class="xp-btn vote-pick-btn"
                        :class="{ 'pick-chosen': selectedVoteIndex === idx }"
                        @click="selectVote(idx)">
                  {{ selectedVoteIndex === idx ? '✓ Выбран' : 'Выбрать' }}
                </button>
              </div>
            </div>
            <hr class="win-sep" />
            <button class="xp-btn confirm-btn"
                    :disabled="selectedVoteIndex === null"
                    @click="castVote">
              <PixelIcon name="check" :size="14" /> Подтвердить голос
            </button>
          </div>

          <div v-else class="ok-banner">
            <PixelIcon name="check" :size="20" color="#008000" />
            <span>Голос принят! Проголосовало: {{ voteCount }} / {{ totalPlayers }}</span>
          </div>
        </div>

        <!-- ── RESULTS ── -->
        <div v-else-if="phase === 'results'" class="phase-content">
          <div class="results-header">
            <PixelIcon name="crown" :size="34" :color="roundResult?.winnerId ? '#f4a800' : '#888'" />
            <span class="results-title">Раунд завершён!</span>
          </div>

          <div v-if="roundResult?.winnerId" class="winner-box">
            <div class="winner-meta">Победитель раунда:</div>
            <div class="winner-name">{{ roundResult.winnerNick }}</div>
            <div class="winner-snd"><PixelIcon name="speaker" :size="12" /> {{ roundResult.sound?.name }}</div>
          </div>
          <div v-else class="no-winner">Ничья — победителя нет.</div>

          <hr class="win-sep" />

          <div class="section-lbl">Счёт:</div>
          <div class="scores-list">
            <div v-for="(p, i) in sortedScores" :key="p.socketId"
                 class="score-row"
                 :class="{ 'score-winner': p.socketId === roundResult?.winnerId }">
              <span class="score-pos">{{ i + 1 }}.</span>
              <span class="score-nick">{{ p.nickname }}</span>
              <span class="score-stars">
                <span v-for="n in settings_pts" :key="n">{{ n <= p.score ? '★' : '☆' }}</span>
              </span>
            </div>
          </div>

          <hr class="win-sep" />
          <button v-if="isHost" class="xp-btn action-btn" @click="requestNextRound">
            <PixelIcon name="rocket" :size="14" /> Следующий раунд
          </button>
          <p v-else class="wait-hint"><PixelIcon name="hourglass" :size="14" /> Ждём хоста...</p>
        </div>

        <!-- ── GAMEOVER ── -->
        <div v-else-if="phase === 'gameover'" class="phase-content">
          <div class="results-header gameover-hdr">
            <PixelIcon name="crown" :size="46" color="#f4a800" />
            <span class="results-title gameover-title">Игра завершена!</span>
          </div>

          <div class="winner-box winner-final">
            <div class="winner-meta">Чемпион:</div>
            <div class="winner-name">{{ gameOver?.winnerNick }}</div>
          </div>

          <hr class="win-sep" />

          <div class="section-lbl">Итоговый счёт:</div>
          <div class="scores-list">
            <div v-for="(p, i) in sortedGameOver" :key="p.socketId"
                 class="score-row"
                 :class="{ 'score-winner': p.socketId === gameOver?.winnerId }">
              <span class="score-pos">{{ i + 1 }}.</span>
              <span class="score-nick">{{ p.nickname }}</span>
              <span class="score-stars">{{ '★'.repeat(p.score) }}{{ '☆'.repeat(Math.max(0, settings_pts - p.score)) }}</span>
            </div>
          </div>

          <hr class="win-sep" />
          <button v-if="isHost" class="xp-btn action-btn" @click="restartGame">
            <PixelIcon name="gamepad" :size="14" /> Сыграть снова
          </button>
          <p v-else class="wait-hint"><PixelIcon name="hourglass" :size="14" /> Ждём хоста...</p>
        </div>

      </div><!-- /game-body -->

      <!-- ══ Status bar: all players ══ -->
      <div class="game-statusbar">
        <div v-for="p in players" :key="p.socketId"
             class="sb-player"
             :class="{ 'sb-me': p.socketId === mySocketId, 'sb-host': p.socketId === hostSocketId }">
          <PixelIcon v-if="p.socketId === hostSocketId" name="crown" :size="10" color="#f4a800" />
          <span class="sb-nick">{{ p.nickname }}</span>
          <span class="sb-score">{{ p.score }}★</span>
          <PixelIcon v-if="phase === 'choosing' && submittedSocketIds.includes(p.socketId)"
                     name="check" :size="10" color="#008000" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '../socket.js'
import { gameState } from '../gameState.js'
import { speakText, cancelSpeech } from '../tts.js'
import PixelIcon from '../components/PixelIcon.vue'

const route   = useRoute()
const router  = useRouter()
const lobbyId = computed(() => route.params.id)

// ── State ──────────────────────────────────────────────────────────────────
const phase             = ref(gameState.phase || 'situation')
const currentSituation  = ref(gameState.situation || null)
const myHand            = ref(gameState.hand || [])
const players           = ref([])
const hostSocketId      = ref(null)
const mySocketId        = ref(socket.id || '')
const totalPlayers      = ref(0)
const settings_pts      = ref(3)

const submitted          = ref(false)
const selectedSoundId    = ref(null)
const submittedSoundId   = ref(null)
const submitCount        = ref(0)
const submittedSocketIds = ref([])

const previewingId      = ref(null)  // id of sound card currently in preview
const previewPlaying    = ref(false) // true = playing, false = paused/stopped
let   _previewAudio     = null       // the live Audio element

const orderedSounds       = ref([])
const activePlaybackIndex = ref(-1)
const ttsPlaying          = ref(false)
const playbackStarted     = ref(false)
const isPlaying           = ref(false)
let   playbackAborted     = false

const voted             = ref(false)
const selectedVoteIndex = ref(null)
const voteCount         = ref(0)

const roundResult  = ref(null)
const gameOver     = ref(null)
const errorMsg     = ref('')
const showConfirm  = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────
const isHost = computed(() =>
  mySocketId.value && mySocketId.value === hostSocketId.value
)
const currentPlayingItem = computed(() =>
  activePlaybackIndex.value >= 0 ? orderedSounds.value[activePlaybackIndex.value] || null : null
)
const hasNextPlayer = computed(() =>
  activePlaybackIndex.value < orderedSounds.value.length - 1
)
const sortedScores   = computed(() => [...(roundResult.value?.scores || [])].sort((a, b) => b.score - a.score))
const sortedGameOver = computed(() => [...(gameOver.value?.scores   || [])].sort((a, b) => b.score - a.score))

const phaseLabel = computed(() => ({
  situation: 'Генерация ситуации...',
  choosing:  'Выбор реакции',
  playback:  'Воспроизведение',
  voting:    'Голосование',
  results:   'Результаты раунда',
  gameover:  'Игра завершена'
}[phase.value] || phase.value))

const phaseSteps = computed(() => {
  const p = phase.value
  const order = ['situation', 'choosing', 'playback', 'voting', 'results', 'gameover']
  const cur   = order.indexOf(p)
  return [
    { n: 1, key: 'choose',   label: 'Выбор звука',     phases: ['situation', 'choosing'] },
    { n: 2, key: 'playback', label: 'Прослушивание',   phases: ['playback'] },
    { n: 3, key: 'vote',     label: 'Голосование',     phases: ['voting'] },
    { n: 4, key: 'results',  label: 'Итоги',           phases: ['results', 'gameover'] },
  ].map(s => {
    const sIdx = order.indexOf(s.phases[0])
    return { ...s, active: s.phases.includes(p), done: sIdx < cur && !s.phases.includes(p) }
  })
})

// ── Audio utils ────────────────────────────────────────────────────────────
function playAudio(url) {
  stopPreview()
  return new Promise(resolve => {
    if (!url) return resolve()
    const audio = new Audio(url)
    audio.onended = resolve
    audio.onerror = resolve
    audio.play().catch(resolve)
  })
}

function stopPreview() {
  if (_previewAudio) {
    _previewAudio.pause()
    _previewAudio.onended = null
    _previewAudio = null
  }
  previewingId.value   = null
  previewPlaying.value = false
}

function togglePreview(sound) {
  if (!sound?.file) return

  // Same card → toggle pause/resume
  if (previewingId.value === sound.id) {
    if (previewPlaying.value) {
      _previewAudio.pause()
      previewPlaying.value = false
    } else {
      _previewAudio.play().catch(() => {})
      previewPlaying.value = true
    }
    return
  }

  // Different card → stop current, start new
  stopPreview()
  const audio = new Audio(sound.file)
  _previewAudio = audio
  previewingId.value   = sound.id
  previewPlaying.value = true
  audio.onended = () => stopPreview()
  audio.onerror = () => stopPreview()
  audio.play().catch(() => stopPreview())
}

// ── Playback controls (host) ───────────────────────────────────────────────
async function startPlayback() {
  playbackStarted.value = true
  playbackAborted = false

  // Signal non-hosts to play TTS too
  socket.emit('playback_advance', { lobbyId: lobbyId.value, index: -1 })

  ttsPlaying.value = true
  if (currentSituation.value?.audioFile) {
    await playAudio(currentSituation.value.audioFile)
  } else if (currentSituation.value?.text) {
    await speakText(currentSituation.value.text)
  }
  ttsPlaying.value = false

  if (playbackAborted) return
  await playPlayerAt(0)
}

async function playPlayerAt(index) {
  if (playbackAborted) return
  activePlaybackIndex.value = index
  // Sync non-host clients immediately, before audio starts
  socket.emit('playback_advance', { lobbyId: lobbyId.value, index })
  isPlaying.value = true
  const item = orderedSounds.value[index]
  await playAudio(item?.sound?.file || '')
  if (playbackAborted) return
  isPlaying.value = false
}

async function replayCurrentSound() {
  if (playbackAborted) return
  const index = activePlaybackIndex.value
  socket.emit('playback_advance', { lobbyId: lobbyId.value, index })
  isPlaying.value = true
  const item = orderedSounds.value[index]
  await playAudio(item?.sound?.file || '')
  if (playbackAborted) return
  isPlaying.value = false
}

async function nextPlayer() {
  await playPlayerAt(activePlaybackIndex.value + 1)
}

// ── Game actions ───────────────────────────────────────────────────────────
function highlightSound(soundId) {
  if (submitted.value) return
  selectedSoundId.value = soundId
}

function submitSound() {
  if (submitted.value || !selectedSoundId.value) return
  stopPreview()
  submittedSoundId.value = selectedSoundId.value
  submitted.value = true
  socket.emit('submit_sound', { lobbyId: lobbyId.value, soundId: selectedSoundId.value })
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
  stopPreview()
  cancelSpeech()
  socket.emit('leave_lobby', { lobbyId: lobbyId.value })
  router.push('/')
}

function showError(msg) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 4000)
}

function resetRound() {
  stopPreview()
  submitted.value           = false
  selectedSoundId.value     = null
  submittedSoundId.value    = null
  submitCount.value         = 0
  submittedSocketIds.value  = []
  voted.value               = false
  selectedVoteIndex.value   = null
  voteCount.value           = 0
  orderedSounds.value       = []
  activePlaybackIndex.value = -1
  playbackStarted.value     = false
  isPlaying.value           = false
  playbackAborted           = false
  roundResult.value         = null
  ttsPlaying.value          = false
}

// ── Socket listeners ───────────────────────────────────────────────────────
onMounted(() => {
  mySocketId.value = socket.id

  socket.on('game_started', ({ situation, hand, phase: ph }) => {
    phase.value            = ph || 'situation'
    currentSituation.value = situation
    myHand.value           = hand || []
    gameState.situation    = situation
    gameState.hand         = hand || []
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
    phase.value           = 'playback'
    orderedSounds.value   = os || []
    if (situation) currentSituation.value = situation
    playbackStarted.value = false
    isPlaying.value       = false
    ttsPlaying.value      = false
    playbackAborted       = false
    // Host waits for manual start; non-host immediately shows first player card
    activePlaybackIndex.value = isHost.value ? -1 : 0
  })

  // Non-host: sync state and play audio
  socket.on('playback_advance', ({ index }) => {
    if (isHost.value) return

    // index === -1 means host started, play situation TTS
    if (index === -1) {
      ttsPlaying.value = true
      const sit = currentSituation.value
      const doTTS = async () => {
        if (sit?.audioFile) {
          await playAudio(sit.audioFile)
        } else if (sit?.text) {
          await speakText(sit.text)
        }
        if (!playbackAborted) ttsPlaying.value = false
      }
      doTTS()
      return
    }

    // Normal player sound
    ttsPlaying.value = false
    activePlaybackIndex.value = index
    const item = orderedSounds.value[index]
    if (!item?.sound?.file) return
    isPlaying.value = true
    playAudio(item.sound.file).then(() => {
      if (!playbackAborted) isPlaying.value = false
    })
  })

  socket.on('voting_start', ({ shuffledSounds, situation }) => {
    phase.value             = 'voting'
    orderedSounds.value     = shuffledSounds || []
    if (situation) currentSituation.value = situation
    voted.value             = false
    selectedVoteIndex.value = null
    voteCount.value         = 0
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
    isPlaying.value   = false
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
  cancelSpeech()
  ;['game_started','situation_revealed','player_submitted','playback_start','playback_advance',
    'voting_start','vote_cast','round_result','game_over','lobby_updated',
    'game_restarted','player_kicked','lobby_closed','error'].forEach(e => socket.off(e))
})
</script>

<style scoped>
/* ── Layout ── */
.game-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  z-index: 5;
}
.game-window {
  width: 100%;
  max-width: 740px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ── Titlebar extras ── */
.host-badge {
  margin-left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #f4c000;
  font-weight: bold;
}
.error-badge {
  margin-left: 14px;
  font-size: 11px;
  color: #ff8080;
}

/* ── Phase bar ── */
.phase-bar {
  display: flex;
  background: #bdb8b0;
  border-bottom: 2px solid #808080;
  padding: 0 8px;
  gap: 2px;
  flex-shrink: 0;
}
.phase-step {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #666;
  border-bottom: 3px solid transparent;
  user-select: none;
  transition: color 0.1s;
}
.step-active {
  color: #003399;
  font-weight: bold;
  border-bottom-color: #003399;
  background: #d4d0c8;
}
.step-done { color: #008000; }
.step-num {
  width: 18px;
  height: 18px;
  background: #d4d0c8;
  border: 1px solid #808080;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  flex-shrink: 0;
}
.step-active .step-num { background: #003399; color: #fff; border-color: #003399; }
.step-done   .step-num { background: #008000; color: #fff; border-color: #008000; }

/* ── Game body ── */
.game-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: #d4d0c8;
}
.phase-content {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Status bar ── */
.game-statusbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  background: #d4d0c8;
  border-top: 1px solid #808080;
  padding: 4px 8px;
  flex-shrink: 0;
}
.sb-player {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #444;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 2px 8px;
}
.sb-me   { background: #dce8ff; }
.sb-nick { font-weight: 500; }
.sb-score { font-weight: bold; color: #003399; margin-left: 4px; }

/* ── Loading ── */
.loading-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
}
.loading-text {
  font-family: Tahoma, sans-serif;
  font-size: 16px;
  color: #003399;
  font-weight: bold;
}
.blink-dots { animation: blink 1s step-end infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Section label ── */
.section-lbl {
  font-family: Tahoma, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #222;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Situation panel ── */
.situation-panel {
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 14px 18px;
}
.situation-sm { padding: 10px 14px; }
.sit-meta {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.sit-text {
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  color: #003399;
  font-weight: bold;
  line-height: 1.4;
}

/* ── Hand cards ── */
.hand-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sound-card {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  padding: 12px 14px;
  min-width: 150px;
  flex: 1;
  max-width: 230px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: background 0.08s;
}
.sound-card:hover:not(.sound-preview) { background: #ddd9d0; }
.card-selected {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  background: #dce8ff;
  outline: 2px solid #003399;
  outline-offset: -2px;
}
.sound-preview { cursor: default; opacity: 0.8; border-style: dashed; }
.card-name {
  font-family: Tahoma, sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #222;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-btn-sm { padding: 3px 10px; font-size: 12px; flex-shrink: 0; }
.preview-btn--playing {
  background: #dce8ff;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  color: #003399;
}
.card-chosen-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #008000;
  font-weight: bold;
}

/* ── Confirm row ── */
.confirm-row { display: flex; }
.confirm-btn {
  font-size: 15px;
  font-weight: bold;
  padding: 10px 26px;
  color: #003399;
  display: flex;
  align-items: center;
  gap: 8px;
}
.confirm-btn:not(:disabled):hover { background: #e8f0ff; }

/* ── OK banner ── */
.ok-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f0fff0;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  color: #008000;
  font-weight: bold;
}

/* ── Progress bar ── */
.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress-lbl {
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
}
.progress-bar-wrap {
  flex: 1;
  height: 16px;
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: repeating-linear-gradient(
    90deg, #0a4ee8 0px, #0a4ee8 8px, #1a6aff 8px, #1a6aff 10px
  );
  transition: width 0.3s;
}

/* ── Playback: info/tts banners ── */
.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #e8f0ff;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  font-family: Tahoma, sans-serif;
  font-size: 16px;
  color: #003399;
  font-weight: bold;
}
.start-area {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.start-btn {
  font-size: 16px;
  font-weight: bold;
  padding: 12px 36px;
  color: #003399;
  display: flex;
  align-items: center;
  gap: 10px;
}
.start-btn:hover { background: #e8f0ff; }

/* ── Now playing card ── */
.now-playing-card {
  background: white;
  border: 3px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s, outline 0.2s;
}
.np-active {
  border-top-color: #003399;
  border-left-color: #003399;
  outline: 2px solid #003399;
  outline-offset: -3px;
}
.np-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.np-status-text { margin-left: 2px; }
.np-player {
  font-family: Tahoma, sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #003399;
  margin-top: 2px;
}
.np-sound {
  font-family: Tahoma, sans-serif;
  font-size: 16px;
  color: #444;
}

/* Equalizer */
.eq-wrap {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 34px;
  margin-top: 10px;
}
.eq-bar {
  width: 6px;
  background: linear-gradient(to top, #003399, #4d94ff);
  border-radius: 2px 2px 0 0;
  animation: eqBounce 0.5s ease-in-out infinite alternate;
}
@keyframes eqBounce {
  from { height: 5px;  opacity: 0.5; }
  to   { height: 34px; opacity: 1; }
}

/* ── Host buttons ── */
.host-btns {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
.btn-replay { color: #555; padding: 8px 18px; display: flex; align-items: center; gap: 8px; }
.btn-next {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 10px 24px;
  color: #003399;
}
.btn-next:hover { background: #e8f0ff; }
.btn-vote {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 10px 24px;
  color: #8b6000;
  background: #fff3cd;
  border-top-color: #ffe080;
  border-left-color: #ffe080;
  border-bottom-color: #a07000;
  border-right-color: #a07000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-vote:hover { background: #fffae0; }

.streamer-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  color: #777;
}

/* ── Mini cards ── */
.mini-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mini-card {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  padding: 8px 12px;
  min-width: 130px;
  flex: 1;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.mini-active {
  opacity: 1;
  border-top-color: #003399;
  border-left-color: #003399;
  outline: 2px solid #003399;
  outline-offset: -2px;
  background: #dce8ff;
}
.mini-done { opacity: 0.75; }
.mini-done .mini-nick { color: #008000; }
.mini-icon {
  display: flex;
  align-items: center;
  height: 14px;
}
.mini-num {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #888;
  font-weight: bold;
}
.mini-nick {
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  font-weight: bold;
  color: #222;
}
.mini-snd {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Voting ── */
.vote-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.vote-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  font-family: Tahoma, sans-serif;
  cursor: pointer;
  transition: background 0.08s;
}
.vote-row:not(.vote-mine):hover { background: #ddd9d0; }
.vote-selected {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  background: #dce8ff;
  outline: 2px solid #003399;
  outline-offset: -2px;
}
.vote-mine { opacity: 0.5; cursor: default; }
.vote-num { font-size: 13px; color: #888; min-width: 22px; }
.vote-name { flex: 1; font-size: 15px; font-weight: bold; color: #222; }
.vote-mine-tag { font-size: 12px; color: #888; font-style: italic; }
.vote-pick-btn { white-space: nowrap; font-size: 12px; padding: 4px 14px; }
.pick-chosen {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  background: #dce8ff;
  color: #003399;
  font-weight: bold;
}

/* ── Results ── */
.results-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.results-title {
  font-family: Tahoma, sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #003399;
}
.gameover-hdr { justify-content: center; padding: 10px 0; }
.gameover-title { font-size: 28px; color: #8b6000; }

.winner-box {
  background: #fff3cd;
  border: 2px solid #f4a800;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.winner-final { padding: 22px 26px; }
.no-winner {
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  color: #666;
  padding: 10px 0;
}
.winner-meta {
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  color: #8b6000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.winner-name {
  font-family: Tahoma, sans-serif;
  font-size: 26px;
  font-weight: bold;
  color: #8b4500;
}
.winner-snd {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: Tahoma, sans-serif;
  font-size: 14px;
  color: #666;
  margin-top: 2px;
}

.scores-list { display: flex; flex-direction: column; gap: 4px; }
.score-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
}
.score-winner {
  background: #fff3cd;
  border-top-color: #ffe080;
  border-left-color: #ffe080;
  border-bottom-color: #a07000;
  border-right-color: #a07000;
}
.score-pos  { color: #888; min-width: 24px; }
.score-nick { flex: 1; font-weight: bold; color: #222; }
.score-stars { color: #f4a800; font-size: 17px; letter-spacing: 2px; }

.action-btn {
  font-size: 17px;
  font-weight: bold;
  padding: 12px 32px;
  color: #003399;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.action-btn:not(:disabled):hover { background: #e8f0ff; }

.wait-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: Tahoma, sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* ── Confirm dialog ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.dlg-win { width: 380px; }
.dlg-body {
  padding: 20px 22px 16px;
  background: #d4d0c8;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dlg-msg {
  font-family: Tahoma, sans-serif;
  font-size: 15px;
  color: #222;
}
.dlg-btns {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 680px) {
  .game-wrap { padding: 4px; }
  .phase-step { padding: 4px 8px; font-size: 11px; }
  .phase-bar { flex-wrap: wrap; }
  .sit-text { font-size: 15px; }
  .hand-grid { gap: 6px; }
  .sound-card { min-width: 130px; }
  .np-player { font-size: 22px; }
  .mini-card { min-width: 110px; }
  .start-btn { font-size: 15px; padding: 12px 24px; }
}
</style>
