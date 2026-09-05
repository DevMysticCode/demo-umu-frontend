<template>
  <div class="hs-page mobile-container">
    <!-- Nav bar -->
    <div class="hs-nav-bar">
      <button class="hs-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="hs-nav-title">Help &amp; Support</div>
      <button class="hs-nav-icon-btn" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>

    <main class="hs-body">
      <div class="atm-bg coral" />

      <!-- Hero -->
      <div class="hs-hero">
        <div class="hero-greeting">We're here for you</div>
        <div class="hs-h1">How can we help?</div>
      </div>

      <!-- Live status card -->
      <div class="support-status">
        <div class="ss-icon-wrap">
          <img
            src="/op-icons/helpAndSupport/support.jpeg"
            alt=""
            class="ss-icon-img"
            loading="lazy"
          />
        </div>
        <div class="ss-info">
          <div class="ss-headline">Support team is online</div>
          <div class="ss-sub">Mon–Fri · 9am–6pm UK · usual reply under 4 hours</div>
        </div>
      </div>

      <!-- Get in touch grid -->
      <div class="section-heading">Get in touch</div>
      <div class="contact-grid">
        <button class="contact-card primary" type="button" @click="navigateTo('/profile/chat')">
          <div class="contact-card-icon">
            <img
              src="/op-icons/helpAndSupport/askAiFirst.jpeg"
              alt=""
              class="contact-card-icon-img"
              loading="lazy"
            />
          </div>
          <div class="contact-card-name">Ask AI first</div>
          <div class="contact-card-meta">Instant answers · 24/7</div>
        </button>
        <a class="contact-card" href="mailto:help@umovingu.com">
          <div class="contact-card-icon">
            <img
              src="/op-icons/helpAndSupport/email.jpeg"
              alt=""
              class="contact-card-icon-img"
              loading="lazy"
            />
          </div>
          <div class="contact-card-name">Email us</div>
          <div class="contact-card-meta">help@umovingu.com</div>
        </a>
      </div>

      <!-- FAQ -->
      <div class="section-heading">
        Frequently asked
        <span class="sh-action" @click="openIdx = -2">Browse all</span>
      </div>

      <div
        v-for="(item, idx) in faqs"
        :key="item.q"
        class="faq-item"
        :class="{ open: openIdx === idx || openIdx === -2 }"
        @click="toggleFaq(idx)"
      >
        <div class="faq-q">
          <span class="faq-num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span class="faq-text">{{ item.q }}</span>
          <span class="faq-chev">›</span>
        </div>
        <div v-if="openIdx === idx || openIdx === -2" class="faq-a">
          {{ item.a }}
        </div>
      </div>

      <!-- Status -->
      <div class="section-heading">
        Status
        <span class="sh-action">All systems</span>
      </div>
      <div class="hs-status-card">
        <div class="hs-status-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div class="hs-status-content">
          <div class="hs-status-title">
            UMU systems
            <span class="pill-tag live"><span class="live-dot" />All operational</span>
          </div>
          <div class="hs-status-sub">No issues reported in the last 30 days</div>
        </div>
        <span class="hs-status-arrow">›</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Help & Support - UmovingU', middleware: 'auth' })

const openIdx = ref<number>(0)

function toggleFaq(idx: number) {
  if (openIdx.value === -2) {
    openIdx.value = idx
    return
  }
  openIdx.value = openIdx.value === idx ? -1 : idx
}

const faqs = [
  {
    q: 'What is a Property Passport and why do I need one?',
    a: 'A Property Passport is a verified, legally-backed dossier of every important detail about a property - title deeds, EPC, floor plan, surveys, certificates. It speeds up sales and lettings dramatically by giving buyers and tenants everything they need upfront.',
  },
  {
    q: 'How does identity verification work?',
    a: 'We use a combination of passport / driving-licence checks, liveness detection, and AML screening. The whole flow takes 2–3 minutes and only happens once.',
  },
  {
    q: 'Can I share my Buyer Passport with someone outside UMU?',
    a: 'Yes - generate a secure share link from your Buyer Passport. The recipient sees a verified read-only view in their browser; no UMU account required.',
  },
  {
    q: "What happens if a seller doesn't have a passport yet?",
    a: 'You can register interest. We notify the owner; once they prepare their passport, you get first access before it is published publicly.',
  },
  {
    q: 'How is my data protected?',
    a: 'Documents are stored encrypted at rest, transferred over TLS, and never sold. You control who sees what - every share is auditable and revocable.',
  },
  {
    q: 'How does the £49 passport unlock work?',
    a: 'A one-time payment per passport. It gives you full access to that passport - documents, AI summaries, and direct messaging with the owner.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes - Settings → Delete account. Your passports, documents, and personal data are removed within 30 days; verifiable share links are revoked immediately.',
  },
]

const goBack = useGoBack('/profile')
</script>

<style scoped>
.hs-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.hs-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.hs-nav-icon-btn {
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
.hs-nav-icon-btn:hover { background: #f0f2f1; }
.hs-nav-icon-btn svg { width: 18px; height: 18px; }
.hs-nav-title {
  flex: 1; text-align: center;
  font-size: 16px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.4px;
}

.hs-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.coral {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255, 139, 90, 0.10), transparent 65%);
}

/* Hero */
.hs-hero { padding: 8px 22px 14px; position: relative; z-index: 1; }
.hero-greeting {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 4px;
}
.hs-h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
}

/* Live status card */
.support-status {
  margin: 0 22px 14px;
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  border: 1px solid rgba(61, 189, 163, 0.25);
  border-radius: 14px;
  padding: 13px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}
.ss-icon-wrap {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.ss-icon-wrap::after {
  content: '';
  position: absolute;
  bottom: -1px; right: -1px;
  width: 11px; height: 11px;
  background: #00a19a;
  border: 2px solid #fafaf8;
  border-radius: 50%;
  animation: ss-pulse 2s ease-in-out infinite;
}
@keyframes ss-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(61, 189, 163, 0.55); }
  50% { box-shadow: 0 0 0 7px rgba(61, 189, 163, 0); }
}
.ss-icon-wrap svg { width: 16px; height: 16px; color: #008a84; }
.ss-icon-wrap:has(.ss-icon-img) {
  width: 48px;
  height: 48px;
  background: transparent;
  overflow: visible;
  box-shadow: none;
}
.ss-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  mix-blend-mode: multiply;
}
.ss-info { flex: 1; min-width: 0; }
.ss-headline {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.ss-sub {
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 1px;
}

/* Section heading */
.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px;
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
  color: #008a84;
  text-transform: none;
  letter-spacing: -0.1px;
  cursor: pointer;
}

/* Contact grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 22px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.contact-card {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.18s;
  text-align: left;
  font-family: inherit;
  text-decoration: none;
  color: inherit;
  display: block;
}
.contact-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14, 40, 64, 0.06); }
.contact-card.primary {
  background: linear-gradient(135deg, #ede5ff, #dcc8ff);
  border-color: rgba(157, 123, 255, 0.32);
}
.contact-card-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: #f1f9f4;
  color: #008a84;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.contact-card.primary .contact-card-icon {
  background: linear-gradient(135deg, #9d7bff, #6b4e9f);
  color: #fff;
}
.contact-card-icon svg { width: 15px; height: 15px; }
.contact-card-icon:has(.contact-card-icon-img) {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: transparent !important;
  overflow: visible;
  padding: 0;
  box-shadow: none;
}
.contact-card-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  mix-blend-mode: multiply;
}
.contact-card-name {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  margin-bottom: 1px;
}
.contact-card-meta {
  font-size: 10.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.3;
}

/* FAQ */
.faq-item {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  margin: 0 22px 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  z-index: 1;
}
.faq-item:hover { border-color: #e2f1ea; }
.faq-item.open {
  border-color: #e2f1ea;
  background: #f1f9f4;
}
.faq-q {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.faq-num {
  font-size: 14px;
  color: #008a84;
  font-weight: 700;
  flex-shrink: 0;
  width: 18px;
}
.faq-text { flex: 1; }
.faq-chev {
  color: #8a95a0;
  font-size: 14px;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.faq-item.open .faq-chev {
  transform: rotate(90deg);
  color: #008a84;
}
.faq-a {
  padding: 0 14px 12px 36px;
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.5;
}

/* Status */
.hs-status-card {
  margin: 0 22px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}
.hs-status-icon {
  width: 36px; height: 36px;
  border-radius: 11px;
  background: #f1f9f4;
  color: #008a84;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hs-status-icon svg { width: 16px; height: 16px; }
.hs-status-content { flex: 1; min-width: 0; }
.hs-status-title {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.hs-status-sub {
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 1px;
}
.hs-status-arrow { color: #8a95a0; font-size: 18px; flex-shrink: 0; }

/* Pills */
.pill-tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 100px;
}
.pill-tag.live {
  background: #e2f1ea;
  color: #008a84;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.live-dot {
  width: 6px; height: 6px;
  background: #00a19a;
  border-radius: 50%;
  animation: live-pulse 2s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
