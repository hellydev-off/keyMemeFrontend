<template>
  <div class="admin-wrap">

    <!-- ── Login ── -->
    <div v-if="!token" class="admin-card login-card">
      <div class="card-header">
        <div class="card-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <div class="card-title">Администрирование</div>
          <div class="card-sub">KeyMeme панель управления</div>
        </div>
      </div>
      <div class="card-body login-body">
        <div class="field">
          <label class="field-label">Логин</label>
          <input class="input" v-model="form.login" autocomplete="username" placeholder="admin" />
        </div>
        <div class="field">
          <label class="field-label">Пароль</label>
          <input class="input" type="password" v-model="form.password"
                 autocomplete="current-password" placeholder="••••••••"
                 @keydown.enter="doLogin" />
        </div>
        <p v-if="loginError" class="error-msg">{{ loginError }}</p>
        <button class="btn btn-primary btn-full" :disabled="loading" @click="doLogin">
          <svg v-if="loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:spin .7s linear infinite">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </div>
    </div>

    <!-- ── Panel ── -->
    <div v-else class="admin-card panel-card">
      <div class="card-header">
        <div class="card-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="header-flex">
          <div>
            <div class="card-title">Панель администратора</div>
            <div class="card-sub">Управление контентом</div>
          </div>
          <button class="btn btn-ghost btn-sm logout-btn" @click="logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Выйти
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button :class="['tab-btn', { 'tab-active': tab === 'sounds' }]" @click="tab = 'sounds'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Звуки
          <span class="tab-count">{{ sounds.length }}</span>
        </button>
        <button :class="['tab-btn', { 'tab-active': tab === 'situations' }]" @click="tab = 'situations'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Ситуации
          <span class="tab-count">{{ situations.length }}</span>
        </button>
      </div>

      <div class="card-body">

        <!-- ── Sounds ── -->
        <div v-if="tab === 'sounds'" class="tab-content">
          <div class="upload-row">
            <input class="input upload-name" v-model="newSound.name" placeholder="Название звука" />
            <label class="file-pick" :class="{ 'file-picked': soundFile }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ soundFile ? soundFile.name : 'Выбрать MP3' }}
              <input type="file" accept="audio/*" style="display:none" @change="e => soundFile = e.target.files[0]" />
            </label>
            <button class="btn btn-primary" :disabled="uploading" @click="uploadSound">
              {{ uploading ? '...' : 'Добавить' }}
            </button>
          </div>
          <p v-if="uploadError" class="error-msg">{{ uploadError }}</p>

          <div class="list-box">
            <div v-if="sounds.length === 0" class="list-empty">Нет звуков</div>
            <div v-for="s in sounds" :key="s.id" class="list-row">
              <span class="list-id">#{{ s.id }}</span>
              <span class="list-name">{{ s.name }}</span>
              <span class="list-meta">{{ s.file }}</span>
              <button class="del-btn" @click="deleteSound(s.id)" title="Удалить">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ── Situations ── -->
        <div v-if="tab === 'situations'" class="tab-content">
          <div class="upload-row">
            <input class="input upload-name" v-model="newSit.text" placeholder="Текст ситуации" />
            <label class="file-pick" :class="{ 'file-picked': sitFile }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ sitFile ? sitFile.name : 'MP3 озвучки' }}
              <input type="file" accept="audio/*" style="display:none" @change="e => sitFile = e.target.files[0]" />
            </label>
            <button class="btn btn-primary" :disabled="uploading" @click="uploadSituation">
              {{ uploading ? '...' : 'Добавить' }}
            </button>
          </div>
          <p v-if="uploadError" class="error-msg">{{ uploadError }}</p>

          <div class="list-box">
            <div v-if="situations.length === 0" class="list-empty">Нет ситуаций</div>
            <div v-for="s in situations" :key="s.id" class="list-row">
              <span class="list-id">#{{ s.id }}</span>
              <span class="list-name">{{ s.text }}</span>
              <span v-if="s.audioFile" class="audio-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                MP3
              </span>
              <button class="del-btn" @click="deleteSituation(s.id)" title="Удалить">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const token      = ref(localStorage.getItem('admin_token') || '')
const form       = ref({ login: '', password: '' })
const loginError = ref('')
const loading    = ref(false)

const tab        = ref('sounds')
const sounds     = ref([])
const situations = ref([])

const newSound    = ref({ name: '' })
const soundFile   = ref(null)
const newSit      = ref({ text: '' })
const sitFile     = ref(null)
const uploading   = ref(false)
const uploadError = ref('')

function authHeaders() {
  return { Authorization: `Bearer ${token.value}` }
}

function logout() {
  token.value = ''
  localStorage.removeItem('admin_token')
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
  position: absolute; inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px 40px;
}

.admin-card {
  background: var(--c-surface);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--c-border);
  animation: fadeScaleIn .25s ease both;
  overflow: hidden;
}
.login-card { width: 380px; max-width: 100%; }
.panel-card { width: min(820px, 100%); }

/* Header */
.card-header {
  padding: 18px 22px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-violet));
  display: flex;
  align-items: center;
  gap: 14px;
}
.card-header-icon {
  width: 44px; height: 44px;
  background: rgba(255,255,255,.2);
  border-radius: var(--r);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.header-flex {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-title { font-size: 16px; font-weight: 700; color: white; }
.card-sub   { font-size: 12px; color: rgba(255,255,255,.75); margin-top: 2px; }
.logout-btn { color: rgba(255,255,255,.85); border-color: rgba(255,255,255,.3); background: rgba(255,255,255,.1); }
.logout-btn:hover { background: rgba(255,255,255,.2); color: white; border-color: rgba(255,255,255,.5); }

/* Tabs */
.tab-bar {
  display: flex;
  gap: 2px;
  padding: 10px 16px 0;
  border-bottom: 2px solid var(--c-border);
  background: var(--c-surface-2);
}
.tab-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border: none; background: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--c-text-muted);
  border-radius: var(--r-sm) var(--r-sm) 0 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all .15s;
}
.tab-btn:hover { color: var(--c-primary); background: var(--c-primary-light); }
.tab-active {
  color: var(--c-primary) !important;
  border-bottom-color: var(--c-primary) !important;
  background: var(--c-surface) !important;
  font-weight: 600;
}
.tab-count {
  background: var(--c-primary-light); color: var(--c-primary);
  border-radius: var(--r-full); padding: 1px 6px;
  font-size: 11px; font-weight: 700;
}
.tab-active .tab-count { background: var(--c-primary); color: white; }

/* Body */
.card-body { padding: 20px 22px; }
.login-body { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 12px; font-weight: 600; color: var(--c-text-muted);
  text-transform: uppercase; letter-spacing: .04em;
}

/* Tab content */
.tab-content { display: flex; flex-direction: column; gap: 12px; }

/* Upload row */
.upload-row {
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
}
.upload-name { flex: 1; min-width: 160px; }

.file-pick {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  border: 1.5px dashed var(--c-border);
  border-radius: var(--r-sm);
  font-size: 13px; color: var(--c-text-muted);
  cursor: pointer; transition: all .15s;
  white-space: nowrap; max-width: 200px;
  overflow: hidden; text-overflow: ellipsis;
}
.file-pick:hover { border-color: var(--c-primary); color: var(--c-primary); background: var(--c-primary-light); }
.file-picked { border-style: solid; border-color: var(--c-primary-mid); color: var(--c-primary); background: var(--c-primary-light); }

/* List */
.list-box {
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;
}
.list-empty {
  padding: 24px; text-align: center;
  color: var(--c-text-muted); font-size: 13px; font-style: italic;
}
.list-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--c-border);
  font-size: 13px;
  transition: background .1s;
}
.list-row:last-child { border-bottom: none; }
.list-row:hover { background: var(--c-primary-light); }

.list-id   { font-size: 11px; color: var(--c-text-light); min-width: 28px; flex-shrink: 0; }
.list-name { flex: 1; font-weight: 500; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.list-meta { font-size: 11px; color: var(--c-text-light); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }

.audio-badge {
  display: inline-flex; align-items: center; gap: 3px;
  background: var(--c-success-bg); color: var(--c-success);
  border-radius: var(--r-full); padding: 2px 7px;
  font-size: 11px; font-weight: 600; flex-shrink: 0;
}

.del-btn {
  width: 28px; height: 28px; border-radius: var(--r-full);
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-light); transition: all .12s;
  flex-shrink: 0;
}
.del-btn:hover { background: var(--c-danger-bg); color: var(--c-danger); }
</style>
