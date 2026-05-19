// TTS chain: Yandex SpeechKit → Web Speech API

const KEY = import.meta.env.VITE_YANDEX_TTS_KEY
console.log('[TTS] key loaded:', KEY ? KEY.slice(0, 8) + '…' : 'MISSING')

async function yandexTTS(text) {
  if (!KEY) { console.warn('[TTS] No Yandex key'); return false }
  try {
    const body = new URLSearchParams({
      text,
      lang:   'ru-RU',
      voice:  'filipp',
      format: 'mp3',
      speed:  '0.95'
    })
    const res = await fetch(
      'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize',
      {
        method: 'POST',
        headers: {
          'Authorization':  `Api-Key ${KEY}`,
          'Content-Type':   'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn('[TTS] Yandex error', res.status, err)
      return false
    }
    const blob = await res.blob()
    return await playBlob(blob)
  } catch (e) {
    console.warn('[TTS] Yandex fetch failed', e)
    return false
  }
}

function playBlob(blob) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
    audio.play().catch(() => resolve(false))
  })
}

function webSpeech(text) {
  return new Promise(resolve => {
    if (!window.speechSynthesis) return resolve()
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang    = 'ru-RU'
    utt.rate    = 0.92
    utt.onend   = resolve
    utt.onerror = resolve
    window.speechSynthesis.speak(utt)
  })
}

export async function speakText(text) {
  if (!text) return
  const ok = await yandexTTS(text)
  if (!ok) await webSpeech(text)
}

export function cancelSpeech() {
  window.speechSynthesis?.cancel()
}
