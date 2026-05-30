<template>
  <div class="hs-v6-score">
    <!-- ── EPC NOT AVAILABLE — empty state ──────────────────────────
         When the property has no EPC certificate on the gov register,
         we don't fabricate scores from dummy data. Instead we surface
         a clear "EPC not available" card so the user knows what's
         missing and what to do next. -->
    <template v-if="!hasEpcData">
      <!-- Compact property header — keeps the user oriented even when
           we can't render the full score view. -->
      <div class="hs-noepc-prop anim-1">
        <div class="hs-noepc-prop-pin" />
        <div class="hs-noepc-prop-block">
          <div class="hs-noepc-prop-line">{{ addrLineFull }}</div>
          <div class="hs-noepc-prop-meta">{{ addrMetaFull }}</div>
        </div>
      </div>

      <div class="hs-noepc-card anim-1">
        <div class="hs-noepc-icon">📄</div>
        <div class="hs-noepc-title">No EPC on file for this property</div>
        <div class="hs-noepc-sub">
          We couldn't find an Energy Performance Certificate for
          <b>{{ addrLineFull }}</b> on the public register. That's not unusual —
          some homes haven't been assessed yet, or the certificate has expired.
        </div>
        <div class="hs-noepc-sub" style="margin-top: 8px">
          Without an EPC we don't fabricate a score from guesses. Here's what
          you can do instead:
        </div>
        <div class="hs-noepc-actions">
          <button class="hs-noepc-btn primary" type="button" @click="$emit('refine')">
            Answer a few questions
          </button>
          <a
            class="hs-noepc-btn ghost"
            :href="`https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(property?.postcode ?? '')}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check the EPC Register →
          </a>
        </div>
        <div class="hs-noepc-help">
          The quiz gives you a rough estimate based on what you know about the
          home (heating, insulation, lighting). If the property gets a new EPC
          assessment, we'll pick it up automatically next time you load the
          page.
        </div>
      </div>
    </template>

    <template v-if="hasEpcData">
    <!-- ── Amber address card (typewriter on mount) ────────────────── -->
    <div class="hs-addr-card anim-1" data-tour="addr">
      <div class="hs-addr-top">
        <div class="hs-addr-pin" />
        <div class="hs-addr-block">
          <div class="hs-addr-line">
            <span>{{ addrLineTyped }}</span
            ><span class="tw-caret" :class="{ done: addrLineTyped.length >= addrLineFull.length }">|</span>
          </div>
          <div class="hs-addr-meta">
            <span>{{ addrMetaTyped }}</span
            ><span class="tw-caret done">|</span>
          </div>
        </div>
      </div>
      <div class="hs-addr-pills">
        <span class="hs-addr-pill">
          <span class="epc-letter" :style="{ background: epcColor }">{{ epcRating || '—' }}</span>
          EPC rating
        </span>
        <span class="hs-addr-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 4 14 11 14 11 22 20 10 13 10" fill="currentColor" />
          </svg>
          HomeScore <b style="color: white">{{ displayScore }}</b
          ><span style="opacity: 0.75; font-weight: 600">/100</span>
        </span>
      </div>
      <div class="hs-addr-stat-row">
        <div class="pulse-dot" />
        <span><span class="hs-addr-stat-count">{{ searchesTodayDisplay }}</span> checked this HomeScore today</span>
      </div>
    </div>

    <!-- Claim / Passport-state box + explainer drawers -->
    <PassportClaimBox
      :state="passportState"
      :progress-pct="passportProgressPct"
      :sections-done="passportSectionsDone"
      :sections-total="passportSectionsTotal"
      @claim="$emit('claim')"
      @watch="$emit('buy-passport')"
      @buy="$emit('buy-passport')"
    />

    <!-- ── HomeScore card (animated outline + gauge + band + footer) ── -->
    <div class="score-card anim-2" data-tour="score">
      <div class="score-eyebrow-row">
        <div class="score-eyebrow-mark">HomeScore<sup>™</sup></div>
      </div>
      <div class="score-top">
        <div class="score-gauge">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#00B8B0" />
                <stop offset="100%" stop-color="#008A84" />
              </linearGradient>
            </defs>
            <circle class="g-bg" cx="60" cy="60" r="50" stroke-width="9" />
            <circle
              class="g-fill"
              cx="60"
              cy="60"
              r="50"
              stroke-width="9"
              :stroke="`url(#${gradientId})`"
              stroke-dasharray="314.16"
              :stroke-dashoffset="gaugeOffset"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
          <div class="g-num">
            <div class="gn-big">{{ displayScore }}</div>
            <div class="gn-small">/ 100</div>
          </div>
        </div>
        <div class="score-summary">
          <div class="score-band">{{ scoreBandTitle }}</div>
          <div class="score-explainer" v-html="scoreExplainer" />
        </div>
      </div>
      <div class="score-footer">
        <svg class="score-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          Based on a <b>{{ epcYear || '—' }} EPC</b>. Your real score may be higher if
          improvements have been made.
          <span class="score-refine-link" @click="$emit('refine')">Refine with the quiz →</span>
        </div>
      </div>
    </div>

    <!-- ── Quick stats strip (3 clickable cards) ───────────────────── -->
    <div class="score-strip-hint">Tap any row to explore</div>
    <div class="score-strip-card anim-3" data-tour="overpay">
      <div
        class="score-strip-item clickable"
        :class="{ active: activePanel === 'bills' }"
        @click="togglePanel('bills')"
      >
        <div class="score-strip-eyebrow">Est. bills</div>
        <div class="score-strip-num">
          £{{ formatNum(annualCost) }}<span class="strip-unit">/yr</span>
        </div>
        <div class="score-strip-sub">Save up to £{{ formatNum(potentialSaving) }}/yr</div>
      </div>
      <div
        class="score-strip-item clickable"
        :class="{ active: activePanel === 'co2' }"
        @click="togglePanel('co2')"
      >
        <div class="score-strip-eyebrow">CO₂</div>
        <div class="score-strip-num warn">
          {{ co2NowDisplay.toFixed(1) }}<span class="strip-unit">t/yr</span>
        </div>
        <div class="score-strip-sub">UK avg 6.0t</div>
      </div>
      <div
        class="score-strip-item clickable"
        :class="{ active: activePanel === 'street' }"
        @click="togglePanel('street')"
      >
        <div class="score-strip-eyebrow">Street</div>
        <div class="score-strip-num good">
          {{ streetRank ?? '—' }}<span class="strip-unit">/{{ streetTotal ?? '—' }}</span>
        </div>
        <div class="score-strip-sub">{{ streetRankLabel }}</div>
      </div>
    </div>

    <!-- ── BILLS PANEL ─────────────────────────────────────────────── -->
    <div v-if="activePanel === 'bills'" class="score-strip-panel open">
      <div class="ssp-head">
        <div class="ssp-head-icon">💷</div>
        <div class="ssp-head-info">
          <div class="ssp-head-title">Annual running costs · £{{ formatNum(annualCost) }}/yr</div>
          <div class="ssp-head-sub">EPC figure · heating, hot water &amp; lighting only</div>
        </div>
        <div class="ssp-head-close" @click="activePanel = null">×</div>
      </div>
      <div class="ssp-divider">Where it goes</div>
      <div class="ssp-bar-row">
        <div class="ssp-bar-icon">🔥</div>
        <div class="ssp-bar-label">Heating</div>
        <div class="ssp-bar-track"><div class="ssp-bar-fill gas" :style="{ width: billsSplitDisplay.heating + '%' }" /></div>
        <div class="ssp-bar-amt">£{{ formatNum(annualCost * billsSplitDisplay.heating / 100) }}<div class="ssp-bar-amt-pct">{{ billsSplitDisplay.heating }}%</div></div>
      </div>
      <div class="ssp-bar-row">
        <div class="ssp-bar-icon">💧</div>
        <div class="ssp-bar-label">Hot water</div>
        <div class="ssp-bar-track"><div class="ssp-bar-fill hw" :style="{ width: billsSplitDisplay.hotWater + '%' }" /></div>
        <div class="ssp-bar-amt">£{{ formatNum(annualCost * billsSplitDisplay.hotWater / 100) }}<div class="ssp-bar-amt-pct">{{ billsSplitDisplay.hotWater }}%</div></div>
      </div>
      <div class="ssp-bar-row">
        <div class="ssp-bar-icon">💡</div>
        <div class="ssp-bar-label">Lighting</div>
        <div class="ssp-bar-track"><div class="ssp-bar-fill elec" :style="{ width: billsSplitDisplay.lighting + '%' }" /></div>
        <div class="ssp-bar-amt">£{{ formatNum(annualCost * billsSplitDisplay.lighting / 100) }}<div class="ssp-bar-amt-pct">{{ billsSplitDisplay.lighting }}%</div></div>
      </div>
      <div class="ssp-total-row">
        <div class="ssp-total-label">Total per year</div>
        <div class="ssp-total-num">£{{ formatNum(annualCost) }}</div>
      </div>
      <div class="ssp-note">
        Standing charges, cooking and appliances are <b>not included</b> in the
        EPC figure.
      </div>
      <div class="ssp-foot" @click="$emit('open-pathway')">
        <div class="ssp-foot-text">
          All 6 EPC steps cut bills by <b>£{{ formatNum(potentialSaving) }}/yr</b> →
        </div>
        <div class="ssp-foot-arrow">›</div>
      </div>
    </div>

    <!-- ── CO₂ PANEL ───────────────────────────────────────────────── -->
    <div v-if="activePanel === 'co2'" class="score-strip-panel open">
      <div class="ssp-head">
        <div class="ssp-head-icon">🌍</div>
        <div class="ssp-head-info">
          <div class="ssp-head-title">CO₂ emissions · {{ co2NowDisplay.toFixed(1) }}t/yr</div>
          <div class="ssp-head-sub">UK average 6.0t · could drop to {{ co2Potential.toFixed(1) }}t after all 6 EPC steps</div>
        </div>
        <div class="ssp-head-close" @click="activePanel = null">×</div>
      </div>
      <div class="ssp-divider">Now vs potential</div>
      <div class="ssp-bar-row">
        <div class="ssp-bar-icon">🏠</div>
        <div class="ssp-bar-label">Your home</div>
        <div class="ssp-bar-track"><div class="ssp-bar-fill co2-heat" :style="{ width: co2NowPct + '%' }" /></div>
        <div class="ssp-bar-amt">{{ co2NowDisplay.toFixed(1) }}t<div class="ssp-bar-amt-pct">now</div></div>
      </div>
      <div class="ssp-bar-row">
        <div class="ssp-bar-icon">📊</div>
        <div class="ssp-bar-label">UK avg</div>
        <div class="ssp-bar-track"><div class="ssp-bar-fill co2-elec" :style="{ width: '75%' }" /></div>
        <div class="ssp-bar-amt">6.0t<div class="ssp-bar-amt-pct">benchmark</div></div>
      </div>
      <div class="ssp-bar-row">
        <div class="ssp-bar-icon">🎯</div>
        <div class="ssp-bar-label">Potential</div>
        <div class="ssp-bar-track"><div class="ssp-bar-fill co2-hw" :style="{ width: co2PotentialPct + '%' }" /></div>
        <div class="ssp-bar-amt">{{ co2Potential.toFixed(1) }}t<div class="ssp-bar-amt-pct">after</div></div>
      </div>
      <div class="ssp-total-row">
        <div class="ssp-total-label">Recoverable</div>
        <div class="ssp-total-num">–{{ (co2NowDisplay - co2Potential).toFixed(1) }}t CO₂/yr</div>
      </div>
      <div class="ssp-equiv">
        <div class="ssp-equiv-icon">🚗</div>
        <div>{{ (co2NowDisplay - co2Potential).toFixed(1) }} tonnes CO₂ ≈ <b>driving 12,000 miles in a petrol car</b>.</div>
      </div>
      <div class="ssp-foot" @click="$emit('open-pathway')">
        <div class="ssp-foot-text">
          All 6 EPC steps cut emissions by <b>{{ (co2NowDisplay - co2Potential).toFixed(1) }}t/yr</b> →
        </div>
        <div class="ssp-foot-arrow">›</div>
      </div>
    </div>

    <!-- ── STREET PANEL ────────────────────────────────────────────── -->
    <div v-if="activePanel === 'street'" class="score-strip-panel open">
      <div class="ssp-head">
        <div class="ssp-head-icon">🏘</div>
        <div class="ssp-head-info">
          <div class="ssp-head-title">Your street, ranked by energy cost</div>
          <div class="ssp-head-sub">
            {{ property?.postcode || '—' }} · {{ streetTotal || 18 }} homes · estimated from EPC data
          </div>
        </div>
        <div class="ssp-head-close" @click="activePanel = null">×</div>
      </div>
      <div class="ssp-rank-hero">
        <div class="ssp-rank-num">#{{ streetRank ?? 8 }}</div>
        <div class="ssp-rank-info">
          <div class="ssp-rank-label">{{ streetRankOrdinal }} cheapest of {{ streetTotal || 18 }} homes</div>
          <div class="ssp-rank-sub">
            <b>£190 below</b> the postcode average of £1,651/yr
          </div>
        </div>
      </div>

      <div class="ssp-street-legend">
        <span class="ssp-street-legend-item">
          <span class="ssp-street-legend-dot" style="background:#2EAB55" />Under £1,200/yr
        </span>
        <span class="ssp-street-legend-item">
          <span class="ssp-street-legend-dot" style="background:#E6A23C" />£1,200–£1,800
        </span>
        <span class="ssp-street-legend-item">
          <span class="ssp-street-legend-dot" style="background:#E74C5E" />Over £1,800/yr
        </span>
      </div>

      <!-- Scrollable street scene -->
      <div class="ssp-street-scene">
        <div class="ssp-street-inner">
          <svg class="ssp-street-svg" viewBox="0 0 460 180" preserveAspectRatio="xMinYMid meet" aria-label="Postcode street view">
            <defs>
              <linearGradient id="streetSkyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#DCEEF0" />
                <stop offset="100%" stop-color="#BFE2E5" />
              </linearGradient>
            </defs>
            <rect width="460" height="85" fill="url(#streetSkyGrad)" />

            <!-- Top row -->
            <g
              v-for="h in topRowHouses"
              :key="`top-${h.num}`"
              class="ssp-street-house"
              :class="{ you: h.isYou }"
              @click="pickHouse(h)"
            >
              <!-- YOU house: bigger body + person marker -->
              <template v-if="h.isYou">
                <circle :cx="h.cx" cy="32" r="4.5" fill="#00A19A" />
                <circle :cx="h.cx" cy="32" r="1.8" fill="white" />
                <path :d="`M${h.cx} 36.5 L${h.cx - 3} 41 L${h.cx + 3} 41 Z`" fill="#00A19A" />
                <polygon :points="`${h.cx - 14},55 ${h.cx},44 ${h.cx + 14},55`" fill="#00A19A" />
                <rect class="ssp-house-body" :x="h.cx - 11" y="55" width="22" height="20" fill="#E5F4F2" stroke="#00A19A" stroke-width="1.4" />
                <rect :x="h.cx - 7" y="59" width="4" height="4" fill="#6BD4CD" />
                <rect :x="h.cx + 2" y="59" width="4" height="4" fill="#6BD4CD" />
                <rect :x="h.cx - 2.5" y="67" width="5" height="8" fill="#231d45" />
                <rect :x="h.cx - 16" y="57" width="4.5" height="6" :fill="h.color" rx="0.5" />
                <text :x="h.cx - 13.8" y="61" font-size="4" font-weight="800" fill="white" text-anchor="middle">{{ h.grade }}</text>
                <circle :cx="h.cx + 14" cy="58" r="3" :fill="h.dot" />
                <text :x="h.cx + 14" y="60.2" font-size="4.5" font-weight="800" fill="white" text-anchor="middle">★</text>
                <text :x="h.cx" y="82" font-size="6.5" font-weight="800" fill="#00A19A" text-anchor="middle">{{ h.num }}</text>
              </template>
              <!-- Regular house -->
              <template v-else>
                <polygon :points="`${h.cx - 11},55 ${h.cx},46 ${h.cx + 11},55`" :fill="h.roof" />
                <rect class="ssp-house-body" :x="h.cx - 8" y="55" width="16" height="16" fill="#FAFAFA" stroke="#9C98AD" stroke-width="0.5" />
                <rect :x="h.cx - 5" y="58" width="3" height="3" :fill="h.window" />
                <rect :x="h.cx + 2" y="58" width="3" height="3" :fill="h.window" />
                <rect :x="h.cx - 2" y="64" width="3" height="7" :fill="h.door" />
                <rect :x="h.cx - 12" y="56" width="4" height="5" :fill="h.color" rx="0.5" />
                <text :x="h.cx - 10" y="59.5" font-size="3.5" font-weight="800" fill="white" text-anchor="middle">{{ h.grade }}</text>
                <circle :cx="h.cx + 11" cy="58" r="2.5" :fill="h.dot" />
                <text :x="h.cx" y="80" font-size="6" font-weight="800" fill="#231d45" text-anchor="middle">{{ h.num }}</text>
              </template>
            </g>

            <!-- Road -->
            <rect x="0" y="85" width="460" height="25" fill="#3A3F4A" />
            <line x1="0" y1="97.5" x2="460" y2="97.5" stroke="#E6A23C" stroke-width="1.5" stroke-dasharray="10,8" />
            <text x="230" y="100" font-size="6.5" font-weight="800" fill="rgba(255,255,255,0.55)" text-anchor="middle" letter-spacing="2.5">
              {{ streetName }}
            </text>

            <!-- Bottom row -->
            <g
              v-for="h in bottomRowHouses"
              :key="`bot-${h.num}`"
              class="ssp-street-house"
              @click="pickHouse(h)"
            >
              <polygon :points="`${h.cx - 11},128 ${h.cx},119 ${h.cx + 11},128`" :fill="h.roof" />
              <rect class="ssp-house-body" :x="h.cx - 8" y="128" width="16" height="16" fill="#FAFAFA" stroke="#9C98AD" stroke-width="0.5" />
              <rect :x="h.cx - 5" y="131" width="3" height="3" :fill="h.window" />
              <rect :x="h.cx + 2" y="131" width="3" height="3" :fill="h.window" />
              <rect :x="h.cx - 2" y="137" width="3" height="7" :fill="h.door" />
              <rect :x="h.cx - 12" y="129" width="4" height="5" :fill="h.color" rx="0.5" />
              <text :x="h.cx - 10" y="132.5" font-size="3.5" font-weight="800" fill="white" text-anchor="middle">{{ h.grade }}</text>
              <circle :cx="h.cx + 11" cy="131" r="2.5" :fill="h.dot" />
              <text :x="h.cx" y="156" font-size="6" font-weight="800" fill="#231d45" text-anchor="middle">{{ h.num }}</text>
            </g>

            <!-- Ground -->
            <rect x="0" y="148" width="460" height="32" fill="#B8C7B0" opacity="0.4" />
          </svg>

          <!-- Walker overlay — moves to clicked house via CSS transition -->
          <div
            class="ssp-street-walker walking"
            :style="{ left: walkerX + 'px', top: walkerY + 'px' }"
          >
            <svg viewBox="0 0 18 26" aria-hidden="true">
              <circle cx="9" cy="5" r="3.5" fill="#231d45" />
              <rect x="7" y="8" width="4" height="8" rx="1" fill="#00A19A" />
              <rect class="arm-l" x="4.5" y="9" width="2" height="6" rx="1" fill="#231d45" />
              <rect class="arm-r" x="11.5" y="9" width="2" height="6" rx="1" fill="#231d45" />
              <rect class="leg-l" x="6.5" y="15" width="2" height="8" rx="1" fill="#231d45" />
              <rect class="leg-r" x="9.5" y="15" width="2" height="8" rx="1" fill="#231d45" />
            </svg>
          </div>
        </div>
      </div>
      <div class="ssp-street-scroll-hint">← swipe to see the rest of your postcode →</div>
      <div class="ssp-street-tip">Tap any house to see its EPC and cost</div>

      <!-- Selected house tooltip -->
      <div class="ssp-street-tooltip" :class="{ you: selectedHouse.isYou }">
        <span class="ssp-street-tooltip-num">
          No. {{ selectedHouse.num }}{{ selectedHouse.isYou ? ' — You' : '' }}
        </span>
        <span
          class="ssp-street-tooltip-rating"
          :style="{ background: selectedHouse.color }"
        >{{ selectedHouse.grade }} · {{ selectedHouse.score }}</span>
        <span class="ssp-street-tooltip-cost" :class="selectedHouse.tier">
          {{ selectedHouse.cost }}/yr
        </span>
      </div>

      <!-- Pathway projection -->
      <div class="ssp-street-projection" @click="$emit('open-pathway')">
        <div class="ssp-street-projection-icon">📈</div>
        <div class="ssp-street-projection-body">
          <div class="ssp-street-projection-label">If you complete the EPC pathway</div>
          <div class="ssp-street-projection-num">
            £{{ formatNum(annualCost - potentialSaving) }}<span>/yr</span>
          </div>
          <div class="ssp-street-projection-sub">
            <b>2nd of {{ streetTotal || 18 }}</b> on your street · up from {{ streetRankOrdinal.toLowerCase() }}
          </div>
        </div>
        <div class="ssp-street-projection-saving">
          <div class="ssp-street-projection-saving-num">–£{{ formatNum(potentialSaving) }}</div>
          <div class="ssp-street-projection-saving-sub">/yr saved</div>
        </div>
      </div>

      <div class="ssp-note">
        Higher EPCs sell faster and <b>command ~£15k more</b> on average for a
        3-bed in {{ outwardPostcode }} (Land Reg data).
      </div>
    </div>

    <!-- ── STAT BREAKDOWN (5 rows · expandable) ─────────────────────── -->
    <div class="section-h-row">
      <div class="section-h">How your {{ displayScore }} splits · EPC stats</div>
      <div class="section-h-sub">Points breakdown</div>
    </div>
    <div class="stat-card anim-4" data-tour="breakdown">
      <template v-for="s in stats" :key="s.id">
        <div
          class="stat-row clickable"
          :class="{ open: expandedStat === s.id }"
          @click="toggleStat(s.id)"
        >
          <div class="stat-icon">{{ s.icon }}</div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-bar-wrap">
            <div class="stat-bar-fill" :class="s.tone" :style="{ width: s.pct + '%' }" />
          </div>
          <div class="stat-value">{{ s.value }}/{{ s.max }}</div>
          <span class="stat-row-chev">›</span>
        </div>
        <div v-if="expandedStat === s.id" class="stat-expand">
          <div class="stat-expand-meta">
            <div class="stat-expand-meta-tile">
              <div class="stat-expand-meta-eyebrow">EPC steps</div>
              <div class="stat-expand-meta-num" :class="s.steps > 0 ? 'cost' : 'save'">
                {{ s.steps > 0 ? s.steps : '—' }}
              </div>
              <div class="stat-expand-meta-sub">
                {{ s.steps > 0 ? 'recommended' : 'none recommended' }}
              </div>
            </div>
            <div class="stat-expand-meta-tile">
              <div class="stat-expand-meta-eyebrow">Could save</div>
              <div class="stat-expand-meta-num save">
                <template v-if="s.saving > 0">
                  £{{ s.saving
                  }}<span style="font-size: 9px; color: var(--text-secondary)">/yr</span>
                </template>
                <template v-else>—</template>
              </div>
              <div class="stat-expand-meta-sub">
                {{ s.saving > 0 ? s.savingSub : 'nothing to gain' }}
              </div>
            </div>
            <div class="stat-expand-meta-tile">
              <div class="stat-expand-meta-eyebrow">{{ s.thirdTileLabel }}</div>
              <div class="stat-expand-meta-num">{{ s.thirdTileNum || '—' }}</div>
              <div class="stat-expand-meta-sub">{{ s.thirdTileSub }}</div>
            </div>
          </div>
          <div v-for="(line, i) in s.lines" :key="i" class="stat-cost-line">
            <div class="stat-cost-bullet">{{ line.icon }}</div>
            <div class="stat-cost-info">
              <div class="stat-cost-title">{{ line.title }}</div>
              <div class="stat-cost-sub" v-html="line.sub" />
            </div>
            <div class="stat-cost-amt">
              <div
                class="stat-cost-amt-big"
                :style="line.amtMuted ? { color: 'var(--text-faint)' } : line.amtGood ? { color: 'var(--accent-dark)' } : null"
              >{{ line.amt }}</div>
              <div v-if="line.amtSub" class="stat-cost-amt-sub">{{ line.amtSub }}</div>
            </div>
          </div>
          <div class="stat-expand-foot" @click.stop="$emit('open-pathway')">
            <div class="stat-expand-foot-text" v-html="s.footText" />
            <div class="stat-expand-foot-arrow">›</div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── FULL EPC DRAWER ─────────────────────────────────────────── -->
    <div ref="epcDrawerEl" class="epc-drawer anim-3" :class="{ open: epcDrawerOpen }">
      <div class="epc-drawer-head" @click="toggleEpcDrawer">
        <div class="epc-drawer-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 4 14 11 14 11 22 20 10 13 10" fill="currentColor" />
          </svg>
        </div>
        <div class="epc-drawer-info">
          <div class="epc-drawer-title">Full EPC breakdown</div>
          <div class="epc-drawer-sub">
            {{ epcDrawerOpen ? 'Tap to close' : `Every line of energy detail behind your score · ${epcItems.length} items` }}
          </div>
        </div>
        <div class="epc-drawer-chev" :class="{ open: epcDrawerOpen }">›</div>
      </div>
      <div v-if="epcDrawerOpen" class="epc-drawer-body">
        <!-- Summary row: current → potential -->
        <div class="epc-summary">
          <div class="epc-grade">
            <div class="epc-grade-letter" :style="{ background: epcColor }">{{ epcRating || '—' }}</div>
            <div class="epc-grade-sub">Current · {{ displayScore }}</div>
          </div>
          <div class="epc-arrow">→</div>
          <div class="epc-grade">
            <div class="epc-grade-letter" style="background: #7ab040">C</div>
            <div class="epc-grade-sub">Potential · 75</div>
          </div>
          <div class="epc-saving">
            <div class="epc-saving-num">£{{ formatNum(potentialSaving) }}/yr</div>
            <div class="epc-saving-sub">potential saving</div>
          </div>
        </div>

        <!-- 12 EPC items, each clickable to expand -->
        <template v-for="item in epcItems" :key="item.id">
          <div class="epc-item" @click="toggleEpcItem(item.id)">
            <div class="epc-item-icon">{{ item.icon }}</div>
            <div class="epc-item-body">
              <div class="epc-item-title">{{ item.title }}</div>
              <div class="epc-item-sub" v-html="item.sub" />
            </div>
            <span class="epc-item-rating" :class="item.ratingClass">{{ item.rating }}</span>
            <span class="epc-item-chev" :class="{ open: expandedEpcItem === item.id }">›</span>
          </div>
          <div v-if="expandedEpcItem === item.id" class="epc-item-expand">
            <div class="epc-flag" :class="{ ok: item.flagOk }">
              <div class="epc-flag-label">{{ item.flagOk ? '✓ Already strong' : '⚠ What\'s flagged' }}</div>
              <div class="epc-flag-text" v-html="item.flagText" />
            </div>
            <div v-if="item.fix" class="epc-fix">
              <div class="epc-fix-label">{{ item.fix.label }}</div>
              <div class="epc-fix-text" v-html="item.fix.text" />
              <a class="epc-fix-action" @click.stop="$emit('open-pathway')">See suppliers →</a>
            </div>
          </div>
        </template>

        <!-- Refine CTA -->
        <div class="epc-drawer-cta" @click="$emit('refine')">
          <div class="epc-drawer-cta-text">
            Some of this may have changed since the survey.
            <b>Refine your score in 2 minutes →</b>
          </div>
          <div class="epc-drawer-cta-arrow">›</div>
        </div>
      </div>
    </div>

    <!-- ── FORK SECTION (owner / interested) ───────────────────────── -->
    <div class="fork-section anim-3" data-tour="intent">
      <div class="fork-eyebrow">What's your connection to this property?</div>
      <div class="fork-options">
        <button class="fork-opt primary" type="button" @click="$emit('claim')">
          <div class="fork-opt-icon">🏠</div>
          <div class="fork-opt-body">
            <div class="fork-opt-title">I own this property</div>
            <div class="fork-opt-sub">Take the quiz to level up your stats and get your real score.</div>
          </div>
          <div class="fork-opt-chev">›</div>
        </button>
        <button class="fork-opt" type="button" @click="$emit('interested')">
          <div class="fork-opt-icon">🔍</div>
          <div class="fork-opt-body">
            <div class="fork-opt-title">I'm interested in this property</div>
            <div class="fork-opt-sub">Full running costs, risks and questions to ask before you offer.</div>
          </div>
          <div class="fork-opt-chev">›</div>
        </button>
      </div>
    </div>
    </template><!-- /hasEpcData -->

    <div style="height: 32px" />

    <!-- ── Claim-it-free explainer modal (teleported to body so it
         escapes any parent overflow/transform stacking context) ─── -->
    <Teleport to="body">
    <Transition name="claim-modal">
      <div v-if="claimModalOpen" class="claim-overlay" @click.self="claimModalOpen = false">
        <div class="claim-sheet" @click.stop>
          <div class="claim-grip" />
          <div class="claim-icon">🪪</div>
          <div class="claim-title">Claim this property</div>
          <div class="claim-sub">
            You'll verify you own <b>{{ addrLineFull }}</b> and unlock your
            HomeScore, Move Ready % and Property Passport.
          </div>
          <div class="claim-steps">
            <div class="claim-step">
              <div class="claim-step-num">1</div>
              <div class="claim-step-body">
                <div class="claim-step-title">Verify your ID</div>
                <div class="claim-step-sub">Onfido · photo + selfie · ~60 seconds</div>
              </div>
            </div>
            <div class="claim-step">
              <div class="claim-step-num">2</div>
              <div class="claim-step-body">
                <div class="claim-step-title">Confirm ownership</div>
                <div class="claim-step-sub">HM Land Registry cross-check · automatic</div>
              </div>
            </div>
            <div class="claim-step">
              <div class="claim-step-num">3</div>
              <div class="claim-step-body">
                <div class="claim-step-title">Take the owner quiz</div>
                <div class="claim-step-sub">6–8 EPC questions · earns your real HomeScore</div>
              </div>
            </div>
          </div>
          <div class="claim-cta-row">
            <button type="button" class="claim-btn ghost" @click="claimModalOpen = false">
              Not now
            </button>
            <button
              type="button"
              class="claim-btn primary"
              @click="claimModalOpen = false; $emit('claim')"
            >
              Start verification →
            </button>
          </div>
          <div class="claim-privacy">
            <span>🔒</span>
            <span>Free · no card needed · we'll never sell your data.</span>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PassportClaimBox from '~/components/property/PassportClaimBox.vue'

const props = withDefaults(
  defineProps<{
    property: any | null
    score: number
    epcRating: string | null
    epcYear?: number | null
    /** Estimated annual running cost in £ */
    annualCost: number
    /** Potential annual saving if all EPC steps done */
    potentialSaving?: number
    /** Current CO₂ in tonnes/yr (real EPC data; null if unavailable) */
    co2Now?: number | null
    /** Potential CO₂ if all improvements done (real EPC data; null if unavailable) */
    co2Potential?: number | null
    /** Real bills split from EPC heating/hotWater/lighting costs */
    billsSplit?: { heating: number; hotWater: number; lighting: number } | null
    /** Street rank (1 = cheapest, N = most expensive) */
    streetRank?: number | null
    streetTotal?: number | null
    /** Real searches today from PropertySearchLog */
    searchesToday?: number
    /** Passport status of the property — drives the claim box so we don't
     *  pitch "claim" on a home that's already claimed. */
    passportState?: 'unclaimed' | 'inProgress' | 'published'
    /** Passport build progress (drives the in-progress ring + drawer). */
    passportProgressPct?: number
    passportSectionsDone?: number
    passportSectionsTotal?: number
    /** Set by parent to auto-pop the claim drawer (e.g. when the user
     *  has just returned from sign-in with ?claim=1) */
    autoOpenClaim?: boolean
  }>(),
  {
    potentialSaving: 445,
    co2Now: null,
    co2Potential: null,
    billsSplit: null,
    streetRank: null,
    streetTotal: null,
    searchesToday: 0,
    passportState: 'unclaimed',
    passportProgressPct: 0,
    passportSectionsDone: 0,
    passportSectionsTotal: 0,
    autoOpenClaim: false,
  },
)

// Whether this property has enough EPC data to render the live score.
// We require at least the rating + an annual cost figure (or the EPC cert
// object) — if neither is present, the gov register has no certificate
// and we surface a proper "EPC not available" empty state rather than
// fabricating scores from dummy fallbacks.
const hasEpcData = computed(() => {
  // Trust ONLY positive evidence of a real EPC certificate. Don't trust
  // `annualCost` — `resolvedAnnualCost` in the parent falls back to a
  // rating-based map (or £1,592 if even that's missing), so it's always
  // > 0 and would mask a "no EPC on file" property as if it had one.
  const p = props.property as any
  if (!p) return false
  if (props.epcRating) return true
  // The lmk-key is positive proof the cert was actually fetched, not a
  // heuristic fallback. Check both the top-level row and the nested
  // cert sub-object (backend exposes both shapes).
  if (p.epcLmkKey) return true
  if (p.epcCert?.lmkKey) return true
  if (p.epcCert?.epcRating) return true
  return false
})

// Real or estimated splits/values, with safe fallbacks.
const billsSplitDisplay = computed(() => {
  if (props.billsSplit) return props.billsSplit
  return { heating: 72, hotWater: 18, lighting: 10 }
})
const streetRankLabel = computed(() => {
  const r = props.streetRank
  const t = props.streetTotal
  if (r == null || t == null || t <= 0) return '—'
  const ratio = r / t
  if (ratio <= 0.33) return 'top of street'
  if (ratio <= 0.5) return 'above avg'
  if (ratio <= 0.66) return 'around avg'
  return 'below avg'
})

const co2NowDisplay = computed(() => {
  const v = props.co2Now
  if (v != null && Number.isFinite(v)) return v
  // Estimate from EPC rating when no real value is present.
  const map: Record<string, number> = { A: 1.8, B: 2.6, C: 3.8, D: 5.2, E: 6.4, F: 8.1, G: 9.6 }
  const r = (props.epcRating || '').toUpperCase()
  return map[r] ?? 6.4
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'claim'): void
  (e: 'refine'): void
  (e: 'interested'): void
  (e: 'open-panel', panel: 'bills' | 'co2' | 'street'): void
  (e: 'open-pathway'): void
  (e: 'see-running-costs'): void
  (e: 'see-street'): void
  /** Property already claimed — parent navigates to the passport/property. */
  (e: 'view-passport'): void
  /** Open the £99 unlock drawer on the property page (in-progress/published). */
  (e: 'buy-passport'): void
  /** Fires when the user dismisses the claim modal so the parent can
   *  clear the ?claim=1 auto-open intent and not re-trigger on remount. */
  (e: 'claim-modal-closed'): void
}>()

// Unique id for the SVG gradient so multiple instances on a page don't
// clash on the same <defs> id.
const gradientId = `hs-v6-grad-${Math.random().toString(36).slice(2, 8)}`

// ── Typewriter for the amber address line ────────────────────────
// The meta sub-line (postcode · type · bedrooms) reveals instantly,
// the headline address types out one character at a time for a "this
// is YOUR home" beat. Mirrors the prototype's #addrLine / #addrLineCaret.
const addrLineFull = computed(() => props.property?.addressLine1 || 'Your property')
const addrMetaFull = computed(() => {
  const p = props.property
  if (!p) return ''
  const parts: string[] = []
  if (p.postcode) parts.push(p.postcode)
  if (p.propertyType) parts.push(p.propertyType)
  // Show floor area (from EPC) instead of bedroom count — more meaningful
  // for energy / running-cost context. Falls back to bedrooms only when
  // we have no area on file.
  const area = p.floorAreaSqm ?? p.epcCert?.floorAreaSqm
  if (area && Number.isFinite(Number(area))) {
    parts.push(`${Math.round(Number(area))}m²`)
  } else if (p.bedrooms) {
    parts.push(`${p.bedrooms} bed`)
  }
  return parts.join(' · ')
})

const addrLineTyped = ref('')
const addrMetaTyped = computed(() => addrMetaFull.value)
let twTimer: ReturnType<typeof setInterval> | null = null

function startTypewriter(text: string) {
  if (twTimer) {
    clearInterval(twTimer)
    twTimer = null
  }
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !text) {
    addrLineTyped.value = text
    return
  }
  addrLineTyped.value = ''
  let i = 0
  twTimer = setInterval(() => {
    i += 1
    addrLineTyped.value = text.slice(0, i)
    if (i >= text.length && twTimer) {
      clearInterval(twTimer)
      twTimer = null
    }
  }, 32)
}
onMounted(() => startTypewriter(addrLineFull.value))
// Property data may arrive AFTER mount (async fetch from parent). When
// `addrLineFull` changes from the fallback "Your property" to the real
// address, restart the typewriter so the right text shows.
watch(addrLineFull, (next, prev) => {
  if (next && next !== prev) startTypewriter(next)
})
onBeforeUnmount(() => {
  if (twTimer) clearInterval(twTimer)
})

// ── Animated count-up score (gauge + headline number both tick up) ──
const animatedScore = ref(0)
let scoreRaf = 0
function animateScore(target: number) {
  cancelAnimationFrame(scoreRaf)
  const from = animatedScore.value
  const start = performance.now()
  const dur = 1100
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur)
    const eased = 1 - Math.pow(1 - t, 3)
    animatedScore.value = from + (target - from) * eased
    if (t < 1) scoreRaf = requestAnimationFrame(tick)
  }
  scoreRaf = requestAnimationFrame(tick)
}
onMounted(() => animateScore(Number(props.score) || 0))
onBeforeUnmount(() => cancelAnimationFrame(scoreRaf))
const displayScore = computed(() => Math.round(animatedScore.value))

// Gauge stroke-dashoffset: full circle is 2π·50 = 314.16. We start at
// 314.16 (empty), tick down to 314.16 · (1 - score/100).
const gaugeOffset = computed(() => 314.16 - (animatedScore.value / 100) * 314.16)

// ── Score band copy (drives the big headline next to the gauge) ──
const scoreBandTitle = computed(() => {
  const s = props.score
  if (s >= 92) return 'Top of the class · A'
  if (s >= 81) return 'Excellent · B'
  if (s >= 69) return 'Above average · C'
  if (s >= 55) return 'Average · D'
  if (s >= 39) return 'Room to climb · E → C'
  if (s >= 21) return 'Plenty to gain · F → C'
  return 'Critical · G → D'
})
const scoreExplainer = computed(() => {
  const saving = formatNum(props.potentialSaving ?? 0)
  return `The EPC lists <b>6 steps</b> to lift your score and cut bills by <b>~£${saving}/yr</b>. See the path below.`
})

// ── EPC letter pill colour ───────────────────────────────────────
const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#008060',
    B: '#2EAB55',
    C: '#7AB040',
    D: '#E6A23C',
    E: '#D86F4A',
    F: '#C73E36',
    G: '#7A2A20',
  }
  return map[(props.epcRating || '').toUpperCase()] || '#9c98ad'
})

// ── Quick stats strip — popout panel toggle ──────────────────────
const activePanel = ref<'bills' | 'co2' | 'street' | null>(null)
function togglePanel(p: 'bills' | 'co2' | 'street') {
  activePanel.value = activePanel.value === p ? null : p
}

// ── CO₂ panel maths ──────────────────────────────────────────────
// Potential = ~53% of current (matches prototype's 6.4 → 3.4 example).
// Use real co2Potential from EPC when available; otherwise estimate.
const co2Potential = computed(() => {
  const v = props.co2Potential
  if (v != null && Number.isFinite(v)) return v
  return Math.max(1.4, co2NowDisplay.value * 0.53)
})
// Bars are sized relative to a 10t maximum so they're comparable.
const co2NowPct = computed(() => Math.min(100, (co2NowDisplay.value / 10) * 125))
const co2PotentialPct = computed(() => Math.min(100, (co2Potential.value / 10) * 125))

// ── Street panel ────────────────────────────────────────────────
// House data lifted from the prototype's hand-drawn 18-house SVG. Each
// row is keyed off the same x-anchor positions the prototype uses so
// the walker animation lands cleanly on the clicked house. The two
// `cx` values per row mirror the prototype's x increments (50 px gap).
interface StreetHouse {
  num: string
  grade: string
  score: number
  cost: string
  tier: 'good' | 'warn' | 'high'
  color: string
  roof: string
  door: string
  window: string
  dot: string
  cx: number
  walkerX: number
  walkerY: number
  isYou: boolean
}

// Extract the leading house number from the property's first address line
// so the "YOU" marker on the street SVG lands on the user's actual house
// rather than the prototype's hardcoded "15".
const youHouseNum = computed<number>(() => {
  const line = (props.property as any)?.addressLine1 || ''
  const m = String(line).match(/(\d+)/)
  const n = m ? parseInt(m[1], 10) : 15
  return Number.isFinite(n) && n > 0 ? n : 15
})

// Build the 18 neighbouring houses centred on the user's real number.
// Houses on UK streets alternate odd/even between the two sides of the
// road, so the top row is the odd side and the bottom row is the even.
function buildStreetHouses(): { top: StreetHouse[]; bottom: StreetHouse[] } {
  const me = youHouseNum.value
  // Mock palette for the 17 neighbours — until backend exposes per-house
  // EPC data, we cycle through a plausible spread of grades/costs.
  const palette: Array<[string, number, string, 'good' | 'warn' | 'high']> = [
    ['A', 92, '£945',   'good'],
    ['B', 84, '£1,108', 'good'],
    ['C', 76, '£1,193', 'good'],
    ['C', 72, '£1,265', 'warn'],
    ['D', 64, '£1,310', 'warn'],
    ['D', 60, '£1,355', 'warn'],
    ['D', 56, '£1,418', 'warn'],
    ['E', 45, '£1,580', 'warn'],
    ['E', 42, '£1,635', 'warn'],
    ['F', 38, '£1,720', 'warn'],
    ['F', 35, '£1,820', 'high'],
    ['F', 32, '£1,900', 'high'],
    ['F', 30, '£1,950', 'high'],
    ['F', 25, '£2,050', 'high'],
    ['G', 20, '£2,140', 'high'],
    ['G', 18, '£2,340', 'high'],
    ['G', 15, '£2,520', 'high'],
  ]
  const isOdd = me % 2 === 1
  // Generate 9 numbers on each side, centred on the user's number.
  const myNums: number[] = []
  const otherNums: number[] = []
  const sideStart = me - 8
  for (let i = 0; i < 9; i++) {
    myNums.push(Math.max(1, sideStart + i * 2))
  }
  // Opposite side: neighbour numbers that interleave between the user's side.
  for (let i = 0; i < 9; i++) {
    otherNums.push(Math.max(1, sideStart + 1 + i * 2))
  }
  const topNums = isOdd ? myNums : otherNums
  const bottomNums = isOdd ? otherNums : myNums

  const buildRow = (nums: number[], y: number): StreetHouse[] =>
    nums.map((n, idx) => {
      const x = 30 + idx * 50
      if (n === me) {
        return mkHouse(
          String(n),
          props.epcRating || 'E',
          Math.round(props.score),
          `£${formatNum(props.annualCost)}`,
          'warn',
          x,
          y,
          true,
        )
      }
      // Deterministic palette pick so each address gets a stable grade.
      const [grade, score, cost, tier] = palette[(n * 7) % palette.length]
      return mkHouse(String(n), grade, score, cost, tier, x, y)
    })

  return {
    top: buildRow(topNums, 88),
    bottom: buildRow(bottomNums, 107),
  }
}

const topRowHouses = computed<StreetHouse[]>(() => buildStreetHouses().top)
const bottomRowHouses = computed<StreetHouse[]>(() => buildStreetHouses().bottom)

function mkHouse(
  num: string,
  grade: string,
  score: number,
  cost: string,
  tier: 'good' | 'warn' | 'high',
  cx: number,
  walkerY: number,
  isYou = false,
): StreetHouse {
  // Colour palette per grade — matches the prototype's hand-coded values
  // exactly so the SVG looks identical to the design.
  const palette: Record<
    string,
    { color: string; roof: string; door: string; window: string; dot: string }
  > = {
    A: { color: '#00A19A', roof: '#2EAB55', door: '#2EAB55', window: '#A8E6C4', dot: '#2EAB55' },
    B: { color: '#2EAB55', roof: '#2EAB55', door: '#2EAB55', window: '#A8E6C4', dot: '#2EAB55' },
    C: { color: '#7AB040', roof: '#7AB040', door: '#2EAB55', window: '#C7E8E4', dot: '#2EAB55' },
    D: { color: '#E6A23C', roof: '#E6A23C', door: '#A0683E', window: '#C7E8E4', dot: '#E6A23C' },
    E: { color: '#D86F4A', roof: '#D86F4A', door: '#7C8B9C', window: '#A4B4C2', dot: '#E6A23C' },
    F: { color: '#C73E36', roof: '#C73E36', door: '#7C8B9C', window: '#A4B4C2', dot: '#E74C5E' },
    G: { color: '#C73E36', roof: '#C73E36', door: '#7C8B9C', window: '#A4B4C2', dot: '#E74C5E' },
  }
  const p = palette[grade] ?? palette.E
  return {
    num,
    grade,
    score,
    cost,
    tier,
    color: p.color,
    roof: p.roof,
    door: p.door,
    window: p.window,
    dot: p.dot,
    cx,
    walkerX: cx,
    walkerY,
    isYou,
  }
}

// Selected house — defaults to YOU (15). Tooltip + walker overlay both
// drive off this state. Clicking any house re-points everything.
const selectedHouse = ref<StreetHouse>(
  mkHouse(
    '15',
    props.epcRating || 'E',
    Math.round(props.score),
    `£${formatNum(props.annualCost)}`,
    'warn',
    230,
    88,
    true,
  ),
)
const walkerX = computed(() => selectedHouse.value.walkerX)
const walkerY = computed(() => selectedHouse.value.walkerY)

function pickHouse(h: StreetHouse) {
  selectedHouse.value = h
}

// Street name displayed across the road in the SVG — pulled from the
// property's address line. Falls back to the prototype's example.
const streetName = computed(() => {
  const a = props.property?.addressLine1 || ''
  const cleaned = a.replace(/^\d+[a-z]?[,\s]+/i, '').trim()
  return (cleaned || 'WOODFIELD ROAD').toUpperCase()
})

// Outward postcode (first half) for the Land Registry comparison line.
const outwardPostcode = computed(() => {
  const pc = (props.property?.postcode || 'CV5 6AJ').trim()
  return pc.split(/\s+/)[0]
})

// Ordinal suffix for the street-rank label (8 → "8th", 1 → "1st", etc.)
const streetRankOrdinal = computed(() => {
  const r = props.streetRank ?? 8
  const v = r % 100
  if (v >= 11 && v <= 13) return `${r}th`
  switch (r % 10) {
    case 1: return `${r}st`
    case 2: return `${r}nd`
    case 3: return `${r}rd`
    default: return `${r}th`
  }
})

// ── Stat breakdown (5 expandable rows) ───────────────────────────
// Numbers lifted from the prototype so 16+8+5+10+13 = 52 (the example
// score). When we have a real per-stat breakdown from the backend we'll
// drive these off props; for now they're prototype-faithful constants.
interface StatRow {
  id: 'heating' | 'structure' | 'efficiency' | 'electrics' | 'plumbing'
  icon: string
  label: string
  value: number
  max: number
  pct: number
  tone: 'high' | 'mid' | 'low'
  steps: number
  saving: number
  savingSub: string
  thirdTileLabel: string
  thirdTileNum: string
  thirdTileSub: string
  lines: {
    icon: string
    title: string
    sub: string
    amt: string
    amtSub?: string
    amtGood?: boolean
    amtMuted?: boolean
  }[]
  footText: string
}
// ── Real-EPC stat builders ──────────────────────────────────────
// Convert an EPC efficiency string ("Very Good" / "Good" / "Average" /
// "Poor" / "Very Poor" / "N/A") to a 0–1 normalised score.
function effToScore(eff: string | null | undefined): number {
  const e = (eff || '').toLowerCase().trim()
  if (!e || e === 'n/a' || e === 'na') return 0.5
  if (e === 'very good') return 1.0
  if (e === 'good') return 0.8
  if (e === 'average') return 0.6
  if (e === 'poor') return 0.4
  if (e === 'very poor') return 0.2
  return 0.5
}
function effRating(eff: string | null | undefined): 'Good' | 'Average' | 'Poor' | 'N/A' {
  const e = (eff || '').toLowerCase().trim()
  if (!e || e === 'n/a' || e === 'na') return 'N/A'
  if (e.includes('very good') || e === 'good') return 'Good'
  if (e === 'average') return 'Average'
  if (e.includes('poor')) return 'Poor'
  return 'N/A'
}
function effTone(eff: string | null | undefined): 'high' | 'mid' | 'low' {
  const s = effToScore(eff)
  if (s >= 0.7) return 'high'
  if (s >= 0.5) return 'mid'
  return 'low'
}

// Pull EPC fields from BOTH the top-level Property row and the nested
// `epcCert` sub-object (the backend exposes both shapes — legacy rows
// have direct fields, newer rows have an embedded cert). For each
// field name, we prefer the top-level value if present, otherwise the
// cert's value. This proxy lets callers do `epc.value.mainheatEnergyEff`
// without caring where it lived.
const epc = computed<any>(() => {
  const p = (props.property as any) || {}
  const cert = p.epcCert || {}
  return new Proxy({}, {
    get(_t, key: string) {
      const top = p[key]
      if (top != null && top !== '') return top
      return cert[key]
    },
  })
})

function fmtSaving(rec: any | null): string {
  const v = Number(rec?.typicalSaving ?? 0)
  if (!v) return ''
  return `–£${Math.round(v)}/yr`
}

const stats = computed<StatRow[]>(() => {
  const e = epc.value
  const recs: any[] = (props.property as any)?.epcRecommendations ?? []

  // ── Heating: mainheat + controls ──
  const heatEff = e.mainheatEnergyEff
  const heatcEff = e.mainheatcEnergyEff
  const heatScore = (effToScore(heatEff) + effToScore(heatcEff)) / 2
  const heatVal = Math.round(heatScore * 20)
  const heatRecs = recs.filter((r) =>
    /(boiler|heating|heat pump|radiator|thermostat|controls)/i.test(
      `${r?.title ?? ''} ${r?.improvementType ?? ''}`,
    ),
  )
  const heatSaving = heatRecs.reduce(
    (s, r) => s + (Number(r?.typicalSaving) || 0),
    0,
  )

  // ── Structure: walls + roof + floor + windows ──
  const structScore =
    (effToScore(e.wallsEnergyEff) +
      effToScore(e.roofEnergyEff) +
      effToScore(e.floorEnergyEff) +
      effToScore(e.windowsEnergyEff)) /
    4
  const structVal = Math.round(structScore * 25)
  const structRecs = recs.filter((r) =>
    /(loft|cavity|wall|floor|window|glaz|roof|insulat)/i.test(
      `${r?.title ?? ''} ${r?.improvementType ?? ''}`,
    ),
  )
  const structSaving = structRecs.reduce(
    (s, r) => s + (Number(r?.typicalSaving) || 0),
    0,
  )

  // ── Efficiency: lighting (with low-energy %) ──
  const ledPct = Number(e.lowEnergyLighting ?? 0)
  const effLightScore = effToScore(e.lightingEnergyEff)
  // Blend the % into the lighting eff rating so a 100% LED home beats a 15%.
  const effScore = effLightScore * 0.6 + (ledPct / 100) * 0.4
  const effVal = Math.round(effScore * 15)
  const effRecs = recs.filter((r) => /(led|lighting|light)/i.test(`${r?.title ?? ''}`))
  const effSaving = effRecs.reduce((s, r) => s + (Number(r?.typicalSaving) || 0), 0)

  // ── Electrics: solar PV present? ──
  const elecRecs = recs.filter((r) =>
    /(solar pv|photovoltaic|electric)/i.test(`${r?.title ?? ''} ${r?.improvementType ?? ''}`),
  )
  // If solar PV is recommended, the property doesn't have it. Score 50%.
  const elecScore = elecRecs.length > 0 ? 0.5 : 0.8
  const elecVal = Math.round(elecScore * 20)
  const elecSaving = elecRecs.reduce((s, r) => s + (Number(r?.typicalSaving) || 0), 0)

  // ── Plumbing: hot water + ventilation ──
  const plumbScore = effToScore(e.hotWaterEnergyEff)
  const plumbVal = Math.round(plumbScore * 20)
  const plumbRecs = recs.filter((r) =>
    /(solar (?:water|thermal)|hot water|cylinder)/i.test(`${r?.title ?? ''}`),
  )
  const plumbSaving = plumbRecs.reduce((s, r) => s + (Number(r?.typicalSaving) || 0), 0)

  const heatRating = effRating(heatEff)
  const wallsRating = effRating(e.wallsEnergyEff)
  const lightRating = effRating(e.lightingEnergyEff)
  const hwRating = effRating(e.hotWaterEnergyEff)

  return [
    {
      id: 'heating',
      icon: '🔥',
      label: 'Heating',
      value: heatVal,
      max: 20,
      pct: Math.round(heatScore * 100),
      tone: effTone(heatEff),
      steps: heatRecs.length,
      saving: Math.round(heatSaving),
      savingSub: heatRecs.length ? `${heatRecs.length} step${heatRecs.length > 1 ? 's' : ''}` : 'nothing to fix',
      thirdTileLabel: 'EPC rating',
      thirdTileNum: heatRating,
      thirdTileSub: `mainheat ${effRating(heatEff)}`,
      lines: [
        {
          icon: '🔥',
          title: e.mainheatDescription || 'Main heating system',
          sub: `Rated <b>${effRating(heatEff)}</b> on the EPC.`,
          amt: effRating(heatEff),
          amtGood: effToScore(heatEff) >= 0.7,
        },
        {
          icon: '🌡',
          title: e.mainheatcontDescription || 'Heating controls',
          sub: `Rated <b>${effRating(heatcEff)}</b> on the EPC.`,
          amt: effRating(heatcEff),
          amtGood: effToScore(heatcEff) >= 0.7,
        },
      ],
      footText: heatRecs.length
        ? `<b>${heatRecs.length} EPC step${heatRecs.length > 1 ? 's' : ''}</b> can lift heating →`
        : '<b>Your strongest stat.</b> No EPC recommendations live here — heating is sorted.',
    },
    {
      id: 'structure',
      icon: '🧱',
      label: 'Structure',
      value: structVal,
      max: 25,
      pct: Math.round(structScore * 100),
      tone:
        structScore >= 0.7 ? 'high' : structScore >= 0.5 ? 'mid' : 'low',
      steps: structRecs.length,
      saving: Math.round(structSaving),
      savingSub: structRecs.length ? `${structRecs.length} step${structRecs.length > 1 ? 's' : ''}` : 'all good',
      thirdTileLabel: 'Walls EPC',
      thirdTileNum: wallsRating,
      thirdTileSub: e.builtForm || '',
      lines: [
        {
          icon: '🧱',
          title: e.wallsDescription || 'Walls',
          sub: `Walls rated <b>${effRating(e.wallsEnergyEff)}</b> on the EPC.`,
          amt: fmtSaving(structRecs.find((r) => /wall|cavity/i.test(r?.title ?? ''))) || effRating(e.wallsEnergyEff),
          amtSub: structRecs.find((r) => /wall|cavity/i.test(r?.title ?? ''))?.costRange || '',
          amtGood: !structRecs.find((r) => /wall|cavity/i.test(r?.title ?? '')),
        },
        {
          icon: '🏠',
          title: e.roofDescription || 'Roof',
          sub: `Roof rated <b>${effRating(e.roofEnergyEff)}</b> on the EPC.`,
          amt: fmtSaving(structRecs.find((r) => /loft|roof/i.test(r?.title ?? ''))) || effRating(e.roofEnergyEff),
          amtSub: structRecs.find((r) => /loft|roof/i.test(r?.title ?? ''))?.costRange || '',
          amtGood: !structRecs.find((r) => /loft|roof/i.test(r?.title ?? '')),
        },
        {
          icon: '🪟',
          title: e.floorDescription || 'Floor',
          sub: `Floor rated <b>${effRating(e.floorEnergyEff)}</b> on the EPC.`,
          amt: fmtSaving(structRecs.find((r) => /floor/i.test(r?.title ?? ''))) || effRating(e.floorEnergyEff),
          amtSub: structRecs.find((r) => /floor/i.test(r?.title ?? ''))?.costRange || '',
          amtGood: !structRecs.find((r) => /floor/i.test(r?.title ?? '')),
        },
      ],
      footText: structRecs.length
        ? '<b>Biggest drag on your score.</b> See the full pathway →'
        : '<b>Structure is in good shape.</b>',
    },
    {
      id: 'efficiency',
      icon: '💡',
      label: 'Efficiency',
      value: effVal,
      max: 15,
      pct: Math.round(effScore * 100),
      tone: effScore >= 0.7 ? 'high' : effScore >= 0.5 ? 'mid' : 'low',
      steps: effRecs.length,
      saving: Math.round(effSaving),
      savingSub: effRecs.length ? 'LED swap' : 'all LED',
      thirdTileLabel: 'LED %',
      thirdTileNum: `${Math.round(ledPct)}%`,
      thirdTileSub: 'of fixed outlets',
      lines: [
        {
          icon: '💡',
          title: 'Low energy lighting',
          sub: `<b>${Math.round(ledPct)}%</b> of fixed outlets · rated <b>${effRating(e.lightingEnergyEff)}</b>.`,
          amt: fmtSaving(effRecs[0]) || effRating(e.lightingEnergyEff),
          amtSub: effRecs[0]?.costRange || '',
          amtGood: !effRecs[0],
        },
        {
          icon: '🪟',
          title: e.windowsDescription || 'Windows',
          sub: `Glazing rated <b>${effRating(e.windowsEnergyEff)}</b>.`,
          amt: effRating(e.windowsEnergyEff),
          amtMuted: true,
        },
      ],
      footText: effRecs.length
        ? '<b>LED swap is the cheapest EPC step</b> →'
        : '<b>Lighting is already efficient.</b>',
    },
    {
      id: 'electrics',
      icon: '⚡',
      label: 'Electrics',
      value: elecVal,
      max: 20,
      pct: Math.round(elecScore * 100),
      tone: elecScore >= 0.7 ? 'high' : elecScore >= 0.5 ? 'mid' : 'low',
      steps: elecRecs.length,
      saving: Math.round(elecSaving),
      savingSub: elecRecs.length ? 'biggest /yr' : 'none',
      thirdTileLabel: 'Solar PV',
      thirdTileNum: elecRecs.length ? 'Missing' : 'Present',
      thirdTileSub: elecRecs.length ? 'EPC step' : 'no upgrade',
      lines: elecRecs.length
        ? [
            {
              icon: '☀️',
              title: elecRecs[0]?.title || 'Solar PV panels',
              sub: elecRecs[0]?.description || "EPC's final step. Crosses you into Band C.",
              amt: fmtSaving(elecRecs[0]) || '—',
              amtSub: elecRecs[0]?.costRange || '',
            },
          ]
        : [
            {
              icon: '⚡',
              title: 'Standard electrical setup',
              sub: 'No EPC recommendations for electrics.',
              amt: 'OK',
              amtMuted: true,
            },
          ],
      footText: elecRecs.length
        ? '<b>Final step on the EPC pathway.</b> →'
        : '<b>Electrics OK on the EPC.</b>',
    },
    {
      id: 'plumbing',
      icon: '💧',
      label: 'Plumbing',
      value: plumbVal,
      max: 20,
      pct: Math.round(plumbScore * 100),
      tone: effTone(e.hotWaterEnergyEff),
      steps: plumbRecs.length,
      saving: Math.round(plumbSaving),
      savingSub: plumbRecs.length ? 'solar thermal' : 'all good',
      thirdTileLabel: 'Hot water',
      thirdTileNum: hwRating,
      thirdTileSub: 'EPC rating',
      lines: [
        {
          icon: '💧',
          title: e.hotwaterDescription || 'Hot water',
          sub: `Hot water rated <b>${effRating(e.hotWaterEnergyEff)}</b> on the EPC.`,
          amt: effRating(e.hotWaterEnergyEff),
          amtGood: effToScore(e.hotWaterEnergyEff) >= 0.7,
        },
        ...(plumbRecs.length
          ? [
              {
                icon: '☀️',
                title: plumbRecs[0]?.title || 'Solar water heating',
                sub: plumbRecs[0]?.description || 'Roof collector pre-heats water from the sun.',
                amt: fmtSaving(plumbRecs[0]) || '—',
                amtSub: plumbRecs[0]?.costRange || '',
              },
            ]
          : []),
      ],
      footText: plumbRecs.length
        ? 'Solar thermal · longer payback →'
        : '<b>Plumbing is in good shape.</b>',
    },
  ]
})
const expandedStat = ref<StatRow['id'] | null>(null)

// Claim-it-free explainer modal (opens KYC/quiz flow when confirmed)
const claimModalOpen = ref(false)

// When the parent sets `autoOpenClaim` (user just returned from sign-in
// via the claim flow), pop the drawer open. Notifies the parent on close
// so it can clear the auto-open flag and not re-trigger.
watch(
  () => props.autoOpenClaim,
  (open) => {
    if (open) claimModalOpen.value = true
  },
  { immediate: true },
)
watch(claimModalOpen, (open) => {
  if (!open) emit('claim-modal-closed')
})

// "Is this your property?" CTA. If the user is signed in, open the
// explainer modal immediately. If they're a guest, send them to sign-in
// with a redirect-back URL that includes `?claim=1` — the parent
// homescore page picks that up on mount and pops this same modal open
// so the journey resumes where it left off.
function toggleStat(id: StatRow['id']) {
  expandedStat.value = expandedStat.value === id ? null : id
}

// ── Full EPC drawer ──────────────────────────────────────────────
interface EpcItem {
  id: string
  icon: string
  title: string
  sub: string
  rating: string
  ratingClass: 'good' | 'poor' | 'average' | 'nodata'
  flagOk: boolean
  flagText: string
  fix?: { label: string; text: string }
}
function ratingClassFor(eff: string | null | undefined): 'good' | 'poor' | 'average' | 'nodata' {
  const e = (eff || '').toLowerCase().trim()
  if (!e || e === 'n/a' || e === 'na') return 'nodata'
  if (e.includes('very good') || e === 'good') return 'good'
  if (e === 'average') return 'average'
  return 'poor'
}

function findRec(pattern: RegExp): any | null {
  const recs: any[] = (props.property as any)?.epcRecommendations
  if (!Array.isArray(recs)) return null
  return recs.find((r) => pattern.test(`${r?.title ?? ''} ${r?.improvementType ?? ''}`)) ?? null
}

const epcItems = computed<EpcItem[]>(() => {
  const e = epc.value
  const items: EpcItem[] = []

  // 1. Main heating
  const mainHeatRec = findRec(/(boiler|heat pump|main heat)/i)
  items.push({
    id: 'main-heating',
    icon: '🔥',
    title: 'Main heating',
    sub: e.mainheatDescription || 'Heating system',
    rating: effRating(e.mainheatEnergyEff),
    ratingClass: ratingClassFor(e.mainheatEnergyEff),
    flagOk: !mainHeatRec,
    flagText: mainHeatRec
      ? `EPC flags: <b>${mainHeatRec.title}</b>`
      : `Heating rated <b>${effRating(e.mainheatEnergyEff)}</b>. No upgrade on this EPC.`,
    fix: mainHeatRec
      ? {
          label: '✨ EPC recommendation',
          text: `${mainHeatRec.description || mainHeatRec.title}. ${mainHeatRec.typicalSaving ? `Saves <b>£${mainHeatRec.typicalSaving}/yr</b>.` : ''} ${mainHeatRec.costRange ? `Cost <b>${mainHeatRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 2. Heating controls
  const controlsRec = findRec(/(controls|thermostat|programmer)/i)
  items.push({
    id: 'heating-controls',
    icon: '🌡',
    title: 'Heating controls',
    sub: e.mainheatcontDescription || 'Controls',
    rating: effRating(e.mainheatcEnergyEff),
    ratingClass: ratingClassFor(e.mainheatcEnergyEff),
    flagOk: !controlsRec,
    flagText: controlsRec
      ? `EPC flags: <b>${controlsRec.title}</b>`
      : `Heating controls rated <b>${effRating(e.mainheatcEnergyEff)}</b>.`,
    fix: controlsRec
      ? {
          label: '✨ EPC recommendation',
          text: `${controlsRec.title}. ${controlsRec.typicalSaving ? `Saves <b>£${controlsRec.typicalSaving}/yr</b>.` : ''} ${controlsRec.costRange ? `Cost <b>${controlsRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 3. Hot water
  const hwRec = findRec(/(hot water|cylinder|solar water|solar thermal)/i)
  items.push({
    id: 'hot-water',
    icon: '💧',
    title: 'Hot water',
    sub: e.hotwaterDescription || 'Hot water system',
    rating: effRating(e.hotWaterEnergyEff),
    ratingClass: ratingClassFor(e.hotWaterEnergyEff),
    flagOk: !hwRec,
    flagText: hwRec
      ? `EPC flags: <b>${hwRec.title}</b>`
      : `Hot water rated <b>${effRating(e.hotWaterEnergyEff)}</b>.`,
    fix: hwRec
      ? {
          label: '✨ EPC recommendation',
          text: `${hwRec.description || hwRec.title}. ${hwRec.typicalSaving ? `Saves <b>£${hwRec.typicalSaving}/yr</b>.` : ''} ${hwRec.costRange ? `Cost <b>${hwRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 4. Walls
  const wallsRec = findRec(/(cavity|wall insulation|external wall)/i)
  items.push({
    id: 'walls',
    icon: '🧱',
    title: 'Walls',
    sub: e.wallsDescription || 'Walls',
    rating: effRating(e.wallsEnergyEff),
    ratingClass: ratingClassFor(e.wallsEnergyEff),
    flagOk: !wallsRec,
    flagText: wallsRec
      ? `EPC flags: <b>${wallsRec.title}</b>`
      : `Walls rated <b>${effRating(e.wallsEnergyEff)}</b>.`,
    fix: wallsRec
      ? {
          label: '✨ EPC recommendation',
          text: `${wallsRec.description || wallsRec.title}. ${wallsRec.typicalSaving ? `Saves <b>£${wallsRec.typicalSaving}/yr</b>.` : ''} ${wallsRec.costRange ? `Cost <b>${wallsRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 5. Roof / loft
  const roofRec = findRec(/(loft|roof insulation|increase loft)/i)
  items.push({
    id: 'roof',
    icon: '🏠',
    title: 'Roof · loft insulation',
    sub: e.roofDescription || 'Roof',
    rating: effRating(e.roofEnergyEff),
    ratingClass: ratingClassFor(e.roofEnergyEff),
    flagOk: !roofRec,
    flagText: roofRec
      ? `EPC flags: <b>${roofRec.title}</b>`
      : `Roof rated <b>${effRating(e.roofEnergyEff)}</b>.`,
    fix: roofRec
      ? {
          label: '✨ EPC recommendation',
          text: `${roofRec.description || roofRec.title}. ${roofRec.typicalSaving ? `Saves <b>£${roofRec.typicalSaving}/yr</b>.` : ''} ${roofRec.costRange ? `Cost <b>${roofRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 6. Floor
  const floorRec = findRec(/floor insulation/i)
  items.push({
    id: 'floor',
    icon: '🪟',
    title: 'Floor',
    sub: e.floorDescription || 'Floor',
    rating: effRating(e.floorEnergyEff),
    ratingClass: ratingClassFor(e.floorEnergyEff),
    flagOk: !floorRec,
    flagText: floorRec
      ? `EPC flags: <b>${floorRec.title}</b>`
      : `Floor rated <b>${effRating(e.floorEnergyEff)}</b>.`,
    fix: floorRec
      ? {
          label: '✨ EPC recommendation',
          text: `${floorRec.description || floorRec.title}. ${floorRec.typicalSaving ? `Saves <b>£${floorRec.typicalSaving}/yr</b>.` : ''} ${floorRec.costRange ? `Cost <b>${floorRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 7. Windows
  const windowsRec = findRec(/(window|glaz)/i)
  items.push({
    id: 'windows',
    icon: '🪟',
    title: 'Windows',
    sub: e.windowsDescription || 'Windows',
    rating: effRating(e.windowsEnergyEff),
    ratingClass: ratingClassFor(e.windowsEnergyEff),
    flagOk: !windowsRec,
    flagText: windowsRec
      ? `EPC flags: <b>${windowsRec.title}</b>`
      : `Windows rated <b>${effRating(e.windowsEnergyEff)}</b>.`,
    fix: windowsRec
      ? {
          label: '✨ EPC recommendation',
          text: `${windowsRec.description || windowsRec.title}. ${windowsRec.typicalSaving ? `Saves <b>£${windowsRec.typicalSaving}/yr</b>.` : ''} ${windowsRec.costRange ? `Cost <b>${windowsRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 8. Lighting
  const ledPct = Number(e.lowEnergyLighting ?? 0)
  const lightingRec = findRec(/(led|lighting|light)/i)
  items.push({
    id: 'lighting',
    icon: '💡',
    title: 'Lighting',
    sub: `Low energy in <b>${Math.round(ledPct)}%</b> of fixed outlets`,
    rating: effRating(e.lightingEnergyEff),
    ratingClass: ratingClassFor(e.lightingEnergyEff),
    flagOk: !lightingRec,
    flagText: lightingRec
      ? `Only ${Math.round(ledPct)}% of outlets are low-energy. Rated <b>${effRating(e.lightingEnergyEff)}</b>.`
      : `Lighting rated <b>${effRating(e.lightingEnergyEff)}</b>.`,
    fix: lightingRec
      ? {
          label: '✨ EPC recommendation',
          text: `${lightingRec.title}. ${lightingRec.typicalSaving ? `Saves <b>£${lightingRec.typicalSaving}/yr</b>.` : ''} ${lightingRec.costRange ? `Cost <b>${lightingRec.costRange}</b>.` : ''}`,
        }
      : undefined,
  })

  // 9. Solar water heating
  const swhRec = findRec(/solar (?:water|thermal)/i)
  if (swhRec) {
    items.push({
      id: 'solar-water',
      icon: '☀️',
      title: 'Solar water heating',
      sub: 'Not present · recommended on EPC',
      rating: 'Not installed',
      ratingClass: 'nodata',
      flagOk: false,
      flagText: 'Listed as a recommended improvement on the EPC.',
      fix: {
        label: '✨ EPC recommendation',
        text: `${swhRec.description || swhRec.title}. ${swhRec.typicalSaving ? `Saves <b>£${swhRec.typicalSaving}/yr</b>.` : ''} ${swhRec.costRange ? `Cost <b>${swhRec.costRange}</b>.` : ''}`,
      },
    })
  }

  // 10. Solar PV
  const pvRec = findRec(/(solar pv|photovoltaic)/i)
  if (pvRec) {
    items.push({
      id: 'solar-pv',
      icon: '⚡',
      title: 'Solar PV panels',
      sub: 'Not present · recommended on EPC',
      rating: 'Not installed',
      ratingClass: 'nodata',
      flagOk: false,
      flagText: 'Listed as a recommended improvement — generates electricity from sunlight.',
      fix: {
        label: '✨ EPC recommendation',
        text: `${pvRec.description || pvRec.title}. ${pvRec.typicalSaving ? `Saves <b>£${pvRec.typicalSaving}/yr</b>.` : ''} ${pvRec.costRange ? `Cost <b>${pvRec.costRange}</b>.` : ''}`,
      },
    })
  }

  // 11. Secondary heating (if present)
  if (e.secondheatDescription && !/none/i.test(e.secondheatDescription)) {
    items.push({
      id: 'secondary-heating',
      icon: '🔥',
      title: 'Secondary heating',
      sub: e.secondheatDescription,
      rating: 'N/A',
      ratingClass: 'nodata',
      flagOk: true,
      flagText: `Secondary heating: ${e.secondheatDescription}`,
    })
  }

  // 12. Ventilation
  if (e.mechanicalVentilation) {
    items.push({
      id: 'ventilation',
      icon: '💨',
      title: 'Ventilation',
      sub: e.mechanicalVentilation,
      rating: 'N/A',
      ratingClass: 'nodata',
      flagOk: true,
      flagText: `Ventilation: <b>${e.mechanicalVentilation}</b>`,
    })
  }

  return items
})

const expandedEpcItem = ref<string | null>(null)
function toggleEpcItem(id: string) {
  expandedEpcItem.value = expandedEpcItem.value === id ? null : id
}

// Full EPC drawer (the "Every line of energy detail behind your score"
// expandable card). This ref was missing — that's why clicking the head
// row appeared to do nothing.
const epcDrawerOpen = ref(false)
const epcDrawerEl = ref<HTMLElement | null>(null)
function toggleEpcDrawer() {
  epcDrawerOpen.value = !epcDrawerOpen.value
  if (epcDrawerOpen.value) {
    // Scroll the drawer body into view so the user immediately sees the
    // expansion. Without this, on small viewports the drawer can open
    // below the fold and feel like the click did nothing.
    requestAnimationFrame(() => {
      epcDrawerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

// ── Display helpers ───────────────────────────────────────────────
function formatNum(n: number): string {
  return new Intl.NumberFormat('en-GB').format(Math.round(n))
}
const searchesTodayDisplay = computed(() => {
  const n = props.searchesToday ?? 0
  return `${n} ${n === 1 ? 'person' : 'people'}`
})
</script>

<style scoped>
/* ── Design tokens (mirror prototype :root) ────────────────────── */
.hs-v6-score {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --warning: #f5a623;
  --warning-deep: #7a5500;
  --warning-pale: #fff5e0;
  --gold: #f0b933;
  --error: #e74c5e;
  --error-light: #f08594;
  --error-pale: #fcebea;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

/* ── Typography rebalance ──────────────────────────────────────
   Soften the prototype's heavy 800-weights to match the rest of the
   app (max weight ~700 to match the SF Pro 600/700 scale used in the
   global header and other pages). */
.hs-v6-score :is(.app-header-title, .hs-addr-line, .score-band, .gn-big,
  .ssp-head-title, .ssp-bar-amt, .ssp-total-num, .ssp-cell-num,
  .stat-cost-title, .epc-grade-letter, .epc-saving-num,
  .fork-opt-title) {
  font-weight: 700;
}
.hs-v6-score :is(.app-header-sub, .hs-addr-meta, .score-explainer,
  .score-footer, .ssp-bar-label, .ssp-bar-amt-pct, .ssp-total-label,
  .stat-cost-sub, .epc-grade-sub, .epc-saving-sub, .epc-item-sub,
  .fork-opt-sub) {
  font-weight: 500;
}

/* ── App header (kept for backwards-compat; no longer rendered) ── */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.15s;
  flex-shrink: 0;
}
.back-btn:hover,
.app-icon-btn:hover {
  background: var(--accent-paler);
  border-color: var(--accent-pale);
  color: var(--accent-dark);
}
.back-btn svg,
.app-icon-btn svg {
  width: 16px;
  height: 16px;
}
.app-icon-btn {
  color: var(--text-secondary);
}
.app-header-info {
  flex: 1;
  min-width: 0;
}
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.15;
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* ── Animations ───────────────────────────────────────────────── */
@keyframes hs-v6-pulse {
  0% { transform: scale(0.6); opacity: 0.5; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes hs-v6-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hs-v6-caretBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes hs-v6-scoreRing {
  0% { transform: scale(1); opacity: 0.6; }
  70% { transform: scale(1.05); opacity: 0; }
  100% { transform: scale(1.06); opacity: 0; }
}
.anim-1 { animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: hs-v6-fadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-3 { animation: hs-v6-fadeUp 0.35s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-4 { animation: hs-v6-fadeUp 0.35s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.tw-caret {
  display: inline-block;
  width: 2px;
  height: 0.95em;
  background: currentColor;
  vertical-align: -0.12em;
  margin-left: 2px;
  animation: hs-v6-caretBlink 0.8s steps(1) infinite;
  opacity: 0.9;
  color: transparent;
  font-size: 0;
}
.tw-caret.done {
  animation: none;
  opacity: 0;
}

/* ── Amber address card ───────────────────────────────────────── */
.hs-addr-card {
  margin: 14px 20px 0;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  border: none;
  border-radius: 14px;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: white;
  position: relative;
  overflow: hidden;
}
.hs-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 65%);
  pointer-events: none;
}
.hs-addr-card > * {
  position: relative;
  z-index: 1;
}
.hs-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.hs-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  margin-top: 8px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}
.hs-addr-block {
  flex: 1;
  min-width: 0;
}
.hs-addr-line {
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 2px;
}
.hs-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
.hs-addr-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.hs-addr-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 10px 5px 7px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
}
.hs-addr-pill svg {
  width: 10px;
  height: 10px;
}
.hs-addr-pill .epc-letter {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}
.claim-cta-btn {
  display: flex;
  width: 100%;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border: none;
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.1px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.35);
  transition: filter 0.15s;
}
.claim-cta-btn:hover {
  filter: brightness(1.06);
}
/* Already-claimed variants — informational, not a "claim" pitch. */
.claim-cta-btn.published {
  background: white;
  color: #8b4e0a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.claim-cta-btn.progress {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  box-shadow: none;
}
.hs-addr-stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 14px;
  flex-wrap: wrap;
}
.hs-addr-stat-row .pulse-dot {
  background: var(--accent-light);
}
.hs-addr-stat-row .pulse-dot::after {
  background: var(--accent-light);
}
.hs-addr-stat-count {
  font-weight: 800;
  color: white;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  position: relative;
  flex-shrink: 0;
  display: inline-block;
}
.pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.35;
  animation: hs-v6-pulse 1.8s ease-out infinite;
}

/* ── HomeScore card ─────────────────────────────────────────────── */
.score-card {
  margin: 14px 20px 0;
  padding: 20px 20px 18px;
  background: linear-gradient(180deg, var(--accent-paler) 0%, var(--card) 60%);
  border: 2px solid var(--accent);
  border-radius: 14px;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.12);
}
.score-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  border: 2px solid var(--accent);
  pointer-events: none;
  animation: hs-v6-scoreRing 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  opacity: 0;
}
.score-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.score-eyebrow-mark {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.score-eyebrow-mark sup {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0;
}
.score-top {
  display: flex;
  align-items: center;
  gap: 18px;
}
.score-gauge {
  position: relative;
  width: 104px;
  height: 104px;
  flex-shrink: 0;
}
.score-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.g-bg {
  stroke: var(--border-soft);
  fill: none;
}
.g-fill {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.g-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.gn-big {
  font-size: 34px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1.2px;
  line-height: 1;
  font-feature-settings: 'tnum';
}
.gn-small {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  margin-top: 2px;
}
.score-summary {
  flex: 1;
  min-width: 0;
}
.score-band {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  margin-bottom: 6px;
  line-height: 1.1;
}
.score-explainer {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.score-explainer :deep(b) {
  color: var(--accent-dark);
  font-weight: 800;
}
.score-footer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--border-soft);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.score-footer-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--text-faint);
  margin-top: 1px;
}
.score-footer b {
  color: var(--text);
  font-weight: 800;
}
.score-refine-link {
  color: var(--accent-dark);
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

/* ── Quick stats strip ────────────────────────────────────────── */
.score-strip-hint {
  margin: 12px 20px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-faint);
  letter-spacing: 0.3px;
}
.score-strip-card {
  display: flex;
  gap: 8px;
  margin: 12px 20px 0;
  padding: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.score-strip-item {
  flex: 1;
  padding: 10px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  text-align: center;
}
.score-strip-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.score-strip-num {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
  line-height: 1.1;
}
.score-strip-num.warn {
  color: var(--error);
}
.score-strip-num.good {
  color: var(--accent-dark);
}
.strip-unit {
  font-weight: 600;
  font-size: 11px;
  color: var(--text-secondary);
}
.score-strip-sub {
  font-size: 9.5px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-top: 2px;
}
.score-strip-item.clickable {
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.score-strip-item.clickable:hover {
  border-color: var(--accent-pale);
  background: var(--card);
  transform: translateY(-1px);
}
.score-strip-item.clickable.active {
  border-color: var(--accent);
  background: var(--accent-paler);
  box-shadow: 0 0 0 2px rgba(0, 161, 154, 0.15);
}
.score-strip-item.clickable.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid var(--accent);
}

/* ── Popout panels (bills / CO₂ / street) ─────────────────────── */
.score-strip-panel {
  margin: 14px 20px 0;
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  animation: hs-v6-fadeUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.ssp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-soft);
}
.ssp-head-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.ssp-head-info { flex: 1; }
.ssp-head-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
.ssp-head-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.ssp-head-close {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  font-weight: 700;
  line-height: 1;
}
.ssp-head-close:hover {
  background: var(--error-pale, #fcebea);
  color: var(--error);
}
.ssp-divider {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin: 14px 0 6px;
}

/* Bar row used by Bills + CO₂ panels */
.ssp-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 11.5px;
}
.ssp-bar-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}
.ssp-bar-label {
  width: 80px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}
.ssp-bar-track {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
}
.ssp-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.ssp-bar-fill.gas {
  background: linear-gradient(90deg, #f5a623, #e69015);
}
.ssp-bar-fill.hw {
  background: linear-gradient(90deg, #4a9fcf, #2d7aae);
}
.ssp-bar-fill.elec {
  background: linear-gradient(90deg, #ffd700, #e6be00);
}
.ssp-bar-fill.co2-heat { background: #8b4e0a; }
.ssp-bar-fill.co2-hw   { background: #4a9fcf; }
.ssp-bar-fill.co2-elec { background: var(--warning); }
.ssp-bar-amt {
  font-size: 11px;
  font-weight: 800;
  color: var(--text);
  width: 62px;
  text-align: right;
  flex-shrink: 0;
}
.ssp-bar-amt-pct {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-faint);
  margin-top: 1px;
}
.ssp-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-top: 8px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
}
.ssp-total-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.ssp-total-num {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
.ssp-note {
  padding: 8px 10px;
  margin-top: 8px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  font-size: 10.5px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.4;
}
.ssp-note b { color: var(--text); font-weight: 800; }
.ssp-equiv {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 9px 12px;
  background: #f5f0e8;
  border: 1px solid #e8dec8;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: #7a5500;
}
.ssp-equiv-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.ssp-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
  cursor: pointer;
  transition: filter 0.15s;
}
.ssp-foot:hover {
  filter: brightness(0.98);
  background: var(--accent-pale);
}
.ssp-foot-text {
  flex: 1;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1.35;
}
.ssp-foot-text :deep(b) { font-weight: 800; }
.ssp-foot-arrow {
  color: var(--accent-dark);
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

/* ── Street panel ─────────────────────────────────────────────── */
.ssp-rank-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
}
.ssp-rank-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -1px;
  line-height: 1;
}
.ssp-rank-info { flex: 1; }
.ssp-rank-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.1px;
  line-height: 1.1;
}
.ssp-rank-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.35;
}
.ssp-rank-sub :deep(b) { color: var(--text); font-weight: 800; }

.ssp-street-legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 4px 0;
}
.ssp-street-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-secondary);
}
.ssp-street-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ssp-street-scene {
  margin: 10px -6px 8px;
  background: linear-gradient(180deg, #dceef0 0%, #bfe2e5 60%, #a8c3c6 100%);
  border-radius: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0 2px;
  border: 1px solid var(--border-soft);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
.ssp-street-scene::-webkit-scrollbar { height: 5px; }
.ssp-street-scene::-webkit-scrollbar-track { background: transparent; }
.ssp-street-scene::-webkit-scrollbar-thumb {
  background: rgba(35, 29, 69, 0.18);
  border-radius: 100px;
}
.ssp-street-inner {
  position: relative;
  width: 460px;
  height: 180px;
  flex-shrink: 0;
}
.ssp-street-svg {
  width: 460px;
  height: 180px;
  display: block;
  position: absolute;
  inset: 0;
}
.ssp-street-house { cursor: pointer; }
.ssp-street-house:hover .ssp-house-body {
  stroke: var(--accent-dark);
  stroke-width: 1.2;
}
.ssp-street-scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-faint);
  margin-top: -2px;
  padding: 0 0 4px;
}
.ssp-street-tip {
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-faint);
  margin-top: -2px;
  padding: 6px 0 4px;
  font-style: italic;
}

/* Walking figure overlay — animates between selected houses */
.ssp-street-walker {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  width: 18px;
  height: 26px;
  transform: translate(-50%, -50%);
  transition:
    left 0.85s cubic-bezier(0.4, 0, 0.2, 1),
    top 0.85s cubic-bezier(0.4, 0, 0.2, 1);
}
.ssp-street-walker svg {
  width: 100%;
  height: 100%;
  display: block;
}
.ssp-street-walker .leg-l,
.ssp-street-walker .leg-r,
.ssp-street-walker .arm-l,
.ssp-street-walker .arm-r {
  transform-box: fill-box;
}
.ssp-street-walker.walking .leg-l {
  animation: hs-v6-wlk-leg-l 0.45s ease-in-out infinite;
  transform-origin: 50% 0%;
}
.ssp-street-walker.walking .leg-r {
  animation: hs-v6-wlk-leg-r 0.45s ease-in-out infinite;
  transform-origin: 50% 0%;
}
.ssp-street-walker.walking .arm-l {
  animation: hs-v6-wlk-arm-l 0.45s ease-in-out infinite;
  transform-origin: 50% 0%;
}
.ssp-street-walker.walking .arm-r {
  animation: hs-v6-wlk-arm-r 0.45s ease-in-out infinite;
  transform-origin: 50% 0%;
}
@keyframes hs-v6-wlk-leg-l {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(35deg); }
}
@keyframes hs-v6-wlk-leg-r {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-35deg); }
}
@keyframes hs-v6-wlk-arm-l {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-30deg); }
}
@keyframes hs-v6-wlk-arm-r {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(30deg); }
}

/* Selected house tooltip */
.ssp-street-tooltip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--card);
  border: 1.5px solid var(--accent-pale);
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.08);
  transition: border-color 0.2s;
}
.ssp-street-tooltip.you {
  border-color: var(--accent);
  background: var(--accent-paler);
}
.ssp-street-tooltip-num {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
.ssp-street-tooltip-rating {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  color: white;
  letter-spacing: 0.3px;
  min-width: 54px;
  text-align: center;
}
.ssp-street-tooltip-cost {
  margin-left: auto;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
}
.ssp-street-tooltip-cost.good { color: var(--accent-dark); }
.ssp-street-tooltip-cost.warn { color: var(--warning-deep); }
.ssp-street-tooltip-cost.high { color: var(--error); }

/* Pathway projection card */
.ssp-street-projection {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  background: linear-gradient(135deg, var(--accent-paler) 0%, var(--card) 100%);
  border: 1.5px solid var(--accent);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: filter 0.15s;
}
.ssp-street-projection:hover { filter: brightness(0.98); }
.ssp-street-projection-icon {
  font-size: 24px;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 161, 154, 0.18);
}
.ssp-street-projection-body {
  flex: 1;
  min-width: 0;
}
.ssp-street-projection-label {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1px;
  text-transform: uppercase;
  line-height: 1.1;
}
.ssp-street-projection-num {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.1;
  margin-top: 3px;
}
.ssp-street-projection-num span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-left: 1px;
}
.ssp-street-projection-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.3;
}
.ssp-street-projection-sub :deep(b) {
  color: var(--accent-dark);
  font-weight: 800;
}
.ssp-street-projection-saving {
  text-align: right;
  flex-shrink: 0;
  padding-left: 6px;
  border-left: 1px solid var(--accent-pale);
}
.ssp-street-projection-saving-num {
  font-size: 18px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -0.4px;
  line-height: 1;
}
.ssp-street-projection-saving-sub {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--accent-dark);
  margin-top: 2px;
  letter-spacing: 0.3px;
}

/* ── Section heading row ───────────────────────────────────────── */
.section-h-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 10px;
}
.section-h {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.section-h-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-dark);
}

/* ── Stat breakdown card (5 rows · expandable) ──────────────────── */
.stat-card {
  margin: 6px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}
.stat-icon {
  font-size: 14px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}
.stat-label {
  width: 70px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}
.stat-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
  position: relative;
}
.stat-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.stat-bar-fill.low {
  background: linear-gradient(90deg, var(--error), var(--error-light));
}
.stat-bar-fill.mid {
  background: linear-gradient(90deg, var(--warning), var(--gold));
}
.stat-bar-fill.high {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.stat-value {
  width: 46px;
  text-align: right;
  font-size: 11px;
  font-weight: 800;
  color: var(--text);
  flex-shrink: 0;
}
.stat-row.clickable {
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 8px;
  padding: 6px 4px;
  margin: -1px -4px;
}
.stat-row.clickable:hover {
  background: var(--accent-paler);
}
.stat-row-chev {
  font-size: 14px;
  color: var(--text-faint);
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 2px;
  line-height: 1;
  width: 10px;
  text-align: right;
}
.stat-row.clickable.open .stat-row-chev {
  transform: rotate(90deg);
  color: var(--accent-dark);
}
.stat-expand {
  padding: 0 0 12px;
  animation: fadeSlideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.stat-expand-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 10px 0 12px;
}
.stat-expand-meta-tile {
  padding: 8px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  text-align: center;
}
.stat-expand-meta-eyebrow {
  font-size: 8.5px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 0.7px;
  text-transform: uppercase;
  line-height: 1.1;
  margin-bottom: 3px;
}
.stat-expand-meta-num {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.1;
}
.stat-expand-meta-num.save {
  color: var(--accent-dark);
}
.stat-expand-meta-num.cost {
  color: var(--text);
}
.stat-expand-meta-sub {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.15;
}
.stat-cost-line {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 9px 0;
}
.stat-cost-line + .stat-cost-line {
  border-top: 1px solid var(--border-soft);
}
.stat-cost-bullet {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}
.stat-cost-info {
  flex: 1;
  min-width: 0;
}
.stat-cost-title {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
  letter-spacing: -0.1px;
}
.stat-cost-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.4;
}
.stat-cost-sub :deep(b) {
  color: var(--text);
  font-weight: 800;
}
.stat-cost-amt {
  text-align: right;
  flex-shrink: 0;
}
.stat-cost-amt-big {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -0.2px;
  line-height: 1.1;
  white-space: nowrap;
}
.stat-cost-amt-sub {
  font-size: 9.5px;
  font-weight: 600;
  color: var(--text-faint);
  margin-top: 2px;
  white-space: nowrap;
}
.stat-expand-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
  cursor: pointer;
  transition: filter 0.15s;
}
.stat-expand-foot:hover {
  filter: brightness(0.98);
  background: var(--accent-pale);
}
.stat-expand-foot-text {
  flex: 1;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1.35;
}
.stat-expand-foot-text :deep(b) {
  font-weight: 800;
}
.stat-expand-foot-arrow {
  color: var(--accent-dark);
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

/* ── Full EPC drawer ───────────────────────────────────────────── */
.epc-drawer {
  margin: 14px 20px 0;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.epc-drawer-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
}
.epc-drawer-head:hover {
  background: var(--accent-paler);
}
.epc-drawer-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--accent-dark);
}
.epc-drawer-icon svg {
  width: 18px;
  height: 18px;
}
.epc-drawer-info {
  flex: 1;
  min-width: 0;
}
.epc-drawer-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
.epc-drawer-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.epc-drawer-chev {
  font-size: 20px;
  color: var(--text-faint);
  transition: transform 0.2s;
  line-height: 1;
}
.epc-drawer-chev.open {
  transform: rotate(90deg);
  color: var(--accent-dark);
}
.epc-drawer-body {
  padding: 0 16px 14px;
  border-top: 1px solid var(--border-soft);
  animation: fadeSlideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.epc-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-soft);
}
.epc-grade {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.epc-grade-letter {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: white;
}
.epc-grade-sub {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.epc-arrow {
  color: var(--text-faint);
  font-size: 18px;
  font-weight: 600;
}
.epc-saving {
  margin-left: auto;
  text-align: right;
}
.epc-saving-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -0.2px;
}
.epc-saving-sub {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}
.epc-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--border-soft);
  cursor: pointer;
  transition: background 0.15s;
}
.epc-item:last-of-type {
  border-bottom: none;
}
.epc-item:hover {
  background: var(--accent-paler);
}
.epc-item-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
  padding-top: 1px;
}
.epc-item-body {
  flex: 1;
  min-width: 0;
  padding-right: 6px;
}
.epc-item-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}
.epc-item-sub {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.4;
}
.epc-item-rating {
  font-size: 9.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  text-transform: uppercase;
}
.epc-item-rating.good {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
}
.epc-item-rating.average {
  background: var(--warning-pale);
  color: #7a5500;
  border: 1px solid #e6a23c;
}
.epc-item-rating.poor {
  background: var(--error-pale);
  color: var(--error);
  border: 1px solid var(--error-light);
}
.epc-item-rating.nodata {
  background: var(--bg);
  color: var(--text-faint);
  border: 1px solid var(--border);
}
.epc-item-chev {
  font-size: 14px;
  color: var(--text-faint);
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 4px;
}
.epc-item-chev.open {
  transform: rotate(90deg);
  color: var(--accent-dark);
}
.epc-item-expand {
  padding: 0 0 14px 34px;
  animation: fadeSlideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.epc-flag,
.epc-fix {
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 11.5px;
  line-height: 1.55;
}
.epc-flag {
  background: var(--error-pale);
  border: 1px solid var(--error-light);
  color: var(--error);
}
.epc-flag.ok {
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  color: var(--accent-dark);
}
.epc-fix {
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  color: var(--accent-dark);
}
.epc-flag-label,
.epc-fix-label {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.epc-flag-text,
.epc-fix-text {
  font-weight: 500;
  color: var(--text);
}
.epc-fix-text :deep(b) {
  color: var(--accent-dark);
  font-weight: 800;
}
.epc-flag-text :deep(b) {
  color: var(--error);
  font-weight: 800;
}
.epc-fix-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--accent-dark);
  cursor: pointer;
}
.epc-fix-action:hover {
  color: var(--accent);
}
.epc-drawer-cta {
  margin-top: 12px;
  padding: 12px 14px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.epc-drawer-cta:hover {
  background: var(--accent-pale);
}
.epc-drawer-cta-text {
  flex: 1;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1.4;
}
.epc-drawer-cta-text :deep(b) {
  font-weight: 800;
}
.epc-drawer-cta-arrow {
  color: var(--accent-dark);
  font-size: 16px;
  font-weight: 800;
}

/* ── Fork section (owner / interested) ─────────────────────────── */
.fork-section {
  padding: 20px 20px 0;
}
.fork-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 14px;
}
.fork-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fork-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  width: 100%;
  text-align: left;
  font-family: inherit;
}
.fork-opt:hover {
  border-color: var(--accent-pale);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.1);
}
.fork-opt.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border-color: var(--accent-dark);
  color: white;
}
.fork-opt.primary:hover {
  filter: brightness(1.04);
}
.fork-opt-icon {
  font-size: 22px;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fork-opt.primary .fork-opt-icon {
  background: rgba(255, 255, 255, 0.18);
}
.fork-opt-body {
  flex: 1;
  min-width: 0;
}
.fork-opt-title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
  margin-bottom: 3px;
  color: var(--text);
}
.fork-opt.primary .fork-opt-title {
  color: white;
}
.fork-opt-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.4;
}
.fork-opt.primary .fork-opt-sub {
  color: rgba(255, 255, 255, 0.85);
}
.fork-opt-chev {
  font-size: 18px;
  color: var(--text-faint);
  flex-shrink: 0;
}
.fork-opt.primary .fork-opt-chev {
  color: rgba(255, 255, 255, 0.7);
}

/* ── EPC NOT AVAILABLE empty state ──────────────────────────── */
/* Compact property header shown above the no-EPC card so the user
   still knows which property they're looking at. */
.hs-noepc-prop {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}
.hs-noepc-prop-pin {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}
.hs-noepc-prop-block { flex: 1; min-width: 0; }
.hs-noepc-prop-line {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
}
.hs-noepc-prop-meta {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}

.hs-noepc-card {
  margin: 18px 20px 0;
  padding: 24px 22px 20px;
  background: var(--card);
  border: 1.5px dashed var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  text-align: center;
}
.hs-noepc-icon {
  font-size: 38px;
  line-height: 1;
  margin-bottom: 10px;
}
.hs-noepc-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.3px;
  margin-bottom: 8px;
  line-height: 1.25;
}
.hs-noepc-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 16px;
}
.hs-noepc-sub :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.hs-noepc-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}
.hs-noepc-btn {
  width: 100%;
  padding: 13px 14px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  border: none;
  display: inline-block;
}
.hs-noepc-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 3px 12px rgba(0, 161, 154, 0.25);
}
.hs-noepc-btn.ghost {
  background: var(--card);
  border: 1.5px solid var(--border);
  color: var(--text);
}
.hs-noepc-btn.ghost:hover {
  border-color: var(--accent-pale);
  background: var(--accent-paler);
  color: var(--accent-dark);
}
.hs-noepc-help {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-faint);
  line-height: 1.5;
  padding-top: 12px;
  border-top: 1px solid var(--border-soft);
}

/* ── Claim-it-free modal ────────────────────────────────────── */
.claim-overlay {
  /* Re-declare design tokens locally — the modal is teleported to
     <body> so it loses access to the CSS custom properties defined on
     `.hs-v6-score`. Without these, the white sheet renders transparent. */
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(2px);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
}
.claim-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  padding: 10px 20px calc(22px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 32px rgba(35, 29, 69, 0.25);
  max-height: 90dvh;
  overflow-y: auto;
}
.claim-grip {
  width: 40px;
  height: 4px;
  border-radius: 100px;
  background: var(--border);
  margin: 0 auto 14px;
}
.claim-icon {
  font-size: 40px;
  line-height: 1;
  text-align: center;
  margin-bottom: 8px;
}
.claim-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.4px;
  text-align: center;
  margin-bottom: 6px;
}
.claim-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
  text-align: center;
  margin-bottom: 16px;
}
.claim-sub :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.claim-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}
.claim-step {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
}
.claim-step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.claim-step-body { flex: 1; min-width: 0; }
.claim-step-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
}
.claim-step-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.claim-cta-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.claim-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}
.claim-btn.ghost {
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}
.claim-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 3px 12px rgba(0, 161, 154, 0.25);
}
.claim-privacy {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-faint);
}
.claim-modal-enter-active,
.claim-modal-leave-active {
  transition: opacity 0.2s ease;
}
.claim-modal-enter-active .claim-sheet,
.claim-modal-leave-active .claim-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.claim-modal-enter-from,
.claim-modal-leave-to {
  opacity: 0;
}
.claim-modal-enter-from .claim-sheet,
.claim-modal-leave-to .claim-sheet {
  transform: translateY(100%);
}
</style>
