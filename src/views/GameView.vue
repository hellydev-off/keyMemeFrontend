<template>
  <!-- Confirm leave dialog -->
  <Teleport to="body">
    <div v-if="showConfirm" class="overlay" @mousedown.self="showConfirm = false">
      <div class="dlg-box">
        <div class="dlg-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4M12 17h.01"/>
          </svg>
        </div>
        <p class="dlg-msg">Выйти из игры? Прогресс раунда потеряется.</p>
        <div class="dlg-btns">
          <button class="btn btn-danger" @click="confirmLeave">Выйти</button>
          <button class="btn btn-ghost" @click="showConfirm = false">Отмена</button>
        </div>
      </div>
    </div>
  </Teleport>

  <div class="game-wrap">
    <div class="game-card">

      <!-- ══ Header ══ -->
      <div class="game-header">
        <div class="game-header-left">
          <div class="game-title-icon">
            <PixelIcon name="gamepad" :size="16" color="var(--c-primary)" />
          </div>
          <span class="game-title">{{ phaseLabel }}</span>
          <span v-if="isHost" class="host-chip">
            <PixelIcon name="crown" :size="11" color="#d97706" /> Стример
          </span>
          <span v-if="errorMsg" class="error-chip">{{ errorMsg }}</span>
        </div>
        <button class="close-btn" @click="showConfirm = true" title="Выйти">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- ══ Phase stepper ══ -->
      <div class="phase-bar">
        <div v-for="step in phaseSteps" :key="step.key"
             class="phase-step"
             :class="{ 'step-active': step.active, 'step-done': step.done }">
          <div class="step-bubble">
            <svg v-if="step.done" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span v-else>{{ step.n }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>

      <!-- ══ Phase content ══ -->
      <div class="game-body">

        <!-- ── SITUATION: loading / show hand ── -->
        <div v-if="phase === 'situation'" class="phase-content">
          <div class="info-banner info-loading">
            <div class="loading-spin">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2.5" stroke-linecap="round" style="animation:spin .7s linear infinite">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <span>Генерируется ситуация...</span>
          </div>

          <div class="section-label">
            <PixelIcon name="music" :size="15" color="var(--c-primary)" />
            Твои карты в этом раунде:
          </div>
          <div class="hand-grid">
            <div v-for="s in myHand" :key="s.id" class="sound-card sound-preview">
              <div class="card-name">{{ s.name }}</div>
              <button class="preview-btn"
                      :class="{ playing: previewingId === s.id && previewPlaying }"
                      @click.stop="togglePreview(s)">
                <PixelIcon :name="previewingId === s.id && previewPlaying ? 'pause' : 'speaker'" :size="13"
                           :color="previewingId === s.id && previewPlaying ? 'var(--c-primary)' : 'currentColor'" />
                {{ previewingId === s.id && previewPlaying ? 'Пауза' : previewingId === s.id ? 'Продолжить' : 'Слушать' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── CHOOSING ── -->
        <div v-else-if="phase === 'choosing'" class="phase-content">
          <div class="situation-panel">
            <div class="sit-label">Ситуация</div>
            <div class="sit-text">{{ currentSituation?.text }}</div>
          </div>

          <div v-if="!submitted">
            <div class="section-label">
              <PixelIcon name="music" :size="15" color="var(--c-primary)" />
              Выбери реакцию:
            </div>
            <div class="hand-grid">
              <div v-for="s in myHand" :key="s.id"
                   class="sound-card"
                   :class="{ 'card-selected': selectedSoundId === s.id }"
                   @click="highlightSound(s.id)">
                <div class="card-name">{{ s.name }}</div>
                <div class="card-foot">
                  <button class="preview-btn"
                          :class="{ playing: previewingId === s.id && previewPlaying }"
                          @click.stop="togglePreview(s)">
                    <PixelIcon :name="previewingId === s.id && previewPlaying ? 'pause' : 'speaker'" :size="13" />
                    {{ previewingId === s.id && previewPlaying ? 'Пауза' : '▶' }}
                  </button>
                  <span v-if="selectedSoundId === s.id" class="chosen-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Выбрано
                  </span>
                </div>
              </div>
            </div>

            <div class="confirm-row">
              <button class="btn btn-primary confirm-btn"
                      :disabled="!selectedSoundId"
                      @click="submitSound">
                <PixelIcon name="check" :size="15" color="white" /> Подтвердить выбор
              </button>
            </div>
          </div>

          <div v-else class="ok-banner">
            <div class="ok-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div>
              <div class="ok-title">Ответ отправлен!</div>
              <div class="ok-sub">Ждём остальных игроков...</div>
            </div>
          </div>

          <div class="progress-row">
            <span class="progress-label">Ответили: <strong>{{ submitCount }}</strong> из <strong>{{ totalPlayers }}</strong></span>
            <div class="mini-progress">
              <div class="mini-fill" :style="{ width: totalPlayers > 0 ? (submitCount / totalPlayers * 100) + '%' : '0%' }" />
            </div>
          </div>
        </div>

        <!-- ── PLAYBACK ── -->
        <div v-else-if="phase === 'playback'" class="phase-content">
          <div class="situation-panel situation-sm">
            <div class="sit-label">Ситуация</div>
            <div class="sit-text">{{ currentSituation?.text }}</div>
          </div>

          <div v-if="ttsPlaying" class="info-banner info-blue">
            <PixelIcon name="speaker" :size="20" color="var(--c-primary)" />
            <span>Озвучивается ситуация...</span>
          </div>

          <div v-else-if="isHost && !playbackStarted" class="start-area">
            <button class="btn btn-primary start-pb-btn" @click="startPlayback">
              <PixelIcon name="rocket" :size="16" color="white" /> Начать воспроизведение
            </button>
          </div>

          <template v-else-if="activePlaybackIndex >= 0">
            <!-- Now playing card -->
            <div class="now-playing" :class="{ 'np-live': isPlaying }">
              <div class="np-header">
                <div class="np-status-dot" :class="{ 'dot-live': isPlaying, 'dot-done': !isPlaying }" />
                <span class="np-status-text">{{ isPlaying ? 'Играет' : 'Готово' }}</span>
              </div>
              <div class="np-player">{{ currentPlayingItem?.playerNick }}</div>
              <div class="np-sound">{{ currentPlayingItem?.sound?.name }}</div>
              <div v-if="isPlaying" class="equalizer">
                <div v-for="i in 8" :key="i" class="eq-bar"
                     :style="{ animationDelay: (i * .07) + 's', animationDuration: (.4 + i * .04) + 's' }" />
              </div>
            </div>

            <!-- Host controls -->
            <div v-if="isHost && !isPlaying" class="host-controls">
              <button class="btn btn-ghost" @click="replayCurrentSound">
                <PixelIcon name="speaker" :size="14" color="var(--c-text-muted)" /> Переслушать
              </button>
              <button v-if="hasNextPlayer" class="btn btn-primary flex-1" @click="nextPlayer">
                Следующий →
              </button>
              <button v-else class="btn btn-success flex-1" @click="startVoting">
                <PixelIcon name="star" :size="14" color="white" /> Начать голосование
              </button>
            </div>
            <div v-else-if="!isHost" class="streamer-hint">
              <PixelIcon name="monitor" :size="14" color="var(--c-text-light)" /> Стример управляет воспроизведением
            </div>

            <!-- Mini player cards -->
            <div class="section-label">
              <PixelIcon name="people" :size="15" color="var(--c-primary)" /> Все участники:
            </div>
            <div class="mini-grid">
              <div v-for="(item, idx) in orderedSounds" :key="idx"
                   class="mini-card"
                   :class="{
                     'mc-active': idx === activePlaybackIndex,
                     'mc-done':   idx < activePlaybackIndex,
                     'mc-wait':   idx > activePlaybackIndex
                   }">
                <div class="mc-indicator">
                  <svg v-if="idx < activePlaybackIndex" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  <div v-else-if="idx === activePlaybackIndex" class="mc-dot-live" />
                  <span v-else class="mc-num">{{ idx + 1 }}</span>
                </div>
                <div class="mc-nick">{{ item.playerNick }}</div>
                <div class="mc-snd">{{ item.sound?.name || '???' }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- ── VOTING ── -->
        <div v-else-if="phase === 'voting'" class="phase-content">
          <div class="situation-panel situation-sm">
            <div class="sit-label">Ситуация</div>
            <div class="sit-text">{{ currentSituation?.text }}</div>
          </div>

          <div v-if="!voted">
            <div class="section-label">
              <PixelIcon name="star" :size="15" color="var(--c-primary)" /> Выбери лучший звук:
            </div>
            <div class="vote-list">
              <div v-for="(item, idx) in orderedSounds" :key="idx"
                   class="vote-row"
                   :class="{
                     'vote-mine':     isMySound(item),
                     'vote-selected': selectedVoteIndex === idx && !isMySound(item)
                   }"
                   @click="!isMySound(item) && selectVote(idx)">
                <span class="vote-num">{{ idx + 1 }}</span>
                <span class="vote-name">{{ item.sound?.name || '???' }}</span>
                <span v-if="isMySound(item)" class="vote-mine-tag">мой звук</span>
                <button v-else class="vote-pick-btn"
                        :class="{ 'pick-active': selectedVoteIndex === idx }"
                        @click.stop="selectVote(idx)">
                  {{ selectedVoteIndex === idx ? '✓ Выбран' : 'Выбрать' }}
                </button>
              </div>
            </div>
            <div class="confirm-row">
              <button class="btn btn-primary confirm-btn"
                      :disabled="selectedVoteIndex === null"
                      @click="castVote">
                <PixelIcon name="check" :size="15" color="white" /> Подтвердить голос
              </button>
            </div>
          </div>

          <div v-else class="ok-banner">
            <div class="ok-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div>
              <div class="ok-title">Голос принят!</div>
              <div class="ok-sub">Проголосовало: {{ voteCount }} / {{ totalPlayers }}</div>
            </div>
          </div>
        </div>

        <!-- ── RESULTS ── -->
        <div v-else-if="phase === 'results'" class="phase-content">
          <div class="results-header">
            <PixelIcon name="crown" :size="32" :color="roundResult?.winnerId ? '#f59e0b' : 'var(--c-text-light)'" />
            <span class="results-title">Раунд завершён!</span>
          </div>

          <div v-if="roundResult?.winnerId" class="winner-card">
            <div class="winner-label">Победитель раунда</div>
            <div class="winner-name">{{ roundResult.winnerNick }}</div>
            <div class="winner-sound">
              <PixelIcon name="speaker" :size="13" color="var(--c-warning)" />
              {{ roundResult.sound?.name }}
            </div>
          </div>
          <div v-else class="no-winner">Ничья — победителя нет.</div>

          <div class="section-label">
            <PixelIcon name="star" :size="15" color="var(--c-primary)" /> Счёт:
          </div>
          <div class="scores-list">
            <div v-for="(p, i) in sortedScores" :key="p.socketId"
                 class="score-row"
                 :class="{ 'sr-winner': p.socketId === roundResult?.winnerId }">
              <span class="sr-pos">{{ i + 1 }}</span>
              <span class="sr-nick">{{ p.nickname }}</span>
              <span class="sr-stars">
                <svg v-for="n in settings_pts" :key="n" width="16" height="16" viewBox="0 0 24 24"
                     :fill="n <= p.score ? '#f59e0b' : 'none'" stroke="#f59e0b" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" style="display:inline-block">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="round-actions">
            <button v-if="isHost" class="btn btn-primary action-btn" @click="requestNextRound">
              <PixelIcon name="rocket" :size="15" color="white" /> Следующий раунд
            </button>
            <div v-else class="wait-hint">
              <div style="animation:spin .8s linear infinite;display:flex">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </div>
              Ждём хоста...
            </div>
          </div>
        </div>

        <!-- ── GAMEOVER ── -->
        <div v-else-if="phase === 'gameover'" class="phase-content">
          <div class="gameover-header">
            <div class="trophy-wrap">
              <PixelIcon name="crown" :size="44" color="#f59e0b" />
            </div>
            <div class="gameover-title">Игра завершена!</div>
          </div>

          <div class="winner-card winner-final">
            <div class="winner-label">Чемпион</div>
            <div class="winner-name">{{ gameOver?.winnerNick }}</div>
          </div>

          <div class="section-label">
            <PixelIcon name="star" :size="15" color="var(--c-primary)" /> Итоговый счёт:
          </div>
          <div class="scores-list">
            <div v-for="(p, i) in sortedGameOver" :key="p.socketId"
                 class="score-row"
                 :class="{ 'sr-winner': p.socketId === gameOver?.winnerId }">
              <span class="sr-pos">{{ i + 1 }}</span>
              <span class="sr-nick">{{ p.nickname }}</span>
              <span class="sr-stars">
                <svg v-for="n in settings_pts" :key="n" width="16" height="16" viewBox="0 0 24 24"
                     :fill="n <= p.score ? '#f59e0b' : 'none'" stroke="#f59e0b" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round" style="display:inline-block">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="round-actions">
            <button v-if="isHost" class="btn btn-primary action-btn" @click="restartGame">
              <PixelIcon name="gamepad" :size="15" color="white" /> Сыграть снова
            </button>
            <div v-else class="wait-hint">
              <div style="animation:spin .8s linear infinite;display:flex">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </div>
              Ждём хоста...
            </div>
          </div>
        </div>

      </div><!-- /game-body -->

      <!-- ══ Players status bar ══ -->
      <div class="game-statusbar">
        <div v-for="p in players" :key="p.socketId"
             class="sb-chip"
             :class="{ 'sb-me': p.socketId === mySocketId }">
          <PixelIcon v-if="p.socketId === hostSocketId" name="crown" :size="10" color="#d97706" />
          <span class="sb-nick">{{ p.nickname }}</span>
          <span class="sb-score">{{ p.score }}★</span>
          <svg v-if="phase === 'choosing' && submittedSocketIds.includes(p.socketId)"
               width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="3" stroke-linecap="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
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

const previewingId      = ref(null)
const previewPlaying    = ref(false)
let   _previewAudio     = null

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

const isHost = computed(() => mySocketId.value && mySocketId.value === hostSocketId.value)
const currentPlayingItem = computed(() =>
  activePlaybackIndex.value >= 0 ? orderedSounds.value[activePlaybackIndex.value] || null : null
)
const hasNextPlayer = computed(() => activePlaybackIndex.value < orderedSounds.value.length - 1)
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
  const order = ['situation','choosing','playback','voting','results','gameover']
  const cur   = order.indexOf(p)
  return [
    { n:1, key:'choose',   label:'Выбор',        phases:['situation','choosing'] },
    { n:2, key:'playback', label:'Прослушивание', phases:['playback'] },
    { n:3, key:'vote',     label:'Голосование',  phases:['voting'] },
    { n:4, key:'results',  label:'Итоги',        phases:['results','gameover'] },
  ].map(s => {
    const sIdx = order.indexOf(s.phases[0])
    return { ...s, active: s.phases.includes(p), done: sIdx < cur && !s.phases.includes(p) }
  })
})

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
  if (_previewAudio) { _previewAudio.pause(); _previewAudio.onended = null; _previewAudio = null }
  previewingId.value   = null
  previewPlaying.value = false
}
function togglePreview(sound) {
  if (!sound?.file) return
  if (previewingId.value === sound.id) {
    if (previewPlaying.value) { _previewAudio.pause(); previewPlaying.value = false }
    else { _previewAudio.play().catch(() => {}); previewPlaying.value = true }
    return
  }
  stopPreview()
  const audio = new Audio(sound.file)
  _previewAudio = audio
  previewingId.value   = sound.id
  previewPlaying.value = true
  audio.onended = () => stopPreview()
  audio.onerror = () => stopPreview()
  audio.play().catch(() => stopPreview())
}

async function startPlayback() {
  playbackStarted.value = true
  playbackAborted = false
  socket.emit('playback_advance', { lobbyId: lobbyId.value, index: -1 })
  ttsPlaying.value = true
  if (currentSituation.value?.audioFile) await playAudio(currentSituation.value.audioFile)
  else if (currentSituation.value?.text) await speakText(currentSituation.value.text)
  ttsPlaying.value = false
  if (playbackAborted) return
  await playPlayerAt(0)
}
async function playPlayerAt(index) {
  if (playbackAborted) return
  activePlaybackIndex.value = index
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
async function nextPlayer() { await playPlayerAt(activePlaybackIndex.value + 1) }

function highlightSound(soundId) { if (submitted.value) return; selectedSoundId.value = soundId }
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
function selectVote(idx) { if (voted.value) return; selectedVoteIndex.value = idx }
function castVote() {
  if (selectedVoteIndex.value === null || voted.value) return
  voted.value = true
  socket.emit('cast_vote', { lobbyId: lobbyId.value, shuffleIndex: selectedVoteIndex.value })
}
function startVoting()     { socket.emit('request_voting', { lobbyId: lobbyId.value }) }
function requestNextRound() { socket.emit('next_round', { lobbyId: lobbyId.value }) }
function restartGame()      { socket.emit('restart_game', { lobbyId: lobbyId.value }) }
function confirmLeave() {
  showConfirm.value = false
  playbackAborted = true
  stopPreview()
  cancelSpeech()
  socket.emit('leave_lobby', { lobbyId: lobbyId.value })
  router.push('/')
}
function showError(msg) { errorMsg.value = msg; setTimeout(() => { errorMsg.value = '' }, 4000) }
function resetRound() {
  stopPreview()
  submitted.value = false; selectedSoundId.value = null; submittedSoundId.value = null
  submitCount.value = 0; submittedSocketIds.value = []
  voted.value = false; selectedVoteIndex.value = null; voteCount.value = 0
  orderedSounds.value = []; activePlaybackIndex.value = -1
  playbackStarted.value = false; isPlaying.value = false; playbackAborted = false
  roundResult.value = null; ttsPlaying.value = false
}

onMounted(() => {
  mySocketId.value = socket.id

  socket.on('game_started', ({ situation, hand, phase: ph }) => {
    phase.value = ph || 'situation'; currentSituation.value = situation
    myHand.value = hand || []; gameState.situation = situation; gameState.hand = hand || []
    resetRound()
  })
  socket.on('situation_revealed', ({ situation }) => {
    phase.value = 'choosing'; currentSituation.value = situation
  })
  socket.on('player_submitted', ({ count, total, socketId }) => {
    submitCount.value = count; totalPlayers.value = total
    if (socketId && !submittedSocketIds.value.includes(socketId))
      submittedSocketIds.value = [...submittedSocketIds.value, socketId]
  })
  socket.on('playback_start', ({ orderedSounds: os, situation }) => {
    phase.value = 'playback'; orderedSounds.value = os || []
    if (situation) currentSituation.value = situation
    playbackStarted.value = false; isPlaying.value = false
    ttsPlaying.value = false; playbackAborted = false
    activePlaybackIndex.value = isHost.value ? -1 : 0
  })
  socket.on('playback_advance', ({ index }) => {
    if (isHost.value) return
    if (index === -1) {
      ttsPlaying.value = true
      const sit = currentSituation.value
      const doTTS = async () => {
        if (sit?.audioFile) await playAudio(sit.audioFile)
        else if (sit?.text) await speakText(sit.text)
        if (!playbackAborted) ttsPlaying.value = false
      }
      doTTS(); return
    }
    ttsPlaying.value = false; activePlaybackIndex.value = index
    const item = orderedSounds.value[index]
    if (!item?.sound?.file) return
    isPlaying.value = true
    playAudio(item.sound.file).then(() => { if (!playbackAborted) isPlaying.value = false })
  })
  socket.on('voting_start', ({ shuffledSounds, situation }) => {
    phase.value = 'voting'; orderedSounds.value = shuffledSounds || []
    if (situation) currentSituation.value = situation
    voted.value = false; selectedVoteIndex.value = null; voteCount.value = 0
  })
  socket.on('vote_cast', ({ count, total }) => { voteCount.value = count; totalPlayers.value = total })
  socket.on('round_result', (data) => {
    phase.value = 'results'; roundResult.value = data
    players.value = (data.scores || []).map(s => ({ ...s }))
    playbackAborted = true; isPlaying.value = false
  })
  socket.on('game_over', (data) => {
    phase.value = 'gameover'; gameOver.value = data
    players.value = (data.scores || []).map(s => ({ ...s }))
  })
  socket.on('lobby_updated', ({ players: p, settings: s, hostSocketId: h }) => {
    players.value = p || []; hostSocketId.value = h; totalPlayers.value = (p || []).length
    if (s?.pointsToWin) settings_pts.value = s.pointsToWin
  })
  socket.on('game_restarted', ({ players: p, hostSocketId: h }) => {
    players.value = p || []; hostSocketId.value = h
    router.push(`/lobby/${lobbyId.value}`)
  })
  socket.on('player_kicked', ({ socketId }) => { if (socketId === socket.id) router.push('/') })
  socket.on('lobby_closed', () => router.push('/'))
  socket.on('error', ({ message }) => showError(message))

  const base = import.meta.env.VITE_SERVER_URL || ''
  fetch(`${base}/api/lobby/${lobbyId.value}`)
    .then(r => r.ok ? r.json() : null)
    .then(lobby => {
      if (!lobby) return router.push('/')
      players.value = lobby.players || []; hostSocketId.value = lobby.hostSocketId
      mySocketId.value = socket.id; totalPlayers.value = (lobby.players || []).length
      settings_pts.value = lobby.settings?.pointsToWin || 3
      if (lobby.phase === 'waiting') router.push(`/lobby/${lobbyId.value}`)
      if (myHand.value.length === 0 && lobby.phase !== 'waiting') router.push(`/lobby/${lobbyId.value}`)
    }).catch(() => {})
})

onUnmounted(() => {
  playbackAborted = true; cancelSpeech()
  ;['game_started','situation_revealed','player_submitted','playback_start','playback_advance',
    'voting_start','vote_cast','round_result','game_over','lobby_updated',
    'game_restarted','player_kicked','lobby_closed','error'].forEach(e => socket.off(e))
})
</script>

<style scoped>
@keyframes spin       { to { transform: rotate(360deg); } }
@keyframes eqBounce   { from { height: 4px; } to { height: 28px; } }

/* ── Layout ── */
.game-wrap {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 8px 12px; z-index: 5;
}
.game-card {
  width: 100%; max-width: 700px;
  height: 100%;
  background: var(--c-surface);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-border);
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: fadeScaleIn .25s ease both;
}

/* ── Header ── */
.game-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; background: var(--c-surface-2); flex-shrink: 0;
}
.game-header-left { display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden; }
.game-title-icon {
  width: 30px; height: 30px; border-radius: var(--r-sm);
  background: var(--c-primary-light);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.game-title { font-size: 14px; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.host-chip {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--c-warning-bg); color: var(--c-warning);
  border: 1px solid #fed7aa; border-radius: var(--r-full);
  padding: 2px 8px; font-size: 11px; font-weight: 600; flex-shrink: 0;
}
.error-chip {
  font-size: 11px; color: var(--c-danger); background: var(--c-danger-bg);
  border-radius: var(--r-full); padding: 2px 8px; flex-shrink: 0;
}
.close-btn {
  width: 28px; height: 28px; border-radius: var(--r-full);
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-muted); transition: all .12s;
}
.close-btn:hover { background: var(--c-danger-bg); color: var(--c-danger); }

/* ── Phase bar ── */
.phase-bar {
  display: flex; background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  padding: 0 12px; gap: 0; flex-shrink: 0;
}
.phase-step {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; font-size: 12px; font-weight: 500;
  color: var(--c-text-light); border-bottom: 2px solid transparent;
  transition: all .15s; user-select: none;
}
.step-active { color: var(--c-primary); border-bottom-color: var(--c-primary); }
.step-done   { color: var(--c-success); }
.step-bubble {
  width: 18px; height: 18px; border-radius: var(--r-full);
  background: var(--c-surface-2); border: 1.5px solid var(--c-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
  transition: all .15s;
}
.step-active .step-bubble { background: var(--c-primary); border-color: var(--c-primary); color: white; }
.step-done   .step-bubble { background: var(--c-success); border-color: var(--c-success); color: white; }

/* ── Body ── */
.game-body { flex: 1; min-height: 0; overflow-y: auto; background: var(--c-surface); }
.phase-content { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }

/* ── Status bar ── */
.game-statusbar {
  display: flex; flex-wrap: wrap; gap: 6px;
  background: var(--c-surface-2); border-top: 1px solid var(--c-border);
  padding: 8px 12px; flex-shrink: 0;
}
.sb-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-full); padding: 3px 10px;
  font-size: 12px; transition: all .1s;
}
.sb-me { background: var(--c-primary-light); border-color: var(--c-primary-mid); }
.sb-nick { font-weight: 500; color: var(--c-text); }
.sb-score { font-weight: 700; color: var(--c-warning); margin-left: 2px; }

/* ── Info banners ── */
.info-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: var(--r);
  font-size: 15px; font-weight: 500;
}
.info-loading { background: var(--c-primary-light); color: var(--c-primary); border: 1px solid var(--c-primary-mid); }
.info-blue    { background: var(--c-primary-light); color: var(--c-primary); border: 1px solid var(--c-primary-mid); }
.loading-spin { animation: spin .7s linear infinite; display: flex; }

/* ── Section label ── */
.section-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600;
  color: var(--c-text-muted); text-transform: uppercase; letter-spacing: .04em;
  margin-top: 2px;
}

/* ── Situation panel ── */
.situation-panel {
  background: linear-gradient(135deg, var(--c-primary-light), #faf5ff);
  border: 1px solid var(--c-primary-mid);
  border-radius: var(--r); padding: 14px 16px;
}
.situation-sm { padding: 10px 14px; }
.sit-label { font-size: 11px; font-weight: 600; color: var(--c-primary); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
.sit-text  { font-size: 16px; font-weight: 600; color: var(--c-text); line-height: 1.4; }

/* ── Hand cards ── */
.hand-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.sound-card {
  background: var(--c-surface); border: 1.5px solid var(--c-border);
  border-radius: var(--r); padding: 12px 14px;
  min-width: 140px; flex: 1; max-width: 220px;
  display: flex; flex-direction: column; gap: 10px;
  cursor: pointer; transition: all .15s;
}
.sound-card:hover:not(.sound-preview) {
  border-color: var(--c-primary-mid); background: var(--c-primary-light);
  box-shadow: 0 2px 8px rgba(99,102,241,.12); transform: translateY(-1px);
}
.sound-card:active:not(.sound-preview) { transform: translateY(0); }
.card-selected {
  border-color: var(--c-primary); background: var(--c-primary-light);
  box-shadow: 0 0 0 3px rgba(99,102,241,.15);
}
.sound-preview { cursor: default; opacity: .85; border-style: dashed; }
.card-name { font-size: 14px; font-weight: 600; color: var(--c-text); }
.card-foot { display: flex; align-items: center; gap: 8px; }
.chosen-tag { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--c-success); }

.preview-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: var(--r-full);
  border: 1px solid var(--c-border); background: var(--c-surface);
  font-size: 12px; font-weight: 500; cursor: pointer; color: var(--c-text-muted);
  transition: all .12s;
}
.preview-btn:hover { background: var(--c-primary-light); border-color: var(--c-primary-mid); color: var(--c-primary); }
.preview-btn.playing { background: var(--c-primary-light); border-color: var(--c-primary); color: var(--c-primary); }

/* ── Confirm row ── */
.confirm-row { display: flex; margin-top: 4px; }
.confirm-btn { font-size: 15px; font-weight: 600; padding: 11px 24px; }

/* ── OK banner ── */
.ok-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: var(--c-success-bg);
  border: 1px solid #a7f3d0; border-radius: var(--r);
}
.ok-icon {
  width: 40px; height: 40px; background: #d1fae5; border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ok-title { font-size: 15px; font-weight: 600; color: var(--c-success); }
.ok-sub   { font-size: 13px; color: #059669; margin-top: 2px; }

/* ── Progress row ── */
.progress-row { display: flex; align-items: center; gap: 12px; }
.progress-label { font-size: 13px; color: var(--c-text-muted); white-space: nowrap; flex-shrink: 0; }
.mini-progress { flex: 1; height: 6px; background: var(--c-primary-light); border-radius: var(--r-full); overflow: hidden; }
.mini-fill { height: 100%; background: linear-gradient(90deg, var(--c-primary), var(--c-violet)); border-radius: var(--r-full); transition: width .3s; }

/* ── Now playing ── */
.now-playing {
  background: var(--c-surface); border: 1.5px solid var(--c-border);
  border-radius: var(--r); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 6px; transition: all .2s;
}
.np-live { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
.np-header { display: flex; align-items: center; gap: 8px; }
.np-status-dot {
  width: 8px; height: 8px; border-radius: var(--r-full); flex-shrink: 0;
}
.dot-live { background: var(--c-primary); animation: pulse 1s ease-in-out infinite; }
.dot-done { background: var(--c-success); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.np-status-text { font-size: 11px; font-weight: 600; color: var(--c-text-muted); text-transform: uppercase; letter-spacing: .05em; }
.np-player { font-size: 22px; font-weight: 800; color: var(--c-primary); }
.np-sound  { font-size: 15px; color: var(--c-text-2); }
.equalizer { display: flex; align-items: flex-end; gap: 3px; height: 28px; margin-top: 8px; }
.eq-bar {
  width: 5px; background: linear-gradient(to top, var(--c-primary), var(--c-violet));
  border-radius: 3px 3px 0 0;
  animation: eqBounce .45s ease-in-out infinite alternate;
}

/* ── Host controls ── */
.host-controls { display: flex; gap: 8px; }
.flex-1 { flex: 1; }
.streamer-hint {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--c-text-light); padding: 4px 0;
}

/* ── Start area ── */
.start-area { display: flex; justify-content: center; padding: 16px 0; }
.start-pb-btn { font-size: 15px; font-weight: 600; padding: 12px 32px; }

/* ── Mini cards ── */
.mini-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.mini-card {
  background: var(--c-surface-2); border: 1px solid var(--c-border);
  border-radius: var(--r-sm); padding: 8px 10px;
  min-width: 120px; flex: 1; max-width: 180px;
  display: flex; flex-direction: column; gap: 3px; opacity: .5; transition: all .2s;
}
.mc-active { opacity: 1; border-color: var(--c-primary); background: var(--c-primary-light); box-shadow: 0 0 0 2px rgba(99,102,241,.12); }
.mc-done   { opacity: .8; }
.mc-indicator { display: flex; align-items: center; height: 14px; }
.mc-dot-live { width: 8px; height: 8px; border-radius: var(--r-full); background: var(--c-primary); animation: pulse 1s ease-in-out infinite; }
.mc-num  { font-size: 10px; color: var(--c-text-light); font-weight: 700; }
.mc-nick { font-size: 13px; font-weight: 600; color: var(--c-text); }
.mc-snd  { font-size: 11px; color: var(--c-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Voting ── */
.vote-list { display: flex; flex-direction: column; gap: 6px; }
.vote-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: var(--c-surface);
  border: 1.5px solid var(--c-border); border-radius: var(--r);
  cursor: pointer; transition: all .12s;
}
.vote-row:not(.vote-mine):hover { border-color: var(--c-primary-mid); background: var(--c-primary-light); }
.vote-selected { border-color: var(--c-primary); background: var(--c-primary-light); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
.vote-mine { opacity: .5; cursor: default; }
.vote-num  { font-size: 13px; font-weight: 700; color: var(--c-text-light); min-width: 22px; }
.vote-name { flex: 1; font-size: 15px; font-weight: 600; color: var(--c-text); }
.vote-mine-tag { font-size: 11px; color: var(--c-text-muted); font-style: italic; }
.vote-pick-btn {
  padding: 5px 14px; border-radius: var(--r-full);
  border: 1.5px solid var(--c-border); background: var(--c-surface);
  font-size: 12px; font-weight: 600; cursor: pointer; color: var(--c-text-muted);
  transition: all .12s; white-space: nowrap;
}
.vote-pick-btn:hover { border-color: var(--c-primary); color: var(--c-primary); background: var(--c-primary-light); }
.pick-active { border-color: var(--c-primary); color: var(--c-primary); background: var(--c-primary-light); }

/* ── Results ── */
.results-header { display: flex; align-items: center; gap: 12px; }
.results-title  { font-size: 22px; font-weight: 800; color: var(--c-text); }

.winner-card {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a; border-radius: var(--r); padding: 16px 20px;
  display: flex; flex-direction: column; gap: 4px;
}
.winner-final { padding: 20px 24px; }
.winner-label { font-size: 11px; font-weight: 600; color: var(--c-warning); text-transform: uppercase; letter-spacing: .05em; }
.winner-name  { font-size: 26px; font-weight: 800; color: #92400e; }
.winner-sound { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--c-warning); margin-top: 2px; }
.no-winner    { font-size: 14px; color: var(--c-text-muted); padding: 10px 0; }

.scores-list { display: flex; flex-direction: column; gap: 4px; }
.score-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; background: var(--c-surface);
  border: 1px solid var(--c-border); border-radius: var(--r-sm); font-size: 14px;
}
.sr-winner { background: #fffbeb; border-color: #fde68a; }
.sr-pos    { font-weight: 700; color: var(--c-text-light); min-width: 20px; }
.sr-nick   { flex: 1; font-weight: 600; color: var(--c-text); }
.sr-stars  { display: flex; gap: 1px; }

/* ── Gameover ── */
.gameover-header {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 12px 0;
}
.trophy-wrap {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 2px solid #fde68a; border-radius: var(--r-full);
  display: flex; align-items: center; justify-content: center;
}
.gameover-title { font-size: 26px; font-weight: 800; color: var(--c-text); }

/* ── Actions ── */
.round-actions { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.action-btn { font-size: 15px; font-weight: 600; padding: 12px 28px; }
.wait-hint { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--c-text-muted); }

/* ── Confirm dialog ── */
.overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(4px);
}
.dlg-box {
  background: var(--c-surface); border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg); border: 1px solid var(--c-border);
  padding: 28px; width: 340px; max-width: calc(100vw - 32px);
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  animation: fadeScaleIn .18s ease both; text-align: center;
}
.dlg-icon-wrap {
  width: 52px; height: 52px; background: var(--c-warning-bg);
  border-radius: var(--r-full); display: flex; align-items: center; justify-content: center;
}
.dlg-msg { font-size: 15px; color: var(--c-text); line-height: 1.5; }
.dlg-btns { display: flex; gap: 10px; width: 100%; }
.dlg-btns .btn { flex: 1; }

@media (max-width: 640px) {
  .game-wrap { padding: 4px; }
  .phase-step { padding: 6px 8px; font-size: 11px; }
  .phase-bar  { flex-wrap: wrap; }
  .sit-text   { font-size: 14px; }
  .hand-grid  { gap: 6px; }
  .sound-card { min-width: 120px; }
  .np-player  { font-size: 18px; }
  .mini-card  { min-width: 100px; }
}
</style>
