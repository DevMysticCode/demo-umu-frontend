<template>
  <div class="lg-page mobile-container">
    <div class="lg-nav-bar">
      <button class="lg-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="lg-nav-title">Privacy Policy</div>
      <div style="width: 38px" />
    </div>

    <main class="lg-body">
      <div class="atm-bg teal" />

      <div class="lg-hero">
        <div class="lg-greeting">How we handle your data</div>
        <div class="lg-h1">Privacy Policy</div>
        <div class="lg-meta">Last updated March 2025 · Controller: umovingu Limited · ICO ZC111880</div>
      </div>

      <div class="lg-content">
        <h2>01 · Who we are</h2>
        <p>
          umovingu Limited operates the Property Passport and umovingu platform. Registered in England
          and Wales, Company No. 13321548, at 116 Yardley Road, Birmingham, B27 6LG. For UK data
          protection purposes, umovingu Limited is the data controller. Contact:
          <a href="mailto:hello@umovingu.io">hello@umovingu.io</a>.
        </p>
        <p>
          The company is registered with the Information Commissioner's Office (ICO) under reference
          ZC111880.
        </p>

        <h2>02 · What information we collect</h2>
        <p>
          Information collected includes: name (via contact form), email address (contact form or
          signup), phone number (voluntarily provided), property address (during Passport setup),
          uploaded documents, and website usage data (via cookies).
        </p>
        <p>
          The company does not collect payment card details, health information, or government identity
          documents at this stage.
        </p>

        <h2>03 · Our legal basis for using your information</h2>
        <ul>
          <li>Contractual necessity when you sign up for a Property Passport or early access</li>
          <li>Legitimate interests to analyse website usage and improve it</li>
          <li>Consent for marketing emails, withdrawable at any time</li>
          <li>Legal obligation in rare cases</li>
        </ul>

        <h2>04 · How we use your information</h2>
        <ul>
          <li>Respond to contact form enquiries</li>
          <li>Set up and manage Property Passport records</li>
          <li>Send updates about records, expiring documents or new features where agreed</li>
          <li>Contact applicants about Founding 30 applications</li>
          <li>Improve website and product using anonymised analytics</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>
          The company does not use information for automated decision-making, does not sell information,
          and does not share it with third parties for marketing purposes.
        </p>

        <h2>05 · Who we share your information with</h2>
        <ul>
          <li>Google Analytics: receives anonymised website usage data</li>
          <li>Mailchimp or equivalent: receives name and email if subscribed to updates</li>
          <li>OpenProperty Tech Ltd: receives property address and record data</li>
          <li>Legal or regulatory authorities: information required by law or court order</li>
        </ul>

        <h2>06 · How long we keep your information</h2>
        <ul>
          <li>Contact form enquiries: 2 years</li>
          <li>Property Passport records: for the duration of an active account plus up to 2 years after closure</li>
          <li>Marketing preferences: until changed</li>
          <li>Analytics data: anonymised data retained per Google's standard settings (default 26 months)</li>
        </ul>

        <h2>07 · Your rights</h2>
        <p>
          Under UK GDPR, individuals may exercise rights by emailing
          <a href="mailto:hello@umovingu.io">hello@umovingu.io</a> within one month:
        </p>
        <ul>
          <li><strong>Access:</strong> confirm held information and receive a copy</li>
          <li><strong>Rectification:</strong> correct inaccurate or incomplete information</li>
          <li><strong>Erasure:</strong> delete information in certain circumstances</li>
          <li><strong>Restriction:</strong> pause information use while disputing accuracy</li>
          <li><strong>Portability:</strong> receive information in portable format</li>
          <li><strong>Object:</strong> object to processing based on legitimate interests</li>
          <li><strong>Withdraw consent:</strong> withdraw marketing consent at any time</li>
        </ul>
        <p>
          Right to complain to the ICO at
          <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a> or 0303 123 1113.
        </p>

        <h2>08 · Security</h2>
        <ul>
          <li>Encrypted transmission between browser and servers (HTTPS)</li>
          <li>Access controls for authorised team members only</li>
          <li>Regular review of data handling practices</li>
          <li>Use of reputable third-party platforms with maintained security standards</li>
        </ul>
        <p>Data breach notification to ICO within 72 hours if likely to affect rights.</p>

        <h2>09 · Links and children</h2>
        <p>
          External site links are not covered by this privacy policy. The service is not directed at
          children under 16. Contact the company if a child has provided information.
        </p>

        <h2>10 · Contact us</h2>
        <p>
          Email: <a href="mailto:hello@umovingu.io">hello@umovingu.io</a><br />
          Post: umovingu Limited, 116 Yardley Road, Birmingham, B27 6LG<br />
          Company No. 13321548<br />
          Response within five working days.
        </p>

        <p class="lg-footer">umovingu Limited · ICO registration ZC111880</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Privacy Policy · UMovingU' })
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
.lg-content li { font-size: 13px; font-weight: 500; color: #4a5868; line-height: 1.55; margin-bottom: 4px; }
.lg-content a { color: #1f7a66; font-weight: 700; text-decoration: none; border-bottom: 1px dashed #1f7a66; }
.lg-content strong { color: #0e2840; font-weight: 800; }
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
