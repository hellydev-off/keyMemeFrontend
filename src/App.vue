<template>
  <GameBackground />

  <div class="page-shell">
    <!-- ═══ HEADER ═══ -->
    <header class="site-header">
      <img src="/mainPage/pc_header.png" class="hdr-side hdr-left" alt="" />

      <div class="hdr-logo-wrap">
        <h1 class="site-logo">KeyMeme</h1>
      </div>

      <img src="/mainPage/cd_header.png" class="hdr-side hdr-right" alt="" />
    </header>

    <!-- ═══ MAIN ═══ -->
    <main class="site-main">
      <router-view />
    </main>

    <!-- ═══ TASKBAR ═══ -->
    <WinTaskbar />

    <!-- ═══ CRT OVERLAY (above everything) ═══ -->
    <div class="crt-overlay" aria-hidden="true">
      <div class="crt-scanlines" />
      <div class="crt-vignette" />
      <div class="crt-chromatic" />
      <div class="crt-flicker" />
    </div>
  </div>
</template>

<script setup>
import WinTaskbar from "./components/WinTaskbar.vue";
import GameBackground from "./components/GameBackground.vue";
</script>

<style>
/* ── Reset & tokens ── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --win-bg: #d4d0c8;
  --win-bg-dark: #bdb8b0;
  --win-dark: #808080;
  --win-darker: #404040;
  --win-light: #ffffff;
  --win-title-from: #1e4bcc;
  --win-title-to: #0a2080;
  --win-title-text: #ffffff;
  --page-bg: #0a0f2e;
  --page-accent: #0d1540;
  --accent: #7ec8ff;
  --text: #222222;
  --text-muted: #666666;
  --danger: #e87070;
  --header-bg: #0a0f2e;
  --header-h: 130px;
  --header-top: 50px;
  --sb-bg: #0d1540;
  --sb-h: 42px;
}

html,
body {
  height: 100%;
  overflow: hidden;
}
body {
  font-family: "Tahoma", "MS Sans Serif", system-ui, sans-serif;
  background: #1a4fa0; /* fallback while SVG loads */
  color: var(--text);
  font-size: 13px;
  /* Screen wobble on the whole document */
  animation: crtWobble 9s ease-in-out infinite;
}

@keyframes crtWobble {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  18% {
    transform: translate(-0.4px, 0.3px) scale(1.0004);
  }
  36% {
    transform: translate(0.3px, -0.4px) scale(0.9998);
  }
  54% {
    transform: translate(-0.3px, 0.5px) scale(1.0003);
  }
  72% {
    transform: translate(0.5px, -0.2px) scale(0.9999);
  }
  88% {
    transform: translate(-0.2px, 0.3px) scale(1.0002);
  }
}

/* ── Page shell ── */
.page-shell {
  height: 100vh;
  display: grid;
  grid-template-rows: var(--header-top) var(--header-h) 1fr var(--sb-h);
  grid-template-areas: "top" "hdr" "main" "sb";
  position: relative;
  overflow: hidden;
}

/* ── CRT overlay (above header, dialogs, status bar — everything) ── */
.crt-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  pointer-events: none;
}

/* Scanlines */
.crt-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.07) 2px,
    rgba(0, 0, 0, 0.07) 4px
  );
}

/* Vignette */
.crt-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    transparent 38%,
    rgba(0, 0, 0, 0.62) 100%
  );
}

/* Chromatic aberration: red fringe left, blue right, slight green top */
.crt-chromatic {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse at 0% 50%,
      rgba(255, 30, 30, 0.045) 0%,
      transparent 22%
    ),
    radial-gradient(
      ellipse at 100% 50%,
      rgba(30, 30, 255, 0.045) 0%,
      transparent 22%
    ),
    radial-gradient(
      ellipse at 50% 0%,
      rgba(30, 200, 30, 0.025) 0%,
      transparent 18%
    ),
    radial-gradient(
      ellipse at 50% 100%,
      rgba(0, 0, 0, 0.12) 0%,
      transparent 20%
    );
}

/* Subtle random flicker */
.crt-flicker {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0);
  animation: crtFlicker 0.12s steps(1) infinite;
}
@keyframes crtFlicker {
  0%,
  91% {
    opacity: 0;
  }
  92% {
    opacity: 0.03;
  }
  93% {
    opacity: 0;
  }
  96% {
    opacity: 0;
  }
  97% {
    opacity: 0.018;
  }
  100% {
    opacity: 0;
  }
}

/* ── Header ── */
.site-header {
  grid-area: hdr;
  background: rgba(5, 15, 50, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
  border-top: 1px solid rgba(80, 130, 220, 0.3);
  border-bottom: 1px solid rgba(80, 130, 220, 0.4);
  overflow: visible;
}

.hdr-side {
  height: 190px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: -30px;
  margin-bottom: -30px;
}

.hdr-left {
  /* glitch: brief position shake + cyan color bleed every 5s */
  animation: hdrGlitch 5s linear infinite;
  filter: drop-shadow(0 0 8px rgba(79, 195, 247, 0.6));
  transform-origin: bottom center;
}
.hdr-right {
  /* continuous rock + warm glow pulse */
  animation:
    hdrRock 3s ease-in-out infinite alternate,
    hdrGlow 2s ease-in-out infinite alternate;
  transform-origin: bottom center;
}

@keyframes hdrGlitch {
  0%,
  88%,
  100% {
    transform: translateX(0) skewX(0deg);
    filter: drop-shadow(0 0 8px rgba(79, 195, 247, 0.6));
  }
  90% {
    transform: translateX(-6px) skewX(-3deg);
    filter: drop-shadow(-4px 0 0 #0ff) drop-shadow(4px 0 0 #f0f) brightness(1.5);
  }
  91% {
    transform: translateX(6px) skewX(3deg);
    filter: drop-shadow(4px 0 0 #0ff) drop-shadow(-4px 0 0 #f0f) brightness(1.2);
  }
  92% {
    transform: translateX(-3px) skewX(0deg);
    filter: drop-shadow(0 0 8px rgba(79, 195, 247, 0.6));
  }
  93% {
    transform: translateX(0);
  }
}
@keyframes hdrRock {
  from {
    transform: rotate(-5deg) translateY(2px);
  }
  to {
    transform: rotate(5deg) translateY(-2px);
  }
}
@keyframes hdrGlow {
  from {
    filter: drop-shadow(0 0 6px rgba(255, 200, 80, 0.5));
  }
  to {
    filter: drop-shadow(0 0 18px rgba(255, 200, 80, 0.9))
      drop-shadow(0 0 30px rgba(255, 120, 0, 0.5));
  }
}

.hdr-logo-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.site-logo {
  pointer-events: auto;
  font-family: "Press Start 2P", monospace;
  font-size: clamp(2rem, 5vw, 4.2rem);
  color: #fff;
  text-shadow:
    0 0 20px #4fc3f7,
    0 0 40px #1e90ff,
    0 0 80px rgba(79, 195, 247, 0.4),
    2px 2px 0 #0a2080;
  letter-spacing: 3px;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(79, 195, 247, 0.6);
  box-shadow:
    0 0 18px rgba(79, 195, 247, 0.4),
    inset 0 0 30px rgba(0, 0, 60, 0.5);
  padding: 12px 28px;
  border-radius: 20px;
  animation: logoPulse 4s ease-in-out infinite alternate;
}
@keyframes logoPulse {
  from {
    box-shadow:
      0 0 12px rgba(79, 195, 247, 0.3),
      inset 0 0 20px rgba(0, 0, 60, 0.4);
  }
  to {
    box-shadow:
      0 0 30px rgba(79, 195, 247, 0.7),
      inset 0 0 40px rgba(0, 0, 100, 0.6);
  }
}

/* ── Main ── */
.site-main {
  grid-area: main;
  position: relative;
  z-index: 5;
  overflow: hidden;
}

/* status-bar styles moved to WinTaskbar.vue */

/* ══════════════════════════════════════════
   SHARED DESIGN SYSTEM (used by all views)
   ══════════════════════════════════════════ */

/* XP window chrome */
.xp-window {
  background: #d4d0c8;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #404040;
  border-right: 2px solid #404040;
  animation: fadeScaleIn 0.2s ease both;
}
.xp-titlebar {
  background: linear-gradient(to right, #1e4bcc, #0a2080);
  color: #fff;
  font-family: Tahoma, sans-serif;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  height: 28px;
  user-select: none;
  gap: 6px;
}
.xp-titlebar-left {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  overflow: hidden;
}
.xp-title-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.xp-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}
.xp-title-btns {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.xp-ctrl {
  width: 18px;
  height: 16px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
  padding: 0;
  line-height: 1;
}
.xp-ctrl:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
}
.xp-ctrl-close:hover {
  background: #cc0000;
  color: white;
}
.xp-body {
  padding: 20px;
  background: #d4d0c8;
}

/* XP button */
.xp-btn {
  background: #d4d0c8;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #808080;
  border-right: 2px solid #808080;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  color: #222;
  padding: 4px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  user-select: none;
  white-space: nowrap;
  min-width: 75px;
}
.xp-btn:hover:not(:disabled) {
  background: #ddd9d0;
}
.xp-btn:active:not(:disabled) {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 5px 13px 3px 15px;
}
.xp-btn:disabled {
  color: #808080;
  text-shadow: 1px 1px 0 #fff;
  cursor: not-allowed;
}
.xp-btn-lg {
  font-size: 17px;
  font-weight: bold;
  height: 56px;
  width: 100%;
}
.xp-btn-danger {
  background: #e87070;
  color: #fff;
  border-top-color: #f0a0a0;
  border-left-color: #f0a0a0;
  border-bottom-color: #a04040;
  border-right-color: #a04040;
}
.xp-btn-danger:hover:not(:disabled) {
  background: #d96060;
}

/* XP input */
.xp-input {
  background: white;
  border: none;
  border-top: 1px solid #808080;
  border-left: 1px solid #808080;
  border-bottom: 1px solid #fff;
  border-right: 1px solid #fff;
  padding: 4px 8px;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  color: #222;
  outline: none;
  width: 100%;
}
.xp-input[readonly] {
  background: #d4d0c8;
}

/* Spinner */
.xp-spinner {
  display: flex;
  align-items: stretch;
}
.xp-spinner .xp-input {
  width: 60px;
  border-right: none;
  text-align: center;
}
.xp-spinner-btns {
  display: flex;
  flex-direction: column;
}
.xp-spinner-btn {
  background: #d4d0c8;
  border: 1px solid #808080;
  width: 18px;
  flex: 1;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  color: #222;
}
.xp-spinner-btn:active {
  background: #bdb8b0;
}

/* Separator */
.xp-sep {
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
  margin: 12px 0;
}

/* Inset list box */
.xp-listbox {
  background: white;
  border-top: 2px solid #808080;
  border-left: 2px solid #808080;
  border-bottom: 2px solid #fff;
  border-right: 2px solid #fff;
  min-height: 60px;
  max-height: 200px;
  overflow-y: auto;
}
.xp-list-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-bottom: 1px solid #e0dcd4;
  animation: slideDown 0.2s ease;
}
.xp-list-row:hover {
  background: #d0e8ff;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 16px;
}
::-webkit-scrollbar-track {
  background: #d4d0c8;
}
::-webkit-scrollbar-thumb {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
}

/* Utilities */
.page-center {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Legacy win-* classes still used by GameView/WinnerScreen etc. */
.win-btn {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  color: #222;
  padding: 4px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  user-select: none;
  white-space: nowrap;
  min-width: 75px;
}
.win-btn:hover:not(:disabled) {
  background: #ddd9d0;
}
.win-btn:active:not(:disabled) {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
}
.win-btn:disabled {
  color: #808080;
  text-shadow: 1px 1px 0 #fff;
  cursor: not-allowed;
}
.win-btn-lg {
  font-size: 14px;
  padding: 6px 18px;
}
.win-btn-full {
  width: 100%;
}
.win-btn-danger {
  background: #e87070;
  color: white;
  border-top-color: #f0a0a0;
  border-left-color: #f0a0a0;
  border-bottom-color: #a04040;
  border-right-color: #a04040;
}
.win-btn-danger:hover:not(:disabled) {
  background: #d96060;
}
.win-input {
  background: white;
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  font-family: Tahoma, sans-serif;
  font-size: 13px;
  color: #222;
  padding: 3px 6px;
  outline: none;
  width: 100%;
}
.win-input[readonly] {
  background: #d4d0c8;
}
.win-spinner {
  display: flex;
  align-items: stretch;
}
.win-spinner .win-input {
  width: 60px;
  border-right: none;
  text-align: center;
}
.win-spinner-btns {
  display: flex;
  flex-direction: column;
}
.win-spinner-btn {
  background: #d4d0c8;
  border: 1px solid #808080;
  width: 18px;
  flex: 1;
  font-size: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  color: #222;
}
.win-spinner-btn:active {
  background: #bdb8b0;
}
.win-sep {
  border: none;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
  margin: 8px 0;
}
.win-label {
  font-size: 13px;
  font-family: Tahoma, sans-serif;
  color: #222;
}
.win-status-panel {
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  padding: 2px 8px;
  background: #d4d0c8;
  font-size: 12px;
}
.win-group {
  border: 1px solid #808080;
  padding: 14px 10px 10px;
  position: relative;
  margin-top: 8px;
}
.win-group-label {
  position: absolute;
  top: -9px;
  left: 10px;
  background: #d4d0c8;
  padding: 0 4px;
  font-size: 13px;
}
.win-list-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-bottom: 1px solid #bdb8b0;
  animation: slideDown 0.2s ease;
}
.win-list-row:hover {
  background: #d0e8ff;
}
.win-progress {
  background: white;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
  border: 2px solid;
  height: 18px;
  overflow: hidden;
}
.win-progress-fill {
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #000080 0 10px,
    #1e4bcc 10px 12px
  );
  transition: width 0.5s;
}
.bevel-out {
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
}
.bevel-in {
  border: 2px solid;
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
}
.win-window {
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  width: 100%;
  animation: fadeScaleIn 0.2s ease both;
  position: relative;
}
.win-titlebar {
  background: linear-gradient(90deg, #1e4bcc, #0a2080);
  color: #fff;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  user-select: none;
}
.win-titlebar-left {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-family: Tahoma, sans-serif;
  overflow: hidden;
}
.win-title-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.win-title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.win-title-btns {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.win-ctrl {
  width: 18px;
  height: 16px;
  background: #d4d0c8;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #808080;
  border-right-color: #808080;
  font-size: 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
  padding: 0;
  line-height: 1;
}
.win-ctrl:active {
  border-top-color: #808080;
  border-left-color: #808080;
  border-bottom-color: #fff;
  border-right-color: #fff;
}
.win-ctrl-close:hover {
  background: #cc0000;
  color: white;
}
.win-body {
  padding: 12px;
  background: #d4d0c8;
}

/* Animations */
@keyframes fadeScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
@keyframes pulseBlue {
  0%,
  100% {
    box-shadow: 0 0 0 2px #1e4bcc;
  }
  50% {
    box-shadow: 0 0 8px 4px #1e4bcc;
  }
}
@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 60px;
  }
}

.fade-enter-active {
  animation: fadeScaleIn 0.2s ease both;
}
.fade-leave-active {
  opacity: 0;
  transition: opacity 0.15s;
}

/* Utilities */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.w-full {
  width: 100%;
}
.text-center {
  text-align: center;
}
.error-msg {
  color: #cc0000;
  font-size: 12px;
}

/* ── Adaptive header ── */

@media (max-width: 900px) {
  :root {
    --header-h: 110px;
    --header-top: 36px;
  }
  .hdr-side {
    height: 155px;
    margin-top: -22px;
    margin-bottom: -22px;
  }
  .site-logo {
    font-size: clamp(1.4rem, 4vw, 2.6rem);
    padding: 10px 20px;
  }
}

@media (max-width: 640px) {
  :root {
    --header-h: 88px;
    --header-top: 22px;
  }
  .hdr-side {
    height: 115px;
    margin-top: -14px;
    margin-bottom: -14px;
  }
  .site-logo {
    font-size: clamp(1rem, 5vw, 1.6rem);
    padding: 8px 16px;
    letter-spacing: 1px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  :root {
    --header-h: 72px;
    --header-top: 14px;
  }
  .hdr-left {
    display: none;
  }
  .hdr-side {
    height: 88px;
    margin-top: -10px;
    margin-bottom: -10px;
  }
  .site-logo {
    font-size: clamp(0.85rem, 5.5vw, 1.2rem);
    padding: 6px 14px;
    letter-spacing: 0px;
    border-radius: 10px;
  }
}

@media (max-width: 360px) {
  :root {
    --header-h: 60px;
    --header-top: 10px;
  }
  .hdr-side {
    height: 70px;
    margin-top: -6px;
    margin-bottom: -6px;
  }
  .site-logo {
    font-size: 0.75rem;
    padding: 5px 10px;
  }
}

@media (max-width: 640px) {
  .page-center { padding: 8px; }
}
</style>
