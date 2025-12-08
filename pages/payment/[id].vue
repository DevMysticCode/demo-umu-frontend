<template>
  <div class="payment-page mobile-container bg-umu-gradient">
    <AppHeader title="Payment" :showBack="true" right="profile" />

    <div class="content">
      <div class="payment-icon">
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80'%3E%3Crect x='10' y='25' width='50' height='35' rx='3' fill='%234a5568'/%3E%3Crect x='15' y='30' width='20' height='15' rx='2' fill='%23718096'/%3E%3Crect x='15' y='48' width='35' height='3' fill='%23a0aec0'/%3E%3Crect x='15' y='53' width='25' height='3' fill='%23a0aec0'/%3E%3Crect x='40' y='20' width='50' height='35' rx='3' fill='%232d3748'/%3E%3Crect x='45' y='25' width='20' height='15' rx='2' fill='%234a5568'/%3E%3Crect x='45' y='43' width='35' height='3' fill='%23718096'/%3E%3Crect x='45' y='48' width='25' height='3' fill='%23718096'/%3E%3Ccircle cx='80' cy='50' r='8' fill='%2300b8a9'/%3E%3Cpath d='M77 50 L79 52 L83 47' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E"
          alt="Payment Terminal"
          class="terminal-img"
        />
      </div>

      <h1 class="title">Property Passport Access</h1>
      <p class="subtitle">12, Maple Road, Staines TW18 3BA</p>
      <p class="fee">One-time fee: £6.00</p>

      <div class="summary-section">
        <h2 class="section-title">Your Order Summary</h2>
        <div class="summary-item">
          <span class="summary-label">Property Passport Access</span>
          <span class="summary-value">£ 6.00</span>
        </div>
        <ul class="summary-benefits">
          <li>Complete property documentation</li>
          <li>Direct owner contact details</li>
          <li>30-day access guarantee</li>
        </ul>
        <div class="summary-total">
          <span class="total-label">Total</span>
          <span class="total-value">£ 6.00</span>
        </div>
      </div>

      <div class="payment-methods-section">
        <h2 class="section-title">Choose Payment Methods</h2>

        <div class="payment-method-group">
          <div class="method-label">Primary</div>
          <div class="payment-method selected">
            <input type="radio" name="payment" checked class="radio-input" />
            <div class="method-info">
              <div class="method-name">LLoyds Bank Card</div>
              <div class="card-number">•••• •••• •••• 4829</div>
              <div class="card-details">Visa • Expires 12/26</div>
            </div>
            <span class="check-mark">✓</span>
          </div>
        </div>

        <div class="payment-method-group">
          <div class="method-label">Secondary</div>
          <div class="payment-method">
            <input type="radio" name="payment" class="radio-input" />
            <div class="method-info">
              <div class="method-name">Monzo Bank Card</div>
              <div class="card-number">•••• •••• •••• 3398</div>
              <div class="card-details">Mastercard • Expires 11/28</div>
            </div>
            <span class="radio-circle"></span>
          </div>

          <div class="payment-method">
            <input type="radio" name="payment" class="radio-input" />
            <div class="method-info">
              <div class="method-name">Use UMU Credits</div>
              <div class="credits-info">
                <div class="credits-icon">💳</div>
                <div>
                  <div class="credits-balance">Balance: 1,240 points</div>
                  <div class="credits-required">
                    Need 600 points for this unlock
                  </div>
                </div>
              </div>
            </div>
            <span class="radio-circle"></span>
          </div>

          <div class="payment-method">
            <input type="radio" name="payment" class="radio-input" />
            <div class="method-info">
              <div class="method-name">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 32'%3E%3Ctext x='5' y='22' font-family='Arial' font-size='18' font-weight='bold' fill='%23000'%3E Pay%3C/text%3E%3C/svg%3E"
                  alt="Apple Pay"
                  style="height: 20px; margin-right: 8px"
                />
                Pay using Apple Pay
              </div>
            </div>
            <span class="radio-circle"></span>
          </div>

          <div class="payment-method">
            <input type="radio" name="payment" class="radio-input" />
            <div class="method-info">
              <div class="method-name">
                <span
                  style="color: #4285f4; font-weight: 600; margin-right: 8px"
                  >G</span
                >
                Pay using Google Pay
              </div>
            </div>
            <span class="radio-circle"></span>
          </div>
        </div>

        <button class="add-payment-btn">Add New Payment Method</button>
        <p class="payment-methods-info">
          Choose one of the Supported Payment Methods to get started
        </p>

        <div class="payment-logos">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ccircle cx='20' cy='20' r='15' fill='%23eb001b'/%3E%3Ccircle cx='40' cy='20' r='15' fill='%23f79e1b'/%3E%3C/svg%3E"
            alt="Mastercard"
            class="payment-logo"
          />
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='5' y='28' font-family='Arial' font-size='20' font-weight='bold' fill='%231434cb'%3EVISA%3C/text%3E%3C/svg%3E"
            alt="Visa"
            class="payment-logo"
          />
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='5' y='22' font-family='Arial' font-size='16' font-weight='bold' fill='%23000'%3E Pay%3C/text%3E%3C/svg%3E"
            alt="Apple Pay"
            class="payment-logo"
          />
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='5' y='25' font-family='Arial' font-size='18' font-weight='bold'%3E%3Ctspan fill='%234285f4'%3EG%3C/tspan%3E%3Ctspan fill='%23ea4335'%3EPay%3C/tspan%3E%3C/text%3E%3C/svg%3E"
            alt="Google Pay"
            class="payment-logo"
          />
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='5' y='25' font-family='Arial' font-size='14' font-weight='bold' fill='%23009cde'%3EPayPal%3C/text%3E%3C/svg%3E"
            alt="PayPal"
            class="payment-logo"
          />
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Ctext x='5' y='25' font-family='Arial' font-size='14' font-weight='bold' fill='%23ffa0c9'%3EKlarna%3C/text%3E%3C/svg%3E"
            alt="Klarna"
            class="payment-logo"
          />
        </div>
      </div>

      <div class="billing-section">
        <h2 class="section-title">Billing Information</h2>
        <div class="saved-address-badge">Same as Account Address</div>

        <div class="address-card selected-address">
          <div class="address-content">
            <div class="address-name">Maxine Wilson</div>
            <div class="address-details">
              123 Oak Street<br />
              Dartford, England DA1 2AB<br />
              United Kingdom
            </div>
          </div>
          <span class="check-mark">✓</span>
        </div>
        <button class="edit-address-btn">Edit Address</button>

        <button class="add-address-btn">
          <span>Add New Address</span>
          <span class="radio-circle"></span>
        </button>
      </div>

      <div class="security-section">
        <h2 class="section-title">Payment Security</h2>

        <div class="security-item">
          <div class="security-icon">🔒</div>
          <div class="security-content">
            <div class="security-title">Secure Payment</div>
            <div class="security-text">
              Your card is protected by 256-bit SSL encryption
            </div>
          </div>
        </div>

        <div class="security-item">
          <div class="security-icon">💳</div>
          <div class="security-content">
            <div class="security-title">Card Details</div>
            <div class="security-text">
              For your utmost privacy methods, we'll securely store your card
              for faster future purchases. You can remove it anytime.
            </div>
          </div>
        </div>
      </div>

      <div class="terms-section">
        <h2 class="section-title">Terms and Guarantee</h2>

        <div class="terms-item">
          <input type="checkbox" class="checkbox-input" />
          <div class="terms-content">
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </div>
          <span class="radio-circle"></span>
        </div>

        <div class="guarantee-item">
          <div class="guarantee-icon">✓</div>
          <div class="guarantee-content">
            <div class="guarantee-title">Our Guarantee</div>
            <div class="guarantee-text">
              If this property passport doesn't provide the information you
              expected, request a full refund within 24 hours.
            </div>
          </div>
        </div>
      </div>

      <button class="continue-btn" @click="processPayment">Continue</button>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/core/AppHeader.vue'
const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.back()
}

const processPayment = () => {
  console.log('Processing payment...')
  router.push(`/property/${route.params.id}`)
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f5f5 0%, #ffffff 200px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 40px;
}

.header {
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

.content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.payment-icon {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.terminal-img {
  width: 120px;
  height: 96px;
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
  margin-bottom: 4px;
}

.fee {
  font-size: 16px;
  color: #00b8a9;
  text-align: center;
  font-weight: 600;
  margin-bottom: 32px;
}

.summary-section,
.payment-methods-section,
.billing-section,
.security-section,
.terms-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
}

.summary-value {
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 700;
}

.summary-benefits {
  list-style: none;
  padding: 16px 0;
  margin: 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-benefits li {
  font-size: 14px;
  color: #00b8a9;
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.summary-benefits li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #00b8a9;
  font-weight: 700;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.total-label {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #00b8a9;
}

.payment-method-group {
  margin-bottom: 24px;
}

.method-label {
  font-size: 13px;
  color: #666;
  font-weight: 600;
  margin-bottom: 12px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.payment-method:hover {
  border-color: #00b8a9;
  background: #f9fffe;
}

.payment-method.selected {
  border-color: #00b8a9;
  background: #f0fffe;
}

.radio-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #00b8a9;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.card-number {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.card-details {
  font-size: 12px;
  color: #999;
}

.credits-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 8px;
}

.credits-icon {
  font-size: 24px;
}

.credits-balance {
  font-size: 13px;
  color: #00b8a9;
  font-weight: 600;
  margin-bottom: 4px;
}

.credits-required {
  font-size: 12px;
  color: #666;
}

.check-mark {
  width: 28px;
  height: 28px;
  background: #00b8a9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.radio-circle {
  width: 24px;
  height: 24px;
  border: 2px solid #ccc;
  border-radius: 50%;
}

.add-payment-btn {
  width: 100%;
  padding: 14px;
  background: white;
  border: 2px dashed #00b8a9;
  border-radius: 12px;
  color: #00b8a9;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin: 16px 0 12px;
  transition: all 0.2s;
}

.add-payment-btn:hover {
  background: #f0fffe;
}

.payment-methods-info {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin: 12px 0 20px;
}

.payment-logos {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.payment-logo {
  height: 32px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.payment-logo:hover {
  opacity: 1;
}

.saved-address-badge {
  display: inline-block;
  background: #e6f9f7;
  color: #00b8a9;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 12px;
}

.address-card.selected-address {
  border-color: #00b8a9;
  background: #f0fffe;
}

.address-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.address-details {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.edit-address-btn {
  background: none;
  border: none;
  color: #00b8a9;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  text-decoration: underline;
}

.add-address-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;
}

.add-address-btn:hover {
  border-color: #00b8a9;
  background: #f9fffe;
}

.security-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 12px;
}

.security-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.security-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.security-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.terms-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #00b8a9;
}

.terms-content {
  flex: 1;
  font-size: 14px;
  color: #1a1a1a;
}

.guarantee-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f0fffe;
  border-radius: 12px;
  border: 1px solid #c0f3ee;
}

.guarantee-icon {
  width: 28px;
  height: 28px;
  background: #00b8a9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.guarantee-title {
  font-size: 15px;
  font-weight: 700;
  color: #00b8a9;
  margin-bottom: 6px;
}

.guarantee-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.continue-btn {
  width: 100%;
  padding: 18px;
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 32px;
  box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
  transition: all 0.2s;
}

.continue-btn:hover {
  background: #00a89a;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 184, 169, 0.4);
}
</style>
