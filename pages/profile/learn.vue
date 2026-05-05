<template>
  <div class="ai-page mobile-container">
    <!-- Nav bar -->
    <div class="ai-nav-bar">
      <button class="ai-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="ai-nav-title">Learn &amp; Ask AI</div>
      <button class="ai-nav-icon-btn" aria-label="Chat history" @click="navigateTo('/profile/chat')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
    </div>

    <main class="ai-body">
      <div class="atm-bg teal-deep" />

      <!-- Hero with breathing AI orb -->
      <div class="ai-hero">
        <div class="ai-orb" />
        <div class="ai-greeting">Hi {{ firstName || 'there' }}</div>
        <div class="ai-headline">
          Ask me <span class="ai-headline-italic">anything</span> about your property journey.
        </div>
        <div class="ai-sub">
          From legal jargon to chain timelines. I know UMU and the UK property market inside out.
        </div>
      </div>

      <!-- Input -->
      <form class="ai-input-wrap" @submit.prevent="askWith(question)">
        <input
          v-model="question"
          type="text"
          placeholder="Ask a question…"
          @keydown.enter.prevent="askWith(question)"
        />
        <button type="button" class="ai-input-btn" aria-label="Voice (coming soon)" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="3" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>
        <button type="submit" class="ai-send" aria-label="Send" :disabled="!question.trim()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </form>

      <!-- Suggested prompts -->
      <div class="section-heading">Try asking</div>
      <div class="ai-prompts">
        <button
          v-for="p in prompts"
          :key="p.text"
          type="button"
          class="ai-prompt"
          @click="askWith(p.text)"
        >
          <div class="ai-prompt-icon" v-html="p.icon" />
          <div class="ai-prompt-text">{{ p.text }}</div>
          <div class="ai-prompt-arrow">›</div>
        </button>
      </div>

      <!-- Library -->
      <div class="section-heading">
        Library <span class="sh-action">Coming soon</span>
      </div>

      <div class="article-card coming-soon">
        <div class="article-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div class="article-info">
          <div class="article-title">
            Articles
            <span class="pill-tag gold">Soon</span>
          </div>
          <div class="article-meta">In-depth guides on every step</div>
        </div>
      </div>

      <div class="article-card coming-soon">
        <div class="article-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </div>
        <div class="article-info">
          <div class="article-title">
            Video walk-throughs
            <span class="pill-tag gold">Soon</span>
          </div>
          <div class="article-meta">5-min explainers on each topic</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Learn & Ask AI - UmovingU', middleware: 'auth' })

const { profile, fetchProfile } = useProfile()

onMounted(() => {
  if (!profile.value) fetchProfile().catch(() => null)
})

const firstName = computed(() => profile.value?.firstName ?? '')

const question = ref('')

const prompts = [
  {
    text: "What's an EICR and do I need one?",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/></svg>',
  },
  {
    text: 'How long does conveyancing usually take?',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  },
  {
    text: 'What stamp duty will I pay on a £450k home?',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7c0-2-1.6-3.5-4.5-3.5S9 5 9 7c0 4 9 4 9 8 0 2-1.6 3.5-4.5 3.5S9 17 9 15"/><line x1="13.5" y1="2" x2="13.5" y2="22"/></svg>',
  },
  {
    text: 'Should I get a homebuyer survey?',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>',
  },
]

function askWith(text: string) {
  const q = text.trim()
  if (!q) return
  navigateTo(`/profile/chat?prefill=${encodeURIComponent(q)}`)
}

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) window.history.back()
  else navigateTo('/profile')
}
</script>

<style scoped>
.ai-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.ai-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.ai-nav-icon-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
  font-family: inherit;
}
.ai-nav-icon-btn:hover { background: #f0f2f1; }
.ai-nav-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ai-nav-icon-btn svg { width: 18px; height: 18px; }
.ai-nav-title {
  flex: 1; text-align: center;
  font-size: 16px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.4px;
}

.ai-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 320px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal-deep {
  background:
    radial-gradient(ellipse 90% 100% at 50% 0%, rgba(0, 161, 154, 0.18), transparent 70%),
    radial-gradient(ellipse 70% 80% at 90% 30%, rgba(61, 189, 163, 0.12), transparent 60%);
}

/* Hero */
.ai-hero {
  padding: 16px 22px 18px;
  position: relative;
  z-index: 1;
  text-align: center;
}
.ai-orb {
  width: 72px; height: 72px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.4), transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(245, 196, 76, 0.5), transparent 60%),
    linear-gradient(135deg, #00a19a 0%, #1f7a66 50%, #3dbda3 100%);
  margin: 0 auto 12px;
  position: relative;
  box-shadow:
    0 8px 28px rgba(61, 189, 163, 0.45),
    inset 0 0 0 2px rgba(255, 255, 255, 0.2);
  animation: orbBreathe 4s ease-in-out infinite;
}
@keyframes orbBreathe {
  0%, 100% {
    box-shadow: 0 8px 28px rgba(61, 189, 163, 0.45), inset 0 0 0 2px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow:
      0 8px 36px rgba(61, 189, 163, 0.6),
      0 0 50px rgba(61, 189, 163, 0.18),
      inset 0 0 0 2px rgba(255, 255, 255, 0.25);
  }
}
.ai-orb::before {
  content: '✨';
  position: absolute;
  top: -2px; right: -2px;
  font-size: 14px;
  filter: drop-shadow(0 2px 4px rgba(61, 189, 163, 0.4));
}

.ai-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: #1f7a66;
  margin-bottom: 4px;
}
.ai-headline {
  font-size: 24px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.8px;
  line-height: 1.1;
  margin-bottom: 8px;
}
.ai-headline-italic {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  color: #1f7a66;
}
.ai-sub {
  font-size: 12.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.45;
  max-width: 280px;
  margin: 0 auto;
}

/* Input */
.ai-input-wrap {
  margin: 16px 22px 0;
  background: #fff;
  border: 1.5px solid #e8eceb;
  border-radius: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 8px 24px rgba(61, 189, 163, 0.12);
  transition: all 0.18s;
  position: relative;
  z-index: 1;
}
.ai-input-wrap:focus-within {
  border-color: #3dbda3;
  box-shadow:
    0 0 0 3px rgba(61, 189, 163, 0.18),
    0 8px 24px rgba(61, 189, 163, 0.18);
}
.ai-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  min-width: 0;
}
.ai-input-wrap input::placeholder {
  color: #8a95a0;
  font-weight: 500;
}
.ai-input-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #0e2840;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
}
.ai-input-btn:hover { background: #f0f2f1; }
.ai-input-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ai-input-btn svg { width: 16px; height: 16px; }

.ai-send {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3dbda3, #1f7a66);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(31, 122, 102, 0.42);
  transition: all 0.15s;
  font-family: inherit;
}
.ai-send:hover { transform: translateX(1px); }
.ai-send:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.ai-send svg { width: 14px; height: 14px; }

/* Section heading */
.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 16px 22px 8px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sh-action {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: #1f7a66;
  text-transform: none;
  letter-spacing: -0.1px;
}

/* Suggested prompts */
.ai-prompts {
  padding: 0 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  z-index: 1;
}
.ai-prompt {
  background: #e2f1ea;
  border: 1px solid rgba(61, 189, 163, 0.22);
  border-radius: 12px;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
  width: 100%;
}
.ai-prompt:hover {
  background: #c5e3d4;
  transform: translateX(2px);
  border-color: rgba(61, 189, 163, 0.4);
}
.ai-prompt-icon {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: #fff;
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(31, 122, 102, 0.18);
}
.ai-prompt-icon svg { width: 13px; height: 13px; }
.ai-prompt-text {
  font-size: 12.5px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.1px;
  line-height: 1.3;
  flex: 1;
}
.ai-prompt-arrow { color: #1f7a66; font-size: 14px; flex-shrink: 0; }

/* Article card */
.article-card {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 14px;
  margin: 0 22px 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  transition: all 0.15s;
  position: relative;
  z-index: 1;
}
.article-card.coming-soon { opacity: 0.7; }
.article-icon {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e2f1ea, #c5e3d4);
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.article-icon svg { width: 16px; height: 16px; }
.article-info { flex: 1; min-width: 0; }
.article-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.article-meta {
  font-size: 11px;
  font-weight: 600;
  color: #8a95a0;
  margin-top: 2px;
}
.pill-tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 100px;
}
.pill-tag.gold {
  background: #fdf4dc;
  color: #6f4d14;
}
</style>
