<template>
  <div class="admin-wrap">

    <!-- ── Login ── -->
    <div v-if="!token" class="win-window login-box">
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <span class="win-title-icon"><PixelIcon name="lock" :size="14" /></span>
          <span class="win-title-text">KeyMeme — Администрирование</span>
        </div>
      </div>
      <div class="win-body" style="display:flex;flex-direction:column;gap:10px;">
        <label class="win-label">Логин</label>
        <input class="win-input" v-model="form.login" autocomplete="username" />
        <label class="win-label">Пароль</label>
        <input class="win-input" type="password" v-model="form.password"
               autocomplete="current-password" @keydown.enter="doLogin" />
        <p v-if="loginError" class="error-msg">{{ loginError }}</p>
        <button class="xp-btn xp-btn-lg" :disabled="loading" @click="doLogin">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </div>
    </div>

    <!-- ── Panel ── -->
    <div v-else class="win-window panel-box">
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <span class="win-title-icon"><PixelIcon name="gear" :size="14" /></span>
          <span class="win-title-text">Панель администратора — KeyMeme</span>
        </div>
        <div class="win-title-btns">
          <button class="win-ctrl win-ctrl-close" @click="token = null">✕</button>
        </div>
      </div>
      <div class="win-body panel-body">

        <!-- Tabs -->
        <div class="tab-bar">
          <button :class="['tab-btn', {active: tab==='sounds'}]"     @click="tab='sounds'"><PixelIcon name="speaker" :size="12" /> Звуки ({{ sounds.length }})</button>
          <button :class="['tab-btn', {active: tab==='situations'}]" @click="tab='situations'"><PixelIcon name="clipboard" :size="12" /> Ситуации ({{ situations.length }})</button>
        </div>

        <!-- ── Sounds tab ── -->
        <div v-if="tab==='sounds'" class="tab-content">
          <div class="upload-row">
            <input class="win-input" v-model="newSound.name" placeholder="Название звука" style="flex:1;min-width:0" />
            <label class="file-label">
              {{ soundFile ? soundFile.name : 'Выбрать MP3…' }}
              <input type="file" accept="audio/*" style="display:none" @change="e => soundFile = e.target.files[0]" />
            </label>
            <button class="xp-btn" :disabled="uploading" @click="uploadSound">
              {{ uploading ? '…' : 'Добавить' }}
            </button>
          </div>
          <p v-if="uploadError" class="error-msg">{{ uploadError }}</p>

          <div class="xp-listbox list-scroll">
            <div v-for="s in sounds" :key="s.id" class="xp-list-row">
              <span class="row-id tc-dim">{{ s.id }}</span>
              <span class="row-name">{{ s.name }}</span>
              <span class="row-file tc-dim">{{ s.file }}</span>
              <button class="del-btn" @click="deleteSound(s.id)">✕</button>
            </div>
          </div>
        </div>

        <!-- ── Situations tab ── -->
        <div v-if="tab==='situations'" class="tab-content">
          <div class="upload-row">
            <input class="win-input" v-model="newSit.text" placeholder="Текст ситуации" style="flex:2;min-width:0" />
            <label class="file-label">
              {{ sitFile ? sitFile.name : 'MP3 озвучки *' }}
              <input type="file" accept="audio/*" style="display:none" @change="e => sitFile = e.target.files[0]" />
            </label>
            <button class="xp-btn" :disabled="uploading" @click="uploadSituation">
              {{ uploading ? '…' : 'Добавить' }}
            </button>
          </div>
          <p v-if="uploadError" class="error-msg">{{ uploadError }}</p>

          <div class="xp-listbox list-scroll">
            <div v-for="s in situations" :key="s.id" class="xp-list-row">
              <span class="row-id tc-dim">{{ s.id }}</span>
              <span class="row-name">{{ s.text }}</span>
              <span v-if="s.audioFile" class="tc-ok" title="Есть MP3"><PixelIcon name="speaker" :size="12" /></span>
              <button class="del-btn" @click="deleteSituation(s.id)">✕</button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import PixelIcon from '../components/PixelIcon.vue'

const token      = ref(localStorage.getItem('admin_token') || '')
const form       = ref({ login: '', password: '' })
const loginError = ref('')
const loading    = ref(false)

const tab        = ref('sounds')
const sounds     = ref([])
const situations = ref([])

const newSound   = ref({ name: '' })
const soundFile  = ref(null)
const newSit     = ref({ text: '' })
const sitFile    = ref(null)
const uploading  = ref(false)
const uploadError = ref('')

function authHeaders() {
  return { Authorization: `Bearer ${token.value}` }
}

async function doLogin() {
  if (!form.value.login || !form.value.password) return
  loading.value = true
  loginError.value = ''
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    if (!res.ok) { loginError.value = data.error; return }
    token.value = data.token
    localStorage.setItem('admin_token', data.token)
    loadData()
  } catch {
    loginError.value = 'Ошибка соединения'
  } finally {
    loading.value = false
  }
}

async function loadData() {
  await Promise.all([loadSounds(), loadSituations()])
}

async function loadSounds() {
  const res = await fetch('/api/admin/sounds', { headers: authHeaders() })
  if (res.status === 401) { token.value = ''; return }
  sounds.value = await res.json()
}

async function loadSituations() {
  const res = await fetch('/api/admin/situations', { headers: authHeaders() })
  if (res.status === 401) { token.value = ''; return }
  situations.value = await res.json()
}

async function uploadSound() {
  if (!newSound.value.name || !soundFile.value) {
    uploadError.value = 'Укажи название и выбери файл'
    return
  }
  uploading.value = true
  uploadError.value = ''
  const fd = new FormData()
  fd.append('name', newSound.value.name)
  fd.append('file', soundFile.value)
  const res = await fetch('/api/admin/sounds', { method: 'POST', headers: authHeaders(), body: fd })
  uploading.value = false
  if (!res.ok) { uploadError.value = (await res.json()).error; return }
  newSound.value.name = ''
  soundFile.value = null
  await loadSounds()
}

async function deleteSound(id) {
  if (!confirm('Удалить звук?')) return
  await fetch(`/api/admin/sounds/${id}`, { method: 'DELETE', headers: authHeaders() })
  await loadSounds()
}

async function uploadSituation() {
  if (!newSit.value.text) { uploadError.value = 'Укажи текст ситуации'; return }
  if (!sitFile.value) { uploadError.value = 'Прикрепи MP3 с озвучкой'; return }
  uploading.value = true
  uploadError.value = ''
  const fd = new FormData()
  fd.append('text', newSit.value.text)
  fd.append('audioFile', sitFile.value)
  const res = await fetch('/api/admin/situations', { method: 'POST', headers: authHeaders(), body: fd })
  uploading.value = false
  if (!res.ok) { uploadError.value = (await res.json()).error; return }
  newSit.value.text = ''
  sitFile.value = null
  await loadSituations()
}

async function deleteSituation(id) {
  if (!confirm('Удалить ситуацию?')) return
  await fetch(`/api/admin/situations/${id}`, { method: 'DELETE', headers: authHeaders() })
  await loadSituations()
}

watch(tab, () => { uploadError.value = '' })

onMounted(() => { if (token.value) loadData() })
</script>

<style scoped>
.admin-wrap {
  height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
}

.login-box  { width: 320px; }
.panel-box  { width: min(780px, 100%); }

.panel-body { display: flex; flex-direction: column; gap: 0; padding: 0; }

/* Tabs */
.tab-bar {
  display: flex;
  border-bottom: 2px solid #808080;
  background: #bdb8b0;
  padding: 6px 8px 0;
  gap: 4px;
}
.tab-btn {
  background: #d4d0c8;
  border: 2px solid;
  border-bottom: none;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #808080;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #222;
  padding: 4px 14px;
  cursor: pointer;
  position: relative;
  bottom: -2px;
}
.tab-btn.active {
  background: #d4d0c8;
  border-bottom: 2px solid #d4d0c8;
  font-weight: bold;
  z-index: 1;
}

/* Tab content */
.tab-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Upload row */
.upload-row {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.file-label {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 4px 8px;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  color: #444;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
.file-label:hover { background: #c8c4bc; }

/* List */
.list-scroll { max-height: 360px; overflow-y: auto; }

.row-id   { width: 32px; text-align: right; flex-shrink: 0; font-size: 11px; }
.row-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-file { font-size: 11px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.del-btn {
  background: #e87070;
  border: 2px solid;
  border-top-color: #f0a0a0;
  border-left-color: #f0a0a0;
  border-bottom-color: #a04040;
  border-right-color: #a04040;
  color: #fff;
  width: 22px;
  height: 20px;
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.del-btn:hover { background: #d05050; }

.tc-dim { color: #888; }
.tc-ok  { color: #4ec9b0; }
</style>
