<template>
  <div class="passport-page mobile-container">
    <div class="header">
      <button class="back-btn" @click="goBack">
        <span class="back-arrow">←</span> Back
      </button>
      <button class="close-btn">✕</button>
    </div>

    <div class="content">
      <h1 class="title">Property Passport Available</h1>
      <p class="subtitle">12, Maple Road, Staines TW18 3BA</p>

      <div class="passport-card">
        <div class="passport-visual">
          <div class="passport-book">
            <div class="passport-cover">
              <div class="passport-text">Property Passport</div>
              <div class="house-icon">🏠</div>
              <div class="passport-address">
                <div class="address-line">21, Rochester Road</div>
                <div class="address-line-small">Staines, TW18 3BA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="completion-status">
        <p>
          This passport is <span class="percentage">37% complete</span>. Get
          property information and contact the owner directly
        </p>
      </div>

      <div class="key-visual">
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Cellipse cx='30' cy='25' rx='20' ry='15' fill='%23d4af37' opacity='0.8'/%3E%3Cellipse cx='35' cy='25' rx='20' ry='15' fill='%23f0d98a'/%3E%3Crect x='50' y='20' width='40' height='10' fill='%23d4af37' rx='2'/%3E%3Ccircle cx='85' cy='25' r='3' fill='%23654321'/%3E%3C/svg%3E"
          alt="Key"
          class="key-img"
        />
      </div>

      <h2 class="section-title">Why Unlock This Passport?</h2>

      <div class="benefits-list">
        <div class="benefit-item">
          <span class="benefit-icon">📞</span>
          <span class="benefit-text">Easily reach out to the owner</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">📄</span>
          <span class="benefit-text"
            >Access complete property documentation</span
          >
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🛡️</span>
          <span class="benefit-text"
            >See all warranties, certificates & repairs</span
          >
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">💬</span>
          <span class="benefit-text"
            >Get answers to specific property questions</span
          >
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">⏱️</span>
          <span class="benefit-text">Save time with verified information</span>
        </div>
      </div>

      <button class="unlock-btn" @click="navigateToPayment">Unlock Now</button>

      <div class="pricing-section">
        <h3 class="pricing-title">One-time access fee: £6</h3>
        <div class="pricing-features">
          <div class="feature-item">
            <span class="check-icon">✓</span>
            <span class="feature-text">Full property documentation</span>
          </div>
          <div class="feature-item">
            <span class="check-icon">✓</span>
            <span class="feature-text">Direct owner contact</span>
          </div>
          <div class="feature-item">
            <span class="check-icon">✓</span>
            <span class="feature-text">30-day access guarantee</span>
          </div>
          <div class="feature-item">
            <span class="check-icon">✓</span>
            <span class="feature-text">Money-back if unsatisfied</span>
          </div>
        </div>
      </div>

      <div class="comparison-table">
        <div class="comparison-header">
          <div class="header-col">Information</div>
          <div class="header-col">
            Snapshot<br /><span class="header-subtitle"
              >What you get for free*</span
            >
          </div>
          <div class="header-col highlight">
            Passport<br /><span class="header-subtitle-highlight"
              >Full Passport Access</span
            >
          </div>
        </div>

        <div class="comparison-row section-row">
          <div class="row-label">Property Overview</div>
          <div class="row-value"></div>
          <div class="row-value"></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Property Overview</div>
          <div class="row-value"><span class="check">✓</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Professional Photos</div>
          <div class="row-value"><span class="check">✓</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Contact Owner Directly</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">All Warranties & Certs</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Property History</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Recent Surveys</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Energy Performance</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Council Tax Information</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Neighborhood Data</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>

        <div class="comparison-row">
          <div class="row-label">Condition Report</div>
          <div class="row-value"><span class="cross">✕</span></div>
          <div class="row-value"><span class="check">✓</span></div>
        </div>
      </div>

      <button class="bottom-unlock-btn" @click="navigateToPayment">
        Unlock Complete Passport - £6
      </button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.back()
}

const navigateToPayment = () => {
  router.push(`/payment/${route.params.id}`)
}
</script>

<style scoped>
.passport-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f0f0 0%, #ffffff 300px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #00b8a9;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.back-arrow {
  font-size: 20px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  padding: 0 20px 40px;
  max-width: 600px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin: 16px 0 8px;
  color: #1a1a1a;
}

.subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 32px;
}

.passport-card {
  display: flex;
  justify-content: center;
  margin: 32px 0;
  perspective: 1000px;
}

.passport-visual {
  transform: rotateY(-15deg);
  transition: transform 0.3s;
}

.passport-visual:hover {
  transform: rotateY(0deg);
}

.passport-book {
  width: 200px;
  height: 260px;
  position: relative;
}

.passport-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00b8a9 0%, #00a89a 100%);
  border-radius: 8px;
  box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.3),
    inset 2px 2px 8px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  color: white;
  position: relative;
}

.passport-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
  border-radius: 8px 0 0 8px;
}

.passport-text {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
}

.house-icon {
  font-size: 64px;
  margin: 20px 0;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.passport-address {
  margin-top: auto;
  text-align: center;
}

.address-line {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.address-line-small {
  font-size: 11px;
  opacity: 0.9;
}

.completion-status {
  text-align: center;
  margin: 24px 0;
  padding: 0 20px;
}

.completion-status p {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

.percentage {
  color: #00b8a9;
  font-weight: 700;
  font-size: 16px;
}

.key-visual {
  display: flex;
  justify-content: center;
  margin: 32px 0 24px;
}

.key-img {
  width: 120px;
  height: 60px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 32px 0 24px;
  color: #1a1a1a;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.benefit-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.benefit-text {
  font-size: 15px;
  color: #00b8a9;
  font-weight: 500;
}

.unlock-btn {
  width: 100%;
  padding: 16px;
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin: 32px 0;
  box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
  transition: all 0.2s;
}

.unlock-btn:hover {
  background: #00a89a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 169, 0.4);
}

.pricing-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 32px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.pricing-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.pricing-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: #00b8a9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.feature-text {
  font-size: 14px;
  color: #00b8a9;
  font-weight: 500;
}

.comparison-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin: 32px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  gap: 8px;
  padding: 16px;
  background: #f8f8f8;
  font-weight: 700;
  font-size: 13px;
}

.header-col {
  text-align: center;
  color: #1a1a1a;
}

.header-col.highlight {
  color: #00b8a9;
}

.header-subtitle {
  display: block;
  font-size: 10px;
  font-weight: 400;
  color: #666;
  margin-top: 4px;
}

.header-subtitle-highlight {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: #00b8a9;
  margin-top: 4px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.comparison-row:last-child {
  border-bottom: none;
}

.section-row {
  background: #f8f8f8;
  font-weight: 700;
}

.row-label {
  font-size: 13px;
  color: #1a1a1a;
}

.row-value {
  text-align: center;
  font-size: 16px;
}

.check {
  color: #00b8a9;
  font-weight: 700;
}

.cross {
  color: #ccc;
  font-weight: 700;
}

.bottom-unlock-btn {
  width: 100%;
  padding: 18px;
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin: 32px 0;
  box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
  transition: all 0.2s;
}

.bottom-unlock-btn:hover {
  background: #00a89a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 169, 0.4);
}
</style>
