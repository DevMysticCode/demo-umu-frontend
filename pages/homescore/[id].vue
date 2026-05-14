<template>
  <div class="hs-page">
    <!-- Global header — hidden during the quiz, which has its own top nav -->
    <div v-if="screen !== 'questions'" class="hs-header">
      <button class="hs-back-btn" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path
            d="M15 18l-6-6 6-6"
            stroke="#475569"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="hs-header-center">
        <p class="hs-header-title">
          {{
            screen === 'results'
              ? 'Your HomeScore'
              : screen === 'passport'
                ? 'Property Passport'
                : screen === 'buyer-results'
                  ? 'Property Report'
                  : screen === 'quick-wins'
                    ? 'Boost your score'
                    : screen === 'move-ready'
                      ? 'Get move ready'
                      : 'HomeScore'
          }}
        </p>
        <p class="hs-header-sub">{{ headerSub }}</p>
      </div>
      <button
        v-if="screen === 'landing' || screen === 'results' || screen === 'buyer-results'"
        class="hs-tour-btn"
        type="button"
        title="How does this work?"
        @click="resultTour.restart()"
      >?</button>
      <div v-else class="hs-header-spacer" />
    </div>

    <!-- Tour overlay (renders only when active) -->
    <TourCoach :tour="resultTour" />

    <!-- Property strip -->
    <!-- <div v-if="property" class="hs-prop-strip">
      <div class="hs-prop-dot" />
      <p class="hs-prop-address">
        {{ property.addressLine1 }}, {{ property.postcode }}
      </p>
      <span
        v-if="property.epcRating"
        class="hs-epc-chip"
        :style="{ background: epcColor(property.epcRating) }"
      >
        EPC {{ property.epcRating }}
      </span>
    </div> -->

    <!-- ── LOADING ──────────────────────────────────────────────── -->
    <template v-if="screen === 'loading'">
      <div class="hs-loading-wrap">
        <div class="hs-loading-ring" />
        <p class="hs-loading-label">Analysing property...</p>
      </div>
    </template>

    <!-- ── LANDING / AUTO SCORE — prototype-aligned (3a/3b/3c) ──── -->
    <template v-else-if="screen === 'landing'">
      <ResultDetail
        :property="property"
        :score="autoScoreVal"
        :epc-rating="property?.epcRating ?? null"
        :state="resolvedPassportState"
        :estimated-annual-cost="resolvedAnnualCost"
        :street-avg-cost="1673"
        :epc-year="resolvedEpcYear"
        @claim="startQuestions"
        @owner-dashboard="claimOrAccessPassport"
        @interested="goToBuyerView"
        @see-street="goToStreetCompare"
        @see-running-costs="goToRunningCosts"
        @refine-score="onRefineScore"
      />
    </template>

    <!-- ── QUESTIONS — prototype-style: teal address card + live gauge ── -->
    <template v-else-if="screen === 'questions'">
      <div class="sim-root">
        <!-- Top nav -->
        <div class="sim-topnav">
          <button class="sim-back-btn" @click="screen = 'landing'" aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div class="sim-eyebrow-pill"><span class="dot" />HomeScore</div>
          <div style="width: 32px;" />
        </div>

        <!-- Amber address card — consistent with ResultDetail -->
        <div v-if="property" class="sim-addr-card">
          <div class="sim-addr-top">
            <div class="sim-addr-pin" />
            <div class="sim-addr-block">
              <div class="sim-addr-line">{{ property.addressLine1 || 'Your property' }}</div>
              <div class="sim-addr-meta">
                {{ property.postcode || '' }}
                <template v-if="property.propertyType"> · {{ property.propertyType }}</template>
                <template v-if="property.bedrooms"> · {{ property.bedrooms }} bed</template>
              </div>
            </div>
          </div>
        </div>

        <!-- Hero -->
        <div class="sim-hero">
          <div class="sim-hero-eyebrow">🎯 Your HomeScore accuracy check</div>
          <div class="sim-hero-body">
            Your EPC is from <b>{{ simEpcYear }}</b>. A lot may have changed. Tell
            us what's been done — we'll give you a score based on reality, not
            old assumptions. This also makes your street comparison more accurate.
          </div>
          <div class="sim-score-row">
            <div class="sim-score-dial">
              <svg viewBox="0 0 80 80">
                <circle class="dial-bg" cx="40" cy="40" r="32" stroke-width="7" />
                <circle
                  class="dial-fill"
                  cx="40"
                  cy="40"
                  r="32"
                  stroke-width="7"
                  :stroke="simScoreColor"
                  stroke-dasharray="201.06"
                  :stroke-dashoffset="201.06 - (simScore / 100) * 201.06"
                />
              </svg>
              <div class="sim-score-label">
                <div class="sim-score-num">{{ simScore }}</div>
                <div class="sim-score-denom">/ 100</div>
              </div>
            </div>
            <div class="sim-score-info">
              <div class="sim-score-band">{{ simScoreBand }}</div>
              <div class="sim-score-grade">
                {{
                  simAnsweredCount === 0
                    ? 'Answer the questions below to update'
                    : `${simAnsweredCount} of ${simSteps.length} answered`
                }}
              </div>
            </div>
          </div>
          <div class="sim-stats-row">
            <div class="sim-stat">
              <div class="sim-stat-label">Est. bills</div>
              <div class="sim-stat-val" :class="{ improved: simBillsDelta > 0 }">
                £{{ simBills.toLocaleString() }}
              </div>
              <div class="sim-stat-delta">
                <template v-if="simBillsDelta > 0"
                  >−£{{ simBillsDelta.toLocaleString() }}/yr</template
                >
              </div>
            </div>
            <div class="sim-stat">
              <div class="sim-stat-label">CO₂/yr</div>
              <div class="sim-stat-val" :class="{ improved: simCo2Delta > 0 }">
                {{ simCo2.toFixed(1) }}t
              </div>
              <div class="sim-stat-delta">
                <template v-if="simCo2Delta > 0"
                  >−{{ simCo2Delta.toFixed(1) }}t</template
                >
              </div>
            </div>
            <div class="sim-stat">
              <div class="sim-stat-label">vs neighbours</div>
              <div
                class="sim-stat-val"
                :style="{
                  fontSize: '12px',
                  color: simVsNeighbours > 0 ? '#C73E36' : '#00a19a',
                }"
              >
                <template v-if="simVsNeighbours > 0"
                  >£{{ simVsNeighbours }} more</template
                >
                <template v-else-if="simVsNeighbours < 0"
                  >£{{ Math.abs(simVsNeighbours) }} less</template
                >
                <template v-else>At average</template>
              </div>
              <div class="sim-stat-delta">vs street avg</div>
            </div>
          </div>
        </div>

        <!-- Two paths — quiz vs bill upload -->
        <div class="sim-paths">
          <div class="sim-paths-eyebrow">Two ways to update your score</div>
          <div class="sim-paths-row">
            <div
              class="sim-path"
              :class="{ active: simPath === 'quiz' }"
              @click="simSelectPath('quiz')"
            >
              <div class="sim-path-icon">📋</div>
              <div class="sim-path-title">Answer questions</div>
              <div class="sim-path-sub">Work through the list below</div>
            </div>
            <div class="sim-paths-or">or</div>
            <div
              class="sim-path bill"
              :class="{ active: simPath === 'bill' }"
              @click="simSelectPath('bill')"
            >
              <div class="sim-path-icon">💡</div>
              <div class="sim-path-title">Upload a bill</div>
              <div class="sim-path-sub">Skip the questions</div>
            </div>
          </div>
        </div>

        <!-- Progress + step cards (collapsed when bill path is selected) -->
        <div v-show="simPath !== 'bill'" class="sim-questions-block">
          <div class="sim-progress-row">
            <div class="sim-progress-label">
              Has your home had these improvements?
            </div>
            <div class="sim-progress-count">
              {{ simAnsweredCount }} of {{ simSteps.length }} answered
            </div>
          </div>
          <div class="sim-progress-track">
            <div
              class="sim-progress-fill"
              :style="{ width: `${simProgressPct}%` }"
            />
          </div>

          <div class="sim-steps">
            <div
              v-for="(s, idx) in simSteps"
              :key="s.id"
              class="sim-step"
              :class="[s.status, { open: openStepId === s.id }]"
              @click="simToggleStep(s.id)"
            >
              <div class="sim-step-top">
                <div class="sim-step-num">{{ idx + 1 }}</div>
                <div class="sim-step-body">
                  <div class="sim-step-title">{{ s.title }}</div>
                  <div class="sim-step-meta">{{ s.meta }}</div>
                </div>
                <div class="sim-step-badge">{{ simBadge(s.status) }}</div>
              </div>
              <div class="sim-step-expand">
                <div class="sim-step-desc">{{ s.desc }}</div>
                <div class="sim-step-impact">✦ {{ s.impact }}</div>
                <div class="sim-step-question">{{ s.question }}</div>
                <div class="sim-step-btns">
                  <button
                    type="button"
                    class="sim-step-btn done"
                    @click.stop="simAnswer(s.id, 'done')"
                  >
                    ✅ {{ s.doneLabel || 'Yes — done' }}
                  </button>
                  <button
                    type="button"
                    class="sim-step-btn diff"
                    @click.stop="simOpenDiff(s.id)"
                  >
                    🔄 Done something different
                  </button>
                  <button
                    type="button"
                    class="sim-step-btn todo"
                    @click.stop="simAnswer(s.id, 'todo')"
                  >
                    📋 Not yet
                  </button>
                  <button
                    type="button"
                    class="sim-step-btn skip"
                    @click.stop="simAnswer(s.id, 'skip')"
                  >
                    ⊘ Not applicable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bill-upload confirmation — visible after bill path picked -->
        <div v-if="simPath === 'bill' && simBillUploaded" class="sim-bill-confirm">
          <div class="sim-bill-emoji">✅</div>
          <div>
            <div class="sim-bill-title">Bill uploaded — score updated</div>
            <div class="sim-bill-sub">
              Your actual energy spend is now feeding your HomeScore. Tap below
              to see your result.
            </div>
          </div>
        </div>
        <!-- Bill-upload picker — shown if bill path selected but no bill uploaded yet -->
        <div
          v-else-if="simPath === 'bill'"
          class="sim-bill-picker"
          @click="simBillUploaded = true"
        >
          <div class="sim-bill-emoji">📄</div>
          <div>
            <div class="sim-bill-title">Tap to upload a recent energy bill</div>
            <div class="sim-bill-sub">
              We'll read the total spend and update your HomeScore — no manual
              entry needed.
            </div>
          </div>
        </div>

        <!-- Publish prompt — shown after enough answers -->
        <div v-if="simShowPublishPrompt" class="sim-publish">
          <div class="sim-publish-title">🏠 Ready to publish this data?</div>
          <div class="sim-publish-sub">
            Publishing updates your property's data and makes energy cost
            estimates more accurate for everyone nearby. You'll need to verify
            ownership first.
          </div>
          <div class="sim-publish-btns">
            <button type="button" class="sim-publish-go" @click="simSubmit">
              🏠 Claim &amp; publish →
            </button>
            <button
              type="button"
              class="sim-publish-skip"
              @click="simShowPublishPrompt = false"
            >
              Not now
            </button>
          </div>
        </div>

        <!-- EPC nudge — dynamic copy based on state -->
        <div class="sim-epc-nudge">
          <div class="sim-epc-nudge-icon">🏷️</div>
          <div style="flex: 1;">
            <div class="sim-epc-nudge-title">{{ simEpcNudge.title }}</div>
            <div class="sim-epc-nudge-body">{{ simEpcNudge.body }}</div>
          </div>
        </div>

        <!-- CTA + reset -->
        <div class="sim-cta">
          <button type="button" class="sim-cta-btn" @click="simSubmit">
            🏠 Get my real HomeScore
          </button>
          <button type="button" class="sim-reset-btn" @click="simReset">
            ↺ Start again
          </button>
        </div>

        <div style="height: 24px;" />
      </div>

      <!-- "Done something different" modal -->
      <Transition name="sim-modal">
        <div v-if="simDiffOpen" class="sim-diff-modal" @click="simCloseDiff">
          <div class="sim-diff-card" @click.stop>
            <div class="sim-diff-handle" />
            <div class="sim-diff-title">What did you do instead?</div>
            <div class="sim-diff-body">
              Tell us what improvement you made — even if it's not on the EPC
              list. This updates your score and helps your neighbours compare
              their options.
            </div>
            <textarea
              v-model="simDiffText"
              class="sim-diff-textarea"
              placeholder="e.g. Replaced hot water cylinder completely, installed underfloor heating, added a heat pump..."
            />
            <div class="sim-diff-tip">
              <span class="sim-diff-tip-icon">💡</span>
              <div class="sim-diff-tip-text">
                <b>This won't show on your EPC</b> until it's reassessed. A new
                EPC costs around <b>£50</b> and could move your rating from F to
                C — improving your score, your property's value, and your
                street's data for everyone.
              </div>
            </div>
            <div class="sim-diff-actions">
              <button
                type="button"
                class="sim-diff-save"
                @click="simConfirmDiff"
              >
                Save my answer
              </button>
              <button
                type="button"
                class="sim-diff-cancel"
                @click="simCloseDiff"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <!-- ── RESULTS ───────────────────────────────────────────────── -->
    <template v-else-if="screen === 'results'">
      <div class="hs-scroll">
        <!-- Address strip -->
        <div v-if="property" class="hs-addr-strip">
          <div class="hs-addr-dot" />
          <div>
            <div class="hs-addr-text">{{ property.addressLine1 }}</div>
            <div class="hs-addr-tiny">
              {{ property.postcode
              }}<template v-if="property.propertyType">
                &middot; {{ property.propertyType }}</template
              ><template v-if="property.bedrooms">
                &middot; {{ property.bedrooms }} bed</template
              >
            </div>
          </div>
        </div>

        <!-- Savings hero -->
        <div class="hs-savings-hero">
          <div class="hs-savings-eyebrow">Your savings potential</div>
          <div class="hs-savings-row">
            <div class="hs-savings-amount">
              <template v-if="yearlyPotential > 0"
                >£{{ yearlyPotential.toLocaleString() }} / year</template
              >
              <template v-else>Save money with verified upgrades</template>
            </div>
            <div class="hs-savings-pill">Score {{ result.total }}</div>
          </div>
          <div class="hs-savings-sub">
            Biggest wins are in heating and insulation — upgrades below could
            recover most of this.
          </div>
        </div>

        <!-- Property Journey card -->
        <div class="hs-journey-card" @click="screen = 'passport'">
          <div class="hs-journey-inner">
            <div class="hs-journey-head">
              <div class="hs-journey-eyebrow">Your Property Journey</div>
              <div class="hs-journey-link">What's this? →</div>
            </div>
            <div class="hs-journey-grid">
              <div
                class="hs-journey-col"
                style="border-right: 1px solid var(--line, #e5e7eb)"
              >
                <div class="hs-journey-num-wrap">
                  <div
                    class="hs-journey-num"
                    :style="{ color: scoreColor(result.total) }"
                  >
                    {{ result.total }}
                  </div>
                  <div class="hs-journey-num-small">/100</div>
                </div>
                <div class="hs-journey-label">HomeScore</div>
                <div class="hs-journey-sub">Energy score</div>
              </div>
              <div
                class="hs-journey-col"
                style="border-right: 1px solid var(--line, #e5e7eb)"
              >
                <div class="hs-journey-num hs-journey-num-muted">0%</div>
                <div class="hs-journey-label">Move Ready</div>
                <div class="hs-journey-sub">Docs &amp; certs</div>
              </div>
              <div class="hs-journey-col">
                <div class="hs-journey-num hs-journey-num-muted">0%</div>
                <div class="hs-journey-label">Passport</div>
                <div class="hs-journey-sub">Ownership verified</div>
              </div>
            </div>
            <div class="hs-journey-bar-track">
              <div
                class="hs-journey-bar-fill"
                :style="{ width: `${completeScore}%` }"
              />
            </div>
            <div class="hs-journey-bar-label">
              Upload documents and verify your home to start your journey
            </div>
          </div>
          <!-- Walking lady street scene SVG -->
          <div class="hs-street">
            <svg viewBox="0 0 354 90" width="100%" style="display: block">
              <rect x="0" y="0" width="354" height="62" fill="#f0f9ff" />
              <g opacity="0.55">
                <rect
                  x="14"
                  y="38"
                  width="38"
                  height="22"
                  rx="2"
                  fill="#cbd5e1"
                />
                <polygon points="14,38 33,22 52,38" fill="#94a3b8" />
                <rect
                  x="26"
                  y="46"
                  width="10"
                  height="14"
                  rx="1"
                  fill="#64748b"
                />
              </g>
              <g opacity="0.55">
                <rect
                  x="68"
                  y="34"
                  width="42"
                  height="26"
                  rx="2"
                  fill="#cbd5e1"
                />
                <polygon points="68,34 89,16 110,34" fill="#94a3b8" />
                <rect
                  x="82"
                  y="44"
                  width="10"
                  height="16"
                  rx="1"
                  fill="#64748b"
                />
                <rect
                  x="96"
                  y="42"
                  width="9"
                  height="9"
                  rx="1"
                  fill="#93c5fd"
                />
              </g>
              <g>
                <rect
                  x="140"
                  y="32"
                  width="46"
                  height="28"
                  rx="2"
                  fill="#ccfbf1"
                />
                <polygon points="140,32 163,12 186,32" fill="#1f7a66" />
                <rect
                  x="155"
                  y="44"
                  width="11"
                  height="16"
                  rx="1"
                  fill="#0f766e"
                />
                <rect
                  x="143"
                  y="40"
                  width="9"
                  height="10"
                  rx="1"
                  fill="#99f6e4"
                />
                <text
                  x="163"
                  y="9"
                  text-anchor="middle"
                  font-size="8"
                  fill="#1f7a66"
                  font-weight="700"
                >
                  YOU
                </text>
              </g>
              <g opacity="0.55">
                <rect
                  x="212"
                  y="36"
                  width="40"
                  height="24"
                  rx="2"
                  fill="#cbd5e1"
                />
                <polygon points="212,36 232,20 252,36" fill="#94a3b8" />
                <rect
                  x="224"
                  y="46"
                  width="10"
                  height="14"
                  rx="1"
                  fill="#64748b"
                />
              </g>
              <g opacity="0.55">
                <rect
                  x="272"
                  y="34"
                  width="38"
                  height="26"
                  rx="2"
                  fill="#cbd5e1"
                />
                <polygon points="272,34 291,18 310,34" fill="#94a3b8" />
                <rect
                  x="284"
                  y="44"
                  width="10"
                  height="16"
                  rx="1"
                  fill="#64748b"
                />
              </g>
              <text x="340" y="56" font-size="16" text-anchor="middle">🏡</text>
              <text
                x="340"
                y="66"
                font-size="7"
                fill="#1f7a66"
                font-weight="600"
                text-anchor="middle"
              >
                SOLD
              </text>
              <rect x="0" y="62" width="354" height="20" fill="#e2e8f0" />
              <line
                x1="0"
                y1="72"
                x2="354"
                y2="72"
                stroke="#fff"
                stroke-width="1.5"
                stroke-dasharray="14,10"
              />
              <rect x="0" y="82" width="354" height="8" fill="#f1f5f9" />
              <g
                :transform="`translate(${Math.round(18 + (completeScore / 100) * 300)}, 62)`"
              >
                <ellipse cx="0" cy="2" rx="8" ry="2.5" fill="rgba(0,0,0,0.1)" />
                <line
                  x1="0"
                  y1="-4"
                  x2="0"
                  y2="-16"
                  stroke="#1f7a66"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <circle cx="0" cy="-19" r="4" fill="#1f7a66" />
                <path
                  d="M-3.5,-22 Q0,-25 3.5,-22"
                  stroke="#1f7a66"
                  stroke-width="1.5"
                  fill="none"
                  stroke-linecap="round"
                />
                <line
                  x1="0"
                  y1="-14"
                  x2="-5"
                  y2="-9"
                  stroke="#1f7a66"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="0"
                  y1="-14"
                  x2="5"
                  y2="-10"
                  stroke="#1f7a66"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="0"
                  y1="-4"
                  x2="4"
                  y2="2"
                  stroke="#1f7a66"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <line
                  x1="0"
                  y1="-4"
                  x2="-3"
                  y2="2"
                  stroke="#1f7a66"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <rect
                  x="-13"
                  y="-32"
                  width="26"
                  height="11"
                  rx="5"
                  fill="#1f7a66"
                />
                <text
                  x="0"
                  y="-23.5"
                  text-anchor="middle"
                  font-size="7.5"
                  font-weight="700"
                  fill="#fff"
                >
                  {{ completeScore }}%
                </text>
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
              <div style="flex: 1">
                <div class="hs-carbon-grade-pill">
                  <div
                    class="hs-carbon-grade-letter"
                    :style="{ background: carbonGradeInfo.col }"
                  >
                    {{ carbonGradeInfo.grade }}
                  </div>
                  <div class="hs-carbon-grade-label">
                    {{ carbonGradeInfo.label }}
                  </div>
                </div>
                <div class="hs-carbon-vs-avg">{{ carbonVsAvg }}</div>
              </div>
            </div>
            <div class="hs-carbon-bars">
              <div
                v-for="cb in carbonBarChart"
                :key="cb.letter"
                class="hs-carbon-bar-col"
                :style="{
                  background: cb.color,
                  height: `${cb.h}px`,
                  opacity: cb.active ? '1' : '0.35',
                  boxShadow: cb.active ? `0 0 10px ${cb.color}99` : 'none',
                }"
              />
            </div>
            <div class="hs-carbon-bar-labels">
              <span>A — very low</span><span>D — avg</span
              ><span>G — very high</span>
            </div>
            <div class="hs-carbon-drivers">
              <div
                v-for="d in pillarCarbonDrivers"
                :key="d.label"
                class="hs-carbon-driver-row"
              >
                <div class="hs-carbon-driver-label">
                  {{ d.icon }} {{ d.label }} ({{ d.value }}/{{ d.max }})
                </div>
                <div class="hs-carbon-driver-val">
                  {{ d.pct }}% under average
                </div>
              </div>
            </div>
          </div>
          <div class="hs-carbon-upgrade-bar">
            <div class="hs-carbon-upgrade-title">
              If you made the top improvements:
            </div>
            <div class="hs-carbon-upgrade-row">
              <div class="hs-carbon-upgrade-text">
                You could cut emissions by ~40%
              </div>
              <div class="hs-carbon-save-pill">
                Save ~{{ Math.round(carbonKg * 0.4).toLocaleString() }} kg/yr
              </div>
            </div>
          </div>
        </div>

        <!-- Score breakdown -->
        <div class="hs-breakdown-card">
          <p class="hs-breakdown-title">Score breakdown</p>
          <div class="hs-pillar-list">
            <div
              v-for="bar in pillarBars(result.breakdown)"
              :key="bar.key"
              class="hs-pillar-row"
            >
              <span class="hs-pillar-name">{{ bar.label }}</span>
              <div class="hs-pillar-track">
                <div
                  class="hs-pillar-fill"
                  :style="{
                    width: `${(bar.value / bar.max) * 100}%`,
                    background: pillarBarColor(bar.value, bar.max),
                  }"
                />
              </div>
              <span class="hs-pillar-val">{{ bar.value }}/{{ bar.max }}</span>
            </div>
          </div>
          <div class="hs-breakdown-explain">
            <template v-if="allAnswered">
              Your public EPC gave us a starting estimate of
              <b>{{ autoScoreVal }}</b
              >. Your answers refined that to <b>{{ result.total }}</b
              >.
            </template>
            <template v-else>
              This is based on public EPC data only. Answer quick questions to
              refine.
            </template>
          </div>
        </div>

        <!-- Top 3 savings -->
        <div class="hs-wins-card">
          <p class="hs-wins-title">Top 3 ways to save money</p>
          <p class="hs-wins-sub">
            Ranked by annual saving — pounds back in your pocket.
          </p>
          <div
            v-for="(win, i) in displayWins.slice(0, 3)"
            :key="i"
            class="hs-win-item"
          >
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

        <!-- Neighbour comparison -->
        <div v-if="neighbourhood.length" class="hs-nb-card">
          <div class="hs-nb-header">
            <div class="hs-nb-title">Your street, ranked by energy cost</div>
            <div class="hs-nb-rank">{{ nbRank }} of 12</div>
          </div>
          <p class="hs-nb-body">Based on EPC data and local energy records.</p>
          <div class="hs-nb-list">
            <div
              v-for="n in neighbourhood"
              :key="n.label"
              class="hs-nb-row"
              :class="{ mine: n.isYou }"
            >
              <div class="hs-nb-pos" :class="{ mine: n.isYou }">
                {{ n.rank }}
              </div>
              <div style="flex: 1; min-width: 0">
                <div class="hs-nb-addr" :class="{ mine: n.isYou }">
                  {{ n.label }}
                </div>
                <div class="hs-nb-detail">{{ n.detail }}</div>
              </div>
              <div class="hs-nb-cost" :style="{ color: n.costColor }">
                £{{ n.cost.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <div style="height: 108px" />
      </div>

      <!-- Sticky CTA bar -->
      <div class="hs-sticky-cta">
        <button class="hs-sticky-cta-btn" @click="onBoostScore">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <polyline points="12 19 12 5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
          <span>Boost your score</span>
        </button>
        <div class="hs-sticky-cta-sub">
          Upload certs &amp; earn points instantly
        </div>
      </div>
    </template>

    <!-- ── PASSPORT ──────────────────────────────────────────────── -->
    <template v-else-if="screen === 'passport'">
      <div class="hs-scroll" style="padding: 0">
        <!-- Tab bar -->
        <div class="hs-vault-tabs">
          <button
            :class="[
              'hs-vault-tab',
              passportTab === 'sections' ? 'active' : '',
            ]"
            @click="setPassportTab('sections')"
          >
            📋 Sections
          </button>
          <button
            :class="['hs-vault-tab', passportTab === 'street' ? 'active' : '']"
            @click="setPassportTab('street')"
          >
            🗺 Street
          </button>
          <button
            :class="['hs-vault-tab', passportTab === 'buyers' ? 'active' : '']"
            @click="setPassportTab('buyers')"
          >
            👥 Buyers<span v-if="matchedBuyers.length" class="hs-tab-badge">{{
              matchedBuyers.length
            }}</span>
          </button>
        </div>

        <!-- ── SECTIONS TAB ─────────────────────────────────────── -->
        <div v-if="passportTab === 'sections'" class="hs-tab-content">
          <!-- Action row -->
          <div class="hs-passport-actions">
            <button class="hs-pa-btn outline" @click="setPassportTab('buyers')">
              ⇄ Match to Buyers
            </button>
            <button
              class="hs-pa-btn solid"
              @click="claimOrAccessPassport"
              :disabled="passportClaimLoading"
            >
              {{ passportClaimLoading ? '…' : '↑ Claim Passport' }}
            </button>
          </div>

          <div class="hs-pp-card">
            <div class="hs-pp-badge">
              You're {{ result.confidenceScore }}% there
            </div>
            <h3 class="hs-pp-title">
              You've started something real.<br />Let's take it to 100%.
            </h3>
            <p class="hs-pp-body">
              You've just built the foundation of a Property Passport for
              <b>{{ property?.addressLine1 || 'your property' }}</b
              >. Three documents would take your score from <b>estimated</b> to
              <b>verified</b>.
            </p>
            <div class="hs-pp-progress">
              <div class="hs-pp-progress-labels">
                <span>HomeScore confidence</span>
                <span>{{ result.confidenceScore }}% → 100%</span>
              </div>
              <div class="hs-pp-progress-track">
                <div
                  class="hs-pp-progress-fill"
                  :style="{ width: `${result.confidenceScore}%` }"
                />
              </div>
            </div>
            <div class="hs-pp-docs">
              <div class="hs-pp-doc-row">
                <div class="hs-pp-doc-ic">🔥</div>
                <div class="hs-pp-doc-name">
                  Last boiler service certificate
                </div>
                <div class="hs-pp-doc-gain">+15% conf</div>
              </div>
              <div class="hs-pp-doc-row">
                <div class="hs-pp-doc-ic">⚡</div>
                <div class="hs-pp-doc-name">Last 12 months energy bills</div>
                <div class="hs-pp-doc-gain">+20% conf</div>
              </div>
              <div class="hs-pp-doc-row">
                <div class="hs-pp-doc-ic">👤</div>
                <div class="hs-pp-doc-name">EICR (electrical report)</div>
                <div class="hs-pp-doc-gain">+10% conf</div>
              </div>
            </div>
            <button
              class="hs-pp-cta"
              @click="claimOrAccessPassport"
              :disabled="passportClaimLoading"
            >
              {{
                passportClaimLoading
                  ? 'Loading…'
                  : 'Claim your Property Passport'
              }}
            </button>
            <div class="hs-pp-cta-sub">
              Free to start · Your data stays yours
            </div>
          </div>
          <div class="hs-pp-unlocks-card">
            <p class="hs-pp-unlocks-title">What a Passport unlocks</p>
            <div class="hs-pp-unlocks-list">
              <div class="hs-pp-unlock-row">
                <span class="hs-pp-unlock-icon">📄</span>
                <div>
                  <div class="hs-pp-unlock-name">Document vault</div>
                  <div class="hs-pp-unlock-sub">
                    EPC, gas safety, EICR, warranties — all in one place.
                  </div>
                </div>
              </div>
              <div class="hs-pp-unlock-row">
                <span class="hs-pp-unlock-icon">⚡</span>
                <div>
                  <div class="hs-pp-unlock-name">14-day completion</div>
                  <div class="hs-pp-unlock-sub">
                    vs the UK average of 179 days — verified sellers close
                    faster.
                  </div>
                </div>
              </div>
              <div class="hs-pp-unlock-row">
                <span class="hs-pp-unlock-icon">📊</span>
                <div>
                  <div class="hs-pp-unlock-name">
                    Live running cost tracking
                  </div>
                  <div class="hs-pp-unlock-sub">
                    Connect bills for actual usage vs modelled estimates.
                  </div>
                </div>
              </div>
              <div class="hs-pp-unlock-row">
                <span class="hs-pp-unlock-icon">🛡</span>
                <div>
                  <div class="hs-pp-unlock-name">TA6-ready when you sell</div>
                  <div class="hs-pp-unlock-sub">
                    Share verified info with buyers &amp; conveyancers in a
                    click.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="hs-btn-ghost" @click="screen = 'results'">
            Maybe later — keep my score
          </button>
          <div style="height: 40px" />
        </div>

        <!-- ── STREET TAB ──────────────────────────────────────────── -->
        <div v-if="passportTab === 'street'" class="hs-tab-content">
          <p class="hs-vm-header">
            See who else on your street has started a Property Passport. Tap any
            house to see details.
          </p>

          <!-- Property list -->
          <div v-if="streetProperties.length" class="hs-street-list">
            <div
              v-for="sp in streetProperties"
              :key="sp.id"
              class="hs-street-row"
              @click="router.push(`/property/${sp.id}`)"
            >
              <div
                class="hs-street-house-icon"
                :style="{
                  color: sp.isPublished
                    ? '#1f7a66'
                    : sp.hasPassport
                      ? '#f59e0b'
                      : '#94a3b8',
                }"
              >
                🏠
              </div>
              <div style="flex: 1; min-width: 0">
                <div class="hs-street-addr">{{ sp.addressLine1 }}</div>
                <div class="hs-street-meta">
                  <span v-if="sp.propertyType" style="margin-right: 6px">{{
                    sp.propertyType
                  }}</span>
                  <span v-if="sp.bedrooms">{{ sp.bedrooms }} bed</span>
                  <span
                    v-if="sp.epcRating"
                    class="hs-street-epc"
                    :style="{ background: epcColor(sp.epcRating) }"
                    >EPC {{ sp.epcRating }}</span
                  >
                </div>
              </div>
              <div class="hs-street-status">
                <span v-if="sp.isPublished" class="hs-street-badge published"
                  >✓ Published</span
                >
                <span v-else-if="sp.hasPassport" class="hs-street-badge started"
                  >In progress</span
                >
                <span v-else class="hs-street-badge none">Not started</span>
              </div>
            </div>
          </div>
          <div v-else class="hs-street-empty">
            <div style="font-size: 32px; margin-bottom: 8px">🏘</div>
            <p style="font-size: 13px; color: #64748b; text-align: center">
              No other properties found on this street yet. Be the first to
              start your Passport!
            </p>
          </div>

          <!-- Street stats -->
          <div v-if="streetStats" class="hs-street-stats">
            <div class="hs-street-stats-title">
              {{ property?.postcode }} — Street Overview
            </div>
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
                <div class="hs-stat-val">
                  £{{ Math.round(streetStats.avgPrice / 1000) }}k
                </div>
                <div class="hs-stat-lbl">Avg. estimated value</div>
              </div>
            </div>
            <div class="hs-street-tip">
              💡 <strong>You're ahead of your street.</strong> Most neighbours
              haven't started their passport. Sellers with a passport typically
              accept offers <strong>18 days faster</strong>.
            </div>
          </div>
          <div style="height: 80px" />
        </div>

        <!-- ── BUYERS TAB ──────────────────────────────────────────── -->
        <div v-if="passportTab === 'buyers'" class="hs-tab-content">
          <div class="hs-buyers-intro">
            <div
              style="
                font-size: 13px;
                color: #0f172a;
                font-weight: 600;
                margin-bottom: 2px;
              "
            >
              {{ buyersTotal || matchedBuyers.length }} buyers searching in your
              area
            </div>
            <div style="font-size: 12px; color: #64748b">
              Tap any buyer to see how well they match your property.
            </div>
          </div>

          <div v-if="matchedBuyers.length" class="hs-buyer-list">
            <div
              v-for="buyer in matchedBuyers"
              :key="buyer.name"
              class="hs-buyer-card"
            >
              <div
                class="hs-buyer-avatar"
                :style="{
                  background:
                    buyer.matchScore >= 75
                      ? '#dcfce7'
                      : buyer.matchScore >= 55
                        ? '#fef3c7'
                        : '#f1f5f9',
                  color:
                    buyer.matchScore >= 75
                      ? '#16a34a'
                      : buyer.matchScore >= 55
                        ? '#92400e'
                        : '#64748b',
                }"
              >
                {{ buyer.name[0] }}
              </div>
              <div class="hs-buyer-info">
                <div class="hs-buyer-name">{{ buyer.name }}</div>
                <div class="hs-buyer-criteria">
                  {{ buyer.area }} · {{ buyer.budget }} · {{ buyer.timeline }}
                </div>
                <div class="hs-buyer-tags">
                  <span
                    v-for="tag in buyer.tags"
                    :key="tag"
                    class="hs-buyer-tag"
                    :class="
                      tag === 'Strong match'
                        ? 'match'
                        : tag === 'Good match'
                          ? 'partial'
                          : 'other'
                    "
                    >{{ tag }}</span
                  >
                </div>
              </div>
              <div
                class="hs-buyer-match-score"
                :style="{
                  color:
                    buyer.matchScore >= 75
                      ? '#16a34a'
                      : buyer.matchScore >= 55
                        ? '#92400e'
                        : '#94a3b8',
                }"
              >
                {{ buyer.matchScore }}%
              </div>
            </div>
          </div>
          <div v-else class="hs-buyers-loading">
            <div style="font-size: 32px; margin-bottom: 8px">👥</div>
            <p style="font-size: 13px; color: #64748b; text-align: center">
              Loading matched buyers…
            </p>
          </div>

          <!-- Notify CTA -->
          <button
            class="hs-pp-cta"
            style="margin: 16px 0 8px"
            @click="claimOrAccessPassport"
          >
            Claim Passport to notify buyers
          </button>
          <div class="hs-pp-cta-sub">
            Your passport will become visible to matched buyers
          </div>
          <div style="height: 80px" />
        </div>
      </div>
    </template>

    <!-- ── BUYER RESULTS ─────────────────────────────────────────── -->
    <template v-else-if="screen === 'buyer-results'">
      <div class="hs-scroll bv-root">
        <!-- ── Address card (consistent with ResultDetail) ─────── -->
        <div v-if="property" class="bv-addr-card">
          <div class="bv-addr-top">
            <div class="bv-addr-pin" />
            <div class="bv-addr-block">
              <div class="bv-addr-line">
                {{ property.addressLine1 || 'This property' }}
              </div>
              <div class="bv-addr-meta">
                {{ property.postcode || '' }}
                <template v-if="property.propertyType">
                  · {{ property.propertyType }}</template
                ><template v-if="property.bedrooms">
                  · {{ property.bedrooms }} bed</template
                >
              </div>
            </div>
          </div>
          <div class="bv-addr-pills">
            <span v-if="property.epcRating" class="bv-addr-pill epc">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
              </svg>
              <span class="bv-epc-letter" :style="{ background: bvEpcColor }">{{
                property.epcRating
              }}</span>
              EPC
            </span>
            <span
              v-if="bvPassportState === 'unclaimed'"
              class="bv-addr-pill bv-state-unclaimed"
              >Unclaimed</span
            >
            <span
              v-else-if="bvPassportState === 'inProgress'"
              class="bv-addr-pill bv-state-progress"
              >In progress</span
            >
            <span v-else class="bv-addr-pill bv-state-published"
              >✓ Published</span
            >
          </div>
          <div class="bv-addr-stats">
            <div v-if="bvPassportState === 'unclaimed'" class="bv-stat-row">
              <span class="bv-pulse-dot" />
              <span class="bv-stat-count">{{ bvSearches }} searches today</span>
              <span class="bv-sep">·</span>
              <span>No verified Passport yet</span>
            </div>
            <div
              v-else-if="bvPassportState === 'inProgress'"
              class="bv-stat-row"
            >
              <span class="bv-pulse-dot" />
              <span class="bv-stat-count"
                >{{ bvSearches + 1 }} searches today</span
              >
              <span class="bv-sep">·</span>
              <span>Passport in progress</span>
            </div>
            <div v-else class="bv-stat-row">
              <span class="bv-pulse-dot bv-pulse-green" />
              <span class="bv-stat-count"
                >{{ bvSearches * 6 }} searches this month</span
              >
              <span class="bv-sep">·</span>
              <span>Verified Passport live</span>
            </div>
          </div>
        </div>

        <!-- ── Running cost hero (navy gradient) ───────────────── -->
        <div class="bv-cost-hero">
          <div class="bv-cost-eyebrow">Estimated annual running cost</div>
          <div class="bv-cost-num">
            ~£{{ buyerAnnualCost.toLocaleString()
            }}<span class="bv-cost-unit"> / year</span>
          </div>
          <div class="bv-cost-sub">
            Based on EPC data. The best homes on this street cost
            <b>£{{ bvStreetBest.toLocaleString() }}/yr</b> — there's potential
            to negotiate or factor in upgrade costs.
          </div>
          <div class="bv-cost-stats">
            <div class="bv-cost-stat">
              <div class="bv-cost-stat-num">{{ result.total }}</div>
              <div class="bv-cost-stat-label">HomeScore</div>
            </div>
            <div class="bv-cost-stat-div" />
            <div class="bv-cost-stat">
              <div class="bv-cost-stat-num">{{ buyerEpcGrade }}</div>
              <div class="bv-cost-stat-label">EPC Grade</div>
            </div>
            <div class="bv-cost-stat-div" />
            <div class="bv-cost-stat">
              <div class="bv-cost-stat-num">4th</div>
              <div class="bv-cost-stat-label">of 12 on street</div>
            </div>
          </div>
        </div>

        <!-- ── Buyer risk summary ──────────────────────────────── -->
        <div class="bv-section-h">
          <div class="bv-section-h-icon warn">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
            </svg>
          </div>
          <div class="bv-section-h-text">
            <div class="bv-section-h-title">Buyer risk summary</div>
            <div class="bv-section-h-sub">
              What the EPC data suggests you look into
            </div>
          </div>
        </div>
        <div class="bv-risks-card">
          <div
            v-for="r in buyerRisks"
            :key="r.key"
            class="bv-risk-row"
            :class="r.tone === 'ok' ? 'green' : 'amber'"
          >
            <span class="bv-risk-icon">{{ r.icon }}</span>
            <div class="bv-risk-body">
              <div class="bv-risk-title">{{ r.title }}</div>
              <div class="bv-risk-sub">{{ r.body }}</div>
            </div>
          </div>
        </div>

        <!-- ── Score breakdown ─────────────────────────────────── -->
        <div class="bv-section-h">
          <div class="bv-section-h-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2l2 6 6 1-4.5 4 1.5 7-5-3-5 3 1.5-7L4 9l6-1z" />
            </svg>
          </div>
          <div class="bv-section-h-text">
            <div class="bv-section-h-title">Score breakdown</div>
            <div class="bv-section-h-sub">Based on public EPC data only</div>
          </div>
        </div>
        <div class="bv-breakdown-card">
          <div class="bv-breakdown-sub">
            The owner could improve this with a full HomeScore.
          </div>
          <div class="bv-breakdown-rows">
            <div
              v-for="bar in pillarBars(autoBreakdown)"
              :key="bar.key"
              class="bv-breakdown-row"
            >
              <div class="bv-bd-label">{{ bar.label }}</div>
              <div class="bv-bd-bar-wrap">
                <div
                  class="bv-bd-bar"
                  :style="{
                    width: `${(bar.value / bar.max) * 100}%`,
                    background: pillarBarColor(bar.value, bar.max),
                  }"
                />
              </div>
              <div
                class="bv-bd-val"
                :style="{ color: pillarBarColor(bar.value, bar.max) }"
              >
                {{ bar.value }}/{{ bar.max }}
              </div>
            </div>
          </div>
          <div class="bv-bd-note">
            This is based on public EPC data only. Ask the owner to run a full
            HomeScore to get a verified picture.
          </div>
        </div>

        <!-- ── Questions to ask the owner ──────────────────────── -->
        <div class="bv-section-h">
          <div class="bv-section-h-icon save">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <circle cx="12" cy="7.5" r="0.9" fill="currentColor" />
            </svg>
          </div>
          <div class="bv-section-h-text">
            <div class="bv-section-h-title">Questions to ask the owner</div>
            <div class="bv-section-h-sub">
              Based on what the EPC data flags for this property
            </div>
          </div>
        </div>
        <div class="bv-questions-card">
          <div
            v-for="q in bvQuestions"
            :key="q.title"
            class="bv-q-row"
          >
            <span class="bv-q-icon">{{ q.icon }}</span>
            <div class="bv-q-body">
              <div class="bv-q-title">{{ q.title }}</div>
              <div class="bv-q-sub">{{ q.sub }}</div>
            </div>
          </div>
        </div>

        <!-- ── Save to Buyer Profile CTA ───────────────────────── -->
        <div class="bv-save-card" @click="saveToBuyerProfile">
          <div class="bv-save-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div class="bv-save-body">
            <div class="bv-save-title">Save to your Buyer Profile</div>
            <div class="bv-save-sub">
              Track this property, compare with others, share with your
              solicitor.
            </div>
          </div>
          <div class="bv-save-cta">Save →</div>
        </div>

        <button class="bv-back" @click="screen = 'landing'">
          ← Back to HomeScore
        </button>
        <div style="height: 24px" />
      </div>
    </template>

    <!-- ── QUICK WINS / BOOST SCORE ─────────────────────────────── -->
    <template v-else-if="screen === 'quick-wins'">
      <div class="hs-scroll">
        <!-- Property Journey widget (mirrors results) -->
        <div class="hs-journey-card" style="cursor: default">
          <div class="hs-journey-inner">
            <div class="hs-journey-head">
              <div class="hs-journey-eyebrow">Your Property Journey</div>
              <div class="hs-journey-link">Updates as you add docs</div>
            </div>
            <div class="hs-journey-grid">
              <div
                class="hs-journey-col"
                style="border-right: 1px solid var(--line, #e5e7eb)"
              >
                <div class="hs-journey-num-wrap">
                  <div
                    class="hs-journey-num"
                    :style="{ color: scoreColor(qwScore) }"
                  >
                    {{ qwScore }}
                  </div>
                  <div class="hs-journey-num-small">/100</div>
                </div>
                <div class="hs-journey-label">HomeScore</div>
                <div class="hs-journey-sub">Energy score</div>
              </div>
              <div
                class="hs-journey-col"
                style="border-right: 1px solid var(--line, #e5e7eb)"
              >
                <div
                  class="hs-journey-num"
                  :class="qwMoveReady > 0 ? '' : 'hs-journey-num-muted'"
                >
                  {{ qwMoveReady }}%
                </div>
                <div class="hs-journey-label">Move Ready</div>
                <div class="hs-journey-sub">Docs &amp; certs</div>
              </div>
              <div class="hs-journey-col">
                <div class="hs-journey-num hs-journey-num-muted">0%</div>
                <div class="hs-journey-label">Passport</div>
                <div class="hs-journey-sub">Ownership verified</div>
              </div>
            </div>
            <div class="hs-journey-bar-track">
              <div
                class="hs-journey-bar-fill"
                :style="{ width: `${qwProgress}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Upload documents -->
        <div class="hs-qw-section-label">📎 Upload a document</div>
        <div class="hs-qw-list">
          <div
            v-for="doc in qwDocs"
            :key="doc.key"
            class="hs-qw-doc-row"
            :class="{ uploaded: uploadedDocs[doc.key] }"
            @click="triggerDocUpload(doc.key)"
          >
            <div class="hs-qw-doc-ic" :style="{ background: doc.bg }">
              {{ doc.icon }}
            </div>
            <div class="hs-qw-doc-body">
              <div class="hs-qw-doc-name">{{ doc.label }}</div>
              <div class="hs-qw-doc-sub">{{ doc.sub }}</div>
            </div>
            <div class="hs-qw-doc-right">
              <div
                v-if="uploadedDocs[doc.key]"
                class="hs-qw-doc-done"
                aria-label="Uploaded"
              >
                ✓
              </div>
              <div v-else class="hs-qw-doc-pts">+{{ doc.pts }} pts</div>
            </div>
          </div>
        </div>

        <input
          ref="docFileInput"
          type="file"
          accept=".pdf,image/*"
          style="display: none"
          @change="onDocFilePicked"
        />

        <!-- Book a pro -->
        <div class="hs-qw-section-label">🔧 Book a professional</div>
        <div class="hs-qw-list">
          <div
            v-for="pro in qwPros"
            :key="pro.key"
            class="hs-qw-pro-row"
            @click="openMarketplace"
          >
            <div class="hs-qw-doc-ic" :style="{ background: pro.bg }">
              {{ pro.icon }}
            </div>
            <div class="hs-qw-doc-body">
              <div class="hs-qw-doc-name">{{ pro.label }}</div>
              <div class="hs-qw-doc-sub">{{ pro.sub }}</div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              stroke-width="2"
              stroke-linecap="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <!-- Get move ready CTA -->
        <div class="hs-qw-mr-cta">
          <div class="hs-qw-mr-glow" />
          <div class="hs-qw-mr-inner">
            <div class="hs-qw-mr-eyebrow">Next step on your journey</div>
            <div class="hs-qw-mr-title">
              You've scored {{ qwScore }}. Now make it count.
            </div>
            <div class="hs-qw-mr-body">
              Your Move Ready and Passport scores are waiting to be unlocked.
              Each document you add brings them up — verify your home to lock in
              everything you've built.
            </div>
            <button class="hs-qw-mr-btn" @click="screen = 'move-ready'">
              Get move ready
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#042f2e"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        <button class="hs-btn-ghost" @click="screen = 'results'">
          ← Back to my score
        </button>
        <div style="height: 40px" />
      </div>
    </template>

    <!-- ── MOVE READY ────────────────────────────────────────────── -->
    <template v-else-if="screen === 'move-ready'">
      <div class="hs-scroll">
        <!-- Hero -->
        <div class="hs-mr-hero">
          <div class="hs-mr-hero-glow" />
          <div class="hs-mr-hero-inner">
            <div class="hs-mr-hero-eyebrow">Move-ready status</div>
            <div class="hs-mr-hero-title">
              90% of sales fall through<br />because of missing paperwork.
            </div>
            <div class="hs-mr-hero-body">
              Move-ready means your ownership is verified, your documents are in
              order, and a buyer's solicitor can start work the same day they
              make an offer.
            </div>
            <div class="hs-mr-compare-grid">
              <div class="hs-mr-compare-col red">
                <div class="hs-mr-compare-head red">Not verified</div>
                <div class="hs-mr-compare-list">
                  <div>❌ Score is estimated</div>
                  <div>❌ Buyers can't verify</div>
                  <div>❌ Delays at exchange</div>
                  <div>❌ 179 day average</div>
                </div>
              </div>
              <div class="hs-mr-compare-col teal">
                <div class="hs-mr-compare-head teal">Move ready ✓</div>
                <div class="hs-mr-compare-list ok">
                  <div>✓ Score is verified</div>
                  <div>✓ Buyers can trust it</div>
                  <div>✓ No nasty surprises</div>
                  <div>✓ 14 day completion</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Steps -->
        <div class="hs-qw-section-label">What happens next — 3 steps</div>
        <div class="hs-mr-steps">
          <div class="hs-mr-step">
            <div class="hs-mr-step-ic">1</div>
            <div>
              <div class="hs-mr-step-title">Verify your property</div>
              <div class="hs-mr-step-body">
                Enter your address and we confirm it against HM Land Registry.
                Takes 60 seconds.
              </div>
            </div>
          </div>
          <div class="hs-mr-step">
            <div class="hs-mr-step-ic">2</div>
            <div>
              <div class="hs-mr-step-title">Confirm your identity</div>
              <div class="hs-mr-step-body">
                Quick ID check — photo of your passport or driving licence plus
                a selfie. Powered by Onfido.
              </div>
            </div>
          </div>
          <div class="hs-mr-step">
            <div class="hs-mr-step-ic teal">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div class="hs-mr-step-title">Your score becomes verified</div>
              <div class="hs-mr-step-body">
                Your HomeScore is upgraded from estimated to verified — and
                your Property Passport is live.
              </div>
            </div>
          </div>
        </div>

        <!-- Stats grid -->
        <div class="hs-mr-stats">
          <div class="hs-mr-stat">
            <div class="hs-mr-stat-num">12x</div>
            <div class="hs-mr-stat-lbl">faster to exchange</div>
          </div>
          <div class="hs-mr-stat">
            <div class="hs-mr-stat-num">3x</div>
            <div class="hs-mr-stat-lbl">fewer fall-throughs</div>
          </div>
          <div class="hs-mr-stat">
            <div class="hs-mr-stat-num">£0</div>
            <div class="hs-mr-stat-lbl">to get started</div>
          </div>
        </div>

        <!-- Claim CTA -->
        <button class="hs-mr-claim-btn" @click="claimFromMoveReady">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Claim your Property Passport →
        </button>
        <div class="hs-mr-claim-sub">
          Free to start · Takes 5 mins · Your data stays yours
        </div>
        <button class="hs-btn-ghost" @click="screen = 'quick-wins'">
          ← Back
        </button>
        <div style="height: 40px" />
      </div>
    </template>

    <!-- Auth gate modal — shown when a guest taps "I'm interested in buying"
         or "Save to Buyer Profile". Returns user to this property after login. -->
    <div
      v-if="showAuthGate"
      class="hs-authgate-overlay"
      @click.self="showAuthGate = false"
    >
      <div class="hs-authgate-card">
        <div class="hs-authgate-ic">🔒</div>
        <div class="hs-authgate-title">Log in to continue</div>
        <div class="hs-authgate-sub">
          Save this property, see your full Buyer Report and build your Buyer
          Profile to share with sellers.
        </div>
        <button class="hs-authgate-primary" @click="goToSignIn">
          Log in or Create account
        </button>
        <button class="hs-authgate-ghost" @click="showAuthGate = false">
          Not now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHomeScore } from '~/composables/useHomeScore'
import { usePassportClaim } from '~/composables/usePassportClaim'
import { usePropertyActions } from '~/composables/usePropertyActions'
import { useAppToast } from '~/composables/useCustomToast'
import ResultDetail from '~/components/homescore/ResultDetail.vue'
import TourCoach from '~/components/homescore/TourCoach.vue'
import { useHomescoreTour } from '~/composables/useHomescoreTour'
import type { TopWin, Opportunity } from '~/types/homescore'
import { QUESTIONS } from '~/utils/homescoreScoring'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const property = ref<any>(null)

// ── Coach-mark tour for the detail screens (auto-starts on first visit) ──
const resultTour = useHomescoreTour({
  storageKey: `umu-tour-result-${propertyId}`,
  autoStart: true,
  steps: [
    {
      sel: '[data-tour="addr"]',
      title: 'Your property',
      body: 'This shows the address, EPC rating and current Passport status. The live signal shows how many people have searched this property recently.',
    },
    {
      sel: '[data-tour="overpay"]',
      title: 'You could be overpaying',
      body: 'This compares your estimated running costs against similar homes on your street, based on public EPC data which may be out of date.',
    },
    {
      sel: '[data-tour="score"]',
      title: 'Your HomeScore',
      body: 'A score from 0–100 showing how energy efficient this property is. The higher the score, the lower the likely running costs.',
    },
    {
      sel: '[data-tour="breakdown"]',
      title: 'Score breakdown',
      body: 'Each category contributes to the overall score. Shorter bars mean more room to improve — and more potential savings.',
    },
    {
      sel: '[data-tour="intent"]',
      title: 'What brings you here?',
      body: "Own this property? Take a quick quiz to get your real score. Just interested? Save it and view running costs.",
    },
  ],
})

type Screen =
  | 'loading'
  | 'landing'
  | 'questions'
  | 'results'
  | 'passport'
  | 'buyer-results'
  | 'quick-wins'
  | 'move-ready'
const screen = ref<Screen>('loading')

type PassportTab = 'sections' | 'street' | 'buyers'
const passportTab = ref<PassportTab>('sections')

const streetProperties = ref<any[]>([])
const streetStats = ref<any>(null)
const matchedBuyers = ref<any[]>([])
const buyersTotal = ref(0)
const passportClaimLoading = ref(false)
const isPropertyOwner = ref(false)

// Read-only mode: property has a passport claimed by someone else.
// The current user can't run the quiz or modify the score — they see
// the owner's published HomeScore (if available).
const hasOtherOwnerPassport = ref(false)
const isPassportCollaborator = ref(false)
const isOtherPassportPublished = ref(false)
const publicOwnerScore = ref<any>(null)
const notifiedOfPublish = ref(false)

// Auth gate (shown when guest taps "I'm interested in buying" or "Save")
const showAuthGate = ref(false)

// Search-stats card ("People searched this address this month")
const searchStats = ref<{
  today: number
  thisMonth: number
  allTime: number
  distinctVisitors: number
} | null>(null)

// Deterministic fallback so the card still renders for properties with no
// logged searches yet — mirrors the prototype's hsGetViewCount: 8–26 base,
// with a small boost for poor EPC. The real count is preferred whenever it's
// non-zero, so as searches accrue the displayed number transitions smoothly.
const derivedMonthCount = computed(() => {
  const p: any = property.value
  const seedSrc = (p?.id || p?.addressLine1 || propertyId || '') as string
  let h = 0
  for (let i = 0; i < seedSrc.length; i++)
    h = (h * 31 + seedSrc.charCodeAt(i)) >>> 0
  const epc = typeof p?.epcScore === 'number' ? p.epcScore : 55
  let count = 8 + (h % 19)
  if (epc < 50) count += 6
  return count
})
const searchedMonthCount = computed(() => {
  const real = searchStats.value?.thisMonth ?? 0
  return real > 0 ? real : derivedMonthCount.value
})
const searchedTodayCount = computed(() => {
  const real = searchStats.value?.today ?? 0
  if (real > 0) return real
  // ~quarter of monthly when falling back, mirroring prototype
  return Math.max(1, Math.floor(derivedMonthCount.value / 4))
})

const readOnlyMode = computed(
  () =>
    hasOtherOwnerPassport.value &&
    !isPropertyOwner.value &&
    !isPassportCollaborator.value,
)

// True when no token in localStorage — used to gate "I'm interested" CTAs and
// to hide owner-only options (the "This is my home" button) for guest viewers.
const isGuest = computed(() => {
  if (typeof localStorage === 'undefined') return true
  return !localStorage.getItem('token')
})

// Three mutually exclusive states for the banner on the landing screen:
// - 'published': owner has published their passport → show navy "View →" banner
// - 'inProgress': owner has claimed but not published yet → show amber "Notify me" banner
// - null: no third-party passport → no banner
const passportState = computed<'published' | 'inProgress' | null>(() => {
  if (!readOnlyMode.value) return null
  return isOtherPassportPublished.value ? 'published' : 'inProgress'
})

// ── ResultDetail (prototype-aligned 3a/3b/3c view) props ──
// Reflect the property's TRUE Passport state — independent of who is viewing.
// `passportState` (above) gates on `readOnlyMode` and is `null` for the owner;
// for the result UI we want the real status (published / in-progress / unclaimed)
// no matter whether the viewer is the owner, a buyer, or a guest.
const resolvedPassportState = computed<'unclaimed' | 'inProgress' | 'published'>(() => {
  const p: any = property.value
  // Server payload may expose these directly OR via the loaded score-state.
  if (p?.passportPublished) return 'published'
  if (isOtherPassportPublished.value) return 'published'
  if (p?.hasPassport) return 'inProgress'
  if (hasOtherOwnerPassport.value) return 'inProgress'
  return 'unclaimed'
})

const resolvedAnnualCost = computed<number>(() => {
  const cert: any = (property.value as any)?.epcCert
  if (cert?.energyCostCurrent) return Math.round(Number(cert.energyCostCurrent))
  const map: Record<string, number> = { A: 980, B: 1100, C: 1300, D: 1592, E: 1823, F: 2200, G: 2600 }
  const r = (property.value?.epcRating || '').toUpperCase()
  if (map[r]) return map[r]
  return 1592
})

const resolvedEpcYear = computed<number | null>(() => {
  const cert: any = (property.value as any)?.epcCert
  const lodged = cert?.lodgementDate || (property.value as any)?.epcLodgementDate
  if (!lodged) return null
  const y = new Date(lodged).getFullYear()
  return Number.isFinite(y) ? y : null
})

function goToBuyerView() {
  // "I'm interested in buying" — let guests through to the buyer view so
  // they can browse the running costs, comparison, etc. The auth gate
  // only fires when they later tap "Boost your score" (which is gated in
  // `onBoostScore`). Owners and signed-in users also land on the same
  // in-page screen.
  screen.value = 'buyer-results'
}

function goToStreetCompare() {
  router.push(`/homescore/street/${propertyId}`)
}

function goToRunningCosts() {
  router.push(`/homescore/costs/${propertyId}`)
}

function notifyWhenPublished() {
  // Guests need to sign in before we can notify them — gate it.
  if (isGuest.value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', `/homescore/${propertyId}`)
    }
    showAuthGate.value = true
    return
  }
  // Record locally so the button shows "already notified" across reloads.
  if (typeof localStorage !== 'undefined') {
    const key = `hs_notify_publish_${propertyId}`
    localStorage.setItem(key, String(Date.now()))
  }
  notifiedOfPublish.value = true
}

// (Legacy `onInterestedInBuying` removed — the "I'm interested" button now
// fires via ResultDetail's `interested` event → `goToBuyerView()`, which
// lets guests through to the buyer view without an immediate auth gate.)

// Tap handler for "Boost your score" CTA — gate guests up-front before they
// invest time in the quick-wins flow.
function onBoostScore() {
  if (isGuest.value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'redirectAfterLogin',
        `/homescore/${propertyId}?screen=quick-wins`,
      )
    }
    showAuthGate.value = true
    return
  }
  screen.value = 'quick-wins'
}

function goToSignIn() {
  // redirectAfterLogin is set by callers; the auth middleware respects it.
  if (typeof localStorage !== 'undefined') {
    if (!localStorage.getItem('redirectAfterLogin')) {
      localStorage.setItem('redirectAfterLogin', `/homescore/${propertyId}`)
    }
  }
  router.push('/onboarding/signin')
}

// Primary CTA above "I'm interested in buying" — adapts to passport state.
const primaryCta = computed(() => {
  if (passportState.value === 'published') {
    return {
      title: 'Sign in to manage your Passport',
      sub: 'Already own this property? Manage your record',
    }
  }
  if (passportState.value === 'inProgress') {
    return {
      title: 'Sign in to continue your Passport',
      sub: "Building this property's Passport? Pick up where you left off",
    }
  }
  return {
    title: 'I own this property',
    sub: `Get my real score in 2 mins · ${QUESTIONS.length} quick questions`,
  }
})

function onPrimaryCtaClick() {
  if (passportState.value === 'published' || passportState.value === 'inProgress') {
    goToSignIn()
    return
  }
  startQuestions()
}

// Triggered when an existing-passport owner taps "Refine my HomeScore".
// Clear any prior answers so the quiz is a genuine retake, then jump in.
// startQuestions() handles the guest auth-gate (redirects to sign-in with
// ?screen=questions) and the read-only-mode bail-out internally.
function onRefineScore() {
  retakeHS()
  startQuestions()
}

// Stable per-browser session id used for guest dedup on /property/:id/log-search.
function getOrCreateSessionId(): string | null {
  if (typeof localStorage === 'undefined') return null
  const KEY = 'umu_session_id'
  let sid = localStorage.getItem(KEY)
  if (!sid) {
    sid =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(KEY, sid)
  }
  return sid
}

const {
  step,
  answers,
  showResult,
  currentQuestion,
  currentAnswer,
  canNext,
  isLastStep,
  progress,
  result,
  topWins,
  opportunities,
  liveScore,
  confidence,
  carbonKg,
  autoScore,
  answer,
  next,
  prev,
  retake: retakeHS,
  prefill,
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
      deltaTimer = setTimeout(() => {
        deltaInfo.value = { val: 0, show: false }
      }, 1200)
    }
  })
}

// ── Computed ──────────────────────────────────────────────────

const autoScoreVal = computed(
  () => autoScore.value?.total ?? result.value.total,
)
const autoBreakdown = computed(
  () => autoScore.value?.breakdown ?? result.value.breakdown,
)
const autoRating = computed(
  () => autoScore.value?.rating ?? result.value.rating,
)

const epcRangeLow = computed(() => Math.max(0, autoScoreVal.value - 7))
const epcRangeHigh = computed(() => Math.min(100, autoScoreVal.value + 25))

// EPC-based positive-framing explainer for the Starter Score card.
// Mirrors the prototype's hsRenderEpcCard(): score band → label, body copy,
// and adaptive confidence pill tone (good / ok / warn).
const epcExplain = computed(() => {
  const s = autoScoreVal.value ?? 55
  let label: string
  let body: string
  let confTone: 'good' | 'ok' | 'warn'
  if (s >= 92) {
    label = 'Exceptional'
    body =
      'Among the <b>most efficient homes</b> in the UK — less than 3% of properties achieve this rating. Modern construction, low running costs.'
    confTone = 'good'
  } else if (s >= 81) {
    label = 'Highly efficient'
    body =
      'In the <b>top 20% of UK homes</b>. Strong insulation and modern systems keep running costs well below average.'
    confTone = 'good'
  } else if (s >= 69) {
    label = 'Above average'
    body =
      'Better than most UK homes — the UK average is around <b>60–65</b>. Small upgrades could lift this to a B.'
    confTone = 'ok'
  } else if (s >= 55) {
    label = 'Typical UK home'
    body =
      'In line with the <b>average British home</b>. Real upside available — cavity wall, glazing or boiler upgrades can lift this to a C or B.'
    confTone = 'ok'
  } else if (s >= 39) {
    label = 'Period property'
    body =
      'Often older or solid-wall homes. Targeted improvements can transform efficiency <b>without losing character</b>.'
    confTone = 'warn'
  } else if (s >= 21) {
    label = 'Upgrade potential'
    body =
      'These homes have the <b>most savings potential</b>. Typical upgrades cut running costs by £200–600 a year.'
    confTone = 'warn'
  } else {
    label = 'Renovation potential'
    body =
      'Less than <b>1% of UK homes</b> rate this low. Strong negotiating position for buyers; biggest improvement journey for owners.'
    confTone = 'warn'
  }
  const confText =
    confTone === 'good'
      ? '✓ Public EPC · recently assessed'
      : confTone === 'ok'
        ? 'Modelled from public EPC data'
        : 'Public EPC · improvements not yet reflected'
  const confIcon = confTone === 'good' ? '✓' : 'ⓘ'
  return { label, body, confTone, confText, confIcon }
})

const epcDataAge = computed(() => {
  const date = property.value?.lodgementDate
  if (!date) return '5-year-old'
  const year = parseInt(String(date).slice(0, 4), 10)
  if (!year) return '5-year-old'
  const age = new Date().getFullYear() - year
  if (age <= 0) return 'recent'
  if (age === 1) return '1-year-old'
  return `${age}-year-old (${year})`
})

// Score-driven saving estimate: (100 - score) * ~21 ≈ prototype's £1,347 for score 37
const potentialSaving = computed(() =>
  Math.max(150, Math.round((100 - autoScoreVal.value) * 21)),
)

const moveReadyScore = 20
const completeScore = computed(() =>
  Math.round((result.value.total + moveReadyScore) / 2),
)

// Fallback wins/opps so these sections always show something useful
const DEFAULT_WINS: TopWin[] = [
  {
    title: 'Install solar PV panels',
    sub: 'Generates ~3,500 kWh/yr and earns export payments',
    savingPerYear: 450,
    points: 7,
  },
  {
    title: 'Top up loft insulation to 270mm',
    sub: 'Up to 25% of heat escapes through the roof',
    savingPerYear: 320,
    points: 5,
  },
  {
    title: 'Fit a smart thermostat',
    sub: 'Smart controls save ~£130/yr on average',
    savingPerYear: 130,
    points: 4,
  },
]
const DEFAULT_OPPS: Opportunity[] = [
  {
    icon: '🏠',
    title: 'Improve loft insulation',
    sub: 'Topping up to 270mm is one of the most cost-effective fixes.',
  },
  {
    icon: '🔥',
    title: 'Book a boiler service',
    sub: 'An annual service keeps your boiler running at peak efficiency.',
  },
  {
    icon: '🌡️',
    title: 'Fit a smart thermostat',
    sub: 'Could save ~£130/yr — low cost, high impact.',
  },
]

const displayWins = computed(() =>
  topWins.value.length > 0 ? topWins.value : DEFAULT_WINS,
)
const displayOpps = computed(() =>
  opportunities.value.length > 0 ? opportunities.value : DEFAULT_OPPS,
)

const totalSaving = computed(() =>
  displayWins.value.reduce((s, w) => s + w.savingPerYear, 0),
)

// Yearly potential — sum of top wins (what the savings hero shows)
const yearlyPotential = computed(() =>
  topWins.value.reduce((s, w) => s + w.savingPerYear, 0),
)

const allAnswered = computed(
  () => Object.keys(answers.value).length >= QUESTIONS.length,
)

// Carbon drivers based on the two worst-scoring pillars
const pillarCarbonDrivers = computed(() => {
  const rows = PILLAR_DEFS.map((d) => {
    const value = (result.value.breakdown as any)?.[d.key] ?? 0
    const pct = Math.round(100 - (value / d.max) * 100)
    const iconMap: Record<string, string> = {
      heating: '🔥',
      structure: '🧱',
      efficiency: '💡',
      electrics: '⚡',
      plumbing: '🚰',
    }
    return {
      key: d.key,
      label: d.label,
      icon: iconMap[d.key] ?? '▫',
      value,
      max: d.max,
      pct: Math.max(0, pct),
      gap: d.max - value,
    }
  })
  rows.sort((a, b) => b.gap - a.gap)
  return rows.slice(0, 2)
})

function pillarBarColor(value: number, max: number): string {
  const pct = (value / max) * 100
  if (pct >= 60) return '#16a34a'
  if (pct >= 40) return '#f59e0b'
  return '#dc2626'
}

const headerSub = computed(() => {
  if (screen.value === 'questions')
    return `Question ${step.value + 1} of ${QUESTIONS.length}`
  if (screen.value === 'landing') return 'Based on public records'
  if (screen.value === 'results') return 'Refined with your answers'
  if (screen.value === 'passport') return 'Continue your journey'
  if (screen.value === 'buyer-results') return 'Based on public EPC data'
  if (screen.value === 'quick-wins') return 'Every document adds real value'
  if (screen.value === 'move-ready') return 'What it means for you'
  return ''
})

const selectedNarr = computed(() => {
  if (!currentQuestion.value || !currentAnswer.value) return ''
  return (
    currentQuestion.value.options.find((o) => o.value === currentAnswer.value)
      ?.narr ?? ''
  )
})

const liveHint = computed(() => {
  if (deltaInfo.value.show) {
    if (deltaInfo.value.val > 0) return "You're boosting your energy score!"
    if (deltaInfo.value.val < 0)
      return 'Your score dipped — try another option.'
  }
  if (selectedNarr.value) return selectedNarr.value
  if (!currentAnswer.value) return 'Each answer refines your real score in real time.'
  const answered = Object.keys(answers.value).length
  return `${answered} of ${QUESTIONS.length} answered`
})

const scoreBand = computed(() => {
  const s = liveScore.value
  if (s >= 80) return 'Excellent — top of the market'
  if (s >= 65) return 'Strong — better than most'
  if (s >= 50) return 'Average — room to improve'
  if (s >= 35) return 'Below average — fixable'
  return 'Plenty of opportunities'
})

// ── Score helpers ─────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 75) return '#1f7a66'
  if (score >= 60) return '#16a34a'
  if (score >= 40) return '#f59e0b'
  return '#dc2626'
}

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050',
    B: '#33b800',
    C: '#92d050',
    D: '#d4e800',
    E: '#ffbf00',
    F: '#ff6600',
    G: '#ff0000',
  }
  return map[rating?.toUpperCase()] ?? '#8e8e93'
}

// ── Pillar bars ───────────────────────────────────────────────

const PILLAR_DEFS = [
  { key: 'heating', label: 'Heating', max: 20, color: '#ef4444' },
  { key: 'structure', label: 'Structure', max: 25, color: '#231d45' },
  { key: 'efficiency', label: 'Efficiency', max: 20, color: '#00a19a' },
  { key: 'electrics', label: 'Electrics', max: 15, color: '#f59e0b' },
  { key: 'plumbing', label: 'Plumbing', max: 20, color: '#3b82f6' },
]

function pillarBars(breakdown: any) {
  return PILLAR_DEFS.map((d) => ({
    ...d,
    value: (breakdown as any)?.[d.key] ?? 0,
  }))
}

// ── Carbon ────────────────────────────────────────────────────

const CARBON_BASELINE = 2900

const carbonGradeInfo = computed(() => {
  const kg = carbonKg.value
  if (kg < 800) return { grade: 'A', label: 'Excellent', col: '#16a34a' }
  if (kg < 1400) return { grade: 'B', label: 'Good', col: '#65a30d' }
  if (kg < 2000) return { grade: 'C', label: 'Average', col: '#ca8a04' }
  if (kg < 2800) return { grade: 'D', label: 'Below avg', col: '#92400e' }
  if (kg < 3800) return { grade: 'E', label: 'Poor', col: '#ea580c' }
  if (kg < 4800) return { grade: 'F', label: 'Very poor', col: '#dc2626' }
  return { grade: 'G', label: 'Critical', col: '#7f1d1d' }
})

const carbonGradient = computed(() => {
  const g = carbonGradeInfo.value.grade
  const map: Record<string, string> = {
    A: 'linear-gradient(135deg,#14532d,#166534)',
    B: 'linear-gradient(135deg,#365314,#3f6212)',
    C: 'linear-gradient(135deg,#713f12,#854d0e)',
    D: 'linear-gradient(135deg,#78350f,#92400e)',
    E: 'linear-gradient(135deg,#7c2d12,#92400e)',
    F: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
    G: 'linear-gradient(135deg,#450a0a,#7f1d1d)',
  }
  return map[g] ?? map.D
})

const carbonVsAvg = computed(() => {
  const diff = carbonKg.value - CARBON_BASELINE
  if (Math.abs(diff) < 100) return 'Roughly the same as the UK average'
  if (diff < 0)
    return `${Math.abs(diff).toLocaleString()} kg below the UK average — great work`
  return `${diff.toLocaleString()} kg above the UK average of ${CARBON_BASELINE.toLocaleString()} kg`
})

const carbonBarChart = computed(() => {
  const grade = carbonGradeInfo.value.grade
  return [
    { letter: 'A', color: '#16a34a', h: 8 },
    { letter: 'B', color: '#65a30d', h: 12 },
    { letter: 'C', color: '#ca8a04', h: 16 },
    { letter: 'D', color: '#92400e', h: 20 },
    { letter: 'E', color: '#ea580c', h: 16 },
    { letter: 'F', color: '#dc2626', h: 12 },
    { letter: 'G', color: '#7f1d1d', h: 8 },
  ].map((b) => ({ ...b, active: b.letter === grade }))
})

const carbonDrivers = computed(() => {
  const drivers: Array<{
    bad: boolean
    icon: string
    label: string
    delta: number
  }> = []
  for (const q of QUESTIONS) {
    const val = (answers.value as Record<string, string>)[q.id]
    if (!val) continue
    const opt = q.options.find((o) => o.value === val)
    if (!opt) continue
    if (opt.carbonDelta > 400)
      drivers.push({
        bad: true,
        icon: '⬆',
        label: `${q.cat}: ${opt.label}`,
        delta: opt.carbonDelta,
      })
    else if (opt.carbonDelta < -400)
      drivers.push({
        bad: false,
        icon: '⬇',
        label: `${q.cat}: ${opt.label}`,
        delta: opt.carbonDelta,
      })
  }
  drivers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  return drivers.slice(0, 4)
})

const carbonSaving = computed(() =>
  Math.max(0, carbonKg.value - Math.max(400, carbonKg.value - 2500)),
)
const carbonPct = computed(() =>
  Math.round((carbonSaving.value / carbonKg.value) * 100),
)

// ── Neighbourhood ─────────────────────────────────────────────

function scoreToCost(s: number): number {
  if (s >= 80) return 680
  if (s >= 70) return 890
  if (s >= 60) return 1040
  if (s >= 50) return 1200
  if (s >= 40) return 1347
  return 1490
}

const neighbourhood = computed(() => {
  const s = result.value.total
  const addr = property.value?.addressLine1 ?? 'Your road'
  const parts = addr.split(' ')
  const streetName = parts.slice(1).join(' ')
  const yourNum = parseInt(parts[0] ?? '61', 10)

  return [
    {
      label: `${yourNum + 2} ${streetName}`,
      score: Math.min(100, s + 18),
      isYou: false,
      detail: 'Heat pump · solar · EPC A',
    },
    {
      label: `${yourNum - 4} ${streetName}`,
      score: Math.min(100, s + 9),
      isYou: false,
      detail: 'New boiler (2022) · loft insulation',
    },
    {
      label: `${yourNum - 6} ${streetName}`,
      score: Math.min(100, s + 3),
      isYou: false,
      detail: 'Double glazed · EPC C',
    },
    {
      label: `${addr} — you`,
      score: s,
      isYou: true,
      detail: 'Your current status',
    },
    {
      label: `${yourNum - 2} ${streetName}`,
      score: Math.max(0, s - 9),
      isYou: false,
      detail: 'Single glazed · no upgrades',
    },
  ]
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      cost: scoreToCost(r.score),
      costColor:
        r.score >= 70 ? '#16a34a' : r.score >= 55 ? '#92400e' : '#dc2626',
    }))
})

const nbRank = computed(
  () => neighbourhood.value.find((n) => n.isYou)?.rank ?? 4,
)
const nbGap = computed(() => {
  const me = neighbourhood.value.find((n) => n.isYou)
  const best = neighbourhood.value[0]
  return me && best && !best.isYou ? Math.max(0, me.cost - best.cost) : 0
})
const nbGapReasons = computed(() => {
  const a = answers.value as Record<string, string>
  const reasons = []
  if (
    !a.heatingType ||
    ['old_gas', 'oil', 'electric', 'none_heat'].includes(a.heatingType)
  )
    reasons.push({
      icon: '🔥',
      title: 'Older heating system',
      body: 'running at lower efficiency vs modern heat pumps or A-rated boilers. Costs extra ~£210/yr.',
    })
  if (!a.loftInsulation || ['minimal', 'partial'].includes(a.loftInsulation))
    reasons.push({
      icon: '🏠',
      title: 'No or partial loft insulation',
      body: '25% of heat escapes through the roof. Topping up to 270mm saves ~£320/yr extra.',
    })
  if (!a.windows || ['single', 'mix'].includes(a.windows))
    reasons.push({
      icon: '🪟',
      title: 'Single or mixed glazing',
      body: 'Replacing remaining single-glazed windows saves ~£140/yr and lifts your EPC rating.',
    })
  if (reasons.length === 0)
    reasons.push({
      icon: '⚡',
      title: 'Energy efficiency gap',
      body: 'Completing further upgrades would bring you closer to the top of your street.',
    })
  return reasons.slice(0, 3)
})

// ── Actions ───────────────────────────────────────────────────

function startQuestions() {
  // Read-only mode: don't let non-owners run the quiz
  if (readOnlyMode.value) {
    router.push(`/property/${propertyId}`)
    return
  }
  // Guests are allowed into the simulator — auth is gated later in the
  // funnel (at "Publish to <address>" / KYC), matching the prototype flow.
  const firstUnanswered = QUESTIONS.findIndex(
    (q) => !(answers.value as Record<string, string>)[q.id],
  )
  step.value = firstUnanswered >= 0 ? firstUnanswered : 0
  screen.value = 'questions'
}

// ── HomeScore Accuracy Simulator (replaces the old quiz UI) ────
// Mirrors `homescore-v2_13.html` simulator: 6 improvement steps with
// per-step score / £ / CO₂ deltas. We keep our existing useHomeScore
// composable available, but the simulator manages its own state and
// posts the final score via `saveSimulatorResult()`.

type SimStatus = 'idle' | 'done' | 'diff' | 'todo' | 'skip'
interface SimStep {
  id: string
  title: string
  meta: string
  desc: string
  impact: string
  question: string
  doneLabel?: string
  scoreDelta: number  // pts added to starting score when status === 'done' (or 'diff')
  costSaving: number  // £/yr knocked off bills
  co2Delta: number    // tonnes/yr knocked off CO₂
  status: SimStatus
  diffNote?: string
}

const SIM_STEP_DEFS: Omit<SimStep, 'status'>[] = [
  {
    id: 'loft',
    title: 'Increase loft insulation to 270mm',
    meta: 'Currently 75mm · EPC: Average',
    desc: 'Your EPC records 75mm of loft insulation — the recommended level is 270mm. Topping this up is one of the cheapest and most effective improvements available.',
    impact: 'Score +2 pts · saves ~£40/yr · cost £100–£350',
    question: 'Has this been done since the last EPC?',
    scoreDelta: 2,
    costSaving: 40,
    co2Delta: 0.2,
  },
  {
    id: 'cavity',
    title: 'Cavity wall insulation',
    meta: 'Uninsulated cavity · EPC: Poor',
    desc: 'The biggest single saving available. Part of the cavity wall is uninsulated — filling it stops heat escaping through the walls. ECO4 or Warm Homes grants may cover the full cost.',
    impact: 'Score +7 pts · saves ~£224/yr · cost £500–£1,500 · ECO4 grant may apply',
    question: 'Has cavity wall insulation been filled since the last EPC?',
    scoreDelta: 7,
    costSaving: 224,
    co2Delta: 1.0,
  },
  {
    id: 'floor',
    title: 'Floor insulation',
    meta: 'Suspended floor, no insulation · EPC: N/A',
    desc: 'The suspended timber floor has no insulation — cold air from below makes rooms harder to heat. Insulating this improves both comfort and efficiency.',
    impact: 'Score +3 pts · saves ~£97/yr · cost £800–£1,200',
    question: 'Has floor insulation been added since the last EPC?',
    scoreDelta: 3,
    costSaving: 97,
    co2Delta: 0.4,
  },
  {
    id: 'led',
    title: 'Low energy lighting throughout',
    meta: '15% low energy lighting · EPC: Poor',
    desc: 'Only 15% of fixed lighting outlets use low energy bulbs. Switching all to LED is quick, cheap and immediate — no installer required.',
    impact: 'Score +2 pts · saves ~£45/yr · cost just £110',
    question: 'Have you switched to LED lighting since the last EPC?',
    doneLabel: 'Yes — mostly LED now',
    scoreDelta: 2,
    costSaving: 45,
    co2Delta: 0.1,
  },
  {
    id: 'solar-thermal',
    title: 'Solar water heating',
    meta: 'No solar thermal on EPC',
    desc: 'Solar thermal panels use the sun to heat your water, reducing how hard your boiler works.',
    impact: 'Score +1 pt · saves ~£40/yr · cost £4,000–£6,000',
    question: 'Has solar water heating been installed since the last EPC?',
    doneLabel: 'Yes — fitted',
    scoreDelta: 1,
    costSaving: 40,
    co2Delta: 0.1,
  },
  {
    id: 'solar-pv',
    title: 'Solar photovoltaic panels',
    meta: 'No solar PV on EPC · recommended',
    desc: 'Solar PV generates electricity from sunlight — cutting your electricity bill and earning Smart Export Guarantee payments for surplus energy.',
    impact: 'Score +8 pts · saves ~£248/yr · Smart Export Guarantee payments too',
    question: 'Have solar panels been installed since the last EPC?',
    doneLabel: 'Yes — panels fitted',
    scoreDelta: 8,
    costSaving: 248,
    co2Delta: 1.0,
  },
]

const simSteps = ref<SimStep[]>(
  SIM_STEP_DEFS.map((d) => ({ ...d, status: 'idle' as SimStatus })),
)
const openStepId = ref<string | null>(null)
const simPath = ref<'quiz' | 'bill' | null>('quiz')
const simBillUploaded = ref(false)
const simDiffOpen = ref(false)
const simDiffStepId = ref<string | null>(null)
const simDiffText = ref('')

// EPC year for the hero copy ("Your EPC is from <year>").
const simEpcYear = computed<string>(() => {
  const y =
    (property.value as any)?.epcYear ??
    (property.value as any)?.lodgementDate?.toString().slice(0, 4) ??
    new Date().getFullYear() - 8
  return String(y)
})

// Starting figures — use the EPC-only auto score as the baseline.
const simStartingScore = computed(() => autoScoreVal.value || 52)
const simBaseBills = computed(() => {
  const cert = (property.value as any)?.epcCert
  const total =
    Number(cert?.heatingCostCurrent ?? 0) +
    Number(cert?.hotWaterCostCurrent ?? 0) +
    Number(cert?.lightingCostCurrent ?? 0)
  return total > 0 ? Math.round(total) : 1823
})
const simBaseCo2 = computed(() => {
  // Carbon kg returned by useHomeScore; convert to tonnes.
  const t = (carbonKg.value || 6400) / 1000
  return Math.round(t * 10) / 10
})

// Accumulated improvements from steps with status 'done' or 'diff'.
const simAcceptedSteps = computed(() =>
  simSteps.value.filter((s) => s.status === 'done' || s.status === 'diff'),
)
const simScoreDeltaTotal = computed(() =>
  simAcceptedSteps.value.reduce((sum, s) => sum + s.scoreDelta, 0),
)
const simBillsDelta = computed(() =>
  simAcceptedSteps.value.reduce((sum, s) => sum + s.costSaving, 0),
)
const simCo2Delta = computed(
  () =>
    Math.round(
      simAcceptedSteps.value.reduce((sum, s) => sum + s.co2Delta, 0) * 10,
    ) / 10,
)

const simScore = computed(() =>
  Math.min(100, simStartingScore.value + simScoreDeltaTotal.value),
)
const simBills = computed(() =>
  Math.max(0, simBaseBills.value - simBillsDelta.value),
)
const simCo2 = computed(() =>
  Math.max(0, +(simBaseCo2.value - simCo2Delta.value).toFixed(1)),
)
const simVsNeighbours = computed(() => simBills.value - 1673)

const simAnsweredCount = computed(
  () => simSteps.value.filter((s) => s.status !== 'idle').length,
)
const simProgressPct = computed(
  () => (simAnsweredCount.value / simSteps.value.length) * 100,
)

const simScoreColor = computed(() => {
  const s = simScore.value
  if (s >= 75) return '#00514d'
  if (s >= 60) return '#2EAB55'
  if (s >= 40) return '#E6A23C'
  return '#C73E36'
})

const simScoreBand = computed(() => {
  const s = simScore.value
  const grade =
    s >= 92 ? 'A · Exceptional'
    : s >= 81 ? 'B · Highly efficient'
    : s >= 69 ? 'C · Above average'
    : s >= 55 ? 'D · Average'
    : s >= 39 ? 'E · Poor'
    : s >= 21 ? 'F · Very poor'
    : 'G · Critical'
  return `EPC ${grade}`
})

const simShowPublishPrompt = ref(false)
watch(simAnsweredCount, (n) => {
  if (n >= 3 && simPath.value === 'quiz') simShowPublishPrompt.value = true
})

const simEpcNudge = computed(() => {
  if (simAnsweredCount.value === 0) {
    return {
      title: 'EPC from ' + simEpcYear.value + ' — out of date?',
      body: 'Tell us what\'s changed and we\'ll refine your HomeScore. If a lot has changed, a fresh EPC (~£50) locks in the improvements officially.',
    }
  }
  if (simAcceptedSteps.value.length >= 2) {
    return {
      title: 'Big improvements logged — get a new EPC?',
      body: "You've told us about several upgrades since your last EPC. A new assessment (~£50) could move your official rating up and add real value at sale.",
    }
  }
  return {
    title: 'Keep going — every answer sharpens your score',
    body: 'The more you tell us, the more accurate your HomeScore and street comparison become.',
  }
})

function simBadge(status: SimStatus): string {
  if (status === 'done') return '✅'
  if (status === 'diff') return '🔄'
  if (status === 'todo') return '📋'
  if (status === 'skip') return '⊘'
  return ''
}

function simToggleStep(id: string) {
  openStepId.value = openStepId.value === id ? null : id
}

function simAnswer(id: string, status: SimStatus) {
  const step = simSteps.value.find((s) => s.id === id)
  if (!step) return
  step.status = status
  // Collapse the step after a choice.
  openStepId.value = null
}

function simOpenDiff(id: string) {
  simDiffStepId.value = id
  simDiffText.value =
    simSteps.value.find((s) => s.id === id)?.diffNote || ''
  simDiffOpen.value = true
}

function simCloseDiff() {
  simDiffOpen.value = false
  simDiffStepId.value = null
  simDiffText.value = ''
}

function simConfirmDiff() {
  const step = simSteps.value.find((s) => s.id === simDiffStepId.value)
  if (step) {
    step.status = 'diff'
    step.diffNote = simDiffText.value.trim() || undefined
    openStepId.value = null
  }
  simCloseDiff()
}

function simSelectPath(p: 'quiz' | 'bill') {
  simPath.value = p
  if (p === 'bill') openStepId.value = null
}

function simReset() {
  simSteps.value = SIM_STEP_DEFS.map((d) => ({
    ...d,
    status: 'idle' as SimStatus,
  }))
  openStepId.value = null
  simPath.value = 'quiz'
  simBillUploaded.value = false
  simShowPublishPrompt.value = false
  simDiffText.value = ''
}

async function saveSimulatorResult() {
  if (!isPropertyOwner.value) return
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  const answersMap: Record<string, string> = {}
  for (const s of simSteps.value) {
    answersMap[`sim_${s.id}`] = s.status
    if (s.diffNote) answersMap[`sim_${s.id}_note`] = s.diffNote
  }
  try {
    await fetch(`${config.public.apiBase}/property/${propertyId}/homescore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        total: simScore.value,
        rating: simScoreBand.value,
        answers: answersMap,
      }),
    })
  } catch {}
}

function simSubmit() {
  saveSimulatorResult()
  screen.value = 'results'
  showResult.value = true
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
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    router.push(`/property/${propertyId}`)
    return
  }

  passportClaimLoading.value = true
  try {
    const { getPassportStatus } = usePassportClaim()
    const status = await getPassportStatus(propertyId)

    if (status.hasPassport && status.passportId) {
      if (
        status.isOwner ||
        status.isBuyer ||
        status.isCollaborator ||
        status.canAccess
      ) {
        router.push(`/passportview/${status.passportId}`)
      } else {
        // Passport claimed by someone else — go to property page for buy-access flow
        router.push(`/property/${propertyId}`)
      }
    } else {
      // No passport yet — send through the new claim + KYC flow
      router.push(`/claim/${propertyId}`)
    }
  } catch {
    router.push(`/property/${propertyId}`)
  } finally {
    passportClaimLoading.value = false
  }
}

async function setPassportTab(tab: PassportTab) {
  passportTab.value = tab
  if (tab === 'street' && streetProperties.value.length === 0)
    await fetchStreetData()
  if (tab === 'buyers' && matchedBuyers.value.length === 0)
    await fetchBuyerData()
}

async function fetchStreetData() {
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId}/street`,
    )
    if (res.ok) {
      const data = await res.json()
      streetProperties.value = data.properties ?? []
      streetStats.value = data.stats ?? null
    }
  } catch {}
}

async function fetchBuyerData() {
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId}/matched-buyers`,
    )
    if (res.ok) {
      const data = await res.json()
      matchedBuyers.value = data.buyers ?? []
      buyersTotal.value = data.total ?? 0
    }
  } catch {}
}

function goToPassport() {
  router.push(`/property/${propertyId}`)
}

// ── Buyer results helpers ─────────────────────────────────────

const buyerAnnualCost = computed(() => {
  const cert = property.value?.epcCert
  const heating = Number(cert?.heatingCostCurrent ?? 0)
  const hotWater = Number(cert?.hotWaterCostCurrent ?? 0)
  const lighting = Number(cert?.lightingCostCurrent ?? 0)
  const sum = Math.round(heating + hotWater + lighting)
  if (sum > 0) return sum
  return 1347
})

// ── Buyer-results (watch screen) helpers ─────────────────────
const bvStreetBest = computed(() => {
  // Cheapest a home on this street could plausibly run — anchor to the same
  // street-average proxy the running-costs service uses.
  const own = buyerAnnualCost.value
  return Math.max(680, Math.round(own * 0.78))
})

const bvEpcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#00B050',
    B: '#33B800',
    C: '#92D050',
    D: '#FFD700',
    E: '#FF9933',
    F: '#FF6600',
    G: '#E64A19',
  }
  return map[(property.value?.epcRating || '').toUpperCase()] || '#9c98ad'
})

const bvPassportState = computed<'unclaimed' | 'inProgress' | 'published'>(
  () => {
    const p: any = property.value
    if (!p) return 'unclaimed'
    if (p.passportPublished) return 'published'
    if (p.hasPassport) return 'inProgress'
    return 'unclaimed'
  },
)

const bvSearches = computed<number>(() => {
  const id = property.value?.id || ''
  return 3 + ((id.charCodeAt(0) || 1) % 7)
})

const bvQuestions = [
  {
    icon: '🔥',
    title: 'When was the boiler last serviced?',
    sub: 'Heating scores low — ask for the service record or Gas Safe certificate.',
  },
  {
    icon: '🧱',
    title: 'Is there cavity wall or loft insulation?',
    sub: 'The biggest cost driver at this score. Ask for any installer guarantees.',
  },
  {
    icon: '📄',
    title: 'Can you share the full EPC report?',
    sub: 'The public register only shows the grade — the full document lists every item.',
  },
  {
    icon: '⚡',
    title: 'Do you have an EICR certificate?',
    sub: 'Electrical Installation Condition Report — not legally required for sales, but worth asking.',
  },
]

const buyerEpcGrade = computed(() => {
  const rating = property.value?.epcRating
  if (rating) return String(rating).toUpperCase()
  const score = autoScoreVal.value
  if (score >= 92) return 'A'
  if (score >= 81) return 'B'
  if (score >= 69) return 'C'
  if (score >= 55) return 'D'
  if (score >= 39) return 'E'
  if (score >= 21) return 'F'
  return 'G'
})

const buyerRisks = computed(() => {
  type Row = {
    key: string
    icon: string
    title: string
    body: string
    tone: 'warn' | 'ok'
  }
  const bd = autoBreakdown.value as any
  const pct = (v: number, m: number) => (m > 0 ? (v / m) * 100 : 0)

  const heatingPct = pct(bd?.heating ?? 0, 20)
  const structurePct = pct(bd?.structure ?? 0, 25)
  const electricsPct = pct(bd?.electrics ?? 0, 15)
  const plumbingPct = pct(bd?.plumbing ?? 0, 20)
  const efficiencyPct = pct(bd?.efficiency ?? 0, 20)

  const all: Row[] = []

  // Heating
  if (heatingPct < 60) {
    all.push({
      key: 'heating',
      icon: '🔥',
      title: 'Heating — needs attention',
      body: 'EPC flags old heating system. Boiler replacement could cost £2,500–£4,000.',
      tone: 'warn',
    })
  } else {
    all.push({
      key: 'heating',
      icon: '🔥',
      title: 'Heating — looks reasonable',
      body: 'Heating efficiency is in line with similar homes. Worth asking for the latest service record.',
      tone: 'ok',
    })
  }

  // Structure / insulation
  if (structurePct < 60) {
    all.push({
      key: 'structure',
      icon: '🧱',
      title: 'Insulation — below average',
      body: 'Likely no cavity wall insulation. Adds ~£400/yr vs best-in-street.',
      tone: 'warn',
    })
  } else {
    all.push({
      key: 'structure',
      icon: '🧱',
      title: 'Insulation — looks reasonable',
      body: 'Insulation appears adequate for the property age. Confirm any guarantees with the seller.',
      tone: 'ok',
    })
  }

  // Electrics
  if (electricsPct >= 60) {
    all.push({
      key: 'electrics',
      icon: '⚡',
      title: 'Electrics — looks reasonable',
      body: 'Average for a property of this age. Worth confirming EICR.',
      tone: 'ok',
    })
  } else {
    all.push({
      key: 'electrics',
      icon: '⚡',
      title: 'Electrics — worth checking',
      body: 'Ask for a recent EICR certificate to rule out rewiring costs.',
      tone: 'warn',
    })
  }

  // Ensure at least one green row if any pillar > 60%
  const anyOk =
    heatingPct >= 60 ||
    structurePct >= 60 ||
    electricsPct >= 60 ||
    plumbingPct >= 60 ||
    efficiencyPct >= 60
  if (anyOk && !all.some((r) => r.tone === 'ok')) {
    all.push({
      key: 'other',
      icon: '✓',
      title: 'Other systems — look reasonable',
      body: 'Several EPC pillars are average-or-better. Confirm documentation with the seller.',
      tone: 'ok',
    })
  }

  return all.slice(0, 3)
})

const { toggleSave } = usePropertyActions()
const { showToast } = useAppToast()

async function saveToBuyerProfile() {
  // The "Save to Buyer Profile" CTAs now direct the user to the new
  // Buyer Profile flow (/buyer-profile) where they build/share their own
  // verified buyer profile. Keeping `toggleSave` available elsewhere for
  // the wishlist feature — this button is the funnel into the profile build.
  // Auth-gate: if guest, send to sign-in with redirect-back.
  const tk =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!tk) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', '/buyer-profile')
    }
    showAuthGate.value = true
    return
  }
  router.push('/buyer-profile')
}

// ── Quick wins / boost score ──────────────────────────────────

const qwDocs = [
  {
    key: 'epc',
    label: 'EPC Certificate',
    sub: 'Energy rating — required for any sale',
    pts: 8,
    icon: '⚡',
    bg: '#fef3c7',
  },
  {
    key: 'gas',
    label: 'Gas Safety Certificate',
    sub: 'Annual boiler service — Gas Safe registered',
    pts: 10,
    icon: '🔥',
    bg: '#fff0f0',
  },
  {
    key: 'eicr',
    label: 'EICR Report',
    sub: 'Electrical check removes a major buyer red flag',
    pts: 7,
    icon: '🔌',
    bg: '#eff6ff',
  },
  {
    key: 'planning',
    label: 'Planning Permission',
    sub: 'Extensions, conversions or permitted development',
    pts: 5,
    icon: '📋',
    bg: '#f0fdf4',
  },
  {
    key: 'fensa',
    label: 'FENSA Certificate',
    sub: 'Window installation compliance certificate',
    pts: 4,
    icon: '🪟',
    bg: '#fdf4ff',
  },
  {
    key: 'buildregs',
    label: 'Building Regulations cert',
    sub: 'Covers any structural or significant works',
    pts: 5,
    icon: '🏗️',
    bg: '#fff7ed',
  },
]

const qwPros = [
  {
    key: 'gassafe',
    label: 'Book a Gas Safe engineer',
    sub: 'Service your boiler · cert auto-lands in your score',
    icon: '🛠️',
    bg: '#fef3c7',
  },
  {
    key: 'electrician',
    label: 'Book an electrician (EICR)',
    sub: 'Electrical check · from £150',
    icon: '⚡',
    bg: '#eff6ff',
  },
  {
    key: 'epcassess',
    label: 'New EPC assessment',
    sub: 'From £60 · required if yours is 10+ years old',
    icon: '🏡',
    bg: '#f0fdf4',
  },
]

const uploadedDocs = reactive<Record<string, boolean>>({})
const docFileInput = ref<HTMLInputElement | null>(null)
const pendingDocKey = ref<string | null>(null)

function triggerDocUpload(docKey: string) {
  if (uploadedDocs[docKey]) return
  pendingDocKey.value = docKey
  docFileInput.value?.click()
}

function onDocFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && pendingDocKey.value) {
    uploadedDocs[pendingDocKey.value] = true
    const doc = qwDocs.find((d) => d.key === pendingDocKey.value)
    showToast({
      message: `${doc?.label ?? 'Document'} uploaded`,
      iconEmoji: '✓',
    })
  }
  pendingDocKey.value = null
  if (input) input.value = ''
}

function openMarketplace() {
  showToast({
    message: 'Marketplace coming soon',
    iconEmoji: '🔧',
  })
}

const qwUploadedCount = computed(
  () => Object.values(uploadedDocs).filter(Boolean).length,
)
const qwUploadedPoints = computed(() =>
  qwDocs.reduce((sum, d) => (uploadedDocs[d.key] ? sum + d.pts : sum), 0),
)
const qwScore = computed(() =>
  Math.min(100, result.value.total + qwUploadedPoints.value),
)
const qwMoveReady = computed(() =>
  Math.min(100, Math.round((qwUploadedCount.value / qwDocs.length) * 100)),
)
const qwProgress = computed(() =>
  Math.min(100, Math.round((qwScore.value + qwMoveReady.value) / 2)),
)

async function claimFromMoveReady() {
  router.push(`/claim/${propertyId}`)
}

function goToClaim() {
  router.push(`/claim/${propertyId}`)
}

function goBack() {
  if (screen.value === 'passport') {
    screen.value = 'results'
    return
  }
  if (screen.value === 'buyer-results') {
    screen.value = 'landing'
    return
  }
  if (screen.value === 'quick-wins') {
    screen.value = 'results'
    return
  }
  if (screen.value === 'move-ready') {
    screen.value = 'quick-wins'
    return
  }
  if (screen.value === 'results') {
    screen.value = 'landing'
    return
  }
  if (screen.value === 'questions') {
    screen.value = 'landing'
    return
  }
  // Landing screen — step back in history so we return to wherever we came
  // from (property page, explore, etc.) without pushing a new entry. Falls
  // back to the property page if the user landed here directly.
  const hasInAppPrev =
    typeof window !== 'undefined' &&
    typeof (router.options.history as any)?.state?.back === 'string'
  if (hasInAppPrev) router.back()
  else router.replace(`/property/${propertyId}`)
}

async function saveToBackend() {
  // Only save to DB if this user is the verified property owner
  if (!isPropertyOwner.value) return
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  try {
    await fetch(`${config.public.apiBase}/property/${propertyId}/homescore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        total: result.value.total,
        rating: result.value.rating,
        heating: result.value.breakdown.heating,
        structure: result.value.breakdown.structure,
        efficiency: result.value.breakdown.efficiency,
        electrics: result.value.breakdown.electrics,
        plumbing: result.value.breakdown.plumbing,
        answers: answers.value,
      }),
    })
  } catch {}
}

// ── Lifecycle ─────────────────────────────────────────────────

onMounted(async () => {
  // Load property data — also returns hasPassport / passportPublished for guests.
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}`)
    if (res.ok) {
      property.value = await res.json()
      prefill(property.value)
      // Seed passport state from public endpoint (used for guests).
      const p: any = property.value
      if (p?.hasPassport) {
        hasOtherOwnerPassport.value = true
        isOtherPassportPublished.value = !!p.passportPublished
      }
    }
  } catch {}

  // Fire-and-forget: log this view + fetch search stats so we can render
  // the "People searched this address this month" card.
  try {
    const sid = getOrCreateSessionId()
    fetch(`${config.public.apiBase}/property/${propertyId}/log-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token')
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}),
      },
      body: JSON.stringify({ sessionId: sid }),
    }).catch(() => {})
    fetch(`${config.public.apiBase}/property/${propertyId}/search-stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j) searchStats.value = j
      })
      .catch(() => {})
  } catch {}

  // Check ownership and load saved score from backend if owner
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null

  // Passport status check — also drives read-only mode for non-owners.
  // For guests (no token) we use the public passport state seeded from /property/:id above.
  try {
    if (token) {
      const { getPassportStatus } = usePassportClaim()
      const status = await getPassportStatus(propertyId)
      isPropertyOwner.value = status.isOwner ?? false
      isPassportCollaborator.value = status.isCollaborator ?? false
      hasOtherOwnerPassport.value =
        !!status.hasPassport && !status.isOwner && !status.isCollaborator
      isOtherPassportPublished.value = !!(
        status.hasPassport && status.isPublished
      )
    }

    // Restore "already notified" state from localStorage
    if (typeof localStorage !== 'undefined') {
      notifiedOfPublish.value = !!localStorage.getItem(
        `hs_notify_publish_${propertyId}`,
      )
    }

    // Read-only mode: fetch the owner's published HomeScore from the public endpoint
    if (readOnlyMode.value) {
      try {
        const scoreRes = await fetch(
          `${config.public.apiBase}/property/${propertyId}/homescore/public`,
        )
        if (scoreRes.ok) {
          publicOwnerScore.value = await scoreRes.json()
          if (publicOwnerScore.value?.answers) {
            answers.value = publicOwnerScore.value.answers
          }
        }
      } catch {}
      screen.value = 'landing'
      return
    }
  } catch {}

  if (token) {
    try {
      if (isPropertyOwner.value) {
        const scoreRes = await fetch(
          `${config.public.apiBase}/property/${propertyId}/homescore`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (scoreRes.ok) {
          const existing = await scoreRes.json()
          if (existing?.answers && Object.keys(existing.answers).length > 0) {
            // Owner has a saved score — load it (backend is source of truth)
            answers.value = existing.answers
            if (Object.keys(existing.answers).length >= QUESTIONS.length) {
              screen.value = 'results'
              return
            }
          }
        }
      }
    } catch {}
  }

  const answeredCount = Object.keys(answers.value).length
  screen.value = answeredCount >= QUESTIONS.length ? 'results' : 'landing'

  // Honour ?screen=… so users returning here after sign-in / signup land on
  // the page they were trying to reach (e.g. buyer-results, questions,
  // quick-wins) rather than the landing screen.
  const requested = (route.query?.screen as string | undefined)?.trim()
  const allowed: Screen[] = [
    'buyer-results',
    'questions',
    'quick-wins',
    'move-ready',
    'results',
    'passport',
  ]
  if (token && requested && (allowed as string[]).includes(requested)) {
    if (requested === 'questions') {
      const firstUnanswered = QUESTIONS.findIndex(
        (q) => !(answers.value as Record<string, string>)[q.id],
      )
      step.value = firstUnanswered >= 0 ? firstUnanswered : 0
    }
    screen.value = requested as Screen
    // Strip the query so back-nav / refresh doesn't re-trigger
    router.replace({ path: route.path }).catch(() => {})
  }
})

watch(showResult, (shown) => {
  if (shown && screen.value === 'questions') {
    screen.value = 'results'
    saveToBackend()
  }
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
  min-height: 100dvh;
  background: #f0f4f4;
  color: #0f172a;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e2e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.hs-back-btn:active {
  background: #f0f4f4;
}
.hs-header-center {
  flex: 1;
  text-align: center;
}
.hs-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}
.hs-header-sub {
  font-size: 11px;
  color: #94a3b8;
  margin: 1px 0 0;
}
.hs-header-spacer {
  width: 32px;
  flex-shrink: 0;
}
.hs-tour-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.hs-tour-btn:hover {
  background: #f2faf8;
  border-color: #b2e4e1;
  color: #007e78;
}

/* ── Property strip ───────────────────────────────────── */
.hs-prop-strip {
  background: white;
  padding: 9px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e2e8e8;
}
.hs-prop-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1f7a66;
  box-shadow: 0 0 0 4px #ccfbf1;
  flex-shrink: 0;
}
.hs-prop-address {
  flex: 1;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
.hs-epc-chip {
  font-size: 10px;
  font-weight: 800;
  color: white;
  padding: 2px 7px;
  border-radius: 5px;
  flex-shrink: 0;
}

/* ── Scroll container ─────────────────────────────────── */
.hs-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 6px 18px 0;
  scroll-behavior: smooth;
}

/* ── Loading ──────────────────────────────────────────── */
.hs-loading-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.hs-loading-ring {
  width: 44px;
  height: 44px;
  border: 4px solid #e2e8e8;
  border-top-color: #1f7a66;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.hs-loading-label {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

/* ── Money hook ───────────────────────────────────────── */
.hs-money-hook {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff;
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.hs-money-hook::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.2),
    transparent 70%
  );
}
.hs-money-hook-label {
  font-size: 12px;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hs-money-hook-amount {
  font-size: 36px;
  font-weight: 700;
  margin: 6px 0 4px;
  letter-spacing: -0.02em;
}
.hs-money-hook-sub {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

/* ── Gauge card ───────────────────────────────────────── */
.hs-gauge-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #0f172a;
}
.hs-gauge-card-eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1f7a66;
  font-weight: 600;
  margin-bottom: 6px;
  align-self: flex-start;
}
.hs-gauge-wrap {
  display: flex;
  justify-content: center;
}
.hs-gauge-svg {
  display: block;
}
/* EPC-based positive-framing block — sits above the confidence pill */
.hs-epc-explain {
  margin-top: 14px;
  background: #f8fafc;
  border: 1px solid #eef0f6;
  border-radius: 12px;
  padding: 12px 14px;
  text-align: left;
}
.hs-epc-explain-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 6px;
}
.hs-epc-explain-body {
  font-size: 12.5px;
  color: #4a5568;
  line-height: 1.55;
}
.hs-epc-explain-body :deep(b) {
  color: #231d45;
  font-weight: 700;
}

.hs-conf-pill {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
  border-radius: 999px;
  padding: 5px 12px;
}
.hs-conf-pill-ic {
  font-size: 11px;
  line-height: 1;
}
.hs-conf-pill--good {
  background: #d1fae5;
  color: #1f7a66;
}
.hs-conf-pill--ok {
  background: #f1f9f4;
  color: #00a19a;
}
.hs-conf-pill--warn {
  background: #fef3c7;
  color: #92400e;
}
.hs-epc-note {
  font-size: 12px;
  color: #475569;
  text-align: center;
  margin: 10px 0 0;
  line-height: 1.5;
  font-style: italic;
}

/* ── CTA ──────────────────────────────────────────────── */
.hs-cta-primary {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff;
  border: none;
  width: 100%;
  padding: 16px 18px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 16px rgba(15, 118, 110, 0.25);
  margin-bottom: 8px;
}
.hs-cta-primary:hover {
  filter: brightness(1.05);
}
.hs-cta-chev {
  font-size: 18px;
}
.hs-cta-sub {
  text-align: center;
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0 0 14px;
}
.hs-owner-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fef3c7;
  border: 1px solid #fef3c7;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.45;
  margin-top: 4px;
}

/* ── Breakdown ────────────────────────────────────────── */
.hs-breakdown-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-breakdown-title {
  font-size: 17px;
  font-weight: 650;
  color: #0f172a;
  margin: 0 0 6px;
}
.hs-breakdown-note {
  font-size: 11px;
  color: #94a3b8;
  margin: 10px 0 0;
  text-align: center;
}
.hs-pillar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.hs-pillar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
}
.hs-pillar-name {
  width: 75px;
  color: #475569;
  font-weight: 500;
}
.hs-pillar-track {
  flex: 1;
  height: 7px;
  background: #e2e8e8;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}
.hs-pillar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hs-pillar-val {
  width: 38px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  font-weight: 600;
}

/* ── Question flow ────────────────────────────────────── */
.hs-progress-wrap {
  background: #f0f4f4;
  padding: 0 18px 8px;
}
.hs-progress-track {
  height: 4px;
  background: #e2e8e8;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}
.hs-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1f7a66, #2dd4bf);
  border-radius: 4px;
  transition: width 0.45s ease;
}
.hs-progress-label {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
  margin: 0;
}

.hs-q-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  padding: 6px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #0f172a;
}

/* ── Live score card ──────────────────────────────────── */
.hs-live-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1px solid #e2e8e8;
  position: relative;
}
.hs-live-mini-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  flex-shrink: 0;
}
.hs-live-num {
  font-size: 14px;
  font-weight: 700;
  z-index: 2;
  position: relative;
}
.hs-live-info {
  flex: 1;
}
.hs-live-lbl {
  font-size: 10.5px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.hs-live-hint {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-top: 1px;
}
.hs-live-conf {
  font-size: 10.5px;
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}
.hs-live-conf.mid {
  background: #dbeafe;
  color: #1e40af;
}
.hs-live-conf.high {
  background: #dcfce7;
  color: #166534;
}

/* ── Delta flying animation ───────────────────────────── */
.hs-delta-float {
  position: absolute;
  right: 14px;
  top: 50%;
  font-size: 13px;
  font-weight: 700;
  animation: floatUp 1.2s ease forwards;
  pointer-events: none;
  z-index: 10;
}
.hs-delta-float.pos {
  color: #16a34a;
}
.hs-delta-float.neg {
  color: #dc2626;
}
@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-32px);
  }
}
.hs-float-enter-active {
  animation: floatUp 1.2s ease forwards;
}

/* ── Question card ────────────────────────────────────── */
.hs-question-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-cat-chip {
  font-size: 11px;
  font-weight: 600;
  color: #1f7a66;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: block;
}
.hs-q-title {
  font-size: 19px;
  font-weight: 650;
  line-height: 1.3;
  margin: 0 0 18px;
  color: #0f172a;
}
.hs-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid #e2e8e8;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: #0f172a;
  text-align: left;
}
.hs-option-btn:hover {
  border-color: #94a3b8;
}
.hs-option-btn.selected {
  border-color: #1f7a66;
  background: #f0fdfa;
  color: #0f766e;
  font-weight: 600;
}
.hs-option-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #94a3b8;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  transition: border-color 0.15s ease;
}
.hs-option-btn.selected .hs-option-radio {
  border-color: #1f7a66;
  background: #1f7a66;
}
.hs-option-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
}
.hs-option-label {
  flex: 1;
  color: #0f172a;
  word-break: break-word;
}
.hs-option-btn.selected .hs-option-label {
  color: #0f766e;
}
.hs-narr-hint {
  font-size: 12px;
  color: #475569;
  font-style: italic;
  margin: 12px 0 0;
  line-height: 1.45;
  border-left: 3px solid #1f7a66;
  padding-left: 10px;
}

/* ── Navigation ───────────────────────────────────────── */
.hs-nav {
  display: flex;
  gap: 10px;
}
.hs-btn-secondary {
  background: #fff;
  color: #0f172a;
  border: 1px solid #e2e8e8;
  padding: 14px 18px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.hs-btn-primary {
  flex: 1;
  background: #1f7a66;
  color: #fff;
  border: none;
  padding: 14px 18px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.hs-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.hs-btn-ghost {
  width: 100%;
  background: transparent;
  color: #475569;
  border: none;
  padding: 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* ── Slide transition ─────────────────────────────────── */
.hs-slide-enter-active,
.hs-slide-leave-active {
  transition: all 0.22s ease;
}
.hs-slide-enter-from {
  opacity: 0;
  transform: translateX(22px);
}
.hs-slide-leave-to {
  opacity: 0;
  transform: translateX(-22px);
}

/* ── Read-only banner (non-owner viewing verified owner's score) ── */
/* ── Published passport banner (navy) ─────────────────────── */
.hs-pp-banner--published {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #1a1640, #231d45);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.hs-pp-banner-ic {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}
.hs-pp-banner-body {
  flex: 1;
  min-width: 0;
}
.hs-pp-banner-title {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}
.hs-pp-banner-sub {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.45;
}
.hs-pp-banner-cta--mint {
  flex-shrink: 0;
  border: none;
  background: #3dbda3;
  color: #042f2e;
  font-size: 11px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: transform 0.15s ease;
}
.hs-pp-banner-cta--mint:active {
  transform: scale(0.96);
}

/* ── Published Passport banner (rich, prototype-matching) ── */
.hs-pp-pub {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1640, #231d45);
  border: 1.5px solid #231d45;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.hs-pp-pub-glow {
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.28), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.hs-pp-pub-inner {
  position: relative;
  z-index: 1;
}
.hs-pp-pub-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #3dbda3;
  margin-bottom: 6px;
}
.hs-pp-eyebrow-ic {
  width: 12px;
  height: 12px;
  object-fit: contain;
  flex-shrink: 0;
}
.hs-searched-sub-ic {
  display: inline-block;
  width: 11px;
  height: 11px;
  object-fit: contain;
  vertical-align: -2px;
  margin-left: 2px;
}
.hs-buyer-save-ic-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.hs-pp-owner-cta-ic {
  width: 12px;
  height: 12px;
  object-fit: contain;
  flex-shrink: 0;
}
.hs-pp-pub-title {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin-bottom: 8px;
}
.hs-pp-pub-body {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
  margin-bottom: 10px;
}
.hs-pp-pub-body strong {
  color: #fff;
  font-weight: 700;
}
.hs-pp-pub-explainer {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hs-pp-pub-explainer-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #3dbda3;
  margin-bottom: 6px;
}
.hs-pp-pub-explainer-row {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.45;
  display: flex;
  gap: 6px;
}
.hs-pp-pub-check {
  color: #3dbda3;
  font-weight: 800;
  flex-shrink: 0;
}
.hs-pp-pub-unlock {
  width: 100%;
  border: none;
  background: #3dbda3;
  color: #042f2e;
  font-size: 13px;
  font-weight: 800;
  padding: 11px;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 8px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.hs-pp-pub-unlock:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(94, 234, 212, 0.28);
}

/* ── In-progress passport banner (warm amber, prototype-matching) ── */
.hs-pp-claimed {
  background: #fffbeb;
  border: 1.5px solid #fef3c7;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.hs-pp-claimed-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #92400e;
  margin-bottom: 6px;
}
.hs-pp-claimed-title {
  font-size: 14px;
  font-weight: 800;
  color: #78350f;
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin-bottom: 8px;
}
.hs-pp-claimed-body {
  font-size: 12px;
  color: #78350f;
  line-height: 1.55;
  margin-bottom: 10px;
}
.hs-pp-claimed-body strong {
  color: #92400e;
  font-weight: 700;
}
.hs-pp-claimed-explainer {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hs-pp-claimed-explainer-amber {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #fef3c7;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hs-pp-claimed-explainer-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 6px;
}
.hs-pp-claimed-explainer-title-amber {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #92400e;
  margin-bottom: 6px;
}
.hs-pp-claimed-explainer-row {
  font-size: 11px;
  color: #4a5568;
  line-height: 1.45;
  display: flex;
  gap: 6px;
}
.hs-pp-claimed-check {
  color: #00a19a;
  font-weight: 800;
  flex-shrink: 0;
}
.hs-pp-claimed-cta {
  width: 100%;
  border: none;
  background: #f59e0b;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  padding: 11px;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 8px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.hs-pp-claimed-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.28);
}
.hs-pp-claimed-done {
  text-align: center;
  font-size: 12px;
  color: #15803d;
  font-weight: 600;
  padding: 8px 0;
  margin-bottom: 4px;
}

/* ── No-passport banner (neutral grey, prototype-matching) ── */
.hs-pp-none {
  background: #f8f7fc;
  border: 1.5px solid #eef0f6;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.hs-pp-none-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 6px;
}
.hs-pp-none-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin-bottom: 8px;
}
.hs-pp-none-body {
  font-size: 12px;
  color: #4a5568;
  line-height: 1.55;
  margin-bottom: 10px;
}
.hs-pp-none-body strong {
  color: #231d45;
  font-weight: 700;
}
.hs-pp-none-explainer {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hs-pp-none-explainer-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 6px;
}
.hs-pp-none-explainer-row {
  font-size: 11px;
  color: #4a5568;
  line-height: 1.45;
  display: flex;
  gap: 6px;
}
.hs-pp-none-check {
  color: #00a19a;
  font-weight: 800;
  flex-shrink: 0;
}

/* Owner sign-in CTA — sits below the published / in-progress banner */
.hs-pp-owner-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  font-size: 12.5px;
  font-weight: 800;
  padding: 10px;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  margin: -6px 0 14px;
  transition: background 0.15s ease;
}
.hs-pp-owner-cta--published {
  border: 1.5px solid rgba(94, 234, 212, 0.5);
  background: rgba(94, 234, 212, 0.08);
  color: #3dbda3;
  margin: 0;
  padding: 10px;
}
.hs-pp-owner-cta--published:hover,
.hs-pp-owner-cta--published:active {
  background: rgba(94, 234, 212, 0.16);
}
.hs-pp-owner-cta--inprogress {
  border: 1.5px solid #92400e;
  background: #fff;
  color: #92400e;
  margin-top: 8px;
  margin-bottom: 0;
}
.hs-pp-owner-cta--inprogress:hover,
.hs-pp-owner-cta--inprogress:active {
  background: #fef3c7;
}

/* ── In-progress passport banner (amber) ─────────────────── */
.hs-pp-inprogress {
  background: #fffbeb;
  border: 1.5px solid #fef3c7;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.hs-pp-inprogress-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.hs-pp-inprogress-ic {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
}
.hs-pp-inprogress-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
}
.hs-pp-inprogress-sub {
  font-size: 11.5px;
  color: #78350f;
  margin-top: 2px;
  line-height: 1.5;
}
.hs-pp-inprogress-box {
  background: #fff;
  border: 1px solid #fef3c7;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
}
.hs-pp-inprogress-box:last-of-type {
  margin-bottom: 10px;
}
.hs-pp-inprogress-box-title {
  font-size: 11.5px;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 2px;
}
.hs-pp-inprogress-box-body {
  font-size: 11px;
  color: #78350f;
  line-height: 1.4;
}
.hs-pp-inprogress-cta {
  width: 100%;
  border: none;
  padding: 11px;
  border-radius: 11px;
  background: #f59e0b;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
}
.hs-pp-inprogress-cta:active {
  background: #92400e;
}
.hs-pp-inprogress-done {
  text-align: center;
  font-size: 12px;
  color: #15803d;
  font-weight: 600;
  padding: 10px 0 2px;
}
.hs-readonly-cta {
  width: 100%;
  margin-top: 14px;
  border: none;
  background: #231d45;
  color: #fff;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.hs-readonly-cta:active {
  background: #1a163a;
}
.hs-readonly-cta-arrow {
  font-size: 16px;
  font-weight: 700;
}
.hs-readonly-subnote {
  text-align: center;
  font-size: 11px;
  color: #64748b;
  margin-top: 8px;
  line-height: 1.5;
}

/* ── Results ──────────────────────────────────────────── */
.hs-addr-strip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}
.hs-addr-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1f7a66;
  box-shadow: 0 0 0 4px #ccfbf1;
  flex-shrink: 0;
  margin-top: 6px;
}
.hs-addr-body {
  flex: 1;
  min-width: 0;
}
.hs-addr-text {
  font-weight: 700;
  font-size: 14px;
  color: #231d45;
  line-height: 1.25;
}
.hs-addr-tiny {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.35;
}
.hs-addr-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
  flex-shrink: 0;
}
.hs-addr-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  line-height: 1.4;
}
.hs-addr-badge-ic {
  width: 12px;
  height: 12px;
  object-fit: contain;
  flex-shrink: 0;
}
.hs-addr-badge--pub {
  background: #231d45;
  color: #fff;
}
.hs-addr-badge--prog {
  background: #fef3c7;
  color: #92400e;
}
.hs-addr-badge--unclaimed {
  background: #f0fdfa;
  color: #00a19a;
  border: 1px solid #e2f1ea;
  cursor: pointer;
  transition: background 0.15s;
}
.hs-addr-badge--unclaimed:hover,
.hs-addr-badge--unclaimed:active {
  background: #ccfbf1;
}

.hs-savings-hero {
  background: linear-gradient(135deg, #1f7a66, #00a19a);
  color: #fff;
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 14px;
}
.hs-savings-eyebrow {
  font-size: 11px;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hs-savings-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
}
.hs-savings-amount {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.hs-savings-pill {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}
.hs-savings-sub {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
  line-height: 1.4;
}

.hs-journey-card {
  background: white;
  border-radius: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-journey-inner {
  padding: 16px 16px 12px;
}
.hs-journey-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 12px;
}
.hs-journey-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 14px;
}
.hs-journey-col {
  text-align: center;
  padding: 0 8px;
}
.hs-journey-num {
  font-size: 24px;
  font-weight: 800;
}
.hs-journey-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 1px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.hs-journey-sub {
  font-size: 10px;
  color: #475569;
  margin-top: 3px;
}
.hs-journey-bar-track {
  height: 8px;
  background: #e2e8e8;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}
.hs-journey-bar-fill {
  height: 8px;
  background: linear-gradient(90deg, #1f7a66, #16a34a);
  border-radius: 4px;
  transition: width 0.8s ease;
}
.hs-journey-bar-label {
  font-size: 11.5px;
  color: #475569;
}
.hs-street {
  background: #f8fafc;
}

.hs-carbon-card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
  color: #fff;
}
.hs-carbon-top {
  padding: 16px 16px 12px;
}
.hs-carbon-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 8px;
}
.hs-carbon-main-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 12px;
}
.hs-carbon-kg {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
}
.hs-carbon-kg-label {
  font-size: 11px;
  opacity: 0.75;
  margin-top: 2px;
}
.hs-carbon-grade-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  padding: 5px 12px 5px 8px;
  margin-bottom: 6px;
}
.hs-carbon-grade-letter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
}
.hs-carbon-grade-label {
  font-size: 12px;
  font-weight: 600;
}
.hs-carbon-vs-avg {
  font-size: 11.5px;
  opacity: 0.8;
}
.hs-carbon-bars {
  display: flex;
  gap: 3px;
  margin-bottom: 12px;
  align-items: flex-end;
}
.hs-carbon-bar-col {
  flex: 1;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
}
.hs-carbon-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  opacity: 0.55;
  margin-bottom: 14px;
  letter-spacing: 0.04em;
}
.hs-carbon-drivers {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hs-carbon-driver-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.9;
}
.hs-carbon-driver-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}
.hs-carbon-driver-label {
  flex: 1;
}
.hs-carbon-driver-val {
  font-weight: 700;
  white-space: nowrap;
}
.hs-carbon-upgrade-bar {
  background: rgba(255, 255, 255, 0.08);
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.hs-carbon-upgrade-title {
  font-size: 11.5px;
  font-weight: 700;
  margin-bottom: 6px;
}
.hs-carbon-upgrade-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hs-carbon-upgrade-text {
  font-size: 11px;
  opacity: 0.8;
}
.hs-carbon-save-pill {
  margin-left: auto;
  background: #00a19a;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
}

.hs-trust-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-trust-inner {
  margin-bottom: 14px;
}
.hs-trust-title {
  font-size: 17px;
  font-weight: 650;
  margin: 0 0 10px;
  color: #0f172a;
}
.hs-trust-steps {
  display: flex;
  align-items: flex-start;
}
.hs-trust-col {
  flex: 1;
  text-align: center;
}
.hs-trust-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 5px;
}
.hs-trust-dot.done {
  background: #16a34a;
  color: #fff;
}
.hs-trust-dot.pending {
  background: #e2e8e8;
  color: #94a3b8;
}
.hs-trust-step-label {
  font-size: 10px;
  font-weight: 700;
}
.hs-trust-step-label.done {
  color: #16a34a;
}
.hs-trust-step-label.pending {
  color: #94a3b8;
}
.hs-trust-step-sub {
  font-size: 9.5px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.3;
}
.hs-trust-connector {
  flex: 0 0 24px;
  height: 2px;
  background: #e2e8e8;
  margin-top: 13px;
}
.hs-trust-connector.done {
  background: #16a34a;
}
.hs-trust-explain {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  font-size: 12.5px;
  color: #0f172a;
  line-height: 1.5;
}
.hs-trust-nudge {
  background: #f0fdfa;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid #99f6e4;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 14px;
}
.hs-trust-nudge-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f766e;
}
.hs-trust-nudge-sub {
  font-size: 11.5px;
  color: #475569;
  margin-top: 1px;
}

.hs-wins-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-wins-title {
  font-size: 17px;
  font-weight: 650;
  color: #0f172a;
  margin: 0 0 2px;
}
.hs-wins-sub {
  font-size: 14px;
  color: #475569;
  margin: 0 0 14px;
}
.hs-win-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 14px;
  margin-bottom: 10px;
  border: 1px solid #e2e8e8;
  align-items: center;
}
.hs-win-item:last-child {
  margin-bottom: 0;
}
.hs-win-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0fdfa;
  color: #0f766e;
  font-weight: 700;
  font-size: 13px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.hs-win-body {
  flex: 1;
}
.hs-win-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 2px;
}
.hs-win-sub {
  font-size: 12px;
  color: #475569;
  margin: 0;
}
.hs-win-right {
  text-align: right;
  flex-shrink: 0;
}
.hs-win-saving {
  color: #16a34a;
  font-weight: 700;
  font-size: 13px;
  margin: 0;
}
.hs-win-pts {
  color: #1f7a66;
  font-weight: 700;
  font-size: 11.5px;
  margin: 0;
}

.hs-opps-card {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  color: #0f172a;
}
.hs-opps-title {
  font-size: 17px;
  font-weight: 650;
  color: #78350f;
  margin: 0 0 10px;
}
.hs-opp-item {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  margin-bottom: 8px;
  align-items: flex-start;
}
.hs-opp-item:last-child {
  margin-bottom: 0;
}
.hs-opp-icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}
.hs-opp-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #78350f;
  margin: 0 0 2px;
}
.hs-opp-sub {
  font-size: 12px;
  color: #92400e;
  margin: 0;
  line-height: 1.4;
}

.hs-nb-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-nb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}
.hs-nb-title {
  font-size: 17px;
  font-weight: 650;
  color: #0f172a;
}
.hs-nb-rank {
  background: #f0fdfa;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.hs-nb-body {
  font-size: 12.5px;
  color: #475569;
  margin-bottom: 12px;
  line-height: 1.4;
}
.hs-nb-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}
.hs-nb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
}
.hs-nb-row.mine {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
}
.hs-nb-pos {
  width: 22px;
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  flex-shrink: 0;
}
.hs-nb-pos.mine {
  color: #0f766e;
}
.hs-nb-addr {
  font-size: 13.5px;
  font-weight: 500;
  color: #0f172a;
}
.hs-nb-addr.mine {
  color: #0f766e;
  font-weight: 700;
}
.hs-nb-detail {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.hs-nb-cost {
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.hs-nb-gap-card {
  background: linear-gradient(135deg, #fef3c7, #fff7ed);
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #fed7aa;
  margin-bottom: 12px;
}
.hs-nb-gap-title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 6px;
}
.hs-nb-gap-reasons {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.hs-nb-gap-reason {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: #78350f;
}
.hs-nb-gap-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #fed7aa;
  font-size: 12px;
  color: #92400e;
}
.hs-nb-nudge {
  background: #f0fdfa;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.hs-nb-nudge-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #0f766e;
}
.hs-nb-nudge-sub {
  font-size: 11.5px;
  color: #475569;
  opacity: 0.8;
}

.hs-retake-btn {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8e8;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 14px;
}

/* ── Passport bridge ──────────────────────────────────── */
.hs-pp-card {
  background: linear-gradient(135deg, #131129, #1e1842);
  color: #fff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.hs-pp-card::before {
  content: '';
  position: absolute;
  right: -60px;
  top: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(20, 184, 166, 0.35),
    transparent 70%
  );
}
.hs-pp-card > * {
  position: relative;
  z-index: 1;
}
.hs-pp-badge {
  display: inline-block;
  background: rgba(20, 184, 166, 0.2);
  color: #3dbda3;
  font-size: 10.5px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hs-pp-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.25;
}
.hs-pp-body {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.5;
  margin: 0 0 16px;
}
.hs-pp-progress {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}
.hs-pp-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  margin-bottom: 8px;
  opacity: 0.85;
}
.hs-pp-progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}
.hs-pp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14b8a6, #3dbda3);
  border-radius: 999px;
  transition: width 0.6s ease;
}
.hs-pp-docs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.hs-pp-doc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12.5px;
}
.hs-pp-doc-ic {
  font-size: 14px;
}
.hs-pp-doc-name {
  flex: 1;
}
.hs-pp-doc-gain {
  color: #3dbda3;
  font-weight: 600;
  font-size: 11.5px;
}
.hs-pp-cta {
  background: #14b8a6;
  color: #042f2e;
  border: none;
  padding: 14px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hs-pp-cta:hover {
  filter: brightness(1.05);
}
.hs-pp-cta-sub {
  text-align: center;
  font-size: 11px;
  opacity: 0.7;
  margin-top: 10px;
}

.hs-pp-unlocks-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.04);
  color: #0f172a;
}
.hs-pp-unlocks-title {
  font-size: 17px;
  font-weight: 650;
  color: #0f172a;
  margin: 0 0 12px;
}
.hs-pp-unlocks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hs-pp-unlock-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.hs-pp-unlock-icon {
  font-size: 20px;
}
.hs-pp-unlock-name {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}
.hs-pp-unlock-sub {
  font-size: 13px;
  color: #475569;
  margin-top: 2px;
}

/* ── Vault tabs ──────────────────────────────────────── */
.hs-vault-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e2e8e8;
  padding: 0 6px;
}
.hs-vault-tab {
  flex: 1;
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  padding: 13px 6px 11px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.hs-vault-tab.active {
  color: #1f7a66;
  border-bottom-color: #1f7a66;
}
.hs-tab-badge {
  background: #1f7a66;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  line-height: 1.4;
}
.hs-tab-content {
  padding: 14px 16px 0;
}

/* ── Passport action row ──────────────────────────────── */
.hs-passport-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.hs-pa-btn {
  flex: 1;
  padding: 11px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}
.hs-pa-btn.outline {
  background: #f0fdfa;
  color: #1f7a66;
  border: 1.5px solid #99f6e4;
}
.hs-pa-btn.solid {
  background: #1f7a66;
  color: #fff;
}
.hs-pa-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Street tab ──────────────────────────────────────── */
.hs-vm-header {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 12px;
}
.hs-street-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid #e2e8e8;
}
.hs-street-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}
.hs-street-row:last-child {
  border-bottom: none;
}
.hs-street-row:active {
  background: #f0fdfa;
}
.hs-street-house-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.hs-street-addr {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
.hs-street-meta {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.hs-street-epc {
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  padding: 1px 5px;
  border-radius: 4px;
}
.hs-street-status {
  flex-shrink: 0;
}
.hs-street-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
}
.hs-street-badge.published {
  background: #dcfce7;
  color: #166534;
}
.hs-street-badge.started {
  background: #fef3c7;
  color: #92400e;
}
.hs-street-badge.none {
  background: #f1f5f9;
  color: #64748b;
}
.hs-street-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}
.hs-street-stats {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid #e2e8e8;
}
.hs-street-stats-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}
.hs-street-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.hs-stat-box {
  border-radius: 10px;
  padding: 10px 12px;
}
.hs-stat-box.brand {
  background: #f0fdfa;
}
.hs-stat-box.green {
  background: #f0fdf4;
}
.hs-stat-box.amber {
  background: #fef3c7;
}
.hs-stat-box.grey {
  background: #f8fafc;
}
.hs-stat-val {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}
.hs-stat-box.brand .hs-stat-val {
  color: #1f7a66;
}
.hs-stat-box.green .hs-stat-val {
  color: #16a34a;
}
.hs-stat-box.amber .hs-stat-val {
  color: #92400e;
}
.hs-stat-lbl {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}
.hs-street-tip {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

/* ── Buyers tab ──────────────────────────────────────── */
.hs-buyers-intro {
  background: #f0fdfa;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.hs-buyer-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8e8;
  margin-bottom: 14px;
}
.hs-buyer-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}
.hs-buyer-card:last-child {
  border-bottom: none;
}
.hs-buyer-card:active {
  background: #f0fdfa;
}
.hs-buyer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
}
.hs-buyer-info {
  flex: 1;
  min-width: 0;
}
.hs-buyer-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}
.hs-buyer-criteria {
  font-size: 11.5px;
  color: #475569;
  margin-top: 2px;
  line-height: 1.4;
}
.hs-buyer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.hs-buyer-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
}
.hs-buyer-tag.match {
  background: #dcfce7;
  color: #166534;
}
.hs-buyer-tag.partial {
  background: #fef3c7;
  color: #92400e;
}
.hs-buyer-match-score {
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 38px;
  text-align: right;
}
.hs-buyers-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

/* ── Question screen (hsq-*) ───────────────────────────────── */
/* ── Prototype-style quiz UI (hsq2) ─────────────────────────── */
.hs-q-shell {
  padding: 0;
  background: #fff;
}
.hsq2-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.hsq2-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  color: #00a19a;
  cursor: pointer;
}
.hsq2-back svg { width: 14px; height: 14px; }
.hs-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #00a19a;
  text-transform: uppercase;
}
.hs-pulse {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #e2f1ea;
}

/* Teal address card with progress + Q counter */
.hsq2-addr-card {
  margin: 10px 16px 0;
  border-radius: 18px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #00a19a 0%, #007e78 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 161, 154, 0.25);
}
.hsq2-addr-card::after {
  content: '';
  position: absolute;
  inset: -40% -20% auto auto;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.hsq2-addr-card > * { position: relative; z-index: 1; }
.hsq2-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.hsq2-addr-pin {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.30);
  flex-shrink: 0;
  margin-top: 4px;
}
.hsq2-addr-block { flex: 1; min-width: 0; }
.hsq2-addr-line {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.hsq2-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
}
.hsq2-progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.hsq2-cat-pill {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}
.hsq2-progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.20);
  border-radius: 100px;
  overflow: hidden;
}
.hsq2-progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 100px;
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.hsq2-q-label {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
}

/* Live score card */
.hsq2-score-card {
  margin: 12px 16px 0;
  padding: 16px;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(35, 29, 69, 0.06);
}
.hsq2-score-eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.hsq2-score-eyebrow .left {
  font-size: 10.5px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.hsq2-score-eyebrow .right {
  font-size: 10px;
  font-weight: 700;
  color: #007e78;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  padding: 3px 8px;
  border-radius: 999px;
}
.hsq2-score-gauge-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}
.hsq2-gauge {
  width: 88px;
  height: 88px;
  position: relative;
  flex-shrink: 0;
}
.hsq2-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.hsq2-gauge .g-bg { stroke: #eef0f6; }
.hsq2-g-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.hsq2-g-num .gn-big {
  font-size: 26px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.8px;
  line-height: 1;
}
.hsq2-g-num .gn-small {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.06em;
  margin-top: 2px;
}
.hsq2-score-summary {
  flex: 1;
  min-width: 0;
}
.hsq2-band {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.hsq2-explainer {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 4px;
  line-height: 1.4;
  letter-spacing: -0.05px;
}

/* Question block */
.hsq2-q-block {
  padding: 16px 22px 0;
}
.hsq2-q-text {
  font-size: 19px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  line-height: 1.25;
  margin-bottom: 10px;
}
.hsq2-context {
  font-size: 12.5px;
  font-weight: 600;
  color: #6b6783;
  background: #f8f9fb;
  border: 1px solid #ececef;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  line-height: 1.45;
}
.hsq2-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hsq2-option {
  display: block;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  padding: 14px 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: all 0.15s;
}
.hsq2-option:hover {
  border-color: #b2e4e1;
  background: #f2faf8;
}
.hsq2-option.selected {
  border-color: #00a19a;
  background: #f2faf8;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
  color: #007e78;
}

/* Back / Next nav */
.hsq2-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 22px 0;
}
.hsq2-nav-back {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #ececef;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.hsq2-nav-back:disabled { opacity: 0.4; cursor: not-allowed; }
.hsq2-nav-next {
  flex: 1;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  padding: 13px 18px;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: background 0.15s;
}
.hsq2-nav-next:hover:not(:disabled) { background: #00b6ae; }
.hsq2-nav-next:disabled { opacity: 0.5; cursor: not-allowed; }

.hsq-header {
  background: linear-gradient(150deg, #1a1640 0%, #231d45 60%, #2a2158 100%);
  padding: 16px 20px 20px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.hsq-header-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.2), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.hsq-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}
.hsq-back {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.hsq-back:active {
  background: rgba(255, 255, 255, 0.15);
}
.hsq-count {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}
.hsq-spacer {
  width: 36px;
}
.hsq-progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}
.hsq-progress-fill {
  height: 4px;
  background: linear-gradient(90deg, #1f7a66, #3dbda3);
  border-radius: 999px;
  transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hsq-cat-wrap {
  position: relative;
  z-index: 1;
}
.hsq-cat-chip {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 161, 154, 0.2);
  border: 1px solid rgba(0, 161, 154, 0.35);
  border-radius: 999px;
  padding: 4px 11px;
  font-size: 10px;
  font-weight: 700;
  color: #3dbda3;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hsq-body {
  padding: 12px 16px 24px;
  gap: 14px;
}

/* Live score widget */
.hsq-live {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.08);
  border: 1.5px solid #e2e8e8;
  position: relative;
  flex-shrink: 0;
  transition:
    background 0.3s,
    border-color 0.3s;
}
.hsq-live-gauge {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}
.hsq-live-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 900;
  color: #231d45;
  line-height: 1;
  transition:
    transform 0.2s,
    color 0.2s;
}
.hsq-live-info {
  flex: 1;
  min-width: 0;
}
.hsq-live-lbl {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.hsq-live-hint {
  font-size: 12px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hsq-delta {
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
}
.hsq-delta.pos {
  color: #16a34a;
}
.hsq-delta.neg {
  color: #dc2626;
}
.hsq-delta-enter-active,
.hsq-delta-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.hsq-delta-enter-from,
.hsq-delta-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Question card */
.hsq-card {
  margin-bottom: 4px;
}
.hsq-title {
  font-size: 19px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.3;
  margin: 0 0 10px;
  letter-spacing: -0.02em;
}
.hsq-hint {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.6;
  padding: 12px 14px;
  background: #f1f9f4;
  border-radius: 12px;
  border: 1.5px solid #e2f1ea;
  margin-bottom: 14px;
}
.hsq-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hsq-opt {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e2e8e8;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: #0f172a;
  text-align: left;
  font-family: inherit;
}
.hsq-opt:hover {
  background: #f1f9f4;
  border-color: #e2f1ea;
}
.hsq-opt.selected {
  background: #1f7a66;
  border-color: #1f7a66;
  color: #fff;
  font-weight: 600;
}
.hsq-opt-label {
  flex: 1;
  word-break: break-word;
}

/* Navigation */
.hsq-nav {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.hsq-nav-back {
  flex: 0 0 48px;
  height: 48px;
  border: 1.5px solid #e2e8e8;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.hsq-nav-back:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.hsq-nav-next {
  flex: 1;
  height: 48px;
  border: none;
  background: #1f7a66;
  color: #fff;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: inherit;
}
.hsq-nav-next:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Results: updated journey card / breakdown explain / sticky CTA ── */
.hs-journey-card {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.hs-journey-card:active {
  transform: scale(0.995);
}
.hs-journey-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.hs-journey-link {
  font-size: 11px;
  font-weight: 600;
  color: #1f7a66;
}
.hs-journey-num-wrap {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}
.hs-journey-num-small {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}
.hs-journey-num-muted {
  color: #94a3b8;
}
.hs-breakdown-explain {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #0f172a;
  line-height: 1.5;
  margin-top: 10px;
}
.hs-sticky-cta {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 28rem;
  padding: 12px 18px calc(18px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #e2e8e8;
  box-shadow: 0 -4px 16px rgba(35, 29, 69, 0.06);
  z-index: 20;
}
.hs-sticky-cta-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  background: #1f7a66;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
  font-family: inherit;
}
.hs-sticky-cta-btn:active {
  transform: scale(0.99);
}
.hs-sticky-cta-sub {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

/* ── Landing interest selector ─────────────────────────── */
.hs-interest-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
  margin: 16px 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.hs-interest-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
}
.hs-interest-btn {
  width: 100%;
  border: none;
  border-radius: 13px;
  padding: 13px 16px;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: inherit;
}
.hs-interest-btn.primary {
  background: #1f7a66;
  color: #fff;
}
.hs-interest-btn.outline {
  background: #fff;
  border: 1.5px solid #e2e8e8;
  color: #0f172a;
}
.hs-interest-ic {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 17px;
}
.hs-interest-ic.primary {
  background: rgba(255, 255, 255, 0.2);
}
.hs-interest-ic.soft {
  background: #ccfbf1;
}
.hs-interest-ic-img {
  width: 17px;
  height: 17px;
  object-fit: contain;
}
.hs-interest-body {
  flex: 1;
}
.hs-interest-title {
  font-size: 13px;
  font-weight: 700;
}
.hs-interest-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}
.hs-interest-sub.primary-sub {
  color: rgba(255, 255, 255, 0.85);
}
.hs-interest-chev {
  font-size: 18px;
  color: #cbd5e1;
}
.hs-interest-chev.primary {
  color: rgba(255, 255, 255, 0.7);
}

/* ── Buyer results ─────────────────────────────────────── */
.hs-buyer-hero {
  background: linear-gradient(135deg, #1e3a5f, #1e4976);
  color: #fff;
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.hs-buyer-hero::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.12),
    transparent 70%
  );
  border-radius: 50%;
}
.hs-buyer-hero-eyebrow {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hs-buyer-hero-amount {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 6px 0 4px;
}
.hs-buyer-hero-sub {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}
.hs-buyer-hero-stats {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  position: relative;
  z-index: 1;
}
.hs-buyer-hero-stat {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 10px;
  text-align: center;
  flex: 1;
}
.hs-buyer-hero-stat-num {
  font-size: 18px;
  font-weight: 800;
}
.hs-buyer-hero-stat-lbl {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 1px;
}

.hs-buyer-risk-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
}
.hs-buyer-risk-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}
.hs-buyer-risk-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hs-buyer-risk-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 11px;
}
.hs-buyer-risk-row.warn {
  background: #fef3c7;
  border: 1px solid #fef3c7;
}
.hs-buyer-risk-row.ok {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}
.hs-buyer-risk-ic {
  font-size: 18px;
  flex-shrink: 0;
}
.hs-buyer-risk-row.warn .hs-buyer-risk-head {
  font-size: 12.5px;
  font-weight: 700;
  color: #92400e;
}
.hs-buyer-risk-row.warn .hs-buyer-risk-body {
  font-size: 11.5px;
  color: #78350f;
  margin-top: 1px;
}
.hs-buyer-risk-row.ok .hs-buyer-risk-head {
  font-size: 12.5px;
  font-weight: 700;
  color: #14532d;
}
.hs-buyer-risk-row.ok .hs-buyer-risk-body {
  font-size: 11.5px;
  color: #166534;
  margin-top: 1px;
}
.hs-buyer-bd-sub {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 12px;
}
.hs-buyer-bd-note {
  background: #fef3c7;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #78350f;
  line-height: 1.5;
  margin-top: 12px;
}
.hs-buyer-carbon-note {
  background: rgba(255, 255, 255, 0.08);
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11.5px;
  opacity: 0.85;
  line-height: 1.5;
  color: #fff;
}
.hs-buyer-qa-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
}
.hs-buyer-qa-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}
.hs-buyer-qa-sub {
  font-size: 12.5px;
  color: #64748b;
  margin: 0 0 12px;
}
.hs-buyer-qa-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hs-buyer-qa-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 11px;
}
.hs-buyer-qa-ic {
  font-size: 17px;
  flex-shrink: 0;
}
.hs-buyer-qa-head {
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
}
.hs-buyer-qa-body {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}
.hs-buyer-save-cta {
  background: #ccfbf1;
  border: 1.5px solid #99f6e4;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.hs-buyer-save-ic {
  font-size: 26px;
  flex-shrink: 0;
}
.hs-buyer-save-body {
  flex: 1;
}
.hs-buyer-save-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.hs-buyer-save-sub {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
}
.hs-buyer-save-arrow {
  font-size: 13px;
  font-weight: 700;
  color: #1f7a66;
  white-space: nowrap;
}

/* ── Neighbourhood re-use (buyer) ──────────────────────── */
.hs-nb-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
}
.hs-nb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.hs-nb-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
.hs-nb-rank {
  font-size: 11px;
  font-weight: 600;
  background: #fef3c7;
  color: #92400e;
  padding: 3px 9px;
  border-radius: 999px;
}
.hs-nb-body {
  font-size: 12.5px;
  color: #64748b;
  margin: 0 0 12px;
}
.hs-nb-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hs-nb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  padding: 5px 4px;
  border-radius: 8px;
}
.hs-nb-row.mine {
  background: #ccfbf1;
  border: 1.5px solid #99f6e4;
  padding: 7px 8px;
}
.hs-nb-pos {
  width: 20px;
  text-align: center;
  font-weight: 700;
  font-size: 11px;
  color: #94a3b8;
}
.hs-nb-pos.mine {
  color: #1f7a66;
}
.hs-nb-addr {
  font-size: 13px;
  color: #0f172a;
  font-weight: 500;
}
.hs-nb-addr.mine {
  color: #1f7a66;
  font-weight: 700;
}
.hs-nb-detail {
  font-size: 11px;
  color: #94a3b8;
}
.hs-nb-cost {
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

/* ── Quick wins ────────────────────────────────────────── */
.hs-qw-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 20px 0 10px;
}
.hs-qw-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hs-qw-doc-row,
.hs-qw-pro-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  background: #fff;
  border: 1.5px solid #e2e8e8;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.hs-qw-doc-row:active,
.hs-qw-pro-row:active {
  transform: scale(0.99);
}
.hs-qw-doc-row.uploaded {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.hs-qw-doc-ic {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 18px;
}
.hs-qw-doc-body {
  flex: 1;
  min-width: 0;
}
.hs-qw-doc-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}
.hs-qw-doc-sub {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 1px;
}
.hs-qw-doc-right {
  flex-shrink: 0;
}
.hs-qw-doc-pts {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 7px;
  border-radius: 999px;
}
.hs-qw-doc-done {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

/* Get move ready CTA */
.hs-qw-mr-cta {
  background: linear-gradient(135deg, #131129, #1e1842);
  border-radius: 18px;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}
.hs-qw-mr-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(
    circle,
    rgba(20, 184, 166, 0.25),
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
}
.hs-qw-mr-inner {
  position: relative;
  z-index: 1;
}
.hs-qw-mr-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}
.hs-qw-mr-title {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}
.hs-qw-mr-body {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.55;
  margin-bottom: 16px;
}
.hs-qw-mr-btn {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 13px;
  background: #14b8a6;
  color: #042f2e;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* ── Move Ready ────────────────────────────────────────── */
.hs-mr-hero {
  background: linear-gradient(150deg, #1a1640 0%, #231d45 60%, #2a2158 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.hs-mr-hero-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.2), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.hs-mr-hero-inner {
  position: relative;
  z-index: 1;
}
.hs-mr-hero-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 10px;
}
.hs-mr-hero-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.hs-mr-hero-body {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin-bottom: 16px;
}
.hs-mr-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.hs-mr-compare-col {
  border-radius: 12px;
  padding: 12px;
}
.hs-mr-compare-col.red {
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.3);
}
.hs-mr-compare-col.teal {
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.hs-mr-compare-head {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.hs-mr-compare-head.red {
  color: #fca5a5;
}
.hs-mr-compare-head.teal {
  color: #3dbda3;
}
.hs-mr-compare-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
}
.hs-mr-compare-list.ok {
  color: rgba(255, 255, 255, 0.75);
}

.hs-mr-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.hs-mr-step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  background: #fff;
  border: 1.5px solid #e2e8e8;
  border-radius: 14px;
}
.hs-mr-step-ic {
  width: 32px;
  height: 32px;
  background: #231d45;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}
.hs-mr-step-ic.teal {
  background: #1f7a66;
}
.hs-mr-step-title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 3px;
}
.hs-mr-step-body {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}
.hs-mr-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.hs-mr-stat {
  background: #ccfbf1;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.hs-mr-stat-num {
  font-size: 20px;
  font-weight: 800;
  color: #1f7a66;
}
.hs-mr-stat-lbl {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.3;
}
.hs-mr-claim-btn {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 14px;
  background: #231d45;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.hs-mr-claim-sub {
  text-align: center;
  font-size: 11.5px;
  color: #94a3b8;
  margin-bottom: 8px;
}

/* "People searched this address this month" card — matches prototype */
.hs-searched-card {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.hs-searched-card--published {
  background: linear-gradient(135deg, #1f7a66, #0f766e);
  color: #fff;
}
.hs-searched-card--inprogress,
.hs-searched-card--unclaimed {
  background: linear-gradient(135deg, #1a1640, #231d45);
  color: #fff;
}
.hs-searched-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  pointer-events: none;
}
.hs-searched-card--published .hs-searched-glow {
  background: rgba(255, 255, 255, 0.08);
}
.hs-searched-card--inprogress .hs-searched-glow,
.hs-searched-card--unclaimed .hs-searched-glow {
  background: rgba(94, 234, 212, 0.08);
}
.hs-searched-numwrap {
  text-align: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.hs-searched-num {
  font-size: 38px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
}
.hs-searched-card--published .hs-searched-num {
  color: #fff;
}
.hs-searched-card--inprogress .hs-searched-num,
.hs-searched-card--unclaimed .hs-searched-num {
  color: #3dbda3;
}
.hs-searched-numlbl {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 1px;
}
.hs-searched-card--published .hs-searched-numlbl {
  color: rgba(255, 255, 255, 0.6);
}
.hs-searched-card--inprogress .hs-searched-numlbl,
.hs-searched-card--unclaimed .hs-searched-numlbl {
  color: rgba(255, 255, 255, 0.45);
}
.hs-searched-divider {
  width: 1px;
  height: 44px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.hs-searched-card--published .hs-searched-divider {
  background: rgba(255, 255, 255, 0.2);
}
.hs-searched-card--inprogress .hs-searched-divider,
.hs-searched-card--unclaimed .hs-searched-divider {
  background: rgba(255, 255, 255, 0.1);
}
.hs-searched-body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.hs-searched-live {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #3dbda3;
  margin-bottom: 4px;
}
.hs-searched-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3dbda3;
  box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.25);
  animation: hs-pulse-mint 1.5s infinite;
  flex-shrink: 0;
}
@keyframes hs-pulse-mint {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(94, 234, 212, 0.4);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(94, 234, 212, 0);
  }
}
.hs-searched-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}
.hs-searched-card--published .hs-searched-title,
.hs-searched-card--inprogress .hs-searched-title,
.hs-searched-card--unclaimed .hs-searched-title {
  color: #fff;
}
.hs-searched-sub {
  font-size: 11.5px;
  margin-top: 4px;
  line-height: 1.4;
}
.hs-searched-card--published .hs-searched-sub {
  color: rgba(255, 255, 255, 0.75);
}
.hs-searched-card--inprogress .hs-searched-sub,
.hs-searched-card--unclaimed .hs-searched-sub {
  color: rgba(255, 255, 255, 0.6);
}
.hs-searched-card--inprogress .hs-searched-title,
.hs-searched-card--unclaimed .hs-searched-title {
  font-size: 12.5px;
  line-height: 1.35;
}

/* Auth-gate modal */
.hs-authgate-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 20px;
}
.hs-authgate-card {
  width: 100%;
  max-width: 24rem;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}
.hs-authgate-ic {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0fdfa;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  font-size: 26px;
}
.hs-authgate-title {
  font-size: 18px;
  font-weight: 800;
  color: #1f2024;
  margin-bottom: 6px;
}
.hs-authgate-sub {
  font-size: 13px;
  color: #64748b;
  line-height: 1.55;
  margin-bottom: 18px;
}
.hs-authgate-primary {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 12px;
  background: #00a19a;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  margin-bottom: 8px;
}
.hs-authgate-ghost {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* ──────────────────────────────────────────────────────────────
   BUYER-RESULTS (watch) — matches homescore-v2_13.html prototype
   ────────────────────────────────────────────────────────────── */
.bv-root {
  --bv-navy: #231d45;
  --bv-navy-soft: #4a4566;
  --bv-teal: #00a19a;
  --bv-teal-bright: #00b6ae;
  --bv-teal-dark: #007e78;
  --bv-teal-deep: #00514d;
  --bv-teal-pale: #e5f4f2;
  --bv-teal-paler: #f2faf8;
  --bv-amber: #e6a23c;
  --bv-amber-pale: #fbefd9;
  --bv-red: #c73e36;
  --bv-bg: #fafafa;
  --bv-text-soft: #6b6783;
  --bv-text-faint: #9c98ad;
  --bv-line: #ececef;
  --bv-line-soft: #f5f5f7;
  --bv-success: #2eab55;
  background: var(--bv-bg);
}

/* ── Address card (consistent with ResultDetail) ────────────── */
.bv-addr-card {
  margin: 16px 22px 0;
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.bv-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.bv-addr-card > * {
  position: relative;
  z-index: 1;
}
.bv-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}
.bv-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 6px;
}
.bv-addr-block {
  flex: 1;
  min-width: 0;
}
.bv-addr-line {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.bv-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
}
.bv-addr-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.bv-addr-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.05px;
}
.bv-addr-pill.epc {
  padding-left: 6px;
}
.bv-epc-letter {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}
.bv-state-unclaimed,
.bv-state-progress {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: #7a3a05;
}
.bv-state-published {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: var(--bv-teal-deep);
}
.bv-addr-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.bv-stat-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}
.bv-stat-count {
  font-weight: 800;
}
.bv-sep {
  opacity: 0.5;
}
.bv-pulse-dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}
.bv-pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  animation: bv-pulse 1.6s ease-out infinite;
}
.bv-pulse-green {
  background: #6bd4cd;
}
.bv-pulse-green::after {
  border-color: rgba(94, 234, 212, 0.5);
}
@keyframes bv-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* ── Running cost hero (navy gradient) ─────────────────────── */
.bv-cost-hero {
  margin: 12px 22px 0;
  padding: 22px 20px 20px;
  background: linear-gradient(
    135deg,
    var(--bv-navy-soft) 0%,
    var(--bv-navy) 60%,
    #0d1a3a 100%
  );
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 12px 32px -8px rgba(35, 29, 69, 0.45);
}
.bv-cost-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.bv-cost-num {
  font-size: 38px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1.2px;
  line-height: 1;
  margin-bottom: 10px;
}
.bv-cost-unit {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
}
.bv-cost-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 16px;
}
.bv-cost-sub b {
  color: #6bd4cd;
  font-weight: 800;
}
.bv-cost-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}
.bv-cost-stat {
  flex: 1;
  padding: 10px 8px;
  text-align: center;
}
.bv-cost-stat-num {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.bv-cost-stat-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-top: 2px;
}
.bv-cost-stat-div {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

/* ── Section header (mirrors costs page) ───────────────────── */
.bv-section-h {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 22px 10px;
}
.bv-section-h-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--bv-teal-bright),
    var(--bv-teal-dark)
  );
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bv-section-h-icon svg {
  width: 16px;
  height: 16px;
}
.bv-section-h-icon.warn {
  background: linear-gradient(135deg, #f0b656, #c18a38);
  box-shadow: 0 3px 10px rgba(230, 162, 60, 0.3);
}
.bv-section-h-icon.save {
  background: linear-gradient(135deg, var(--bv-navy-soft), var(--bv-navy));
  box-shadow: 0 3px 10px rgba(35, 29, 69, 0.3);
}
.bv-section-h-text {
  flex: 1;
  min-width: 0;
}
.bv-section-h-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--bv-navy);
  letter-spacing: -0.2px;
  line-height: 1.1;
}
.bv-section-h-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--bv-text-soft);
  letter-spacing: -0.05px;
  margin-top: 2px;
}

/* ── Buyer risk summary card (amber outer + pastel inner rows) ── */
.bv-risks-card {
  margin: 0 22px;
  background: #fff;
  border: 2px solid var(--bv-amber);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(230, 162, 60, 0.1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bv-risk-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 2px solid;
}
.bv-risk-row.green {
  background: #f0fbf4;
  border-color: #b8e8c8;
}
.bv-risk-row.amber {
  background: #fffbf0;
  border-color: rgba(230, 162, 60, 0.4);
}
.bv-risk-row.red {
  background: #fef0ef;
  border-color: rgba(199, 62, 54, 0.3);
}
.bv-risk-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
.bv-risk-body {
  flex: 1;
  min-width: 0;
}
.bv-risk-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.15px;
  margin-bottom: 2px;
}
.bv-risk-row.green .bv-risk-title {
  color: #2e7d4f;
}
.bv-risk-row.amber .bv-risk-title {
  color: var(--bv-amber);
}
.bv-risk-row.red .bv-risk-title {
  color: var(--bv-red);
}
.bv-risk-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--bv-text-soft);
  line-height: 1.4;
}

/* ── Score breakdown card (teal border) ────────────────────── */
.bv-breakdown-card {
  margin: 0 22px;
  background: #fff;
  border: 2px solid var(--bv-teal);
  border-radius: 16px;
  padding: 16px 16px 14px;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.08);
}
.bv-breakdown-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--bv-text-soft);
  line-height: 1.5;
  margin-bottom: 14px;
}
.bv-breakdown-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}
.bv-breakdown-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bv-bd-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bv-navy);
  width: 62px;
  flex-shrink: 0;
}
.bv-bd-bar-wrap {
  flex: 1;
  height: 7px;
  background: var(--bv-line-soft);
  border-radius: 100px;
  overflow: hidden;
}
.bv-bd-bar {
  height: 100%;
  border-radius: 100px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.bv-bd-val {
  font-size: 11.5px;
  font-weight: 800;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.bv-bd-note {
  font-size: 11.5px;
  font-weight: 500;
  color: #8b6b00;
  background: #fffbe6;
  border: 1px solid #f0dc80;
  border-radius: 8px;
  padding: 9px 11px;
  line-height: 1.5;
}

/* ── Questions to ask (navy outer + teal-pale inner rows) ──── */
.bv-questions-card {
  margin: 0 22px;
  background: #fff;
  border: 2px solid var(--bv-navy);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(35, 29, 69, 0.1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bv-q-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  border: 2px solid var(--bv-teal-pale);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.bv-q-row:hover {
  border-color: var(--bv-teal);
  background: var(--bv-teal-paler);
}
.bv-q-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
.bv-q-body {
  flex: 1;
  min-width: 0;
}
.bv-q-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--bv-navy);
  letter-spacing: -0.15px;
  margin-bottom: 3px;
}
.bv-q-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--bv-text-soft);
  line-height: 1.4;
}

/* ── Save to Buyer Profile card ────────────────────────────── */
.bv-save-card {
  margin: 16px 22px 0;
  padding: 16px 18px;
  background: var(--bv-teal-paler);
  border: 2px solid var(--bv-teal-pale);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.bv-save-card:hover {
  border-color: var(--bv-teal);
  transform: translateY(-1px);
}
.bv-save-icon {
  width: 38px;
  height: 38px;
  background: var(--bv-teal);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.bv-save-icon svg {
  width: 16px;
  height: 16px;
}
.bv-save-body {
  flex: 1;
  min-width: 0;
}
.bv-save-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--bv-navy);
  letter-spacing: -0.2px;
  margin-bottom: 2px;
}
.bv-save-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--bv-text-soft);
  line-height: 1.4;
}
.bv-save-cta {
  font-size: 13px;
  font-weight: 800;
  color: var(--bv-teal-dark);
  flex-shrink: 0;
}

/* ── Back link ─────────────────────────────────────────────── */
.bv-back {
  display: block;
  margin: 14px auto 0;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--bv-text-soft);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
}
.bv-back:hover {
  color: var(--bv-navy);
}

/* ──────────────────────────────────────────────────────────────
   SIMULATOR — replaces the old quiz; matches homescore-v2_13.html
   ────────────────────────────────────────────────────────────── */
.sim-root {
  --sim-navy: #231d45;
  --sim-navy-soft: #4a4566;
  --sim-teal: #00a19a;
  --sim-teal-bright: #00b6ae;
  --sim-teal-dark: #007e78;
  --sim-teal-deep: #00514d;
  --sim-teal-pale: #e5f4f2;
  --sim-teal-paler: #f2faf8;
  --sim-amber: #e6a23c;
  --sim-amber-pale: #fbefd9;
  --sim-red: #c73e36;
  --sim-bg: #fafafa;
  --sim-text-soft: #6b6783;
  --sim-text-faint: #9c98ad;
  --sim-line: #ececef;
  --sim-line-soft: #f5f5f7;

  background: var(--sim-bg);
  min-height: 100dvh;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 24px;
  color: var(--sim-navy);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Top nav */
.sim-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.sim-back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sim-teal-paler);
  border: 1px solid var(--sim-teal-pale);
  color: var(--sim-teal);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
}
.sim-back-btn svg {
  width: 14px;
  height: 14px;
}
.sim-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--sim-teal-paler);
  border: 1px solid var(--sim-teal-pale);
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--sim-teal);
  text-transform: uppercase;
}
.sim-eyebrow-pill .dot {
  width: 6px;
  height: 6px;
  background: var(--sim-teal);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--sim-teal-pale);
}

/* Address card — amber, ResultDetail-consistent */
.sim-addr-card {
  margin: 8px 16px 0;
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.sim-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.sim-addr-card > * {
  position: relative;
  z-index: 1;
}
.sim-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.sim-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 6px;
}
.sim-addr-block {
  flex: 1;
  min-width: 0;
}
.sim-addr-line {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.sim-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
}

/* Hero */
.sim-hero {
  margin: 12px 16px 0;
  background: #fff;
  border: 2px solid var(--sim-teal-pale);
  box-shadow: 0 4px 20px rgba(0, 161, 154, 0.08);
  border-radius: 20px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.sim-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 161, 154, 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.sim-hero > * {
  position: relative;
  z-index: 1;
}
.sim-hero-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: var(--sim-teal-dark);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.sim-hero-body {
  font-size: 12px;
  font-weight: 600;
  color: var(--sim-text-soft);
  line-height: 1.55;
  margin-bottom: 14px;
}
.sim-hero-body b {
  color: var(--sim-navy);
}
.sim-score-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.sim-score-dial {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}
.sim-score-dial svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.sim-score-dial .dial-bg {
  stroke: var(--sim-line-soft);
  fill: none;
}
.sim-score-dial .dial-fill {
  fill: none;
  stroke-linecap: round;
  transition:
    stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    stroke 0.4s;
}
.sim-score-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.sim-score-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--sim-navy);
  line-height: 1;
}
.sim-score-denom {
  font-size: 10px;
  color: var(--sim-text-faint);
}
.sim-score-info {
  flex: 1;
}
.sim-score-band {
  font-size: 14px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 3px;
}
.sim-score-grade {
  font-size: 12px;
  color: var(--sim-text-soft);
}
.sim-stats-row {
  display: flex;
  gap: 0;
  background: var(--sim-teal-paler);
  border: 1.5px solid var(--sim-teal-pale);
  border-radius: 12px;
  overflow: hidden;
}
.sim-stat {
  flex: 1;
  padding: 10px 12px;
  border-right: 1px solid var(--sim-teal-pale);
}
.sim-stat:last-child {
  border-right: none;
}
.sim-stat-label {
  font-size: 9px;
  font-weight: 800;
  color: var(--sim-teal-dark);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.sim-stat-val {
  font-size: 15px;
  font-weight: 800;
  color: var(--sim-navy);
  letter-spacing: -0.3px;
  transition: color 0.3s;
}
.sim-stat-val.improved {
  color: var(--sim-teal);
}
.sim-stat-delta {
  font-size: 10px;
  font-weight: 700;
  color: var(--sim-teal);
  margin-top: 1px;
  min-height: 14px;
}

/* Two paths */
.sim-paths {
  margin: 14px 16px 0;
  background: var(--sim-teal-paler);
  border: 1.5px solid var(--sim-teal-pale);
  border-radius: 16px;
  padding: 14px 16px;
}
.sim-paths-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: var(--sim-teal-dark);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.sim-paths-row {
  display: flex;
  gap: 8px;
}
.sim-path {
  flex: 1;
  background: #fff;
  border: 1.5px solid var(--sim-teal-pale);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.15s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.15s,
    border-color 0.15s,
    background 0.15s;
}
.sim-path:hover {
  border-color: var(--sim-teal);
  transform: translateY(-1px);
}
.sim-path.active {
  border-color: var(--sim-teal);
  background: var(--sim-teal-paler);
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.18);
}
.sim-path.bill {
  border-width: 2px;
}
.sim-path-icon {
  font-size: 16px;
  margin-bottom: 4px;
}
.sim-path-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 3px;
}
.sim-path.bill .sim-path-title {
  color: var(--sim-teal-dark);
}
.sim-path-sub {
  font-size: 10px;
  font-weight: 500;
  color: var(--sim-text-soft);
  line-height: 1.4;
}
.sim-paths-or {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--sim-text-faint);
}

/* Progress + steps block */
.sim-questions-block {
  transition:
    opacity 0.5s ease,
    max-height 0.6s ease;
}
.sim-progress-row {
  margin: 12px 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sim-progress-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--sim-text-soft);
}
.sim-progress-count {
  font-size: 11px;
  font-weight: 800;
  color: var(--sim-teal);
}
.sim-progress-track {
  margin: 6px 16px 0;
  height: 4px;
  background: var(--sim-line-soft);
  border-radius: 100px;
  overflow: hidden;
}
.sim-progress-fill {
  height: 100%;
  background: var(--sim-teal);
  border-radius: 100px;
  transition: width 0.4s;
}

/* Step cards */
.sim-steps {
  margin: 12px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sim-step {
  background: #fff;
  border: 2px solid var(--sim-line-soft);
  border-radius: 14px;
  overflow: hidden;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
  cursor: pointer;
}
.sim-step.idle:hover {
  border-color: var(--sim-teal);
  box-shadow: 0 6px 20px rgba(0, 161, 154, 0.15);
  transform: translateY(-2px);
}
.sim-step.done {
  border-color: var(--sim-teal);
  background: linear-gradient(135deg, var(--sim-teal-paler) 0%, white 60%);
}
.sim-step.todo {
  border-color: var(--sim-navy);
  background: linear-gradient(135deg, #eeedf6 0%, white 60%);
}
.sim-step.skip {
  opacity: 0.55;
}
.sim-step.diff {
  border-color: #3b4fcc;
  background: linear-gradient(135deg, #f0f4ff 0%, white 60%);
}
.sim-step-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}
.sim-step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--sim-line-soft);
  color: var(--sim-text-faint);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background 0.2s,
    color 0.2s;
}
.sim-step.done .sim-step-num {
  background: var(--sim-teal);
  color: #fff;
}
.sim-step.todo .sim-step-num {
  background: var(--sim-navy);
  color: #fff;
}
.sim-step.skip .sim-step-num {
  background: var(--sim-text-faint);
  color: #fff;
}
.sim-step.diff .sim-step-num {
  background: #3b4fcc;
  color: #fff;
}
.sim-step-body {
  flex: 1;
  min-width: 0;
}
.sim-step-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 1px;
}
.sim-step-meta {
  font-size: 10px;
  color: var(--sim-text-soft);
}
.sim-step-badge {
  font-size: 16px;
  flex-shrink: 0;
  min-width: 20px;
  text-align: center;
}
.sim-step-expand {
  display: none;
  padding: 0 14px 14px;
  border-top: 1px solid var(--sim-line-soft);
}
.sim-step.open .sim-step-expand {
  display: block;
}
.sim-step-desc {
  font-size: 11px;
  color: var(--sim-text-soft);
  line-height: 1.5;
  margin: 10px 0 8px;
}
.sim-step-impact {
  font-size: 11px;
  font-weight: 700;
  color: var(--sim-teal-dark);
  background: var(--sim-teal-paler);
  padding: 6px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}
.sim-step-question {
  font-size: 12px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 8px;
}
.sim-step-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sim-step-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 9px;
  border: 1.5px solid;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.sim-step-btn.done {
  background: var(--sim-teal-paler);
  color: var(--sim-teal-dark);
  border-color: var(--sim-teal-pale);
}
.sim-step-btn.done:hover {
  background: var(--sim-teal-pale);
}
.sim-step-btn.diff {
  background: #f0f4ff;
  color: #3b4fcc;
  border-color: #c5ceff;
}
.sim-step-btn.diff:hover {
  background: #e0e7ff;
  border-color: #3b4fcc;
  transform: translateX(3px);
}
.sim-step-btn.todo {
  background: #eeedf6;
  color: var(--sim-navy);
  border-color: #c8c5e0;
}
.sim-step-btn.todo:hover {
  background: #dddbe8;
}
.sim-step-btn.skip {
  background: var(--sim-bg);
  color: var(--sim-text-faint);
  border-color: var(--sim-line-soft);
}

/* Bill-path placeholder/confirm cards */
.sim-bill-picker,
.sim-bill-confirm {
  margin: 10px 16px 0;
  background: linear-gradient(135deg, var(--sim-teal-paler), #d4f0ed);
  border: 2px solid var(--sim-teal-pale);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.sim-bill-picker:hover {
  border-color: var(--sim-teal);
}
.sim-bill-emoji {
  font-size: 28px;
  flex-shrink: 0;
}
.sim-bill-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 3px;
}
.sim-bill-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--sim-text-soft);
  line-height: 1.5;
}

/* Publish prompt */
.sim-publish {
  margin: 14px 16px 0;
  background: linear-gradient(135deg, var(--sim-teal-paler), #d4f0ed);
  border: 2px solid var(--sim-teal-pale);
  border-radius: 16px;
  padding: 16px 18px;
}
.sim-publish-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 4px;
}
.sim-publish-sub {
  font-size: 11px;
  color: var(--sim-text-soft);
  line-height: 1.5;
  margin-bottom: 12px;
}
.sim-publish-btns {
  display: flex;
  gap: 8px;
}
.sim-publish-go {
  flex: 1;
  padding: 10px;
  background: var(--sim-teal);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.sim-publish-skip {
  padding: 10px 14px;
  background: #fff;
  border: 1.5px solid var(--sim-teal-pale);
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--sim-text-soft);
  cursor: pointer;
}

/* EPC nudge */
.sim-epc-nudge {
  margin: 10px 16px 0;
  border-radius: 16px;
  padding: 14px 16px;
  background: var(--sim-amber-pale);
  border: 1.5px solid rgba(230, 162, 60, 0.4);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: all 0.3s ease;
}
.sim-epc-nudge-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.sim-epc-nudge-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 3px;
}
.sim-epc-nudge-body {
  font-size: 11px;
  color: var(--sim-text-soft);
  line-height: 1.5;
}

/* Bottom CTA */
.sim-cta {
  margin: 14px 16px 0;
}
.sim-cta-btn {
  width: 100%;
  padding: 16px;
  background: var(--sim-teal);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}
.sim-cta-btn:hover {
  background: var(--sim-teal-bright);
}
.sim-reset-btn {
  width: 100%;
  margin-top: 8px;
  padding: 10px;
  background: none;
  border: 1.5px solid var(--sim-line-soft);
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--sim-text-soft);
  cursor: pointer;
}

/* "Done something different" modal */
.sim-diff-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sim-diff-card {
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 36px;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
}
.sim-diff-handle {
  width: 40px;
  height: 4px;
  background: var(--sim-line-soft);
  border-radius: 100px;
  margin: 0 auto 20px;
}
.sim-diff-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--sim-navy);
  margin-bottom: 6px;
}
.sim-diff-body {
  font-size: 12px;
  color: var(--sim-text-soft);
  margin-bottom: 16px;
  line-height: 1.5;
}
.sim-diff-textarea {
  width: 100%;
  border: 2px solid var(--sim-teal-pale);
  border-radius: 12px;
  padding: 12px;
  font-family: inherit;
  font-size: 13px;
  color: var(--sim-navy);
  resize: none;
  height: 90px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}
.sim-diff-textarea:focus {
  border-color: var(--sim-teal);
}
.sim-diff-tip {
  margin-top: 10px;
  padding: 12px 14px;
  background: #fff8ec;
  border: 1.5px solid var(--sim-amber-pale);
  border-radius: 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.sim-diff-tip-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.sim-diff-tip-text {
  font-size: 11px;
  color: var(--sim-navy);
  line-height: 1.5;
}
.sim-diff-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.sim-diff-save {
  flex: 1;
  padding: 13px;
  background: var(--sim-teal);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.sim-diff-cancel {
  padding: 13px 16px;
  background: var(--sim-bg);
  border: 1.5px solid var(--sim-line-soft);
  border-radius: 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--sim-text-soft);
  cursor: pointer;
}

/* Sheet-up transition */
.sim-modal-enter-active,
.sim-modal-leave-active {
  transition: opacity 0.25s ease;
}
.sim-modal-enter-active .sim-diff-card,
.sim-modal-leave-active .sim-diff-card {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.sim-modal-enter-from,
.sim-modal-leave-to {
  opacity: 0;
}
.sim-modal-enter-from .sim-diff-card,
.sim-modal-leave-to .sim-diff-card {
  transform: translateY(20px);
}
</style>
