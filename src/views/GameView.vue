<template>
  <div class="page-center game-page-center">
    <!-- Win98 Confirmation dialog -->
    <ConfirmDialog
      v-if="showConfirm"
      message="Вы уверены что хотите покинуть игру? Прогресс будет потерян."
      @confirm="confirmLeave"
      @cancel="showConfirm = false"
    />

    <div class="game-window-wrap">
      <div class="win-window game-win">
        <!-- Titlebar -->
        <div class="win-titlebar">
          <div class="win-titlebar-left">
            <span class="win-title-icon">🎮</span>
            <span class="win-title-text">{{ phaseTitle }}</span>
          </div>
          <div class="win-title-btns">
            <button class="win-ctrl" title="Свернуть">&#x2014;</button>
            <button class="win-ctrl" title="Развернуть">&#x25A1;</button>
            <button class="win-ctrl win-ctrl-close" title="Покинуть игру" @click="showConfirm = true">&#x2715;</button>
          </div>
        </div>

        <!-- Two-column body -->
        <div class="game-body">
          <div class="game-main-area">

            <!-- ── SITUATION ── -->
            <transition name="fade">
              <div v-if="phase === 'situation'" key="situation" class="phase-pad">
                <div class="generating-box">
                  <p class="gen-text">Генерируется жизненная ситуация<span class="blink-cursor">|</span></p>
                  <div class="win-progress mt-2">
                    <div class="win-progress-fill progress-anim" style="width:70%" />
                  </div>
                </div>
                <hr class="win-sep mt-2" />
                <p class="hint-label">Твои звуки в этом раунде:</p>
                <div class="sounds-grid mt-2">
                  <SoundPlayer
                    v-for="s in myHand"
                    :key="s.id"
                    :soundId="s.id"
                    :soundUrl="s.file"
                    :sound="s"
                    :selectable="false"
                    :disabled="false"
                  />
                </div>
              </div>
            </transition>

            <!-- ── CHOOSING ── -->
            <transition name="fade">
              <div v-if="phase === 'choosing'" key="choosing" class="phase-pad">
                <SituationCard :situation="currentSituation" />

                <div class="timer-row mt-2">
                  <Timer :duration="120" :running="true" />
                  <div class="submit-status">
                    <div class="win-progress">
                      <div class="win-progress-fill" :style="{ width: totalPlayers ? (submitCount/totalPlayers*100)+'%' : '0%' }" />
                    </div>
                    <span class="hint-label">{{ submitCount }} из {{ totalPlayers }} ответили</span>
                  </div>
                </div>

                <hr class="win-sep mt-2" />

                <div v-if="!submitted" class="sounds-grid">
                  <SoundPlayer
                    v-for="s in myHand"
                    :key="s.id"
                    :soundId="s.id"
                    :soundUrl="s.file"
                    :sound="s"
                    :selectable="true"
                    :selected="selectedSoundId === s.id"
                    :disabled="false"
                    @select="selectSound"
                  />
                </div>
                <div v-else class="submitted-banner">
                  ✓ Ответ отправлен! Ждём остальных...
                </div>
              </div>
            </transition>

            <!-- ── PLAYBACK ── -->
            <transition name="fade">
              <div v-if="phase === 'playback'" key="playback" class="phase-pad">
                <SituationCard :situation="currentSituation" />
                <p class="hint-label mt-2">🔊 Прослушиваем ответы игроков...</p>
                <div class="sounds-grid mt-2">
                  <SoundPlayer
                    v-for="(item, idx) in orderedSounds"
                    :key="idx"
                    :soundId="item.soundId"
                    :soundUrl="item.sound?.file"
                    :label="`Звук #${idx + 1}`"
                    :sound="item.sound"
                    :active="activePlaybackIndex === idx"
                    :disabled="false"
                  />
                </div>
              </div>
            </transition>

            <!-- ── VOTING ── -->
            <transition name="fade">
              <div v-if="phase === 'voting'" key="voting" class="phase-pad">
                <SituationCard :situation="currentSituation" />

                <div class="timer-row mt-2">
                  <Timer :duration="60" :running="true" />
                  <div class="win-status-panel vote-counter">
                    Проголосовало: <strong>{{ voteCount }} / {{ totalPlayers }}</strong>
                  </div>
                </div>

                <hr class="win-sep mt-2" />

                <div v-if="!voted">
                  <div class="sounds-grid">
                    <SoundPlayer
                      v-for="(item, idx) in orderedSounds"
                      :key="idx"
                      :soundId="item.soundId"
                      :soundUrl="item.sound?.file"
                      :label="isMySubmission(item) ? `Звук #${idx+1} (Ваш)` : `Звук #${idx+1}`"
                      :sound="item.sound"
                      :votable="!isMySubmission(item)"
                      :voted="selectedVoteIndex === idx"
                      :disabled="isMySubmission(item)"
                      @vote="() => selectVote(idx)"
                    />
                  </div>
                  <div class="vote-action mt-2">
                    <button
                      class="win-btn win-btn-lg"
                      :disabled="selectedVoteIndex === null"
                      @click="castVote"
                    >
                      🗳 Подтвердить голос
                    </button>
                  </div>
                </div>
                <div v-else class="submitted-banner">
                  ✓ Голос принят! Ждём остальных...
                </div>
              </div>
            </transition>

            <!-- ── RESULTS ── -->
            <transition name="fade">
              <div v-if="phase === 'results'" key="results" class="phase-pad">
                <WinnerScreen
                  :winnerId="roundResult?.winnerId"
                  :winnerNick="roundResult?.winnerNick"
                  :winnerAvatar="roundResult?.winnerAvatar"
                  :sound="roundResult?.sound"
                  :scores="roundResult?.scores || []"
                  :isGameOver="false"
                  :isHost="isHost"
                  @next-round="requestNextRound"
                />
              </div>
            </transition>

            <!-- ── GAMEOVER ── -->
            <transition name="fade">
              <div v-if="phase === 'gameover'" key="gameover" class="phase-pad">
                <WinnerScreen
                  :winnerId="gameOver?.winnerId"
                  :winnerNick="gameOver?.winnerNick"
                  :winnerAvatar="gameOver?.winnerAvatar"
                  :scores="gameOver?.scores || []"
                  :isGameOver="true"
                  :isHost="isHost"
                  @restart="restartGame"
                />
              </div>
            </transition>
          </div>

          <!-- Sidebar -->
          <div class="game-sidebar" v-if="phase !== 'results' && phase !== 'gameover'">
            <PlayerList
              :players="players"
              :hostSocketId="hostSocketId"
              :submittedIds="submittedSocketIds"
              :showSubmit="phase === 'choosing'"
              :showScore="true"
            />
          </div>
        </div>

        <!-- Status strip -->
        <div class="game-statusstrip">
          <div class="win-status-panel">{{ phaseLabel }}</div>
          <div class="win-status-panel" v-if="isHost">👑 Хост</div>
          <div v-if="errorMsg" class="win-status-panel" style="flex:1;text-align:right;color:#cc0000">⚠️ {{ errorMsg }}</div>
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
import SoundPlayer from '../components/SoundPlayer.vue'
import SituationCard from '../components/SituationCard.vue'
import PlayerList from '../components/PlayerList.vue'
import Timer from '../components/Timer.vue'
import WinnerScreen from '../components/WinnerScreen.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const lobbyId = computed(() => route.params.id)

// State — restored from gameState if navigated here from WaitingRoom
const phase = ref(gameState.phase || 'situation')
const currentSituation = ref(gameState.situation || null)
const myHand = ref(gameState.hand || [])
const players = ref([])
const hostSocketId = ref(null)
const totalPlayers = ref(0)

const submitted = ref(false)
const selectedSoundId = ref(null)
const submitCount = ref(0)
const submittedSocketIds = ref([])

const orderedSounds = ref([])
const activePlaybackIndex = ref(-1)

const voted = ref(false)
const selectedVoteIndex = ref(null)
const voteCount = ref(0)

const mySubmissions = ref((gameState.hand || []).map(s => s.id))

const roundResult = ref(null)
const gameOver = ref(null)
const errorMsg = ref('')
const showConfirm = ref(false)

const isHost = computed(() => socket.id === hostSocketId.value)

const phaseTitle = computed(() => ({
  situation: 'Раунд — Генерация ситуации',
  choosing:  'Выбери реакцию!',
  playback:  'Слушаем ответы...',
  voting:    'Голосование',
  results:   'Победитель раунда!',
  gameover:  'Конец игры!'
}[phase.value] || 'Key Meme'))

const phaseLabel = computed(() => ({
  situation: '⏳ Генерация ситуации...',
  choosing:  '🎵 Выбор звука (120 сек)',
  playback:  '🔊 Воспроизведение',
  voting:    '🗳 Голосование (60 сек)',
  results:   '🏆 Результаты раунда',
  gameover:  '🎉 Игра завершена'
}[phase.value] || ''))

// ── Actions ──
function selectSound(soundId) {
  if (submitted.value) return
  selectedSoundId.value = soundId
  submitted.value = true
  socket.emit('submit_sound', { lobbyId: lobbyId.value, soundId })
}

function isMySubmission(item) {
  return mySubmissions.value.includes(item.soundId)
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

// Host-only: request next round (server guards against duplicates)
function requestNextRound() {
  socket.emit('next_round', { lobbyId: lobbyId.value })
}

function restartGame() {
  socket.emit('restart_game', { lobbyId: lobbyId.value })
}

// X button confirmation
function confirmLeave() {
  showConfirm.value = false
  socket.emit('leave_lobby', { lobbyId: lobbyId.value })
  router.push('/')
}

function speakSituation(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'ru-RU'
  utt.rate = 0.95
  window.speechSynthesis.speak(utt)
}

function startPlaybackSequence(sounds) {
  let idx = 0
  activePlaybackIndex.value = -1
  function playNext() {
    if (idx >= sounds.length) { activePlaybackIndex.value = -1; return }
    activePlaybackIndex.value = idx++
    setTimeout(playNext, 4000)
  }
  if (currentSituation.value) {
    speakSituation(currentSituation.value.text)
    setTimeout(playNext, 1800)
  } else {
    playNext()
  }
}

function showError(msg) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 4000)
}

function resetRound() {
  submitted.value = false
  selectedSoundId.value = null
  submitCount.value = 0
  submittedSocketIds.value = []
  voted.value = false
  selectedVoteIndex.value = null
  voteCount.value = 0
  orderedSounds.value = []
  activePlaybackIndex.value = -1
  roundResult.value = null
}

// ── Socket listeners ──
onMounted(() => {
  socket.on('game_started', ({ situation, hand, phase: ph }) => {
    phase.value = ph || 'situation'
    currentSituation.value = situation
    myHand.value = hand || []
    gameState.situation = situation
    gameState.hand = hand || []
    mySubmissions.value = (hand || []).map(s => s.id)
    resetRound()
  })

  socket.on('situation_revealed', ({ situation }) => {
    phase.value = 'choosing'
    currentSituation.value = situation
  })

  socket.on('player_submitted', ({ count, total, socketId }) => {
    submitCount.value = count
    totalPlayers.value = total
    if (socketId && !submittedSocketIds.value.includes(socketId)) {
      submittedSocketIds.value = [...submittedSocketIds.value, socketId]
    }
  })

  socket.on('playback_start', ({ orderedSounds: os, situation }) => {
    phase.value = 'playback'
    orderedSounds.value = os || []
    if (situation) currentSituation.value = situation
    startPlaybackSequence(os || [])
  })

  socket.on('voting_start', ({ shuffledSounds, situation }) => {
    phase.value = 'voting'
    orderedSounds.value = shuffledSounds || []
    if (situation) currentSituation.value = situation
    voted.value = false
    selectedVoteIndex.value = null
    voteCount.value = 0
  })

  socket.on('vote_cast', ({ count, total }) => {
    voteCount.value = count
    totalPlayers.value = total
  })

  socket.on('round_result', (data) => {
    phase.value = 'results'
    roundResult.value = data
    players.value = (data.scores || []).map(s => ({ ...s }))
    // Server auto-advances after 8s; host can click early
  })

  socket.on('game_over', (data) => {
    phase.value = 'gameover'
    gameOver.value = data
    players.value = (data.scores || []).map(s => ({ ...s }))
  })

  socket.on('lobby_updated', ({ players: p, settings: s, hostSocketId: h }) => {
    players.value = p || []
    hostSocketId.value = h
    totalPlayers.value = (p || []).length
  })

  // Dedicated restart event: server reset lobby → go back to waiting room
  socket.on('game_restarted', ({ players: p, settings: s, hostSocketId: h }) => {
    players.value = p || []
    hostSocketId.value = h
    router.push(`/lobby/${lobbyId.value}`)
  })

  socket.on('player_kicked', ({ socketId }) => {
    if (socketId === socket.id) router.push('/')
  })
  socket.on('lobby_closed', () => router.push('/'))
  socket.on('error', ({ message }) => showError(message))

  // Fetch lobby for host info and player list
  fetch(`/api/lobby/${lobbyId.value}`)
    .then(r => r.ok ? r.json() : null)
    .then(lobby => {
      if (!lobby) return router.push('/')
      players.value = lobby.players || []
      hostSocketId.value = lobby.hostSocketId
      totalPlayers.value = (lobby.players || []).length
      if (lobby.phase === 'waiting') router.push(`/lobby/${lobbyId.value}`)
      if (myHand.value.length === 0 && lobby.phase !== 'waiting') {
        router.push(`/lobby/${lobbyId.value}`)
      }
    })
    .catch(() => {})
})

onUnmounted(() => {
  ['game_started','situation_revealed','player_submitted','playback_start',
   'voting_start','vote_cast','round_result','game_over','lobby_updated',
   'game_restarted','player_kicked','lobby_closed','error'].forEach(e => socket.off(e))
})
</script>

<style scoped>
.game-page-center { align-items: flex-start; padding: 16px; }
.game-window-wrap { width: 100%; max-width: 900px; }

.game-win {
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  animation: fadeScaleIn 0.2s ease both;
  display: flex;
  flex-direction: column;
}

.win-titlebar {
  background: linear-gradient(90deg, var(--win-title-from), var(--win-title-to));
  color: var(--win-title-text);
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  user-select: none;
  flex-shrink: 0;
}
.win-titlebar-left { display: flex; align-items: center; gap: 5px; font-size: 13px; }
.win-title-icon { font-size: 14px; }
.win-title-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.win-title-btns { display: flex; gap: 2px; flex-shrink: 0; }

.win-ctrl {
  width: 18px; height: 16px;
  background: var(--win-bg);
  border: 2px solid;
  border-top-color: var(--win-light);
  border-left-color: var(--win-light);
  border-bottom-color: var(--win-dark);
  border-right-color: var(--win-dark);
  font-size: 9px; cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
}
.win-ctrl:active {
  border-top-color: var(--win-dark); border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light); border-right-color: var(--win-light);
}
.win-ctrl-close:hover { background: #cc0000; color: white; }

.game-body {
  display: grid;
  grid-template-columns: 1fr 160px;
  min-height: 420px;
  flex: 1;
  overflow: hidden;
}

.game-main-area {
  padding: 10px;
  border-right: 2px solid var(--win-dark);
  overflow-y: auto;
}
.game-sidebar { display: flex; flex-direction: column; overflow: hidden; }

.game-statusstrip {
  display: flex;
  gap: 2px;
  padding: 2px 4px;
  background: var(--win-bg);
  border-top: 2px solid var(--win-dark);
  flex-shrink: 0;
}

/* Phase content */
.phase-pad { display: flex; flex-direction: column; gap: 8px; }

.generating-box {
  background: #000;
  padding: 16px;
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
}
.gen-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #39ff14;
  line-height: 1.5;
}
.blink-cursor { animation: blink 0.5s step-end infinite; }

.win-progress { width: 100%; }
@keyframes marquee { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
.progress-anim { animation: marquee 1s linear infinite; }

.hint-label { font-size: 12px; color: var(--text-muted); }

.sounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 8px;
}

.timer-row { display: flex; align-items: center; gap: 10px; }
.submit-status { display: flex; flex-direction: column; gap: 4px; flex: 1; }

.submitted-banner {
  background: #d0f0d0;
  border: 2px solid;
  border-top-color: var(--win-dark);
  border-left-color: var(--win-dark);
  border-bottom-color: var(--win-light);
  border-right-color: var(--win-light);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: bold;
  color: #006600;
  text-align: center;
}

.vote-counter { font-size: 13px; padding: 4px 10px; }
.vote-action { display: flex; justify-content: center; }

@media (max-width: 640px) {
  .game-body { grid-template-columns: 1fr; }
  .game-sidebar { display: none; }
  .sounds-grid { grid-template-columns: 1fr; }
}
</style>
