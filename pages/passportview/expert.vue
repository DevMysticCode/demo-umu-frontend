<template>
  <div class="mobile-container expert-page bg-umu-gradient">
    <AppHeader :showBack="true" right="dots" />

    <div class="expert-content">
      <!-- Profile card -->
      <div class="expert-profile-card">
        <div class="expert-avatar-wrap">
          <div class="expert-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" stroke-width="1.5"/>
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="expert-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="white"/>
            </svg>
            Expert
          </div>
        </div>
        <h1 class="expert-name">Sarah Mitchell</h1>
        <p class="expert-role">Senior Property Conveyancing Specialist</p>
        <div class="expert-tags">
          <span class="expert-tag">RICS Accredited</span>
          <span class="expert-tag">12 Years Experience</span>
          <span class="expert-tag">Law Society Member</span>
        </div>
        <div class="expert-stats">
          <div class="expert-stat">
            <span class="expert-stat-val">340+</span>
            <span class="expert-stat-lbl">Cases resolved</span>
          </div>
          <div class="expert-stat-divider" />
          <div class="expert-stat">
            <span class="expert-stat-val">4.9★</span>
            <span class="expert-stat-lbl">Client rating</span>
          </div>
          <div class="expert-stat-divider" />
          <div class="expert-stat">
            <span class="expert-stat-val">3 days</span>
            <span class="expert-stat-lbl">Avg. response</span>
          </div>
        </div>
      </div>

      <!-- Specialisms -->
      <div class="expert-section">
        <h2 class="expert-section-title">Areas of Expertise</h2>
        <div class="specialism-list">
          <div v-for="s in specialisms" :key="s.title" class="specialism-item">
            <div class="specialism-icon" v-html="s.icon" />
            <div>
              <p class="specialism-title">{{ s.title }}</p>
              <p class="specialism-desc">{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact form -->
      <div class="expert-section">
        <h2 class="expert-section-title">Get in Touch</h2>
        <p class="expert-section-sub">
          Have a question about your property transaction? Send a message and Sarah will respond within 3 working days.
        </p>

        <div v-if="submitted" class="enquiry-success">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#00a19a"/>
            <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3 class="enquiry-success-title">Enquiry Sent!</h3>
          <p class="enquiry-success-sub">Sarah will review your message and get back to you within 3 working days.</p>
        </div>

        <form v-else class="enquiry-form" @submit.prevent="submitEnquiry">
          <div class="form-field">
            <label class="form-label">Your Name</label>
            <input v-model="form.name" class="form-input" type="text" placeholder="Full name" required />
          </div>
          <div class="form-field">
            <label class="form-label">Email Address</label>
            <input v-model="form.email" class="form-input" type="email" placeholder="your@email.com" required />
          </div>
          <div class="form-field">
            <label class="form-label">Property Address (optional)</label>
            <input v-model="form.property" class="form-input" type="text" placeholder="e.g. 12 Oak Street, TW18 1AB" />
          </div>
          <div class="form-field">
            <label class="form-label">Topic</label>
            <select v-model="form.topic" class="form-input form-select" required>
              <option value="">Select a topic…</option>
              <option value="boundaries">Boundaries &amp; disputes</option>
              <option value="fixtures">Fixtures &amp; fittings</option>
              <option value="planning">Planning &amp; building control</option>
              <option value="legal">Legal title &amp; tenure</option>
              <option value="environmental">Environmental concerns</option>
              <option value="completion">Completion &amp; timelines</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Your Question</label>
            <textarea
              v-model="form.message"
              class="form-input form-textarea"
              placeholder="Describe your question or concern in as much detail as possible…"
              rows="5"
              required
            />
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? 'Sending…' : 'Send Enquiry' }}
          </button>
        </form>
      </div>

      <!-- Response time notice -->
      <div class="notice-card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="1.5"/>
          <path d="M12 17v-5" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="8" r="1" fill="#00a19a"/>
        </svg>
        <p class="notice-text">
          Enquiries are reviewed Monday–Friday. For urgent matters contact your solicitor directly.
          umu experts provide guidance only and do not constitute legal advice.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/core/AppHeader.vue'

definePageMeta({ middleware: 'auth' })

const specialisms = [
  {
    title: 'Property Information Forms',
    desc: 'TA6, TA10, and all Law Society forms',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00a19a" stroke-width="1.5"/><polyline points="14,2 14,8 20,8" stroke="#00a19a" stroke-width="1.5"/><line x1="8" y1="13" x2="16" y2="13" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="17" x2="12" y2="17" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    title: 'Boundaries & Disputes',
    desc: 'Ownership, responsibility, and neighbour matters',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#00a19a" stroke-width="1.5"/><path d="M3 12h18M12 3v18" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    title: 'Fixtures & Fittings',
    desc: 'What stays, what goes, and what\'s negotiable',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#00a19a" stroke-width="1.5"/><polyline points="9,22 9,12 15,12 15,22" stroke="#00a19a" stroke-width="1.5"/></svg>',
  },
  {
    title: 'Planning & Building Regs',
    desc: 'Extensions, alterations, and compliance issues',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="1.5"/><path d="M12 8v4l3 3" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
]

const form = ref({ name: '', email: '', property: '', topic: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)
const formError = ref('')

async function submitEnquiry() {
  if (!form.value.name || !form.value.email || !form.value.topic || !form.value.message) {
    formError.value = 'Please fill in all required fields.'
    return
  }
  formError.value = ''
  submitting.value = true
  // Simulate API call — replace with real backend endpoint when ready
  await new Promise(r => setTimeout(r, 1200))
  submitting.value = false
  submitted.value = true
}
</script>

<style scoped>
.expert-page { background: #f2f6f6; padding-bottom: 40px; min-height: 100vh; }
.expert-content { padding: 0 16px; }

/* Profile card */
.expert-profile-card {
  background: white; border-radius: 20px; padding: 28px 20px 20px;
  text-align: center; margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.expert-avatar-wrap { position: relative; display: inline-block; margin-bottom: 14px; }
.expert-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #00a19a, #00d4c8);
  display: flex; align-items: center; justify-content: center;
}
.expert-badge {
  position: absolute; bottom: -4px; right: -4px;
  background: #7c3aed; color: white; border-radius: 12px;
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  display: flex; align-items: center; gap: 3px;
  border: 2px solid white;
}
.expert-name { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
.expert-role { font-size: 13px; color: #666; margin: 0 0 14px; }
.expert-tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 20px; }
.expert-tag {
  font-size: 11px; font-weight: 600; color: #00a19a;
  background: #e6f7f6; border-radius: 20px; padding: 4px 10px;
}
.expert-stats { display: flex; align-items: center; justify-content: center; gap: 16px; }
.expert-stat { text-align: center; }
.expert-stat-val { display: block; font-size: 16px; font-weight: 700; color: #1a1a1a; }
.expert-stat-lbl { display: block; font-size: 10px; color: #999; margin-top: 2px; }
.expert-stat-divider { width: 1px; height: 32px; background: #f0f0f0; }

/* Sections */
.expert-section { background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
.expert-section-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
.expert-section-sub { font-size: 13px; color: #666; margin: 0 0 18px; line-height: 1.5; }

/* Specialisms */
.specialism-list { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
.specialism-item { display: flex; align-items: flex-start; gap: 12px; }
.specialism-icon { width: 36px; height: 36px; background: #f0fffe; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.specialism-title { font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0 0 2px; }
.specialism-desc { font-size: 12px; color: #888; margin: 0; }

/* Form */
.enquiry-form { display: flex; flex-direction: column; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 13px; font-weight: 600; color: #444; }
.form-input {
  width: 100%; padding: 12px 14px; font-size: 14px; color: #1a1a1a;
  border: 1.5px solid #e0e0e0; border-radius: 10px; outline: none;
  background: white; transition: border-color 0.15s;
  font-family: inherit;
}
.form-input:focus { border-color: #00a19a; }
.form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23999' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
.form-textarea { resize: vertical; min-height: 100px; }
.form-error { font-size: 13px; color: #e53e3e; margin: 0; }

.submit-btn {
  width: 100%; padding: 14px; background: #00a19a; color: white;
  border: none; border-radius: 12px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
  margin-top: 4px;
}
.submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.submit-btn:active:not(:disabled) { background: #00877f; }

/* Success state */
.enquiry-success {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 32px 16px; text-align: center;
}
.enquiry-success-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
.enquiry-success-sub { font-size: 13px; color: #666; margin: 0; line-height: 1.6; }

/* Notice */
.notice-card {
  display: flex; gap: 10px; align-items: flex-start;
  background: #f0fffe; border: 1px solid #b2e4e1; border-radius: 12px;
  padding: 14px 16px;
}
.notice-text { font-size: 12px; color: #555; line-height: 1.6; margin: 0; }
</style>
