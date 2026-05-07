<template>
  <div class="lg-page mobile-container">
    <div class="lg-nav-bar">
      <button class="lg-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="lg-nav-title">Terms of Service</div>
      <div style="width: 38px" />
    </div>

    <main class="lg-body">
      <div class="atm-bg teal" />

      <div class="lg-hero">
        <div class="lg-greeting">The legal bit</div>
        <div class="lg-h1">Terms of Service</div>
        <div class="lg-meta">Last updated March 2025 · Governing law: England &amp; Wales · ICO ZC111880</div>
      </div>

      <div class="lg-content">
        <h2>01 · Who we are and what we provide</h2>
        <p>
          umovingu Limited is registered in England and Wales, Company No. 13321548, 116 Yardley Road,
          Birmingham, B27 6LG. The company operates the Property Passport platform, allowing homeowners
          and buyers to build, store and share property documents, certificates and history. The service
          is currently in early access with features still being developed.
        </p>

        <h2>02 · Accepting these terms</h2>
        <p>
          By creating an account, submitting contact forms, joining early access, or using any service
          component, you agree to these terms. Users must be at least 18 years old.
        </p>

        <h2>03 · What we provide — and what we do not</h2>
        <p>
          umovingu provides a platform for organising, storing and sharing property-related documents and
          information. The company is not solicitors, conveyancers, financial advisers, surveyors or
          estate agents. Nothing constitutes legal, financial, mortgage or property advice.
        </p>
        <p>
          The service does not guarantee faster sales, prevent transaction failures, or ensure lender
          acceptance. It functions as a preparation tool only, with outcomes depending on factors beyond
          the company's control.
        </p>

        <h2>04 · Your account and your responsibilities</h2>
        <p>Users must:</p>
        <ul>
          <li>Provide accurate personal and property information</li>
          <li>Keep login credentials secure and not share them</li>
          <li>Notify us immediately if accounts are compromised</li>
          <li>Only upload documents you have rights to share</li>
        </ul>
        <p>
          Users must not misrepresent property conditions, store others' documents without permission,
          or use the service unlawfully.
        </p>

        <h2>05 · Your content</h2>
        <p>
          Users own uploaded documents and information. By uploading, users grant the company licences
          to store, process and share content per instructions and these terms. The company claims no
          ownership. Deleted accounts result in content deletion per the Privacy Policy.
        </p>

        <h2>06 · Sharing your Passport</h2>
        <p>
          Users control Property Passport visibility and duration. Access can be revoked anytime. The
          company is not responsible for third-party use of shared information. Transferring Passports
          to new owners upon completion requires confirmation of rights and accuracy.
        </p>

        <h2>07 · Pricing and payment</h2>
        <p>
          Early access is currently free. Paid features may be introduced with clear advance notice and
          explicit user agreement before charges apply.
        </p>

        <h2>08 · Availability and service changes</h2>
        <p>
          The company aims for constant availability but cannot guarantee uninterrupted access. Features
          may be added, changed or removed. Significant changes receive reasonable notice.
        </p>

        <h2>09 · Our liability to you</h2>
        <p>
          The company is not liable for unforeseeable losses, losses from user actions, losses from
          inaccurate uploaded information, or business losses including lost profits or interruption.
          For free services, total liability per claim is limited to £100. Nothing limits liability for
          death, personal injury from negligence, fraud, or non-excludable liabilities.
        </p>

        <h2>10 · Intellectual property</h2>
        <p>
          All website and platform content — including text, design, graphics, software and the Property
          Passport concept — belongs to umovingu Limited or licensors. The umovingu name, logo and
          branding are protected. Use requires prior written consent.
        </p>

        <h2>11 · Closing your account</h2>
        <p>
          Users can close accounts anytime by emailing
          <a href="mailto:hello@umovingu.io">hello@umovingu.io</a>. Requests are actioned within
          10 working days.
        </p>

        <h2>12 · Governing law and disputes</h2>
        <p>
          These terms are governed by England and Wales law. Disputes fall under exclusive jurisdiction
          of English and Welsh courts. Complaints should first go to
          <a href="mailto:hello@umovingu.io">hello@umovingu.io</a>, as direct conversation resolves
          most issues.
        </p>

        <p class="lg-footer">
          umovingu Limited · 116 Yardley Road, Birmingham, B27 6LG · Company No. 13321548 · ICO ZC111880
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Terms of Service · UMovingU' })

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
.lg-nav-title {
  flex: 1; text-align: center;
  font-size: 16px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.4px;
}

.lg-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 240px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0, 161, 154, 0.12), transparent 65%);
}

.lg-hero {
  padding: 8px 22px 20px;
  position: relative;
  z-index: 1;
}
.lg-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: #1f7a66;
  margin-bottom: 4px;
}
.lg-h1 {
  font-size: 28px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1px;
  line-height: 1.05;
}
.lg-meta {
  font-size: 11.5px;
  font-weight: 700;
  color: #4a5868;
  margin-top: 6px;
}

.lg-content {
  position: relative;
  z-index: 1;
  padding: 0 22px;
  max-width: 720px;
  margin: 0 auto;
}
.lg-content h2 {
  font-size: 14px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.3px;
  margin: 22px 0 8px;
}
.lg-content p {
  font-size: 13px;
  font-weight: 500;
  color: #4a5868;
  line-height: 1.6;
  margin-bottom: 10px;
}
.lg-content ul {
  margin: 0 0 10px 18px;
  padding: 0;
}
.lg-content li {
  font-size: 13px;
  font-weight: 500;
  color: #4a5868;
  line-height: 1.55;
  margin-bottom: 4px;
}
.lg-content a {
  color: #1f7a66;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px dashed #1f7a66;
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
</style>
