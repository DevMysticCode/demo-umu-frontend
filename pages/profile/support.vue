<template>
  <div class="hs-page mobile-container">
    <!-- Nav bar -->
    <div class="hs-nav-bar">
      <button class="hs-nav-icon-btn" aria-label="Back" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="hs-nav-title">Help &amp; Support</div>
      <div style="width: 38px" />
    </div>

    <main class="hs-body">
      <div class="atm-bg warm" />

      <!-- Hero -->
      <div class="hs-hero">
        <div class="hs-h1">How can we help?</div>
      </div>

      <!-- Online status card -->
      <div class="hs-section">
        <div class="hs-status-card">
          <div class="hs-status-pulse" />
          <div class="hs-status-body">
            <div class="hs-status-headline">Support team is online</div>
            <div class="hs-status-sub">
              Online during UK business hours · Mon–Fri 9am–6pm
            </div>
          </div>
          <button class="hs-status-cta" @click="openChat">Chat</button>
        </div>
      </div>

      <!-- Get in touch -->
      <div class="hs-section-heading">Get in touch</div>
      <div class="hs-section">
        <div class="hs-group">
          <button class="hs-row" @click="openChat">
            <div class="hs-row-icon hs-row-icon--brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="hs-row-content">
              <div class="hs-row-label">Live chat</div>
              <div class="hs-row-meta">Average reply time: 4 minutes</div>
            </div>
            <span class="hs-row-chev">›</span>
          </button>

          <a class="hs-row" href="mailto:support@umovingu.com">
            <div class="hs-row-icon hs-row-icon--neutral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div class="hs-row-content">
              <div class="hs-row-label">Email</div>
              <div class="hs-row-meta">support@umovingu.com</div>
            </div>
            <span class="hs-row-chev">›</span>
          </a>

          <button class="hs-row" @click="navigateTo('/profile/calendar')">
            <div class="hs-row-icon hs-row-icon--neutral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="hs-row-content">
              <div class="hs-row-label">Schedule a call</div>
              <div class="hs-row-meta">15 min slot with a specialist</div>
            </div>
            <span class="hs-row-chev">›</span>
          </button>
        </div>
      </div>

      <!-- FAQ -->
      <div class="hs-section-heading">
        Frequently asked
        <span class="hs-sh-action">Browse all</span>
      </div>
      <div class="hs-section">
        <div class="hs-group">
          <div
            v-for="(faq, i) in faqs"
            :key="faq.q"
            class="hs-faq"
            :class="{ open: openFaq === i }"
          >
            <button class="hs-faq-q" @click="openFaq = openFaq === i ? -1 : i">
              <span>{{ faq.q }}</span>
              <span class="hs-faq-chev">{{ openFaq === i ? '−' : '+' }}</span>
            </button>
            <div v-if="openFaq === i" class="hs-faq-a">{{ faq.a }}</div>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="hs-section-heading">
        Status
        <span class="hs-sh-action hs-sh-status">● All systems</span>
      </div>
      <div class="hs-section">
        <div class="hs-group">
          <div v-for="s in services" :key="s.name" class="hs-service">
            <div class="hs-service-dot" />
            <div class="hs-service-name">{{ s.name }}</div>
            <div class="hs-service-state">Operational</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Help & Support - UmovingU', middleware: 'auth' })

const openFaq = ref(-1)

const faqs = [
  {
    q: 'How do I claim my Property Passport?',
    a: 'Find your property in HealthScore search, tap "I own this property", and we\'ll verify ownership via HM Land Registry. Once confirmed, your Passport is created and you can start completing sections.',
  },
  {
    q: 'What\'s the difference between the HealthScore and a Passport?',
    a: 'HealthScore is a public estimate based on EPC data — anyone can see it. The Passport is your verified record: ID-confirmed, document-backed, owner-controlled. Buyers pay to unlock it.',
  },
  {
    q: 'Can I share my Buyer Profile with someone outside UMU?',
    a: 'Yes — open Buyer Profile → Share. We generate a secure link that anyone can open in a browser, with a verified badge so sellers know it\'s genuine.',
  },
  {
    q: 'How does the £49 Passport unlock work?',
    a: 'Buyers pay £49 to access an owner\'s verified Passport. The fee covers the lifetime cost of access; you can revisit the Passport any time from "Watching" in your collections.',
  },
  {
    q: 'Who can see my contact details?',
    a: 'Nobody by default. Contact visibility is off — sellers and agents only see your details after you message them. Toggle this in Settings → Privacy & data.',
  },
  {
    q: 'How do I add a collaborator (solicitor, agent)?',
    a: 'Profile → Collaborators → +. Enter their email; they\'ll get an invite. You control which properties they see and what they can edit.',
  },
  {
    q: 'What happens to my Passport when I sell?',
    a: 'It transfers to the new owner. Their name replaces yours on the title block; the verified history (documents, surveys, prior owners) stays with the property forever.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes — Settings → Privacy & data → Delete account. We permanently wipe your profile, passports, documents and notes. This cannot be undone.',
  },
]

const services = [
  { name: 'App & website' },
  { name: 'Passport platform' },
  { name: 'HealthScore engine' },
  { name: 'Payments (Stripe)' },
  { name: 'Email & notifications' },
]

function openChat() {
  navigateTo('/profile/chat')
}
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
  width: 38px;
  height: 38px;
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
}
.hs-nav-icon-btn:hover { background: #f0f2f1; }
.hs-nav-icon-btn svg { width: 18px; height: 18px; }
.hs-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}

.hs-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.warm {
  background:
    radial-gradient(ellipse 70% 100% at 30% 30%, rgba(245, 196, 76, 0.1), transparent 70%),
    radial-gradient(ellipse 70% 80% at 90% 0%, rgba(61, 189, 163, 0.1), transparent 60%);
}

.hs-hero { padding: 8px 22px 14px; position: relative; z-index: 1; }
.hs-h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
}

.hs-section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 22px 22px 8px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hs-sh-action {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: #1f7a66;
  cursor: pointer;
  letter-spacing: -0.1px;
  text-transform: none;
}
.hs-sh-status { cursor: default; color: #1f7a66; }

.hs-section { padding: 0 22px; position: relative; z-index: 1; }
.hs-group {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}

/* Status card */
.hs-status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  border: 1px solid rgba(61, 189, 163, 0.25);
  border-radius: 16px;
  margin-bottom: 14px;
}
.hs-status-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3dbda3;
  box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.25);
  animation: hs-pulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes hs-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(61, 189, 163, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(61, 189, 163, 0); }
}
.hs-status-body { flex: 1; min-width: 0; }
.hs-status-headline {
  font-size: 13.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.hs-status-sub {
  font-size: 11.5px;
  color: #4a5868;
  font-weight: 600;
  margin-top: 2px;
}
.hs-status-cta {
  background: #3dbda3;
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(61, 189, 163, 0.32);
}
.hs-status-cta:hover { background: #2a9484; }

/* Row pattern */
.hs-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border: none;
  background: transparent;
  border-bottom: 1px solid #f0f2f1;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
  font-family: inherit;
  text-decoration: none;
  color: inherit;
}
.hs-row:last-child { border-bottom: none; }
.hs-row:hover { background: #f5f4f0; }
.hs-row-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.hs-row-icon svg { width: 16px; height: 16px; }
.hs-row-icon--brand { background: #f1f9f4; color: #1f7a66; }
.hs-row-icon--neutral { background: #f5f4f0; color: #4a5868; }
.hs-row-content { flex: 1; min-width: 0; }
.hs-row-label {
  font-size: 13.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.hs-row-meta {
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 2px;
  line-height: 1.3;
}
.hs-row-chev {
  color: #8a95a0;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

/* FAQ accordion */
.hs-faq { border-bottom: 1px solid #f0f2f1; }
.hs-faq:last-child { border-bottom: none; }
.hs-faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #0e2840;
  text-align: left;
  cursor: pointer;
  letter-spacing: -0.1px;
  line-height: 1.3;
  transition: background 0.15s;
}
.hs-faq-q:hover { background: #f5f4f0; }
.hs-faq-q > span:first-child { flex: 1; }
.hs-faq-chev {
  color: #1f7a66;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
}
.hs-faq-a {
  padding: 0 16px 13px;
  font-size: 12.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.5;
}

/* Service status */
.hs-service {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: 1px solid #f0f2f1;
}
.hs-service:last-child { border-bottom: none; }
.hs-service-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3dbda3;
  flex-shrink: 0;
}
.hs-service-name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.1px;
}
.hs-service-state {
  font-size: 11px;
  font-weight: 800;
  color: #1f7a66;
  letter-spacing: -0.1px;
  text-transform: uppercase;
}
</style>
