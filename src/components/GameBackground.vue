<template>
  <div class="xp-bg" aria-hidden="true">
    <svg
      class="xp-svg"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- Sky gradient -->
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#1a4fa0" />
          <stop offset="38%"  stop-color="#3585cc" />
          <stop offset="68%"  stop-color="#6ab4e8" />
          <stop offset="82%"  stop-color="#9ed0f0" />
          <stop offset="100%" stop-color="#c2e4f8" />
        </linearGradient>

        <!-- Hill gradients -->
        <linearGradient id="hillG1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#82cc48" />
          <stop offset="55%"  stop-color="#52a82e" />
          <stop offset="100%" stop-color="#2e6e18" />
        </linearGradient>
        <linearGradient id="hillG2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#4ea030" />
          <stop offset="100%" stop-color="#1c4e0c" />
        </linearGradient>
        <linearGradient id="hillG3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#3a8820" />
          <stop offset="100%" stop-color="#143808" />
        </linearGradient>

        <!-- Sun radial glow -->
        <radialGradient id="sunG" cx="62%" cy="28%" r="38%">
          <stop offset="0%"   stop-color="rgba(255,248,200,0.38)" />
          <stop offset="60%"  stop-color="rgba(255,240,160,0.10)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>

        <!-- Horizon haze -->
        <linearGradient id="hazeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(200,228,248,0)" />
          <stop offset="100%" stop-color="rgba(200,228,248,0.22)" />
        </linearGradient>
      </defs>

      <!-- Sky base -->
      <rect width="1920" height="1080" fill="url(#skyG)" />

      <!-- Sun glow -->
      <rect width="1920" height="1080" fill="url(#sunG)" />

      <!-- Horizon haze -->
      <rect x="0" y="540" width="1920" height="200" fill="url(#hazeG)" />

      <!-- Far hill (pale, distant) -->
      <path
        d="M-60,740 C80,610 260,555 480,600
           C680,640 880,700 1120,610
           C1330,530 1540,480 1760,555
           C1880,595 1960,625 2020,618
           L2020,1080 L-60,1080 Z"
        fill="#6ab840"
        opacity="0.55"
      />

      <!-- Main Bliss hill -->
      <path
        d="M-60,775 C40,645 180,568 400,618
           C595,662 800,730 1050,645
           C1255,572 1465,512 1695,580
           C1830,618 1930,658 2020,645
           L2020,1080 L-60,1080 Z"
        fill="url(#hillG1)"
      />

      <!-- Mid foreground -->
      <path
        d="M-60,875 C100,808 310,775 540,822
           C740,862 940,882 1180,835
           C1380,794 1590,768 1800,828
           C1905,858 1975,875 2020,870
           L2020,1080 L-60,1080 Z"
        fill="url(#hillG2)"
      />

      <!-- Foreground (darkest) -->
      <path
        d="M-60,960 C80,928 220,910 400,940
           C580,968 780,978 1000,958
           C1200,940 1440,920 1680,952
           C1820,968 1940,975 2020,970
           L2020,1080 L-60,1080 Z"
        fill="url(#hillG3)"
      />

      <!-- ── Clouds ── -->

      <!-- Cloud cluster 1 (left) -->
      <g opacity="0.94">
        <ellipse cx="270" cy="200" rx="138" ry="50" fill="white" />
        <ellipse cx="355" cy="176" rx="100" ry="45" fill="white" />
        <ellipse cx="188" cy="218" rx="88"  ry="36" fill="rgba(255,255,255,0.9)" />
        <ellipse cx="305" cy="212" rx="115" ry="28" fill="white" />
        <!-- Shadow base -->
        <ellipse cx="282" cy="235" rx="130" ry="22" fill="rgba(180,210,240,0.35)" />
      </g>

      <!-- Cloud cluster 2 (center-right) -->
      <g opacity="0.90">
        <ellipse cx="1185" cy="148" rx="162" ry="54" fill="white" />
        <ellipse cx="1295" cy="124" rx="108" ry="49" fill="white" />
        <ellipse cx="1082" cy="168" rx="95"  ry="40" fill="rgba(255,255,255,0.88)" />
        <ellipse cx="1210" cy="162" rx="148" ry="30" fill="white" />
        <ellipse cx="1195" cy="185" rx="155" ry="22" fill="rgba(180,210,240,0.3)" />
      </g>

      <!-- Small cloud (center) -->
      <g opacity="0.78">
        <ellipse cx="755"  cy="285" rx="92"  ry="33" fill="white" />
        <ellipse cx="820"  cy="268" rx="68"  ry="30" fill="white" />
        <ellipse cx="700"  cy="298" rx="60"  ry="24" fill="rgba(255,255,255,0.85)" />
      </g>

      <!-- Far-right cloud -->
      <g opacity="0.72">
        <ellipse cx="1690" cy="195" rx="115" ry="42" fill="white" />
        <ellipse cx="1768" cy="176" rx="82"  ry="37" fill="white" />
        <ellipse cx="1625" cy="210" rx="70"  ry="28" fill="rgba(255,255,255,0.8)" />
      </g>

      <!-- Tiny cloud upper-center -->
      <g opacity="0.58">
        <ellipse cx="960"  cy="135" rx="60"  ry="22" fill="white" />
        <ellipse cx="1010" cy="122" rx="45"  ry="20" fill="white" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.xp-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.xp-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
