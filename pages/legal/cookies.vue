<template>
  <div class="lg-page mobile-container">
    <div class="lg-nav-bar">
      <button class="lg-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="lg-nav-title">Cookie Policy</div>
      <div style="width: 38px" />
    </div>

    <main class="lg-body">
      <div class="atm-bg teal" />

      <div class="lg-hero">
        <div class="lg-greeting">No tracking nonsense</div>
        <div class="lg-h1">Cookie Policy</div>
        <div class="lg-meta">Last updated March 2025 · No advertising · ICO ZC111880</div>
      </div>

      <div class="lg-content">
        <h2>01 · What are cookies</h2>
        <p>
          Cookies are small text files placed on your device when you visit a website. umovingu uses
          cookies to make the site function correctly and to understand how it is being used. We do not
          use cookies to serve advertising or to track you across other websites.
        </p>

        <h2>02 · Cookies we use</h2>
        <div class="lg-table">
          <div class="lg-table-row lg-table-head">
            <div>Cookie</div>
            <div>Category</div>
            <div>Purpose</div>
            <div>Duration</div>
          </div>
          <div class="lg-table-row">
            <div><code>u_session</code></div>
            <div><span class="pill ess">Essential</span></div>
            <div>Maintains your session when logged in. Required for the service to function. Cleared on logout.</div>
            <div>Session</div>
          </div>
          <div class="lg-table-row">
            <div><code>u_csrf</code></div>
            <div><span class="pill ess">Essential</span></div>
            <div>Cross-site request forgery protection. Security requirement.</div>
            <div>Session</div>
          </div>
          <div class="lg-table-row">
            <div><code>u_consent</code></div>
            <div><span class="pill ess">Essential</span></div>
            <div>Records your cookie consent choices so we do not ask again on every visit.</div>
            <div>12 months</div>
          </div>
          <div class="lg-table-row">
            <div><code>_ga</code></div>
            <div><span class="pill ana">Analytics</span></div>
            <div>Google Analytics 4. Distinguishes unique users. IP anonymisation enabled. No individual-level tracking.</div>
            <div>2 years</div>
          </div>
          <div class="lg-table-row">
            <div><code>_ga_[ID]</code></div>
            <div><span class="pill ana">Analytics</span></div>
            <div>Google Analytics 4 session state. Used alongside <code>_ga</code>.</div>
            <div>2 years</div>
          </div>
        </div>
        <p class="lg-note">
          Essential cookies cannot be disabled. Analytics cookies are only set if you consent.
        </p>

        <h2>03 · Third-party cookies</h2>
        <p>
          Google Analytics sets cookies on our behalf. Their privacy policy is at
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.
          You can opt out of Google Analytics across all websites using the Google Analytics opt-out
          add-on at
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">tools.google.com/dlpage/gaoptout</a>.
          We do not use advertising network cookies.
        </p>

        <h2>04 · Your choices</h2>
        <ul>
          <li>
            <strong>Cookie banner</strong> — accept or decline analytics cookies when you first visit.
            Change your preference at any time by clearing your cookies and revisiting.
          </li>
          <li>
            <strong>Browser settings</strong> — all modern browsers allow you to block or delete cookies.
            Blocking essential cookies will prevent some features from working.
          </li>
          <li>
            <strong>Contact us</strong> — email
            <a href="mailto:hello@umovingu.io">hello@umovingu.io</a> with any questions about specific cookies.
          </li>
        </ul>

        <h2>05 · Changes to this policy</h2>
        <p>
          We will update this policy if we change the cookies we use. The "last updated" date will reflect
          any changes. If we add new cookie categories, we will reset the consent banner so you can make a
          fresh choice.
        </p>

        <p class="lg-footer">umovingu Limited · ICO registration ZC111880</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Cookie Policy · UMovingU' })
const goBack = useGoBack('/profile/settings')
</script>

<style scoped>
.lg-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}
.lg-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.lg-nav-icon-btn {
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
  font-family: inherit;
}
.lg-nav-icon-btn:hover { background: #f0f2f1; }
.lg-nav-icon-btn svg { width: 18px; height: 18px; }
.lg-nav-title { flex: 1; text-align: center; font-size: 16px; font-weight: 800; color: #0e2840; letter-spacing: -0.4px; }

.lg-body { position: relative; }
.atm-bg { position: absolute; top: 0; left: 0; right: 0; height: 240px; pointer-events: none; z-index: 0; }
.atm-bg.teal { background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0, 161, 154, 0.12), transparent 65%); }

.lg-hero { padding: 8px 22px 20px; position: relative; z-index: 1; }
.lg-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: #1f7a66;
  margin-bottom: 4px;
}
.lg-h1 { font-size: 28px; font-weight: 800; color: #0e2840; letter-spacing: -1px; line-height: 1.05; }
.lg-meta { font-size: 11.5px; font-weight: 700; color: #4a5868; margin-top: 6px; }

.lg-content { position: relative; z-index: 1; padding: 0 22px; max-width: 720px; margin: 0 auto; }
.lg-content h2 { font-size: 14px; font-weight: 800; color: #0e2840; letter-spacing: -0.3px; margin: 22px 0 8px; }
.lg-content p { font-size: 13px; font-weight: 500; color: #4a5868; line-height: 1.6; margin-bottom: 10px; }
.lg-content ul { margin: 0 0 10px 18px; padding: 0; }
.lg-content li { font-size: 13px; font-weight: 500; color: #4a5868; line-height: 1.55; margin-bottom: 6px; }
.lg-content a { color: #1f7a66; font-weight: 700; text-decoration: none; border-bottom: 1px dashed #1f7a66; }
.lg-content strong { color: #0e2840; font-weight: 800; }
.lg-content code {
  background: #f1f9f4;
  color: #1f7a66;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11.5px;
  padding: 1px 6px;
  border-radius: 6px;
}

.lg-table {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  overflow: hidden;
  margin: 12px 0 8px;
  font-size: 12px;
}
.lg-table-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 2.4fr 1fr;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f2f1;
  align-items: start;
}
.lg-table-row:last-child { border-bottom: none; }
.lg-table-head {
  background: #f5f4f0;
  font-weight: 800;
  color: #4a5868;
  font-size: 10px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.lg-table-row > div { color: #4a5868; line-height: 1.45; }
.pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.3px;
  padding: 2px 8px;
  border-radius: 100px;
  text-transform: uppercase;
}
.pill.ess { background: #e2f1ea; color: #1f7a66; }
.pill.ana { background: #fdf4dc; color: #6f4d14; }

.lg-note {
  font-size: 11.5px !important;
  font-weight: 700 !important;
  color: #1f7a66 !important;
}
.lg-footer {
  margin-top: 28px;
  padding-top: 14px;
  border-top: 1px solid #e8eceb;
  font-size: 11px !important;
  color: #8a95a0 !important;
  font-weight: 600 !important;
  text-align: center;
}

@media (max-width: 480px) {
  .lg-table { font-size: 11px; }
  .lg-table-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .lg-table-head { display: none; }
  .lg-table-row > div:nth-child(1)::before { content: 'Cookie · '; color: #8a95a0; font-weight: 800; }
  .lg-table-row > div:nth-child(2)::before { content: ''; }
  .lg-table-row > div:nth-child(3)::before { content: 'Purpose · '; color: #8a95a0; font-weight: 800; }
  .lg-table-row > div:nth-child(4)::before { content: 'Duration · '; color: #8a95a0; font-weight: 800; }
}
</style>
