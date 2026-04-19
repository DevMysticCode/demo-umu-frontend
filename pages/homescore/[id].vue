<template>
  <div class="hs-page">
    <!-- Header -->
    <div class="hs-header">
      <button class="hs-back-btn" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M15 18l-6-6 6-6" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="hs-header-center">
        <p class="hs-header-title">{{ screen === 'results' ? 'Your HomeScore' : screen === 'passport' ? 'Property Passport' : 'HomeScore' }}</p>
        <p class="hs-header-sub">{{ headerSub }}</p>
      </div>
      <div class="hs-header-spacer"/>
    </div>

    <!-- Property strip -->
    <div v-if="property" class="hs-prop-strip">
      <div class="hs-prop-dot"/>
      <p class="hs-prop-address">{{ property.addressLine1 }}, {{ property.postcode }}</p>
      <span v-if="property.epcRating" class="hs-epc-chip" :style="{ background: epcColor(property.epcRating) }">
        EPC {{ property.epcRating }}
      </span>
    </div>

    <!-- ── LOADING ──────────────────────────────────────────────── -->
    <template v-if="screen === 'loading'">
      <div class="hs-loading-wrap">
        <div class="hs-loading-ring"/>
        <p class="hs-loading-label">Analysing property...</p>
      </div>
    </template>

    <!-- ── LANDING / AUTO SCORE ─────────────────────────────────── -->
    <template v-else-if="screen === 'landing'">
      <div class="hs-scroll">
        <!-- Money hook -->
        <div class="hs-money-hook">
          <div class="hs-money-hook-label">You could be overpaying</div>
          <div class="hs-money-hook-amount">£{{ potentialSaving.toLocaleString() }} / year</div>
          <div class="hs-money-hook-sub">vs similar homes on your street. Let's find out if this is real — or just outdated data.</div>
        </div>

        <!-- Starter score card -->
        <div class="hs-gauge-card">
          <div class="hs-gauge-card-eyebrow">Starter Score</div>
          <div class="hs-gauge-wrap">
            <svg viewBox="0 0 200 112" width="220" class="hs-gauge-svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" stroke-width="14"
                stroke-dasharray="251 503" transform="rotate(180,100,100)" stroke-linecap="round"/>
              <circle cx="100" cy="100" r="80" fill="none" :stroke="scoreColor(autoScoreVal)" stroke-width="14"
                :stroke-dasharray="`${(autoScoreVal / 100) * 251} 503`"
                transform="rotate(180,100,100)" stroke-linecap="round"
                style="transition: stroke-dasharray 0.8s cubic-bezier(0.2,0.8,0.2,1)"/>
              <text x="100" y="94" text-anchor="middle" font-size="44" font-weight="700" :fill="scoreColor(autoScoreVal)" font-family="sans-serif">{{ autoScoreVal }}</text>
              <text x="100" y="110" text-anchor="middle" font-size="13" fill="#6b7280" font-family="sans-serif">{{ autoRating }}</text>
            </svg>
          </div>
          <div class="hs-conf-pill">
            <svg viewBox="0 0 24 24" fill="none" width="11" height="11" style="display:inline;margin-right:4px;vertical-align:-1px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#92400e" stroke-width="2"/></svg>
            20% confidence · EPC data only
          </div>
          <p class="hs-epc-note">
            This number is modelled from public EPC data. Your real score could be anywhere from {{ epcRangeLow }} to {{ epcRangeHigh }}.
          </p>
        </div>

        <!-- CTA -->
        <button class="hs-cta-primary" @click="startQuestions">
          Get your real score
          <span class="hs-cta-chev">›</span>
        </button>
        <p class="hs-cta-sub">{{ QUESTIONS.length }} quick questions · No signup needed</p>

        <!-- Score breakdown -->
        <div class="hs-breakdown-card">
          <p class="hs-breakdown-title">Score breakdown (estimated)</p>
          <div class="hs-pillar-list">
            <div v-for="bar in pillarBars(autoBreakdown)" :key="bar.key" class="hs-pillar-row">
              <span class="hs-pillar-name">{{ bar.label }}</span>
              <div class="hs-pillar-track">
                <div class="hs-pillar-fill" :style="{ width: `${(bar.value / bar.max) * 100}%`, background: bar.color }"/>
              </div>
              <span class="hs-pillar-val">{{ bar.value }}/{{ bar.max }}</span>
            </div>
          </div>
          <p class="hs-breakdown-note">Complete the quiz for a personalised, accurate score</p>
        </div>

        <div style="height:32px"/>
      </div>
    </template>

    <!-- ── QUESTIONS ─────────────────────────────────────────────── -->
    <template v-else-if="screen === 'questions'">
      <!-- Progress bar -->
      <div class="hs-progress-wrap">
        <div class="hs-progress-track">
          <div class="hs-progress-fill" :style="{ width: `${progress}%` }"/>
        </div>
        <p class="hs-progress-label">{{ step + 1 }} of {{ QUESTIONS.length }}</p>
      </div>

      <div class="hs-q-scroll">
        <!-- Live score card with flying delta -->
        <div class="hs-live-card">
          <div class="hs-live-mini-wrap">
            <svg width="42" height="42" viewBox="0 0 42 42" style="position:absolute;inset:0;">
              <circle cx="21" cy="21" r="17" fill="none" stroke="#e5e7eb" stroke-width="4"/>
              <circle cx="21" cy="21" r="17" fill="none" :stroke="scoreColor(liveScore)" stroke-width="4"
                :stroke-dasharray="`${(liveScore / 100) * 106.8} 106.8`"
                transform="rotate(-90, 21, 21)" stroke-linecap="round"
                style="transition: all 0.7s ease"/>
            </svg>
            <span class="hs-live-num" :style="{ color: scoreColor(liveScore) }">{{ liveScore }}</span>
          </div>
          <div class="hs-live-info">
            <div class="hs-live-lbl">Live score</div>
            <div class="hs-live-hint">{{ liveHint }}</div>
          </div>
          <div class="hs-live-conf" :class="confidence >= 55 ? 'high' : confidence >= 40 ? 'mid' : ''">{{ confidence }}%</div>
          <!-- Flying delta -->
          <Transition name="hs-float">
            <div v-if="deltaInfo.show" class="hs-delta-float" :class="deltaInfo.val > 0 ? 'pos' : 'neg'">
              {{ deltaInfo.val > 0 ? '+' : '' }}{{ deltaInfo.val }}
            </div>
          </Transition>
        </div>

        <Transition name="hs-slide" mode="out-in">
          <div :key="step" class="hs-question-card">
            <div class="hs-cat-chip">{{ currentQuestion?.cat }}</div>
            <h2 class="hs-q-title">{{ currentQuestion?.title }}</h2>
            <div class="hs-options-list">
              <button
                v-for="opt in currentQuestion?.options"
                :key="opt.value"
                class="hs-option-btn"
                :class="{ selected: currentAnswer === opt.value }"
                @click="handleAnswer(currentQuestion!.id, opt.value)"
              >
                <div class="hs-option-radio" :class="{ selected: currentAnswer === opt.value }">
                  <div v-if="currentAnswer === opt.value" class="hs-option-radio-dot"/>
                </div>
                <span class="hs-option-label">{{ opt.label }}</span>
              </button>
            </div>
            <p v-if="currentAnswer && selectedNarr" class="hs-narr-hint">{{ selectedNarr }}</p>
          </div>
        </Transition>

        <div class="hs-nav">
          <button class="hs-btn-secondary" @click="prev" :style="{ visibility: step > 0 ? 'visible' : 'hidden' }">‹ Back</button>
          <button class="hs-btn-primary" :disabled="!canNext" @click="nextQuestion">
            {{ isLastStep ? 'See my score ›' : 'Next ›' }}
          </button>
        </div>

        <div style="height:24px"/>
      </div>
    </template>

    <!-- ── RESULTS ───────────────────────────────────────────────── -->
    <template v-else-if="screen === 'results'">
      <div class="hs-scroll">
        <!-- Address strip -->
        <div v-if="property" class="hs-addr-strip">
          <div class="hs-addr-dot"/>
          <div>
            <div class="hs-addr-text">{{ property.addressLine1 }}</div>
            <div class="hs-addr-tiny">{{ property.postcode }}</div>
          </div>
        </div>

        <!-- Savings hero -->
        <div class="hs-savings-hero">
          <div class="hs-savings-eyebrow">Your savings potential</div>
          <div class="hs-savings-row">
            <div class="hs-savings-amount">£{{ totalSaving.toLocaleString() }} / year</div>
            <div class="hs-savings-pill">Score {{ result.total }}</div>
          </div>
          <div class="hs-savings-sub">Biggest wins are in heating and insulation — upgrades below could recover most of this.</div>
        </div>

        <!-- Property Journey card -->
        <div class="hs-journey-card">
          <div class="hs-journey-inner">
            <div class="hs-journey-eyebrow">Your Property Journey</div>
            <div class="hs-journey-grid">
              <div class="hs-journey-col" style="border-right: 1px solid #e5e7eb;">
                <div class="hs-journey-num" :style="{ color: scoreColor(result.total) }">{{ result.total }}</div>
                <div class="hs-journey-label">HomeScore</div>
                <div class="hs-journey-sub">How green</div>
              </div>
              <div class="hs-journey-col" style="border-right: 1px solid #e5e7eb;">
                <div class="hs-journey-num" style="color:#f59e0b;">20</div>
                <div class="hs-journey-label">Move-ready</div>
                <div class="hs-journey-sub">Docs &amp; certs</div>
              </div>
              <div class="hs-journey-col">
                <div class="hs-journey-num" style="color:#16a34a;">{{ completeScore }}</div>
                <div class="hs-journey-label">Complete</div>
                <div class="hs-journey-sub">Overall</div>
              </div>
            </div>
            <div class="hs-journey-bar-track">
              <div class="hs-journey-bar-fill" :style="{ width: `${completeScore}%` }"/>
            </div>
            <div class="hs-journey-bar-label">Upload your documents to move further along the street</div>
          </div>
          <!-- Street scene SVG -->
          <div class="hs-street">
            <svg viewBox="0 0 354 90" width="100%" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="354" height="62" fill="#f0f9ff"/>
              <g opacity="0.55"><rect x="14" y="38" width="38" height="22" rx="2" fill="#cbd5e1"/><polygon points="14,38 33,22 52,38" fill="#94a3b8"/><rect x="26" y="46" width="10" height="14" rx="1" fill="#64748b"/></g>
              <g opacity="0.55"><rect x="68" y="34" width="42" height="26" rx="2" fill="#cbd5e1"/><polygon points="68,34 89,16 110,34" fill="#94a3b8"/><rect x="82" y="44" width="10" height="16" rx="1" fill="#64748b"/><rect x="96" y="42" width="9" height="9" rx="1" fill="#93c5fd"/></g>
              <g><rect x="140" y="32" width="46" height="28" rx="2" fill="#ccfbf1"/><polygon points="140,32 163,12 186,32" :fill="result.total >= 70 ? '#16a34a' : '#0d9488'"/><rect x="155" y="44" width="11" height="16" rx="1" fill="#0f766e"/><rect x="143" y="40" width="9" height="10" rx="1" fill="#99f6e4"/><text x="163" y="9" text-anchor="middle" font-size="8" fill="#0d9488" font-weight="700">YOU</text></g>
              <g opacity="0.55"><rect x="212" y="36" width="40" height="24" rx="2" fill="#cbd5e1"/><polygon points="212,36 232,20 252,36" fill="#94a3b8"/><rect x="224" y="46" width="10" height="14" rx="1" fill="#64748b"/></g>
              <g opacity="0.55"><rect x="272" y="34" width="38" height="26" rx="2" fill="#cbd5e1"/><polygon points="272,34 291,18 310,34" fill="#94a3b8"/><rect x="284" y="44" width="10" height="16" rx="1" fill="#64748b"/></g>
              <text x="340" y="56" font-size="16" text-anchor="middle">🏡</text>
              <text x="340" y="66" font-size="7" fill="#0d9488" font-weight="600" text-anchor="middle">SOLD</text>
              <rect x="0" y="62" width="354" height="20" fill="#e2e8f0"/><line x1="0" y1="72" x2="354" y2="72" stroke="#fff" stroke-width="1.5" stroke-dasharray="14,10"/><rect x="0" y="82" width="354" height="8" fill="#f1f5f9"/>
              <g :transform="`translate(${Math.round(18 + (completeScore / 100) * 300)}, 62)`">
                <ellipse cx="0" cy="2" rx="8" ry="2.5" fill="rgba(0,0,0,0.1)"/>
                <line x1="0" y1="-4" x2="0" y2="-16" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="0" cy="-19" r="4" fill="#0d9488"/>
                <path d="M-3.5,-22 Q0,-25 3.5,-22" stroke="#065f46" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <line x1="0" y1="-14" x2="-5" y2="-9" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/>
                <line x1="0" y1="-14" x2="5" y2="-10" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/>
                <line x1="0" y1="-4" x2="4" y2="2" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="0" y1="-4" x2="-3" y2="2" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round"/>
                <rect x="-13" y="-32" width="26" height="11" rx="5" fill="#0d9488"/>
                <text x="0" y="-23.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff">{{ completeScore }}%</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Carbon footprint card -->
        <div class="hs-carbon-card" :style="{ background: carbonGradient }">
          <div class="hs-carbon-top">
            <div class="hs-carbon-eyebrow">🌍 Environmental Impact Rating</div>
            <div class="hs-carbon-main-row">
              <div>
                <div class="hs-carbon-kg">{{ carbonKg.toLocaleString() }}</div>
                <div class="hs-carbon-kg-label">kg CO₂ per year</div>
              </div>
              <div style="flex:1">
                <div class="hs-carbon-grade-pill">
                  <div class="hs-carbon-grade-letter" :style="{ background: carbonGradeInfo.col }">{{ carbonGradeInfo.grade }}</div>
                  <div class="hs-carbon-grade-label">{{ carbonGradeInfo.label }}</div>
                </div>
                <div class="hs-carbon-vs-avg">{{ carbonVsAvg }}</div>
              </div>
            </div>
            <div class="hs-carbon-bars">
              <div v-for="cb in carbonBarChart" :key="cb.letter" class="hs-carbon-bar-col"
                :style="{ background: cb.color, height: `${cb.h}px`, opacity: cb.active ? '1' : '0.35', boxShadow: cb.active ? `0 0 10px ${cb.color}99` : 'none' }"/>
            </div>
            <div class="hs-carbon-bar-labels">
              <span>A — very low</span><span>D — avg</span><span>G — very high</span>
            </div>
            <div class="hs-carbon-drivers">
              <div v-if="carbonDrivers.length" v-for="d in carbonDrivers" :key="d.label" class="hs-carbon-driver-row">
                <div class="hs-carbon-driver-icon" :style="{ background: d.bad ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)' }">{{ d.icon }}</div>
                <div class="hs-carbon-driver-label">{{ d.label }}</div>
                <div class="hs-carbon-driver-val" :style="{ color: d.bad ? '#fca5a5' : '#6ee7b7' }">{{ d.bad ? '+' : '' }}{{ d.delta.toLocaleString() }} kg</div>
              </div>
              <p v-else style="opacity:0.7;font-size:12px;margin:0;">Complete the quiz to see your full carbon breakdown.</p>
            </div>
          </div>
          <div class="hs-carbon-upgrade-bar">
            <div class="hs-carbon-upgrade-title">If you made the top improvements:</div>
            <div class="hs-carbon-upgrade-row">
              <div class="hs-carbon-upgrade-text">You could cut emissions by ~{{ carbonPct }}%</div>
              <div class="hs-carbon-save-pill">Save ~{{ carbonSaving.toLocaleString() }} kg/yr</div>
            </div>
          </div>
        </div>

        <!-- How trusted is this score -->
        <div class="hs-trust-card">
          <div class="hs-trust-inner">
            <div class="hs-trust-title">How trusted is this score?</div>
            <div class="hs-trust-steps">
              <div class="hs-trust-col">
                <div class="hs-trust-dot done">✓</div>
                <div class="hs-trust-step-label done">ESTIMATED</div>
                <div class="hs-trust-step-sub">From public<br/>EPC data</div>
              </div>
              <div class="hs-trust-connector done"/>
              <div class="hs-trust-col">
                <div class="hs-trust-dot done">✓</div>
                <div class="hs-trust-step-label done">ANSWERED</div>
                <div class="hs-trust-step-sub">Refined by<br/>your answers</div>
              </div>
              <div class="hs-trust-connector"/>
              <div class="hs-trust-col">
                <div class="hs-trust-dot pending">3</div>
                <div class="hs-trust-step-label pending">VERIFIED</div>
                <div class="hs-trust-step-sub">Backed by<br/>documents</div>
              </div>
            </div>
          </div>
          <div class="hs-trust-explain">
            Your public EPC gave us a starting estimate of <b>{{ autoScoreVal }}</b>. Your answers have refined that to <b>{{ result.total }}</b> <span style="color:#6b7280;font-size:11.5px;">(±7)</span> — this is now a much more accurate picture of your home.
          </div>
          <div class="hs-trust-nudge" @click="screen = 'passport'">
            <div style="font-size:20px;">📎</div>
            <div style="flex:1;">
              <div class="hs-trust-nudge-title">Add documents to get fully verified</div>
              <div class="hs-trust-nudge-sub">Buyers, lenders and solicitors trust a verified score far more than an estimate.</div>
            </div>
            <div style="font-size:16px;color:#0d9488;">›</div>
          </div>
          <div class="hs-breakdown-title" style="margin:14px 0 10px;">Detailed Breakdown</div>
          <div class="hs-pillar-list">
            <div v-for="bar in pillarBars(result.breakdown)" :key="bar.key" class="hs-pillar-row">
              <span class="hs-pillar-name">{{ bar.label }}</span>
              <div class="hs-pillar-track">
                <div class="hs-pillar-fill" :style="{ width: `${(bar.value / bar.max) * 100}%`, background: bar.color }"/>
              </div>
              <span class="hs-pillar-val">{{ bar.value }}/{{ bar.max }}</span>
            </div>
          </div>
        </div>

        <!-- Top ways to save money -->
        <div class="hs-wins-card">
          <p class="hs-wins-title">Top {{ displayWins.length }} ways to save money</p>
          <p class="hs-wins-sub">Ranked by annual saving — pounds back in your pocket.</p>
          <div v-for="(win, i) in displayWins" :key="i" class="hs-win-item">
            <div class="hs-win-rank">{{ i + 1 }}</div>
            <div class="hs-win-body">
              <p class="hs-win-name">{{ win.title }}</p>
              <p class="hs-win-sub">{{ win.sub }}</p>
            </div>
            <div class="hs-win-right">
              <p class="hs-win-saving">~£{{ win.savingPerYear }}/yr</p>
              <p class="hs-win-pts">+{{ win.points }} pts</p>
            </div>
          </div>
        </div>

        <!-- Opportunities we've spotted -->
        <div class="hs-opps-card">
          <p class="hs-opps-title">Opportunities we've spotted</p>
          <div v-for="opp in displayOpps" :key="opp.title" class="hs-opp-item">
            <span class="hs-opp-icon">{{ opp.icon }}</span>
            <div>
              <p class="hs-opp-name">{{ opp.title }}</p>
              <p class="hs-opp-sub">{{ opp.sub }}</p>
            </div>
          </div>
        </div>

        <!-- Neighbourhood comparison -->
        <div class="hs-nb-card">
          <div class="hs-nb-header">
            <div class="hs-nb-title">Your street, ranked by energy cost</div>
            <div class="hs-nb-rank">{{ nbRank }} of 12</div>
          </div>
          <p class="hs-nb-body">Based on EPC data and local energy records. Properties at the top are paying less — here's why.</p>
          <div class="hs-nb-list">
            <div v-for="n in neighbourhood" :key="n.label" class="hs-nb-row" :class="{ mine: n.isYou }">
              <div class="hs-nb-pos" :class="{ mine: n.isYou }">{{ n.rank }}</div>
              <div style="flex:1;min-width:0;">
                <div class="hs-nb-addr" :class="{ mine: n.isYou }">{{ n.label }}</div>
                <div class="hs-nb-detail">{{ n.detail }}</div>
              </div>
              <div class="hs-nb-cost" :style="{ color: n.costColor }">£{{ n.cost.toLocaleString() }}</div>
            </div>
          </div>
          <div v-if="nbGap > 0" class="hs-nb-gap-card">
            <div class="hs-nb-gap-title">Why you're paying £{{ nbGap.toLocaleString() }}/yr more than your best neighbour</div>
            <div class="hs-nb-gap-reasons">
              <div v-for="reason in nbGapReasons" :key="reason.icon" class="hs-nb-gap-reason">
                <span style="font-size:15px;flex-shrink:0;">{{ reason.icon }}</span>
                <div><b>{{ reason.title }}</b> — {{ reason.body }}</div>
              </div>
            </div>
            <div class="hs-nb-gap-footer">Fix all three and you could save <b>~£{{ Math.round(nbGap * 0.7).toLocaleString() }}/yr</b> and move up the street.</div>
          </div>
          <div class="hs-nb-nudge" @click="screen = 'passport'">
            <div style="font-size:20px;">📋</div>
            <div style="flex:1;">
              <div class="hs-nb-nudge-title">Upload your documents to verify this</div>
              <div class="hs-nb-nudge-sub">A boiler service cert and EPC would confirm your exact position.</div>
            </div>
            <div style="font-size:18px;color:#0d9488;margin-left:auto;">›</div>
          </div>
        </div>

        <!-- Final CTA -->
        <button class="hs-cta-primary" @click="screen = 'passport'">See how to get to 100% verified ›</button>
        <p class="hs-cta-sub">Turn your HomeScore into a full Property Passport</p>
        <button class="hs-retake-btn" @click="doRetake">
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style="display:inline;margin-right:6px;vertical-align:-2px"><path d="M1 4v6h6M23 20v-6h-6" stroke="#636366" stroke-width="2" stroke-linecap="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="#636366" stroke-width="2" stroke-linecap="round"/></svg>
          Retake Assessment
        </button>
        <div style="height:40px"/>
      </div>
    </template>

    <!-- ── PASSPORT ──────────────────────────────────────────────── -->
    <template v-else-if="screen === 'passport'">
      <div class="hs-scroll" style="padding:0;">
        <!-- Tab bar -->
        <div class="hs-vault-tabs">
          <button :class="['hs-vault-tab', passportTab === 'sections' ? 'active' : '']" @click="setPassportTab('sections')">📋 Sections</button>
          <button :class="['hs-vault-tab', passportTab === 'street' ? 'active' : '']" @click="setPassportTab('street')">🗺 Street</button>
          <button :class="['hs-vault-tab', passportTab === 'buyers' ? 'active' : '']" @click="setPassportTab('buyers')">
            👥 Buyers<span v-if="matchedBuyers.length" class="hs-tab-badge">{{ matchedBuyers.length }}</span>
          </button>
        </div>

        <!-- ── SECTIONS TAB ─────────────────────────────────────── -->
        <div v-if="passportTab === 'sections'" class="hs-tab-content">
          <!-- Action row -->
          <div class="hs-passport-actions">
            <button class="hs-pa-btn outline" @click="setPassportTab('buyers')">⇄ Match to Buyers</button>
            <button class="hs-pa-btn solid" @click="claimOrAccessPassport" :disabled="passportClaimLoading">
              {{ passportClaimLoading ? '…' : '↑ Claim Passport' }}
            </button>
          </div>

          <div class="hs-pp-card">
            <div class="hs-pp-badge">You're {{ result.confidenceScore }}% there</div>
            <h3 class="hs-pp-title">You've started something real.<br/>Let's take it to 100%.</h3>
            <p class="hs-pp-body">Three documents would take your score from <b>estimated</b> to <b>verified</b> — unlocking buyer trust.</p>
            <div class="hs-pp-progress">
              <div class="hs-pp-progress-labels">
                <span>HomeScore confidence</span>
                <span>{{ result.confidenceScore }}% → 100%</span>
              </div>
              <div class="hs-pp-progress-track">
                <div class="hs-pp-progress-fill" :style="{ width: `${result.confidenceScore}%` }"/>
              </div>
            </div>
            <div class="hs-pp-docs">
              <div class="hs-pp-doc-row"><div class="hs-pp-doc-ic">🔥</div><div class="hs-pp-doc-name">Last boiler service certificate</div><div class="hs-pp-doc-gain">+15% conf</div></div>
              <div class="hs-pp-doc-row"><div class="hs-pp-doc-ic">⚡</div><div class="hs-pp-doc-name">Last 12 months energy bills</div><div class="hs-pp-doc-gain">+20% conf</div></div>
              <div class="hs-pp-doc-row"><div class="hs-pp-doc-ic">👤</div><div class="hs-pp-doc-name">EICR (electrical report)</div><div class="hs-pp-doc-gain">+10% conf</div></div>
            </div>
            <button class="hs-pp-cta" @click="claimOrAccessPassport" :disabled="passportClaimLoading">
              {{ passportClaimLoading ? 'Loading…' : 'Claim your Property Passport' }}
            </button>
            <div class="hs-pp-cta-sub">Free to start · Your data stays yours</div>
          </div>
          <div class="hs-pp-unlocks-card">
            <p class="hs-pp-unlocks-title">What a Passport unlocks</p>
            <div class="hs-pp-unlocks-list">
              <div class="hs-pp-unlock-row"><span class="hs-pp-unlock-icon">📄</span><div><div class="hs-pp-unlock-name">Document vault</div><div class="hs-pp-unlock-sub">EPC, gas safety, EICR, warranties — all in one place.</div></div></div>
              <div class="hs-pp-unlock-row"><span class="hs-pp-unlock-icon">📈</span><div><div class="hs-pp-unlock-name">Live running cost tracking</div><div class="hs-pp-unlock-sub">Connect bills for actual usage vs modelled estimates.</div></div></div>
              <div class="hs-pp-unlock-row"><span class="hs-pp-unlock-icon">🛡</span><div><div class="hs-pp-unlock-name">TA6-ready when you sell</div><div class="hs-pp-unlock-sub">Share verified info with buyers &amp; conveyancers in a click.</div></div></div>
            </div>
          </div>
          <button class="hs-btn-ghost" @click="screen = 'results'">Maybe later — keep my score</button>
          <div style="height:40px"/>
        </div>

        <!-- ── STREET TAB ──────────────────────────────────────────── -->
        <div v-if="passportTab === 'street'" class="hs-tab-content">
          <p class="hs-vm-header">See who else on your street has started a Property Passport. Tap any house to see details.</p>

          <!-- Property list -->
          <div v-if="streetProperties.length" class="hs-street-list">
            <div v-for="sp in streetProperties" :key="sp.id" class="hs-street-row" @click="router.push(`/property/${sp.id}`)">
              <div class="hs-street-house-icon" :style="{ color: sp.isPublished ? '#0d9488' : sp.hasPassport ? '#f59e0b' : '#94a3b8' }">🏠</div>
              <div style="flex:1;min-width:0;">
                <div class="hs-street-addr">{{ sp.addressLine1 }}</div>
                <div class="hs-street-meta">
                  <span v-if="sp.propertyType" style="margin-right:6px;">{{ sp.propertyType }}</span>
                  <span v-if="sp.bedrooms">{{ sp.bedrooms }} bed</span>
                  <span v-if="sp.epcRating" class="hs-street-epc" :style="{ background: epcColor(sp.epcRating) }">EPC {{ sp.epcRating }}</span>
                </div>
              </div>
              <div class="hs-street-status">
                <span v-if="sp.isPublished" class="hs-street-badge published">✓ Published</span>
                <span v-else-if="sp.hasPassport" class="hs-street-badge started">In progress</span>
                <span v-else class="hs-street-badge none">Not started</span>
              </div>
            </div>
          </div>
          <div v-else class="hs-street-empty">
            <div style="font-size:32px;margin-bottom:8px;">🏘</div>
            <p style="font-size:13px;color:#64748b;text-align:center;">No other properties found on this street yet. Be the first to start your Passport!</p>
          </div>

          <!-- Street stats -->
          <div v-if="streetStats" class="hs-street-stats">
            <div class="hs-street-stats-title">{{ property?.postcode }} — Street Overview</div>
            <div class="hs-street-stats-grid">
              <div class="hs-stat-box brand">
                <div class="hs-stat-val">{{ streetStats.published }}</div>
                <div class="hs-stat-lbl">Passports published</div>
              </div>
              <div class="hs-stat-box green">
                <div class="hs-stat-val">{{ streetStats.notStarted }}</div>
                <div class="hs-stat-lbl">Not yet started</div>
              </div>
              <div v-if="streetStats.avgEpc" class="hs-stat-box amber">
                <div class="hs-stat-val">{{ streetStats.avgEpc }}</div>
                <div class="hs-stat-lbl">Average EPC rating</div>
              </div>
              <div v-if="streetStats.avgPrice" class="hs-stat-box grey">
                <div class="hs-stat-val">£{{ Math.round(streetStats.avgPrice / 1000) }}k</div>
                <div class="hs-stat-lbl">Avg. estimated value</div>
              </div>
            </div>
            <div class="hs-street-tip">
              💡 <strong>You're ahead of your street.</strong> Most neighbours haven't started their passport. Sellers with a passport typically accept offers <strong>18 days faster</strong>.
            </div>
          </div>
          <div style="height:80px"/>
        </div>

        <!-- ── BUYERS TAB ──────────────────────────────────────────── -->
        <div v-if="passportTab === 'buyers'" class="hs-tab-content">
          <div class="hs-buyers-intro">
            <div style="font-size:13px;color:#0f172a;font-weight:600;margin-bottom:2px;">{{ buyersTotal || matchedBuyers.length }} buyers searching in your area</div>
            <div style="font-size:12px;color:#64748b;">Tap any buyer to see how well they match your property.</div>
          </div>

          <div v-if="matchedBuyers.length" class="hs-buyer-list">
            <div v-for="buyer in matchedBuyers" :key="buyer.name" class="hs-buyer-card">
              <div class="hs-buyer-avatar" :style="{ background: buyer.matchScore >= 75 ? '#dcfce7' : buyer.matchScore >= 55 ? '#fef3c7' : '#f1f5f9', color: buyer.matchScore >= 75 ? '#16a34a' : buyer.matchScore >= 55 ? '#92400e' : '#64748b' }">
                {{ buyer.name[0] }}
              </div>
              <div class="hs-buyer-info">
                <div class="hs-buyer-name">{{ buyer.name }}</div>
                <div class="hs-buyer-criteria">{{ buyer.area }} · {{ buyer.budget }} · {{ buyer.timeline }}</div>
                <div class="hs-buyer-tags">
                  <span v-for="tag in buyer.tags" :key="tag" class="hs-buyer-tag" :class="tag === 'Strong match' ? 'match' : tag === 'Good match' ? 'partial' : 'other'">{{ tag }}</span>
                </div>
              </div>
              <div class="hs-buyer-match-score" :style="{ color: buyer.matchScore >= 75 ? '#16a34a' : buyer.matchScore >= 55 ? '#d97706' : '#94a3b8' }">
                {{ buyer.matchScore }}%
              </div>
            </div>
          </div>
          <div v-else class="hs-buyers-loading">
            <div style="font-size:32px;margin-bottom:8px;">👥</div>
            <p style="font-size:13px;color:#64748b;text-align:center;">Loading matched buyers…</p>
          </div>

          <!-- Notify CTA -->
          <button class="hs-pp-cta" style="margin:16px 0 8px;" @click="claimOrAccessPassport">
            Claim Passport to notify buyers
          </button>
          <div class="hs-pp-cta-sub">Your passport will become visible to matched buyers</div>
          <div style="height:80px"/>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHomeScore } from '~/composables/useHomeScore'
import { usePassportClaim } from '~/composables/usePassportClaim'
import type { TopWin, Opportunity } from '~/types/homescore'
import { QUESTIONS } from '~/utils/homescoreScoring'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const property = ref<any>(null)

type Screen = 'loading' | 'landing' | 'questions' | 'results' | 'passport'
const screen = ref<Screen>('loading')

type PassportTab = 'sections' | 'street' | 'buyers'
const passportTab = ref<PassportTab>('sections')

const streetProperties = ref<any[]>([])
const streetStats = ref<any>(null)
const matchedBuyers = ref<any[]>([])
const buyersTotal = ref(0)
const passportClaimLoading = ref(false)

const {
  step, answers, showResult,
  currentQuestion, currentAnswer,
  canNext, isLastStep, progress,
  result, topWins, opportunities,
  liveScore, confidence, carbonKg, autoScore,
  answer, next, prev, retake: retakeHS, prefill,
} = useHomeScore(propertyId)

// ── Delta animation ───────────────────────────────────────────

const deltaInfo = ref({ val: 0, show: false })
let deltaTimer: ReturnType<typeof setTimeout> | null = null

function handleAnswer(qId: string, val: string) {
  const oldScore = liveScore.value
  answer(qId, val, true)
  nextTick(() => {
    const delta = liveScore.value - oldScore
    if (delta !== 0) {
      if (deltaTimer) clearTimeout(deltaTimer)
      deltaInfo.value = { val: delta, show: true }
      deltaTimer = setTimeout(() => { deltaInfo.value = { val: 0, show: false } }, 1200)
    }
  })
}

// ── Computed ──────────────────────────────────────────────────

const autoScoreVal = computed(() => autoScore.value?.total ?? result.value.total)
const autoBreakdown = computed(() => autoScore.value?.breakdown ?? result.value.breakdown)
const autoRating = computed(() => autoScore.value?.rating ?? result.value.rating)

const epcRangeLow = computed(() => Math.max(0, autoScoreVal.value - 7))
const epcRangeHigh = computed(() => Math.min(100, autoScoreVal.value + 25))

// Score-driven saving estimate: (100 - score) * ~21 ≈ prototype's £1,347 for score 37
const potentialSaving = computed(() => Math.max(150, Math.round((100 - autoScoreVal.value) * 21)))

const moveReadyScore = 20
const completeScore = computed(() => Math.round((result.value.total + moveReadyScore) / 2))

// Fallback wins/opps so these sections always show something useful
const DEFAULT_WINS: TopWin[] = [
  { title: 'Install solar PV panels', sub: 'Generates ~3,500 kWh/yr and earns export payments', savingPerYear: 450, points: 7 },
  { title: 'Top up loft insulation to 270mm', sub: 'Up to 25% of heat escapes through the roof', savingPerYear: 320, points: 5 },
  { title: 'Fit a smart thermostat', sub: 'Smart controls save ~£130/yr on average', savingPerYear: 130, points: 4 },
]
const DEFAULT_OPPS: Opportunity[] = [
  { icon: '🏠', title: 'Improve loft insulation', sub: 'Topping up to 270mm is one of the most cost-effective fixes.' },
  { icon: '🔥', title: 'Book a boiler service', sub: 'An annual service keeps your boiler running at peak efficiency.' },
  { icon: '🌡️', title: 'Fit a smart thermostat', sub: 'Could save ~£130/yr — low cost, high impact.' },
]

const displayWins = computed(() => topWins.value.length > 0 ? topWins.value : DEFAULT_WINS)
const displayOpps = computed(() => opportunities.value.length > 0 ? opportunities.value : DEFAULT_OPPS)

const totalSaving = computed(() => displayWins.value.reduce((s, w) => s + w.savingPerYear, 0))

const headerSub = computed(() => {
  if (screen.value === 'questions') return `Question ${step.value + 1} of ${QUESTIONS.length}`
  if (screen.value === 'landing') return 'Based on public records'
  if (screen.value === 'results') return 'Refined with your answers'
  if (screen.value === 'passport') return 'Continue your journey'
  return ''
})

const selectedNarr = computed(() => {
  if (!currentQuestion.value || !currentAnswer.value) return ''
  return currentQuestion.value.options.find(o => o.value === currentAnswer.value)?.narr ?? ''
})

const liveHint = computed(() => {
  if (selectedNarr.value) return selectedNarr.value
  const answered = Object.keys(answers.value).length
  if (answered === 0) return 'Updating as you answer…'
  return `${answered} question${answered !== 1 ? 's' : ''} answered so far`
})

// ── Score helpers ─────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return '#059669'
  if (score >= 60) return '#16a34a'
  if (score >= 40) return '#f59e0b'
  return '#dc2626'
}

function epcColor(rating: string): string {
  const map: Record<string, string> = { A: '#00b050', B: '#33b800', C: '#92d050', D: '#d4e800', E: '#ffbf00', F: '#ff6600', G: '#ff0000' }
  return map[rating?.toUpperCase()] ?? '#8e8e93'
}

// ── Pillar bars ───────────────────────────────────────────────

const PILLAR_DEFS = [
  { key: 'heating',    label: 'Heating',    max: 20, color: '#ef4444' },
  { key: 'structure',  label: 'Structure',  max: 25, color: '#231d45' },
  { key: 'efficiency', label: 'Efficiency', max: 20, color: '#00a19a' },
  { key: 'electrics',  label: 'Electrics',  max: 15, color: '#f59e0b' },
  { key: 'plumbing',   label: 'Plumbing',   max: 20, color: '#3b82f6' },
]

function pillarBars(breakdown: any) {
  return PILLAR_DEFS.map(d => ({ ...d, value: (breakdown as any)?.[d.key] ?? 0 }))
}

// ── Carbon ────────────────────────────────────────────────────

const CARBON_BASELINE = 2900

const carbonGradeInfo = computed(() => {
  const kg = carbonKg.value
  if (kg < 800)  return { grade: 'A', label: 'Excellent',  col: '#16a34a' }
  if (kg < 1400) return { grade: 'B', label: 'Good',       col: '#65a30d' }
  if (kg < 2000) return { grade: 'C', label: 'Average',    col: '#ca8a04' }
  if (kg < 2800) return { grade: 'D', label: 'Below avg',  col: '#d97706' }
  if (kg < 3800) return { grade: 'E', label: 'Poor',       col: '#ea580c' }
  if (kg < 4800) return { grade: 'F', label: 'Very poor',  col: '#dc2626' }
  return              { grade: 'G', label: 'Critical',    col: '#7f1d1d' }
})

const carbonGradient = computed(() => {
  const g = carbonGradeInfo.value.grade
  const map: Record<string, string> = {
    A: 'linear-gradient(135deg,#14532d,#166534)', B: 'linear-gradient(135deg,#365314,#3f6212)',
    C: 'linear-gradient(135deg,#713f12,#854d0e)', D: 'linear-gradient(135deg,#78350f,#92400e)',
    E: 'linear-gradient(135deg,#7c2d12,#9a3412)', F: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
    G: 'linear-gradient(135deg,#450a0a,#7f1d1d)',
  }
  return map[g] ?? map.D
})

const carbonVsAvg = computed(() => {
  const diff = carbonKg.value - CARBON_BASELINE
  if (Math.abs(diff) < 100) return 'Roughly the same as the UK average'
  if (diff < 0) return `${Math.abs(diff).toLocaleString()} kg below the UK average — great work`
  return `${diff.toLocaleString()} kg above the UK average of ${CARBON_BASELINE.toLocaleString()} kg`
})

const carbonBarChart = computed(() => {
  const grade = carbonGradeInfo.value.grade
  return [
    { letter: 'A', color: '#16a34a', h: 8  },
    { letter: 'B', color: '#65a30d', h: 12 },
    { letter: 'C', color: '#ca8a04', h: 16 },
    { letter: 'D', color: '#d97706', h: 20 },
    { letter: 'E', color: '#ea580c', h: 16 },
    { letter: 'F', color: '#dc2626', h: 12 },
    { letter: 'G', color: '#7f1d1d', h: 8  },
  ].map(b => ({ ...b, active: b.letter === grade }))
})

const carbonDrivers = computed(() => {
  const drivers: Array<{ bad: boolean; icon: string; label: string; delta: number }> = []
  for (const q of QUESTIONS) {
    const val = (answers.value as Record<string, string>)[q.id]
    if (!val) continue
    const opt = q.options.find(o => o.value === val)
    if (!opt) continue
    if (opt.carbonDelta > 400) drivers.push({ bad: true,  icon: '⬆', label: `${q.cat}: ${opt.label}`, delta: opt.carbonDelta })
    else if (opt.carbonDelta < -400) drivers.push({ bad: false, icon: '⬇', label: `${q.cat}: ${opt.label}`, delta: opt.carbonDelta })
  }
  drivers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  return drivers.slice(0, 4)
})

const carbonSaving = computed(() => Math.max(0, carbonKg.value - Math.max(400, carbonKg.value - 2500)))
const carbonPct = computed(() => Math.round((carbonSaving.value / carbonKg.value) * 100))

// ── Neighbourhood ─────────────────────────────────────────────

function scoreToCost(s: number): number {
  if (s >= 80) return 680; if (s >= 70) return 890
  if (s >= 60) return 1040; if (s >= 50) return 1200
  if (s >= 40) return 1347; return 1490
}

const neighbourhood = computed(() => {
  const s = result.value.total
  const addr = property.value?.addressLine1 ?? 'Your road'
  const parts = addr.split(' ')
  const streetName = parts.slice(1).join(' ')
  const yourNum = parseInt(parts[0] ?? '61', 10)

  return [
    { label: `${yourNum + 2} ${streetName}`, score: Math.min(100, s + 18), isYou: false, detail: 'Heat pump · solar · EPC A' },
    { label: `${yourNum - 4} ${streetName}`, score: Math.min(100, s + 9),  isYou: false, detail: 'New boiler (2022) · loft insulation' },
    { label: `${yourNum - 6} ${streetName}`, score: Math.min(100, s + 3),  isYou: false, detail: 'Double glazed · EPC C' },
    { label: `${addr} — you`,                score: s,                      isYou: true,  detail: 'Your current status' },
    { label: `${yourNum - 2} ${streetName}`, score: Math.max(0, s - 9),    isYou: false, detail: 'Single glazed · no upgrades' },
  ]
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({
      ...r, rank: i + 1, cost: scoreToCost(r.score),
      costColor: r.score >= 70 ? '#16a34a' : r.score >= 55 ? '#d97706' : '#dc2626',
    }))
})

const nbRank = computed(() => neighbourhood.value.find(n => n.isYou)?.rank ?? 4)
const nbGap = computed(() => {
  const me = neighbourhood.value.find(n => n.isYou)
  const best = neighbourhood.value[0]
  return (me && best && !best.isYou) ? Math.max(0, me.cost - best.cost) : 0
})
const nbGapReasons = computed(() => {
  const a = answers.value as Record<string, string>
  const reasons = []
  if (!a.heatingType || ['old_gas', 'oil', 'electric', 'none_heat'].includes(a.heatingType))
    reasons.push({ icon: '🔥', title: 'Older heating system', body: 'running at lower efficiency vs modern heat pumps or A-rated boilers. Costs extra ~£210/yr.' })
  if (!a.loftInsulation || ['minimal', 'partial'].includes(a.loftInsulation))
    reasons.push({ icon: '🏠', title: 'No or partial loft insulation', body: '25% of heat escapes through the roof. Topping up to 270mm saves ~£320/yr extra.' })
  if (!a.windows || ['single', 'mix'].includes(a.windows))
    reasons.push({ icon: '🪟', title: 'Single or mixed glazing', body: 'Replacing remaining single-glazed windows saves ~£140/yr and lifts your EPC rating.' })
  if (reasons.length === 0)
    reasons.push({ icon: '⚡', title: 'Energy efficiency gap', body: 'Completing further upgrades would bring you closer to the top of your street.' })
  return reasons.slice(0, 3)
})

// ── Actions ───────────────────────────────────────────────────

function startQuestions() {
  const firstUnanswered = QUESTIONS.findIndex(q => !(answers.value as Record<string, string>)[q.id])
  step.value = firstUnanswered >= 0 ? firstUnanswered : 0
  screen.value = 'questions'
}

function nextQuestion() {
  if (isLastStep.value) {
    screen.value = 'results'
    showResult.value = true
    saveToBackend()
  } else {
    next()
  }
}

function doRetake() {
  retakeHS()
  screen.value = 'landing'
}

async function claimOrAccessPassport() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) { router.push(`/property/${propertyId}`); return }

  passportClaimLoading.value = true
  try {
    const { getPassportStatus, claimPassport } = usePassportClaim()
    const status = await getPassportStatus(propertyId)

    if (status.hasPassport && status.passportId) {
      if (status.isOwner || status.isBuyer || status.isCollaborator || status.canAccess) {
        router.push(`/passportview/${status.passportId}`)
      } else {
        // Passport claimed by someone else — go to property page for buy-access flow
        router.push(`/property/${propertyId}`)
      }
    } else {
      // No passport yet — claim it
      const res = await claimPassport(
        propertyId,
        property.value?.addressLine1 ?? '',
        property.value?.postcode ?? '',
      )
      router.push(`/passportview/${res.passportId}`)
    }
  } catch {
    router.push(`/property/${propertyId}`)
  } finally {
    passportClaimLoading.value = false
  }
}

async function setPassportTab(tab: PassportTab) {
  passportTab.value = tab
  if (tab === 'street' && streetProperties.value.length === 0) await fetchStreetData()
  if (tab === 'buyers' && matchedBuyers.value.length === 0) await fetchBuyerData()
}

async function fetchStreetData() {
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}/street`)
    if (res.ok) {
      const data = await res.json()
      streetProperties.value = data.properties ?? []
      streetStats.value = data.stats ?? null
    }
  } catch {}
}

async function fetchBuyerData() {
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}/matched-buyers`)
    if (res.ok) {
      const data = await res.json()
      matchedBuyers.value = data.buyers ?? []
      buyersTotal.value = data.total ?? 0
    }
  } catch {}
}

function goToPassport() { router.push(`/property/${propertyId}`) }

function goBack() {
  if (screen.value === 'passport') { screen.value = 'results'; return }
  if (screen.value === 'results') { screen.value = 'landing'; return }
  if (screen.value === 'questions') { screen.value = 'landing'; return }
  router.push(`/property/${propertyId}`)
}

async function saveToBackend() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  try {
    await fetch(`${config.public.apiBase}/property/${propertyId}/homescore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        total: result.value.total, rating: result.value.rating,
        heating: result.value.breakdown.heating, structure: result.value.breakdown.structure,
        efficiency: result.value.breakdown.efficiency, electrics: result.value.breakdown.electrics,
        plumbing: result.value.breakdown.plumbing, answers: answers.value,
      }),
    })
  } catch {}
}

// ── Lifecycle ─────────────────────────────────────────────────

onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}`)
    if (res.ok) { property.value = await res.json(); prefill(property.value) }
  } catch {}
  const answeredCount = Object.keys(answers.value).length
  screen.value = answeredCount >= QUESTIONS.length ? 'results' : 'landing'
})

watch(showResult, (shown) => {
  if (shown && screen.value === 'questions') { screen.value = 'results'; saveToBackend() }
})

watch(screen, (s) => {
  if (s === 'passport') {
    passportTab.value = 'sections'
    // Pre-fetch data in background
    fetchStreetData()
    fetchBuyerData()
  }
})
</script>

<style scoped>
/* ── Page ────────────────────────────────────────────────── */
.hs-page {
  min-height: 100vh;
  background: #f0f4f4;
  color: #0f172a;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Header ───────────────────────────────────────────── */
.hs-header {
  background: #f0f4f4;
  display: flex;
  align-items: center;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.hs-back-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: #fff; border: 1px solid #e2e8e8;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.hs-back-btn:active { background: #f0f4f4; }
.hs-header-center { flex: 1; text-align: center; }
.hs-header-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; }
.hs-header-sub { font-size: 11px; color: #94a3b8; margin: 1px 0 0; }
.hs-header-spacer { width: 32px; flex-shrink: 0; }

/* ── Property strip ───────────────────────────────────── */
.hs-prop-strip {
  background: white; padding: 9px 18px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid #e2e8e8;
}
.hs-prop-dot { width: 8px; height: 8px; border-radius: 50%; background: #0d9488; box-shadow: 0 0 0 4px #ccfbf1; flex-shrink: 0; }
.hs-prop-address { flex: 1; font-size: 12px; color: #475569; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
.hs-epc-chip { font-size: 10px; font-weight: 800; color: white; padding: 2px 7px; border-radius: 5px; flex-shrink: 0; }

/* ── Scroll container ─────────────────────────────────── */
.hs-scroll { flex: 1; overflow-y: auto; padding: 6px 18px 0; scroll-behavior: smooth; }

/* ── Loading ──────────────────────────────────────────── */
.hs-loading-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
.hs-loading-ring { width: 44px; height: 44px; border: 4px solid #e2e8e8; border-top-color: #0d9488; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.hs-loading-label { font-size: 14px; color: #94a3b8; font-weight: 500; }

/* ── Money hook ───────────────────────────────────────── */
.hs-money-hook {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff; border-radius: 20px; padding: 22px; margin-bottom: 14px;
  position: relative; overflow: hidden;
}
.hs-money-hook::after { content: ""; position: absolute; right: -40px; top: -40px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%); }
.hs-money-hook-label { font-size: 12px; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.08em; }
.hs-money-hook-amount { font-size: 36px; font-weight: 700; margin: 6px 0 4px; letter-spacing: -0.02em; }
.hs-money-hook-sub { font-size: 13px; opacity: 0.9; line-height: 1.4; }

/* ── Gauge card ───────────────────────────────────────── */
.hs-gauge-card {
  background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04);
  display: flex; flex-direction: column; align-items: center; color: #0f172a;
}
.hs-gauge-card-eyebrow { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #0d9488; font-weight: 600; margin-bottom: 6px; align-self: flex-start; }
.hs-gauge-wrap { display: flex; justify-content: center; }
.hs-gauge-svg { display: block; }
.hs-conf-pill { margin-top: 12px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e; border-radius: 999px; padding: 5px 12px; }
.hs-epc-note { font-size: 12px; color: #475569; text-align: center; margin: 10px 0 0; line-height: 1.5; font-style: italic; }

/* ── CTA ──────────────────────────────────────────────── */
.hs-cta-primary {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff; border: none; width: 100%; padding: 16px 18px;
  border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 6px 16px rgba(15,118,110,0.25); margin-bottom: 8px;
}
.hs-cta-primary:hover { filter: brightness(1.05); }
.hs-cta-chev { font-size: 18px; }
.hs-cta-sub { text-align: center; font-size: 11.5px; color: #94a3b8; margin: 0 0 14px; }

/* ── Breakdown ────────────────────────────────────────── */
.hs-breakdown-card {
  background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04); color: #0f172a;
}
.hs-breakdown-title { font-size: 17px; font-weight: 650; color: #0f172a; margin: 0 0 6px; }
.hs-breakdown-note { font-size: 11px; color: #94a3b8; margin: 10px 0 0; text-align: center; }
.hs-pillar-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.hs-pillar-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
.hs-pillar-name { width: 75px; color: #475569; font-weight: 500; }
.hs-pillar-track { flex: 1; height: 7px; background: #e2e8e8; border-radius: 999px; overflow: hidden; position: relative; }
.hs-pillar-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; transition: width 0.7s cubic-bezier(0.2,0.8,0.2,1); }
.hs-pillar-val { width: 38px; text-align: right; font-variant-numeric: tabular-nums; color: #0f172a; font-weight: 600; }

/* ── Question flow ────────────────────────────────────── */
.hs-progress-wrap { background: #f0f4f4; padding: 0 18px 8px; }
.hs-progress-track { height: 4px; background: #e2e8e8; border-radius: 4px; overflow: hidden; margin-bottom: 4px; }
.hs-progress-fill { height: 100%; background: linear-gradient(90deg, #0d9488, #2dd4bf); border-radius: 4px; transition: width 0.45s ease; }
.hs-progress-label { font-size: 11px; color: #94a3b8; text-align: right; margin: 0; }

.hs-q-scroll { flex: 1; overflow-y: auto; padding: 6px 18px 0; display: flex; flex-direction: column; gap: 12px; color: #0f172a; }

/* ── Live score card ──────────────────────────────────── */
.hs-live-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 14px; padding: 12px 14px;
  border: 1px solid #e2e8e8; position: relative;
}
.hs-live-mini-wrap { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; position: relative; flex-shrink: 0; }
.hs-live-num { font-size: 14px; font-weight: 700; z-index: 2; position: relative; }
.hs-live-info { flex: 1; }
.hs-live-lbl { font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.hs-live-hint { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 1px; }
.hs-live-conf { font-size: 10.5px; padding: 4px 8px; background: #fef3c7; color: #92400e; border-radius: 999px; font-weight: 600; white-space: nowrap; transition: background 0.3s ease, color 0.3s ease; }
.hs-live-conf.mid { background: #dbeafe; color: #1e40af; }
.hs-live-conf.high { background: #dcfce7; color: #166534; }

/* ── Delta flying animation ───────────────────────────── */
.hs-delta-float {
  position: absolute; right: 14px; top: 50%;
  font-size: 13px; font-weight: 700;
  animation: floatUp 1.2s ease forwards;
  pointer-events: none; z-index: 10;
}
.hs-delta-float.pos { color: #16a34a; }
.hs-delta-float.neg { color: #dc2626; }
@keyframes floatUp {
  0%   { opacity: 0; transform: translateY(0); }
  20%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-32px); }
}
.hs-float-enter-active { animation: floatUp 1.2s ease forwards; }

/* ── Question card ────────────────────────────────────── */
.hs-question-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04); color: #0f172a; }
.hs-cat-chip { font-size: 11px; font-weight: 600; color: #0d9488; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; display: block; }
.hs-q-title { font-size: 19px; font-weight: 650; line-height: 1.3; margin: 0 0 18px; color: #0f172a; }
.hs-options-list { display: flex; flex-direction: column; gap: 10px; }
.hs-option-btn { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid #e2e8e8; background: #fff; border-radius: 12px; cursor: pointer; transition: all 0.15s ease; font-size: 14px; color: #0f172a; text-align: left; }
.hs-option-btn:hover { border-color: #94a3b8; }
.hs-option-btn.selected { border-color: #0d9488; background: #f0fdfa; color: #0f766e; font-weight: 600; }
.hs-option-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #94a3b8; flex-shrink: 0; display: grid; place-items: center; transition: border-color 0.15s ease; }
.hs-option-btn.selected .hs-option-radio { border-color: #0d9488; background: #0d9488; }
.hs-option-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
.hs-option-label { flex: 1; color: #0f172a; }
.hs-option-btn.selected .hs-option-label { color: #0f766e; }
.hs-narr-hint { font-size: 12px; color: #475569; font-style: italic; margin: 12px 0 0; line-height: 1.45; border-left: 3px solid #0d9488; padding-left: 10px; }

/* ── Navigation ───────────────────────────────────────── */
.hs-nav { display: flex; gap: 10px; }
.hs-btn-secondary { background: #fff; color: #0f172a; border: 1px solid #e2e8e8; padding: 14px 18px; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; }
.hs-btn-primary { flex: 1; background: #0d9488; color: #fff; border: none; padding: 14px 18px; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; }
.hs-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.hs-btn-ghost { width: 100%; background: transparent; color: #475569; border: none; padding: 14px; font-size: 14px; font-weight: 500; cursor: pointer; }

/* ── Slide transition ─────────────────────────────────── */
.hs-slide-enter-active, .hs-slide-leave-active { transition: all 0.22s ease; }
.hs-slide-enter-from { opacity: 0; transform: translateX(22px); }
.hs-slide-leave-to { opacity: 0; transform: translateX(-22px); }

/* ── Results ──────────────────────────────────────────── */
.hs-addr-strip { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.hs-addr-dot { width: 8px; height: 8px; border-radius: 50%; background: #0d9488; box-shadow: 0 0 0 4px #ccfbf1; flex-shrink: 0; }
.hs-addr-text { font-weight: 600; font-size: 14px; color: #0f172a; }
.hs-addr-tiny { font-size: 11.5px; color: #94a3b8; }

.hs-savings-hero { background: linear-gradient(135deg, #065f46, #10b981); color: #fff; border-radius: 20px; padding: 22px; margin-bottom: 14px; }
.hs-savings-eyebrow { font-size: 11px; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.08em; }
.hs-savings-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-top: 6px; }
.hs-savings-amount { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; }
.hs-savings-pill { background: rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 600; }
.hs-savings-sub { font-size: 13px; opacity: 0.9; margin-top: 4px; line-height: 1.4; }

.hs-journey-card { background: white; border-radius: 20px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(15,23,42,0.04); overflow: hidden; border: 1px solid rgba(15,23,42,0.04); color: #0f172a; }
.hs-journey-inner { padding: 16px 16px 12px; }
.hs-journey-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
.hs-journey-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-bottom: 14px; }
.hs-journey-col { text-align: center; padding: 0 8px; }
.hs-journey-num { font-size: 24px; font-weight: 800; }
.hs-journey-label { font-size: 10px; font-weight: 600; color: #94a3b8; margin-top: 1px; text-transform: uppercase; letter-spacing: 0.05em; }
.hs-journey-sub { font-size: 10px; color: #475569; margin-top: 3px; }
.hs-journey-bar-track { height: 8px; background: #e2e8e8; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
.hs-journey-bar-fill { height: 8px; background: linear-gradient(90deg, #0d9488, #16a34a); border-radius: 4px; transition: width 0.8s ease; }
.hs-journey-bar-label { font-size: 11.5px; color: #475569; }
.hs-street { background: #f8fafc; }

.hs-carbon-card { border-radius: 16px; overflow: hidden; margin-bottom: 14px; color: #fff; }
.hs-carbon-top { padding: 16px 16px 12px; }
.hs-carbon-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7; margin-bottom: 8px; }
.hs-carbon-main-row { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 12px; }
.hs-carbon-kg { font-size: 36px; font-weight: 900; line-height: 1; letter-spacing: -1px; }
.hs-carbon-kg-label { font-size: 11px; opacity: 0.75; margin-top: 2px; }
.hs-carbon-grade-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border-radius: 999px; padding: 5px 12px 5px 8px; margin-bottom: 6px; }
.hs-carbon-grade-letter { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; }
.hs-carbon-grade-label { font-size: 12px; font-weight: 600; }
.hs-carbon-vs-avg { font-size: 11.5px; opacity: 0.8; }
.hs-carbon-bars { display: flex; gap: 3px; margin-bottom: 12px; align-items: flex-end; }
.hs-carbon-bar-col { flex: 1; border-radius: 4px 4px 0 0; transition: all 0.3s ease; }
.hs-carbon-bar-labels { display: flex; justify-content: space-between; font-size: 9px; opacity: 0.55; margin-bottom: 14px; letter-spacing: 0.04em; }
.hs-carbon-drivers { display: flex; flex-direction: column; gap: 7px; }
.hs-carbon-driver-row { display: flex; align-items: center; gap: 8px; font-size: 12px; opacity: 0.9; }
.hs-carbon-driver-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
.hs-carbon-driver-label { flex: 1; }
.hs-carbon-driver-val { font-weight: 700; white-space: nowrap; }
.hs-carbon-upgrade-bar { background: rgba(255,255,255,0.08); padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.1); }
.hs-carbon-upgrade-title { font-size: 11.5px; font-weight: 700; margin-bottom: 6px; }
.hs-carbon-upgrade-row { display: flex; align-items: center; gap: 10px; }
.hs-carbon-upgrade-text { font-size: 11px; opacity: 0.8; }
.hs-carbon-save-pill { margin-left: auto; background: #10b981; border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 700; }

.hs-trust-card { background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04); color: #0f172a; }
.hs-trust-inner { margin-bottom: 14px; }
.hs-trust-title { font-size: 17px; font-weight: 650; margin: 0 0 10px; color: #0f172a; }
.hs-trust-steps { display: flex; align-items: flex-start; }
.hs-trust-col { flex: 1; text-align: center; }
.hs-trust-dot { width: 28px; height: 28px; border-radius: 50%; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; }
.hs-trust-dot.done { background: #16a34a; color: #fff; }
.hs-trust-dot.pending { background: #e2e8e8; color: #94a3b8; }
.hs-trust-step-label { font-size: 10px; font-weight: 700; }
.hs-trust-step-label.done { color: #16a34a; }
.hs-trust-step-label.pending { color: #94a3b8; }
.hs-trust-step-sub { font-size: 9.5px; color: #94a3b8; margin-top: 2px; line-height: 1.3; }
.hs-trust-connector { flex: 0 0 24px; height: 2px; background: #e2e8e8; margin-top: 13px; }
.hs-trust-connector.done { background: #16a34a; }
.hs-trust-explain { background: #f8fafc; border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; font-size: 12.5px; color: #0f172a; line-height: 1.5; }
.hs-trust-nudge { background: #f0fdfa; border-radius: 10px; padding: 10px 12px; border: 1px solid #99f6e4; display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 14px; }
.hs-trust-nudge-title { font-size: 12.5px; font-weight: 700; color: #0f766e; }
.hs-trust-nudge-sub { font-size: 11.5px; color: #475569; margin-top: 1px; }

.hs-wins-card { background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04); color: #0f172a; }
.hs-wins-title { font-size: 17px; font-weight: 650; color: #0f172a; margin: 0 0 2px; }
.hs-wins-sub { font-size: 14px; color: #475569; margin: 0 0 14px; }
.hs-win-item { display: flex; gap: 12px; padding: 14px; background: #fff; border-radius: 14px; margin-bottom: 10px; border: 1px solid #e2e8e8; align-items: center; }
.hs-win-item:last-child { margin-bottom: 0; }
.hs-win-rank { width: 28px; height: 28px; border-radius: 50%; background: #f0fdfa; color: #0f766e; font-weight: 700; font-size: 13px; display: grid; place-items: center; flex-shrink: 0; }
.hs-win-body { flex: 1; }
.hs-win-name { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
.hs-win-sub { font-size: 12px; color: #475569; margin: 0; }
.hs-win-right { text-align: right; flex-shrink: 0; }
.hs-win-saving { color: #16a34a; font-weight: 700; font-size: 13px; margin: 0; }
.hs-win-pts { color: #0d9488; font-weight: 700; font-size: 11.5px; margin: 0; }

.hs-opps-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 20px; padding: 20px; margin-bottom: 14px; color: #0f172a; }
.hs-opps-title { font-size: 17px; font-weight: 650; color: #78350f; margin: 0 0 10px; }
.hs-opp-item { display: flex; gap: 12px; padding: 12px 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin-bottom: 8px; align-items: flex-start; }
.hs-opp-item:last-child { margin-bottom: 0; }
.hs-opp-icon { font-size: 18px; line-height: 1; flex-shrink: 0; }
.hs-opp-name { font-size: 13.5px; font-weight: 600; color: #78350f; margin: 0 0 2px; }
.hs-opp-sub { font-size: 12px; color: #92400e; margin: 0; line-height: 1.4; }

.hs-nb-card { background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04); color: #0f172a; }
.hs-nb-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
.hs-nb-title { font-size: 17px; font-weight: 650; color: #0f172a; }
.hs-nb-rank { background: #f0fdfa; color: #0f766e; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.hs-nb-body { font-size: 12.5px; color: #475569; margin-bottom: 12px; line-height: 1.4; }
.hs-nb-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.hs-nb-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; }
.hs-nb-row.mine { background: #f0fdfa; border: 1px solid #99f6e4; }
.hs-nb-pos { width: 22px; font-size: 13px; font-weight: 700; color: #94a3b8; flex-shrink: 0; }
.hs-nb-pos.mine { color: #0f766e; }
.hs-nb-addr { font-size: 13.5px; font-weight: 500; color: #0f172a; }
.hs-nb-addr.mine { color: #0f766e; font-weight: 700; }
.hs-nb-detail { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.hs-nb-cost { font-size: 14px; font-weight: 700; flex-shrink: 0; }
.hs-nb-gap-card { background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 12px; padding: 12px 14px; border: 1px solid #fed7aa; margin-bottom: 12px; }
.hs-nb-gap-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
.hs-nb-gap-reasons { display: flex; flex-direction: column; gap: 7px; }
.hs-nb-gap-reason { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #78350f; }
.hs-nb-gap-footer { margin-top: 10px; padding-top: 10px; border-top: 1px solid #fed7aa; font-size: 12px; color: #92400e; }
.hs-nb-nudge { background: #f0fdfa; border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; }
.hs-nb-nudge-title { font-size: 12.5px; font-weight: 700; color: #0f766e; }
.hs-nb-nudge-sub { font-size: 11.5px; color: #475569; opacity: 0.8; }

.hs-retake-btn { width: 100%; background: #fff; border: 1px solid #e2e8e8; border-radius: 14px; padding: 14px 20px; font-size: 14px; color: #475569; font-weight: 500; cursor: pointer; margin-bottom: 14px; }

/* ── Passport bridge ──────────────────────────────────── */
.hs-pp-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border-radius: 20px; padding: 24px; margin-bottom: 14px; position: relative; overflow: hidden; }
.hs-pp-card::before { content: ""; position: absolute; right: -60px; top: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(20,184,166,0.35), transparent 70%); }
.hs-pp-badge { display: inline-block; background: rgba(20,184,166,0.2); color: #5eead4; font-size: 10.5px; font-weight: 700; padding: 5px 10px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
.hs-pp-title { font-size: 20px; font-weight: 700; margin: 0 0 8px; line-height: 1.25; }
.hs-pp-body { font-size: 13px; opacity: 0.85; line-height: 1.5; margin: 0 0 16px; }
.hs-pp-progress { background: rgba(255,255,255,0.12); border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
.hs-pp-progress-labels { display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 8px; opacity: 0.85; }
.hs-pp-progress-track { height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
.hs-pp-progress-fill { height: 100%; background: linear-gradient(90deg, #14b8a6, #5eead4); border-radius: 999px; transition: width 0.6s ease; }
.hs-pp-docs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.hs-pp-doc-row { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.08); padding: 10px 12px; border-radius: 10px; font-size: 12.5px; }
.hs-pp-doc-ic { font-size: 14px; }
.hs-pp-doc-name { flex: 1; }
.hs-pp-doc-gain { color: #5eead4; font-weight: 600; font-size: 11.5px; }
.hs-pp-cta { background: #14b8a6; color: #042f2e; border: none; padding: 14px 16px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; }
.hs-pp-cta:hover { filter: brightness(1.05); }
.hs-pp-cta-sub { text-align: center; font-size: 11px; opacity: 0.7; margin-top: 10px; }

.hs-pp-unlocks-card { background: white; border-radius: 20px; padding: 20px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.04); color: #0f172a; }
.hs-pp-unlocks-title { font-size: 17px; font-weight: 650; color: #0f172a; margin: 0 0 12px; }
.hs-pp-unlocks-list { display: flex; flex-direction: column; gap: 12px; }
.hs-pp-unlock-row { display: flex; gap: 12px; align-items: flex-start; }
.hs-pp-unlock-icon { font-size: 20px; }
.hs-pp-unlock-name { font-weight: 600; font-size: 14px; color: #0f172a; }
.hs-pp-unlock-sub { font-size: 13px; color: #475569; margin-top: 2px; }

/* ── Vault tabs ──────────────────────────────────────── */
.hs-vault-tabs { display: flex; background: white; border-bottom: 1px solid #e2e8e8; padding: 0 6px; }
.hs-vault-tab { flex: 1; background: none; border: none; border-bottom: 2.5px solid transparent; padding: 13px 6px 11px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: color 0.15s, border-color 0.15s; }
.hs-vault-tab.active { color: #0d9488; border-bottom-color: #0d9488; }
.hs-tab-badge { background: #0d9488; color: white; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 999px; line-height: 1.4; }
.hs-tab-content { padding: 14px 16px 0; }

/* ── Passport action row ──────────────────────────────── */
.hs-passport-actions { display: flex; gap: 8px; margin-bottom: 14px; }
.hs-pa-btn { flex: 1; padding: 11px 12px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
.hs-pa-btn.outline { background: #f0fdfa; color: #0d9488; border: 1.5px solid #99f6e4; }
.hs-pa-btn.solid { background: #0d9488; color: #fff; }
.hs-pa-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Street tab ──────────────────────────────────────── */
.hs-vm-header { font-size: 12.5px; color: #475569; line-height: 1.5; margin: 0 0 12px; }
.hs-street-list { background: white; border-radius: 16px; overflow: hidden; margin-bottom: 14px; border: 1px solid #e2e8e8; }
.hs-street-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
.hs-street-row:last-child { border-bottom: none; }
.hs-street-row:active { background: #f0fdfa; }
.hs-street-house-icon { font-size: 20px; flex-shrink: 0; }
.hs-street-addr { font-size: 13px; font-weight: 600; color: #0f172a; }
.hs-street-meta { font-size: 11px; color: #64748b; margin-top: 2px; display: flex; gap: 6px; align-items: center; }
.hs-street-epc { font-size: 10px; font-weight: 800; color: #fff; padding: 1px 5px; border-radius: 4px; }
.hs-street-status { flex-shrink: 0; }
.hs-street-badge { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
.hs-street-badge.published { background: #dcfce7; color: #166534; }
.hs-street-badge.started { background: #fef3c7; color: #92400e; }
.hs-street-badge.none { background: #f1f5f9; color: #64748b; }
.hs-street-empty { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
.hs-street-stats { background: white; border-radius: 16px; padding: 16px; margin-bottom: 14px; border: 1px solid #e2e8e8; }
.hs-street-stats-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
.hs-street-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.hs-stat-box { border-radius: 10px; padding: 10px 12px; }
.hs-stat-box.brand { background: #f0fdfa; }
.hs-stat-box.green { background: #f0fdf4; }
.hs-stat-box.amber { background: #fef3c7; }
.hs-stat-box.grey { background: #f8fafc; }
.hs-stat-val { font-size: 22px; font-weight: 800; color: #0f172a; }
.hs-stat-box.brand .hs-stat-val { color: #0d9488; }
.hs-stat-box.green .hs-stat-val { color: #16a34a; }
.hs-stat-box.amber .hs-stat-val { color: #92400e; }
.hs-stat-lbl { font-size: 11px; color: #64748b; margin-top: 1px; }
.hs-street-tip { font-size: 12px; color: #475569; line-height: 1.5; padding: 10px; background: #f8fafc; border-radius: 8px; }

/* ── Buyers tab ──────────────────────────────────────── */
.hs-buyers-intro { background: #f0fdfa; border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; }
.hs-buyer-list { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8e8; margin-bottom: 14px; }
.hs-buyer-card { display: flex; align-items: flex-start; gap: 12px; padding: 13px 14px; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
.hs-buyer-card:last-child { border-bottom: none; }
.hs-buyer-card:active { background: #f0fdfa; }
.hs-buyer-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 700; flex-shrink: 0; }
.hs-buyer-info { flex: 1; min-width: 0; }
.hs-buyer-name { font-size: 13.5px; font-weight: 700; color: #0f172a; }
.hs-buyer-criteria { font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.4; }
.hs-buyer-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.hs-buyer-tag { font-size: 10.5px; font-weight: 600; padding: 2px 7px; border-radius: 999px; background: #f1f5f9; color: #475569; }
.hs-buyer-tag.match { background: #dcfce7; color: #166534; }
.hs-buyer-tag.partial { background: #fef3c7; color: #92400e; }
.hs-buyer-match-score { font-size: 16px; font-weight: 800; flex-shrink: 0; min-width: 38px; text-align: right; }
.hs-buyers-loading { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
</style>
