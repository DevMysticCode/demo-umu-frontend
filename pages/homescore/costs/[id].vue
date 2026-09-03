<template>
  <div class="hs-buyer">
    <!-- App header -->
    <div class="app-header">
      <button
        class="back-btn"
        type="button"
        @click="router.back()"
        aria-label="Back"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Property Report</div>
        <div class="app-header-sub">What we know about this property today</div>
      </div>
      <div class="app-header-spacer" />
    </div>

    <!-- HomeScore address card — single source-of-truth component used
         here, on V6ScoreView (homescore detail), and V6QuizView (owner
         quiz). Update the component once, all three pages stay in sync.
         report-mode swaps the tiles/social-proof rows for the stacked EPC
         row + passport-status pill the Property Report prototype shows. -->
    <div v-if="property" class="hs-addr-card-wrap anim-1">
      <HomescoreAddressCard
        :address="property.addressLine1 || 'This property'"
        :postcode="property.postcode ?? null"
        :property-type="property.propertyType ?? null"
        :sqm="property.floorAreaSqm ?? property.sqm ?? null"
        :epc-rating="property.epcRating ?? null"
        :home-score="displayScore"
        :searches-today="searchStats?.today ?? 0"
        :watchers-count="searchStats?.watchers ?? 0"
        :passport-state="passportState"
        report-mode
        @passport-pill-click="onPassportPillClick"
      />
    </div>

    <!-- Buyer snapshot -->
    <div class="buyer-conf anim-2">
      <div class="buyer-conf-row">
        <div class="buyer-conf-info">
          <div class="buyer-conf-eyebrow">
            <img src="/op-icons/calendar/shield.png" alt="" class="buyer-conf-eyebrow-ic" loading="lazy" />
            BUYER SNAPSHOT
          </div>
          <div class="buyer-conf-title">
            HomeScore {{ displayScore || '—' }} · <span>Based on public data</span>
          </div>
          <div class="buyer-conf-desc">{{ confidenceTitle }}</div>
        </div>
        <div class="buyer-conf-dial" aria-label="HomeScore">
          <svg viewBox="0 0 60 60" aria-hidden="true">
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="#EDEDF3"
              stroke-width="6"
              fill="none"
            />
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="url(#confGrad)"
              stroke-width="6"
              fill="none"
              stroke-dasharray="150.8"
              :stroke-dashoffset="150.8 - (displayScore / 100) * 150.8"
              stroke-linecap="round"
              transform="rotate(-90 30 30)"
            />
            <defs>
              <linearGradient id="confGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#00BB93" />
                <stop offset="100%" stop-color="#016F84" />
              </linearGradient>
            </defs>
          </svg>
          <div class="buyer-conf-dial-num">{{ displayScore || '—' }}</div>
        </div>
      </div>

      <div class="buyer-conf-stats">
        <div class="buyer-conf-stat">
          <img src="/op-icons/homescore/wallet.png" alt="" class="buyer-conf-stat-ic" loading="lazy" />
          <div class="buyer-conf-stat-text">
            <div class="buyer-conf-stat-label">Est. running cost</div>
            <div class="buyer-conf-stat-val">£{{ formatNum(totalAnnual) }}<span>/year</span></div>
            <div
              v-if="bsCostVsAreaLabel"
              class="buyer-conf-stat-sub"
              :class="{ good: bsCostVsAreaGood }"
            >
              {{ bsCostVsAreaLabel }}
            </div>
          </div>
        </div>
        <div class="buyer-conf-stat">
          <img src="/op-icons/investment/growthChart.png" alt="" class="buyer-conf-stat-ic" loading="lazy" />
          <div class="buyer-conf-stat-text">
            <div class="buyer-conf-stat-label">Compared to area</div>
            <div class="buyer-conf-stat-val">{{ bsAreaLabel ?? '—' }}</div>
            <div v-if="bsAreaSubtext" class="buyer-conf-stat-sub">{{ bsAreaSubtext }}</div>
          </div>
        </div>
        <div class="buyer-conf-stat">
          <img src="/op-icons/homescore/magnifier.png" alt="" class="buyer-conf-stat-ic" loading="lazy" />
          <div class="buyer-conf-stat-text">
            <div class="buyer-conf-stat-label">Areas worth checking</div>
            <div class="buyer-conf-stat-val">{{ bsWorthCheckingCount }}</div>
            <div class="buyer-conf-stat-sub">See key risks and questions below</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab bar (scrollable, 6 tabs) -->
    <div class="tab-bar scroll">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="tab-panels">
      <!-- ════ ENERGY ════ -->
      <div v-if="activeTab === 'energy'" class="tab-panel active">
        <div class="stats-card">
          <div class="stats-card-head">
            <div class="stats-card-eyebrow">What the public EPC tells you</div>
            <span class="src-tag teal">via EPC Register</span>
          </div>
          <div class="stats-card-intro">
            EPC data comes from the government register. The owner may have
            made improvements since this EPC was recorded.
          </div>
          <div v-for="s in epcStats" :key="s.id" class="stat-row">
            <div class="stat-icon">
              <img
                v-if="s.icon && s.icon.startsWith('/')"
                :src="s.icon"
                alt=""
                loading="lazy"
              />
              <template v-else>{{ s.icon }}</template>
            </div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-bar-wrap">
              <div
                class="stat-bar-fill"
                :class="s.tone"
                :style="{ width: s.pct + '%' }"
              />
            </div>
            <div class="stat-value" :class="`v-${s.tone}`">
              {{ s.value }}/{{ s.max }}
            </div>
          </div>
          <div class="stats-note">
            An up-to-date Property Passport could reveal improvements that
            aren't reflected in this EPC.
          </div>
        </div>

        <div class="section-h">Questions worth asking</div>
        <div class="section-h-sub">
          A Property Passport could answer these for you automatically
        </div>
        <div class="questions-card">
          <div v-for="q in askQuestions" :key="q.id" class="ask-row">
            <div class="ask-icon">
              <img
                v-if="q.icon && q.icon.startsWith('/')"
                :src="q.icon"
                alt=""
                loading="lazy"
              />
              <template v-else>{{ q.icon }}</template>
            </div>
            <div>
              <div class="ask-title">{{ q.title }}</div>
              <div class="ask-sub">{{ q.sub }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════ COSTS ════ -->
      <div v-if="activeTab === 'costs'" class="tab-panel active">
        <div class="cost-total-card">
          <div class="cost-total-eyebrow">
            <span class="pulse-dot white" /> Estimated total per year
          </div>
          <div class="cost-total-num">
            £{{ formatNum(totalAnnual) }}<span> / year</span>
          </div>
          <div class="cost-total-sub">
            ~£{{ formatNum(Math.round(totalAnnual / 12)) }}/month across energy
            (per EPC), water and council tax.
          </div>
          <div class="cost-total-srcs">
            <span class="src-tag light">EPC Register</span>
            <span class="src-tag light">VOA council tax</span>
            <span class="src-tag light">Regional water avg</span>
          </div>
        </div>
        <div v-for="c in costLines" :key="c.id" class="cost-line">
          <div class="cost-line-icon">
            <img
              v-if="c.icon && c.icon.startsWith('/')"
              :src="c.icon"
              alt=""
              loading="lazy"
            />
            <template v-else>{{ c.icon }}</template>
          </div>
          <div class="cost-line-info">
            <div class="cost-line-title">{{ c.title }}</div>
            <div class="cost-line-sub">{{ c.sub }}</div>
          </div>
          <div>
            <div class="cost-line-amt">£{{ formatNum(c.amount) }}</div>
            <div class="cost-line-amt-sub">/year</div>
          </div>
        </div>
        <div class="tab-note">
          Water &amp; sewerage is your water company's
          <b v-if="waterInfo?.company">{{ waterInfo.company }}</b> 2024/25
          regional average — water companies don't expose a per-property metered
          bill, so this is the published area figure.
        </div>
      </div>

      <!-- ════ SOLD ════ -->
      <div v-if="activeTab === 'sold'" class="tab-panel active">
        <div class="sold-chart">
          <div class="sold-chart-h">
            <div>
              <div class="sold-chart-h-title">Estimated value</div>
              <div v-if="estimatedValue" class="sold-chart-h-est">
                £{{ formatNum(estimatedValue) }}
                <small>{{ estimateSource }}</small>
              </div>
              <div v-else class="sold-chart-h-est muted">
                Not available
                <small>No Land Registry estimate yet</small>
              </div>
            </div>
            <span class="src-tag teal">via Land Registry</span>
          </div>
        </div>

        <!-- Sale history -->
        <div class="br-card" :class="{ open: openCards.has('sales') }">
          <div class="br-card-head" @click="toggleCard('sales')">
            <div class="br-card-ico teal">
              <img
                src="/op-icons/passportview/titleDeedsAndPlan.png"
                alt=""
                loading="lazy"
              />
            </div>
            <div class="br-card-info">
              <div class="br-card-title">Sale history</div>
              <div class="br-card-sub">
                {{
                  saleHistory.length
                    ? `${saleHistory.length} recorded sale${saleHistory.length === 1 ? '' : 's'} of this property`
                    : 'No recorded sales of this property'
                }}
              </div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('sales') }">
            <div class="br-card-body-inner">
              <template v-if="saleHistory.length">
                <div v-for="(s, i) in saleHistory" :key="i" class="comp-row">
                  <div class="comp-row-info">
                    <div class="comp-row-addr">Sold · {{ s.dateLabel }}</div>
                    <div class="comp-row-meta">{{ s.meta }}</div>
                  </div>
                  <div>
                    <div class="comp-row-price">£{{ formatNum(s.price) }}</div>
                  </div>
                </div>
              </template>
              <div v-else class="br-empty-note">
                No Land Registry Price Paid record exists for this exact
                address. Sales may be missing if the home is new-build, was last
                sold before 1995, or transferred without a recorded price.
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">HM Land Registry · Price Paid</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparable sales -->
        <div class="br-card" :class="{ open: openCards.has('comps') }">
          <div class="br-card-head" @click="toggleCard('comps')">
            <div class="br-card-ico teal"><img src="/op-icons/investment/housesCluster.png" alt="" loading="lazy" /></div>
            <div class="br-card-info">
              <div class="br-card-title">Comparable sales nearby</div>
              <div class="br-card-sub">
                {{
                  comparables.length
                    ? `${comparables.length} similar homes · ${property?.postcode || ''}`
                    : 'No nearby sales found yet'
                }}
              </div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('comps') }">
            <div class="br-card-body-inner">
              <template v-if="comparables.length">
                <div v-for="(c, i) in comparables" :key="i" class="comp-row">
                  <div class="comp-row-info">
                    <div class="comp-row-addr">{{ c.address }}</div>
                    <div class="comp-row-meta">{{ c.meta }}</div>
                  </div>
                  <div>
                    <div class="comp-row-price">£{{ formatNum(c.price) }}</div>
                    <div class="comp-row-date">{{ c.dateLabel }}</div>
                  </div>
                </div>
              </template>
              <div v-else class="br-empty-note">
                No recent Land Registry sales recorded on nearby streets in
                {{ property?.postcode || 'this postcode' }}.
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">HM Land Registry · Price Paid</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Title summary -->
        <div class="br-card" :class="{ open: openCards.has('title') }">
          <div class="br-card-head" @click="toggleCard('title')">
            <div class="br-card-ico teal">
              <img
                src="/op-icons/passportview/titleDeedsAndPlan.png"
                alt=""
                loading="lazy"
              />
            </div>
            <div class="br-card-info">
              <div class="br-card-title">Title &amp; tenure</div>
              <div class="br-card-sub">{{ tenureLabel }}</div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('title') }">
            <div class="br-card-body-inner">
              <b>Tenure:</b> {{ tenureLabel }}.<br />
              <b>Title number:</b>
              {{ property?.titleNumber || 'available via solicitor' }}.<br />
              The Land Registry can provide a full Title Register (£3) and Title
              Plan (£3) with a buyer's solicitor account.
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">HM Land Registry</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════ RISKS ════ -->
      <div v-if="activeTab === 'risks'" class="tab-panel active">
        <div class="risk-srcs">
          <span class="src-tag teal">Env Agency</span>
          <span class="src-tag">Planning.data.gov.uk</span>
          <span class="src-tag">Historic England</span>
          <span class="src-tag">EPC Register</span>
        </div>

        <!-- Flood -->
        <div class="risk-item col" @click="toggleCard('flood')">
          <div class="risk-item-top">
            <div class="risk-icon" :class="floodTone"><img src="/op-icons/misc/waterDroplet.png" alt="" loading="lazy" /></div>
            <div class="risk-body">
              <div class="risk-title">Flood risk</div>
              <div class="risk-sub">{{ floodSub }} · Environment Agency</div>
            </div>
            <div class="risk-status" :class="floodTone">{{ floodLabel }}</div>
          </div>
          <div v-if="openCards.has('flood')" class="risk-drill">
            <b>Overall rating:</b> {{ floodLabel }}.<br />
            <span class="risk-drill-note">
              The Environment Agency returns a combined assessment — we don't
              get rivers / surface-water / reservoir split separately.
            </span>
          </div>
        </div>

        <!-- Listed / conservation -->
        <div class="risk-item col" @click="toggleCard('listed')">
          <div class="risk-item-top">
            <div class="risk-icon" :class="listedTone">
              <img src="/op-icons/investment/landmarks.png" alt="" loading="lazy" />
            </div>
            <div class="risk-body">
              <div class="risk-title">
                Listed building &amp; conservation area
              </div>
              <div class="risk-sub">
                {{ listedSub }} · Historic England / Planning
              </div>
            </div>
            <div class="risk-status" :class="listedTone">{{ listedLabel }}</div>
          </div>
          <div v-if="openCards.has('listed')" class="risk-drill">
            <template v-if="listedBuildings.length">
              <div v-for="(lb, i) in listedBuildings" :key="i">
                <b>{{ lb.grade || 'Listed' }}:</b> {{ lb.name }}
              </div>
            </template>
            <template v-else>
              No National Heritage List entry for this address, and not within a
              recorded conservation area.
            </template>
          </div>
        </div>

        <!-- Planning -->
        <div class="risk-item col" @click="toggleCard('planning')">
          <div class="risk-item-top">
            <div
              class="risk-icon"
              :class="planningApps.length ? 'note' : 'clear'"
            >
              <img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" />
            </div>
            <div class="risk-body">
              <div class="risk-title">Planning history</div>
              <div class="risk-sub">
                {{
                  planningApps.length
                    ? `${planningApps.length} application${planningApps.length === 1 ? '' : 's'} on file`
                    : 'No applications on file'
                }}
                · Local planning authority
              </div>
            </div>
            <div
              class="risk-status"
              :class="planningApps.length ? 'note' : 'clear'"
            >
              {{
                planningApps.length
                  ? `${planningApps.length} app${planningApps.length === 1 ? '' : 's'}`
                  : 'Clear'
              }}
            </div>
          </div>
          <div
            v-if="openCards.has('planning') && planningApps.length"
            class="risk-drill"
          >
            <div
              v-for="(a, i) in planningApps.slice(0, 6)"
              :key="i"
              style="margin-bottom: 4px"
            >
              · <b>{{ a.dateLabel }}</b> — {{ a.description }}
              <span :style="{ color: a.statusColor }">{{ a.status }}</span>
            </div>
            <div class="risk-drill-note">Source: Planning.data.gov.uk</div>
          </div>
        </div>

        <!-- Ground stability — real contaminated-land + mineral data -->
        <div class="risk-item col" @click="toggleCard('ground')">
          <div class="risk-item-top">
            <div class="risk-icon" :class="groundTone">⛏️</div>
            <div class="risk-body">
              <div class="risk-title">Ground stability</div>
              <div class="risk-sub">{{ groundSub }}</div>
            </div>
            <div class="risk-status" :class="groundTone">{{ groundLabel }}</div>
          </div>
          <div v-if="openCards.has('ground')" class="risk-drill">
            <template v-if="groundConstraints.length">
              <div v-for="(g, i) in groundConstraints" :key="i">
                <b>{{ g.type }}:</b> {{ g.name }}
              </div>
              <div class="risk-drill-note">Source: planning.data.gov.uk</div>
            </template>
            <template v-else>
              No contaminated-land or mineral-safeguarding-area records cover
              this point.
              <div class="risk-drill-note">
                Full coal-mining subsidence needs a paid Coal Authority CON29M
                report (~£25) — there's no free per-property API.
              </div>
            </template>
          </div>
        </div>

        <!-- EPC-derived flags -->
        <template v-for="r in epcRiskFlags" :key="r.id">
          <div class="risk-item">
            <div class="risk-icon" :class="r.status">
              <img
                v-if="r.icon && r.icon.startsWith('/')"
                :src="r.icon"
                alt=""
                loading="lazy"
              />
              <template v-else>{{ r.icon }}</template>
            </div>
            <div class="risk-body">
              <div class="risk-title">{{ r.title }}</div>
              <div class="risk-sub">{{ r.sub }}</div>
            </div>
            <div class="risk-status" :class="r.status">{{ r.statusLabel }}</div>
          </div>
        </template>
      </div>

      <!-- ════ AREA ════ -->
      <div v-if="activeTab === 'area'" class="tab-panel active">
        <!-- Crime -->
        <div class="tab-hero-stat">
          <div>
            <div class="tab-hero-stat-big">
              {{ crime ? crimePerMonth : '—' }}<small> /mo</small>
            </div>
            <div class="tab-hero-stat-label">Crimes within 1 mile</div>
          </div>
          <div class="tab-hero-stat-body">
            <div class="tab-hero-stat-headline">
              {{
                crime
                  ? crimeHeadline
                  : enrichmentLoaded
                    ? 'No crime data'
                    : 'Loading…'
              }}
            </div>
            <div class="tab-hero-stat-sub">
              <template v-if="crime">
                12-month total: {{ crime.totalLast12m }}
                <template v-if="crimeTrendText">
                  ·
                  <span :class="crimeTrendClass">{{
                    crimeTrendText
                  }}</span></template
                >
                · data.police.uk
              </template>
              <template v-else>data.police.uk</template>
            </div>
          </div>
        </div>

        <div class="br-card" :class="{ open: openCards.has('crime') }">
          <div class="br-card-head" @click="toggleCard('crime')">
            <div class="br-card-ico teal">👮</div>
            <div class="br-card-info">
              <div class="br-card-title">Crime breakdown</div>
              <div class="br-card-sub">Last 12 months · 1 mile radius</div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('crime') }">
            <div class="br-card-body-inner">
              <template v-if="crimeByCategory.length">
                <div
                  v-for="(c, i) in crimeByCategory"
                  :key="i"
                  class="crime-row"
                >
                  <span class="crime-name">{{ c.label }}</span>
                  <div class="crime-bar">
                    <div
                      class="crime-bar-fill"
                      :class="c.tone"
                      :style="{ width: c.pct + '%' }"
                    />
                  </div>
                  <span class="crime-count">{{ c.count }}</span>
                </div>
              </template>
              <div v-else class="br-empty-note">
                {{
                  enrichmentLoaded
                    ? 'No street-level crime returned for this location.'
                    : 'Loading crime data…'
                }}
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">data.police.uk</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Schools -->
        <div class="br-card" :class="{ open: openCards.has('schools') }">
          <div class="br-card-head" @click="toggleCard('schools')">
            <div class="br-card-ico teal">
              <img
                src="/op-icons/investment/graduationCap.png"
                alt=""
                loading="lazy"
              />
            </div>
            <div class="br-card-info">
              <div class="br-card-title">Schools nearby</div>
              <div class="br-card-sub">
                {{
                  schools.length
                    ? `${schools.length} within ~1 mile`
                    : 'None found within ~1 mile'
                }}
              </div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('schools') }">
            <div class="br-card-body-inner">
              <template v-if="schools.length">
                <div v-for="(s, i) in schools" :key="i" class="school-row">
                  <div class="school-ofsted nodata"><big>—</big></div>
                  <div class="school-info">
                    <div class="school-name">{{ s.name }}</div>
                    <div class="school-meta">{{ s.meta }}</div>
                  </div>
                  <div class="school-dist">{{ s.dist }}</div>
                </div>
              </template>
              <div v-else class="br-empty-note">
                {{
                  enrichmentLoaded
                    ? 'No schools found within ~1 mile of this address.'
                    : 'Loading schools…'
                }}
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">Ordnance Survey</span>
                <span class="src-tag">Ofsted ratings not connected</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Broadband + mobile -->
        <div class="br-card" :class="{ open: openCards.has('bb') }">
          <div class="br-card-head" @click="toggleCard('bb')">
            <div class="br-card-ico teal">📶</div>
            <div class="br-card-info">
              <div class="br-card-title">Broadband &amp; mobile</div>
              <div class="br-card-sub">
                Ofcom checker for {{ property?.postcode }}
              </div>
            </div>
            <div v-if="broadband" class="br-card-val accent">
              {{
                broadband.fttp
                  ? 'FTTP'
                  : broadband.superfast
                    ? 'Superfast'
                    : 'Standard'
              }}
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('bb') }">
            <div class="br-card-body-inner">
              <template v-if="broadband">
                <div class="bb-card">
                  <div class="bb-speed">
                    <span class="bb-num">{{
                      broadband.maxDownload ?? '—'
                    }}</span>
                    <span class="bb-unit">Mb/s</span>
                  </div>
                  <div class="bb-bars">
                    <i :class="{ on: broadband.maxDownload }" />
                    <i :class="{ on: broadband.maxDownload > 30 }" />
                    <i :class="{ on: broadband.superfast }" />
                    <i :class="{ on: broadband.maxDownload > 300 }" />
                    <i :class="{ on: broadband.ultrafast }" />
                  </div>
                </div>
                <div v-if="mobileNets.length" class="bb-mobile-h">
                  Mobile signal (outdoor)
                </div>
                <div v-for="(n, i) in mobileNets" :key="i" class="bb-net-row">
                  <span class="bb-net-name"><img src="/op-icons/misc/phoneCall.png" alt="" class="inline-ic" loading="lazy" /> {{ n.name }}</span>
                  <div class="bb-cov">
                    <i
                      v-for="bar in 5"
                      :key="bar"
                      :class="{ on: bar <= n.bars }"
                    />
                  </div>
                </div>
              </template>
              <div v-else class="br-empty-note">
                {{
                  enrichmentLoaded
                    ? 'Ofcom did not return coverage for this postcode.'
                    : 'Loading broadband & mobile coverage…'
                }}
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">Ofcom · Connected Nations</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Transport -->
        <div class="br-card" :class="{ open: openCards.has('transport') }">
          <div class="br-card-head" @click="toggleCard('transport')">
            <div class="br-card-ico teal">🚆</div>
            <div class="br-card-info">
              <div class="br-card-title">Transport</div>
              <div class="br-card-sub">Stations &amp; bus stops nearby</div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div
            class="br-card-body"
            :class="{ open: openCards.has('transport') }"
          >
            <div class="br-card-body-inner">
              <template v-if="transport.length">
                <div
                  v-for="(t, i) in transport"
                  :key="i"
                  style="margin-bottom: 4px"
                >
                  <b>{{ t.name }}</b> — {{ t.dist }} ({{ t.kind }})
                </div>
              </template>
              <div v-else class="br-empty-note">
                {{
                  enrichmentLoaded
                    ? 'No stations or bus stops found nearby.'
                    : 'Loading transport…'
                }}
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">Overpass · OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Healthcare -->
        <div class="br-card" :class="{ open: openCards.has('health') }">
          <div class="br-card-head" @click="toggleCard('health')">
            <div class="br-card-ico teal">⚕️</div>
            <div class="br-card-info">
              <div class="br-card-title">Healthcare nearby</div>
              <div class="br-card-sub">
                GP surgeries, pharmacies &amp; hospitals
              </div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('health') }">
            <div class="br-card-body-inner">
              <template v-if="healthcare.length">
                <div
                  v-for="(h, i) in healthcare"
                  :key="i"
                  style="margin-bottom: 4px"
                >
                  <b>{{ h.name }}</b> — {{ h.dist }} ({{ h.kind }})
                </div>
              </template>
              <div v-else class="br-empty-note">
                {{
                  enrichmentLoaded
                    ? 'No GP surgeries, pharmacies or hospitals found nearby.'
                    : 'Loading healthcare…'
                }}
              </div>
              <div class="br-card-srcrow">
                <span class="br-card-srcrow-label">Source</span>
                <span class="src-tag teal">Overpass · OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Neighbourhood -->
        <div class="br-card" :class="{ open: openCards.has('hood') }">
          <div class="br-card-head" @click="toggleCard('hood')">
            <div class="br-card-ico teal"><img src="/op-icons/investment/housesCluster.png" alt="" loading="lazy" /></div>
            <div class="br-card-info">
              <div class="br-card-title">Neighbourhood</div>
              <div class="br-card-sub">
                {{
                  neighbourhood
                    ? `${property?.postcode || ''} area profile`
                    : 'Census demographics'
                }}
              </div>
            </div>
            <span class="br-card-chev">›</span>
          </div>
          <div class="br-card-body" :class="{ open: openCards.has('hood') }">
            <div class="br-card-body-inner">
              <template v-if="neighbourhood && neighbourhood.length">
                <div v-for="(n, i) in neighbourhood" :key="i" class="comp-row">
                  <div class="comp-row-info">
                    <div class="comp-row-addr">{{ n.label }}</div>
                  </div>
                  <div class="comp-row-price">{{ n.value }}</div>
                </div>
                <div class="br-card-srcrow">
                  <span class="br-card-srcrow-label">Source</span>
                  <span class="src-tag teal">ONS Census 2021</span>
                </div>
              </template>
              <div v-else class="br-empty-note">
                Census demographics (ONS 2021) aren't connected yet. We're
                planning to wire the NOMIS API to surface population, age
                profile, tenure mix and deprivation for this neighbourhood.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════ STREET ════ -->
      <div v-if="activeTab === 'street'" class="tab-panel active">
        <div class="street-rank-hero">
          <div class="street-rank-big">
            {{ streetRank ?? '—'
            }}<span
              >{{ streetRank ? ordinalSuffix(streetRank) : '' }} of
              {{ streetTotal ?? '—' }}</span
            >
          </div>
          <div class="street-rank-small">{{ streetRankLabel }}</div>
          <div
            v-if="streetCallout"
            class="street-rank-callout"
            v-html="streetCallout"
          />
        </div>
        <div v-if="streetBars.length" class="street-bars">
          <div
            v-for="(b, i) in streetBars"
            :key="i"
            class="street-bar-row"
            :class="{ 'you-row': b.isYou }"
          >
            <div class="street-bar-label" :class="{ you: b.isYou }">
              {{ b.label }}
            </div>
            <div class="street-bar-wrap">
              <div
                class="street-bar-fill"
                :class="b.tone"
                :style="{ width: b.pct + '%' }"
              />
            </div>
            <div class="street-bar-amt" :class="{ you: b.isYou }">
              £{{ formatNum(b.cost) }}
            </div>
          </div>
        </div>
        <div v-else class="tab-note">
          Not enough neighbouring properties have been enriched to draw a street
          comparison yet.
        </div>
      </div>
    </div>

    <!-- ═══ STATE-AWARE BUYER ACTIONS (visible on every tab) ═══ -->

    <!-- ─── UNCLAIMED ─── -->
    <template v-if="passportState === 'unclaimed'">
      <!-- <div class="watch-card anim-4">
        <div class="watch-card-eyebrow"><img src="/op-icons/misc/eye.png" alt="" class="inline-ic" loading="lazy" /> Watch this property</div>
        <div class="watch-card-title">
          Be the first to know if anything changes here.
        </div>
        <div class="watch-card-sub">
          No Passport exists yet. Adding this to your profile turns on
          notifications for every meaningful change at <b>{{ addrShort }}</b
          >.
        </div>
        <div class="watch-trigger">
          <div class="watch-trigger-ico">
            <img src="/op-icons/homescore/house.png" alt="" loading="lazy" />
          </div>
          <div class="watch-trigger-body">
            <div class="watch-trigger-title">Owner claims this property</div>
            <div class="watch-trigger-sub">
              You'll get pinged the moment they verify ownership.
            </div>
          </div>
        </div>
        <div class="watch-trigger">
          <div class="watch-trigger-ico">
            <img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" />
          </div>
          <div class="watch-trigger-body">
            <div class="watch-trigger-title">
              Passport started or progress milestones hit
            </div>
            <div class="watch-trigger-sub">
              Get a ping at 25% / 50% / 75% so you can register interest before
              it's published.
            </div>
          </div>
        </div>
        <div class="watch-trigger">
          <div class="watch-trigger-ico"><img src="/op-icons/misc/confetti.png" alt="" loading="lazy" /></div>
          <div class="watch-trigger-body">
            <div class="watch-trigger-title">
              Passport published · property goes live
            </div>
            <div class="watch-trigger-sub">
              Buy access for <b>£15</b> — or <b>free</b> if you're a verified
              buyer.
            </div>
          </div>
        </div>
        <div class="watch-trigger">
          <div class="watch-trigger-ico"><img src="/op-icons/investment/growthChart.png" alt="" loading="lazy" /></div>
          <div class="watch-trigger-body">
            <div class="watch-trigger-title">Comparable sales nearby</div>
            <div class="watch-trigger-sub">
              New Land Registry data on {{ property?.postcode }} — keeps your
              estimated value fresh.
            </div>
          </div>
        </div>
        
      </div> -->
      <div class="watch-card anim-4">
        <button class="watch-cta" type="button" @click="onWatch">
          <img src="/op-icons/misc/eye.png" alt="" class="inline-ic" loading="lazy" /> Watch this property →
        </button>
        <div class="watch-cta-note">
          Be the first to know if anything important changes.<br />
          We'll notify you when a Passport is started, published or updated.
        </div>
      </div>
      
      <!-- Verified Buyer card — backend-driven (guest / no-profile →
           unverified CTA, published profile → verified greeting). Same
           component lives on the buyer-results screen. -->
      <!-- <BuyerVerifyCard
        class="anim-4"
        :first-name="userProfile?.firstName ?? null"
        @start-verification="onBuyerStartVerification"
        @view-profile="onBuyerViewProfile"
        @edit-profile="onBuyerEditProfile"
      /> -->
    </template>

    <!-- ─── CLAIMED · PRIVATE ─── -->
    <template v-else-if="passportState === 'private'">
      <div class="state-banner in-progress anim-3">
        <div class="state-banner-ico">
          <img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" />
        </div>
        <div class="state-banner-body">
          <div class="state-banner-title">
            Claimed · Private
            <span class="state-banner-pill">Owner verified</span>
          </div>
          <div class="state-banner-sub">
            The owner has claimed this home and is building a verified Passport
            —
            <b
              >{{ passportSectionsDone }} of
              {{ passportSectionsTotal }} sections</b
            >
            done.
          </div>
        </div>
      </div>

      <div class="pp-progress-hero anim-4">
        <div class="pp-progress-eyebrow"><img src="/op-icons/homescore/clipboard.png" alt="" class="inline-ic" loading="lazy" /> Passport build · live</div>
        <div class="pp-progress-pct-row">
          <span class="pp-progress-pct">{{ passportProgressPct }}%</span>
          <span class="pp-progress-frac"
            >{{ passportSectionsDone }} of {{ passportSectionsTotal }} sections
            complete</span
          >
        </div>
        <div class="pp-progress-bar">
          <div
            class="pp-progress-fill"
            :style="{ width: passportProgressPct + '%' }"
          />
        </div>
        <div class="pp-progress-sub">
          The owner is gathering verified documents.
          <b>Register your interest to be first in line when it publishes.</b>
        </div>
      </div>

      <div class="watch-card anim-5">
        <div class="watch-card-eyebrow"><img src="/op-icons/misc/trophy.png" alt="" class="inline-ic" loading="lazy" /> Register your interest</div>
        <div class="watch-card-title">
          Get in the queue before it goes live.
        </div>
        <div class="watch-card-sub">
          Registering interest tells the owner a real buyer is waiting — and
          puts you <b>first in line</b> for a viewing the moment the Passport
          publishes.
        </div>
        <div class="watch-trigger">
          <div class="watch-trigger-ico">
            <img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" />
          </div>
          <div class="watch-trigger-body">
            <div class="watch-trigger-title">Milestone pings</div>
            <div class="watch-trigger-sub">
              Get pinged at 75%, 90%, and published.
            </div>
          </div>
        </div>
        <div class="watch-trigger">
          <div class="watch-trigger-ico"><img src="/op-icons/misc/confetti.png" alt="" loading="lazy" /></div>
          <div class="watch-trigger-body">
            <div class="watch-trigger-title">
              Free Passport the moment it publishes
            </div>
            <div class="watch-trigger-sub">
              Verified buyers get the full sales pack free on publish — worth
              £15.
            </div>
          </div>
        </div>
        <button class="watch-cta" type="button" @click="onRegister">
          <img src="/op-icons/misc/trophy.png" alt="" class="inline-ic" loading="lazy" /> Register my interest →
        </button>
      </div>

      <BuyerVerifyCard
        class="anim-5"
        :first-name="userProfile?.firstName ?? null"
        @start-verification="onBuyerStartVerification"
        @view-profile="onBuyerViewProfile"
        @edit-profile="onBuyerEditProfile"
      />
    </template>

    <!-- ─── PUBLISHED ─── -->
    <template v-else>
      <div class="state-banner published anim-3">
        <div class="state-banner-ico"><img src="/op-icons/misc/confetti.png" alt="" loading="lazy" /></div>
        <div class="state-banner-body">
          <div class="state-banner-title">
            {{ passportState === 'public' ? 'Claimed · Public' : 'Claimed · Partially Public' }}
            <span class="state-banner-pill">Solicitor-grade</span>
          </div>
          <div class="state-banner-sub">
            Full verified sales pack ready<span v-if="passportSectionsTotal">
              —
              <b
                >{{ passportSectionsDone }} of
                {{ passportSectionsTotal }} sections</b
              ></span
            >. Title, surveys, planning &amp; fittings in one place.
          </div>
        </div>
      </div>

      <div class="buy-pp-card anim-4">
        <div class="buy-pp-top">
          <div class="buy-pp-badge">
            <img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" />
          </div>
          <span class="buy-pp-grade">Solicitor-grade</span>
        </div>
        <div class="buy-pp-title">The full story on this home — verified.</div>
        <div class="buy-pp-sub">
          Everything a buyer's solicitor needs, gathered &amp; checked upfront.
          Homes with a Passport sell
          <b style="color: var(--accent-dark)">~12 weeks faster</b>.
        </div>
        <div class="buy-pp-inside">
          <div class="buy-pp-item">
            <span class="buy-pp-item-tick">✓</span> Title &amp; deeds
          </div>
          <div class="buy-pp-item">
            <span class="buy-pp-item-tick">✓</span> RICS survey
          </div>
          <div class="buy-pp-item">
            <span class="buy-pp-item-tick">✓</span> Planning &amp; building regs
          </div>
          <div class="buy-pp-item">
            <span class="buy-pp-item-tick">✓</span> Fixtures &amp; fittings
          </div>
          <div class="buy-pp-item">
            <span class="buy-pp-item-tick">✓</span> Warranties &amp; guarantees
          </div>
          <div class="buy-pp-item">
            <span class="buy-pp-item-tick">✓</span> + 14 more sections
          </div>
        </div>
        <div class="buy-pp-pricerow">
          <div>
            <div class="buy-pp-price">£15<small> one-off</small></div>
          </div>
          <div class="buy-pp-pricenote">
            Instant access to the full pack. <b>Free for verified buyers</b> —
            verify once, open every Passport.
          </div>
        </div>
        <button class="buy-pp-cta" type="button" @click="onBuyPassport">
          <img src="/op-icons/homescore/clipboard.png" alt="" class="inline-ic" loading="lazy" /> Open the full Passport →
        </button>
      </div>

      <div class="qoffer-card anim-5">
        <div class="qoffer-eyebrow"><img src="/op-icons/investment/moneyBagPound.png" alt="" class="inline-ic" loading="lazy" /> Qualified offer</div>
        <div class="qoffer-title">Make an offer the seller sees first.</div>
        <div class="qoffer-sub">
          Verified buyers can submit a qualified offer straight from the
          Passport — ID &amp; funds already checked, so the seller knows it's
          real.
          <b style="color: #ffd58a">You need to be verified to make one.</b>
        </div>
        <button class="qoffer-cta locked" type="button" @click="onVerify">
          <img src="/op-icons/investment/padlock.png" alt="" class="inline-ic" loading="lazy" /> Get verified to make an offer →
        </button>
      </div>

      <BuyerVerifyCard
        class="anim-5"
        :first-name="userProfile?.firstName ?? null"
        @start-verification="onBuyerStartVerification"
        @view-profile="onBuyerViewProfile"
        @edit-profile="onBuyerEditProfile"
      />
    </template>

    <div style="height: 32px" />

    <WatchPropertyDrawer
      :open="watchDrawerOpen"
      :address-label="property?.addressLine1 || ''"
      :passport-state="passportState"
      @close="watchDrawerOpen = false"
      @submit="onWatchSubmit"
    />
    <WatchConfirmedDrawer
      :open="watchConfirmedOpen"
      :address-label="property?.addressLine1 || ''"
      :prefs="watchConfirmedPrefs"
      @close="watchConfirmedOpen = false"
      @create-passport="goToBuildBuyerPassport"
    />
    <VerifyBuyerDrawer
      :open="verifyDrawerOpen"
      @close="verifyDrawerOpen = false"
      @start="onVerifyStart"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import WatchPropertyDrawer from '~/components/property/WatchPropertyDrawer.vue'
import WatchConfirmedDrawer from '~/components/property/WatchConfirmedDrawer.vue'
import VerifyBuyerDrawer from '~/components/property/VerifyBuyerDrawer.vue'
import BuyerVerifyCard from '~/components/property/BuyerVerifyCard.vue'
import HomescoreAddressCard from '~/components/homescore/HomescoreAddressCard.vue'
import {
  calculateScore,
  getPrefillFromProperty,
} from '~/utils/homescoreScoring'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

// Used by BuyerVerifyCard for the "Welcome back, {firstName}" greeting
// when the user has a published buyer profile. Lazily fetched.
const { profile: userProfile, fetchProfile } = useProfile()
onMounted(() => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('token')) {
    if (!userProfile.value) fetchProfile().catch(() => {})
  }
})

// BuyerVerifyCard handlers — same routing as the buyer-results screen.
function onBuyerStartVerification() {
  const tk =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!tk) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', '/buyer-profile')
    }
    router.push('/onboarding/signin')
    return
  }
  router.push('/buyer-profile')
}
function onBuyerViewProfile() {
  router.push('/buyer-profile/view')
}
function onBuyerEditProfile() {
  router.push('/buyer-profile')
}

const propertyId = computed(() => String(route.params.id))
// Fetch + EPC self-heal logic lives in useHomeScorePropertyData (shared
// with pathway/[id].vue and the homescore flow) so this page can't drift
// out of sync with the same pattern implemented separately elsewhere.
const { property, loadProperty } = useHomeScorePropertyData()
const streetData = ref<any>(null)
const enrichment = ref<any>(null)
const enrichmentLoaded = ref(false)
const passportStatus = ref<any>(null)
const searchStats = ref<{
  today?: number
  thisMonth?: number
  watchers?: number
} | null>(null)

type TabId = 'energy' | 'costs' | 'sold' | 'risks' | 'area' | 'street'
const tabs: { id: TabId; label: string }[] = [
  { id: 'energy', label: '⚡ Energy' },
  { id: 'costs', label: '💰 Costs' },
  { id: 'sold', label: '📈 Sold' },
  { id: 'risks', label: '⚠ Risks' },
  { id: 'area', label: '📍 Area' },
  { id: 'street', label: '🏘 Street' },
]
const activeTab = ref<TabId>('energy')

// Expandable card open-state set.
const openCards = ref<Set<string>>(new Set(['sales', 'crime']))
function toggleCard(id: string) {
  const next = new Set(openCards.value)
  next.has(id) ? next.delete(id) : next.add(id)
  openCards.value = next
}

onMounted(async () => {
  await loadProperty(propertyId.value)
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}/street-energy-rank`,
    )
    if (res.ok) streetData.value = await res.json()
  } catch {}
  // Rich enrichment (Sold / Risks / Area) — may take a moment as it hits
  // ~10 upstream APIs. Send the auth token the same way the property
  // detail page does, so we get identical results.
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}/enrichment`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    )
    if (res.ok) {
      enrichment.value = await res.json()
      // eslint-disable-next-line no-console
      console.log('[BuyerReport][enrichment]', {
        hasCrime: !!enrichment.value?.crime,
        sales: enrichment.value?.salesHistory?.thisProperty?.length ?? 0,
        comps: enrichment.value?.salesHistory?.nearbySales?.length ?? 0,
        estimate: enrichment.value?.landRegistryEstimate,
        schools: enrichment.value?.nearby?.schools?.length ?? 0,
        broadband: !!enrichment.value?.broadband?.available,
      })
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[BuyerReport] enrichment fetch failed', e)
  }
  enrichmentLoaded.value = true
  // Passport status drives the state-aware buyer-action sections
  // (Unclaimed / In progress / Published).
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}/passport-status`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    )
    if (res.ok) passportStatus.value = await res.json()
  } catch {}
  // "N people checked this HomeScore today" — same source as the other pages.
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}/search-stats`,
    )
    if (res.ok) searchStats.value = await res.json()
  } catch {}
})

const searchesTodayDisplay = computed(() => {
  const n = searchStats.value?.today ?? 0
  return `${n} ${n === 1 ? 'person' : 'people'}`
})

// ── State-aware buyer sections ──
// unclaimed → no seller passport; private → claimed but nothing published;
// partiallyPublic/public → live, split by milestonePct. Same 4-state model
// as everywhere else in the app now (used to be a 3-way unclaimed/progress/
// published model — "progress" collapsed into 'private' below, and the
// template's old single "published" branch now covers partiallyPublic and
// public together, distinguished only by label — see the state-banner
// title below). Mirrors property/[id].vue's floatClaimState computed
// exactly; this used to be a second, separate computed
// (watchDrawerPassportState) kept apart from the one driving this page's
// main template deliberately, to avoid touching that page's wording at
// the time — now merged since that wording is being brought in line too.
const passportState = computed<
  'unclaimed' | 'private' | 'partiallyPublic' | 'public'
>(() => {
  const s = passportStatus.value
  const p: any = property.value
  // Prefer the authed status; fall back to the public property payload so
  // the state is correct for guests too (the /passport-status endpoint is
  // JWT-only, but /property/:id exposes hasPassport / passportPublished).
  // `isClaimed` alone isn't enough — the backend sets it true the moment
  // ownership verification succeeds, even with no passport ever created
  // (dropped off mid-flow) — that's still Unclaimed in this UI's sense.
  const claimed = s?.hasPassport || p?.hasPassport || false
  if (!claimed) return 'unclaimed'
  const published =
    s?.isPublished || s?.passportStatus === 'PUBLISHED' || p?.passportPublished || false
  if (!published) return 'private'
  const pct = s?.milestonePct ?? p?.milestonePct ?? 0
  return pct >= 100 ? 'public' : 'partiallyPublic'
})

const passportProgressPct = computed(() => {
  const p = passportStatus.value?.passportProgress
  return p?.completionPct ?? 0
})
const passportSectionsDone = computed(
  () => passportStatus.value?.passportProgress?.completedSections ?? 0,
)
const passportSectionsTotal = computed(
  () => passportStatus.value?.passportProgress?.totalSections ?? 0,
)
const addrShort = computed(
  () =>
    property.value?.addressLine1 ||
    property.value?.displayAddress ||
    'this property',
)

// ── EPC field helper (reads top-level or nested cert) ──
function epcField(name: string): any {
  const p: any = property.value
  if (!p) return null
  if (p[name] != null && p[name] !== '') return p[name]
  const cert = p.epcCert
  if (cert && cert[name] != null && cert[name] !== '') return cert[name]
  return null
}

const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#008a84',
    B: '#00a19a',
    C: '#7ab040',
    D: '#e6a23c',
    E: '#d86f4a',
    F: '#c04a1a',
    G: '#a52a2a',
  }
  return map[(property.value?.epcRating || '').toUpperCase()] || '#9c98ad'
})

const addressMeta = computed(() => {
  const p = property.value
  if (!p) return ''
  const parts: string[] = []
  if (p.postcode) parts.push(p.postcode)
  if (p.propertyType) parts.push(p.propertyType)
  const area = p.floorAreaSqm ?? p.epcCert?.floorAreaSqm
  if (area && Number.isFinite(Number(area)))
    parts.push(`${Math.round(Number(area))}m²`)
  return parts.join(' · ')
})

const shortAddress = computed(() => property.value?.addressLine1 || 'Property')
// Headline HomeScore — mirrors the main HomeScore page (homescore/[id].vue):
// prefer the property's real EPC SAP score, fall back to the 5-pillar engine
// estimate (seeded from EPC rating / age / heating) when there's no EPC.
const displayScore = computed(() => {
  const real = Number(epcField('epcScore'))
  if (Number.isFinite(real) && real > 0) return Math.round(real)
  try {
    const prefill = getPrefillFromProperty({
      epcRating: epcField('epcRating'),
      yearBuilt: epcField('yearBuilt'),
      heatingType: epcField('heatingType'),
    })
    const engine = calculateScore(prefill)
    return engine?.total ? Math.round(engine.total) : 0
  } catch {
    return 0
  }
})
const epcYear = computed(() => {
  const v = epcField('lodgementDate') || epcField('epcLodgementDate')
  if (!v) return null
  const y = new Date(v).getFullYear()
  return Number.isFinite(y) ? y : null
})

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-GB').format(Math.round(n || 0))
}

// ── Energy tab ──
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
interface StatRow {
  id: string
  icon: string
  label: string
  value: number
  max: number
  pct: number
  tone: 'high' | 'mid' | 'low'
}
const epcStats = computed<StatRow[]>(() => {
  const heat =
    (effToScore(epcField('mainheatEnergyEff')) +
      effToScore(epcField('mainheatcEnergyEff'))) /
    2
  const structure =
    (effToScore(epcField('wallsEnergyEff')) +
      effToScore(epcField('roofEnergyEff')) +
      effToScore(epcField('floorEnergyEff')) +
      effToScore(epcField('windowsEnergyEff'))) /
    4
  const ledPct = Number(epcField('lowEnergyLighting') ?? 0)
  const efficiency =
    effToScore(epcField('lightingEnergyEff')) * 0.6 + (ledPct / 100) * 0.4
  const recs: any[] = property.value?.epcRecommendations || []
  const hasSolarPv = recs.some((r) =>
    /(solar pv|photovoltaic)/i.test(r?.title || ''),
  )
  const electrics = hasSolarPv ? 0.5 : 0.8
  const plumbing = effToScore(epcField('hotWaterEnergyEff'))
  const mk = (
    id: string,
    icon: string,
    label: string,
    score: number,
    max: number,
  ): StatRow => {
    const tone: 'high' | 'mid' | 'low' =
      score >= 0.7 ? 'high' : score < 0.5 ? 'low' : 'mid'
    return {
      id,
      icon,
      label,
      value: Math.round(score * max),
      max,
      pct: Math.round(score * 100),
      tone,
    }
  }
  return [
    mk('heating', '/op-icons/homescore/flame.png', 'Heating', heat, 20),
    mk('structure', '/op-icons/homescore/bricks.png', 'Structure', structure, 25),
    mk('efficiency', '/op-icons/homescore/bulb.png', 'Efficiency', efficiency, 15),
    mk('electrics', '/op-icons/homescore/lightning.png', 'Electrics', electrics, 20),
    mk('plumbing', '/op-icons/misc/waterDroplet.png', 'Plumbing', plumbing, 20),
  ]
})

interface AskRow {
  id: string
  icon: string
  title: string
  sub: string
}
function iconForTitle(title: string): string {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t)) return '/op-icons/homescore/lightning.png'
  if (/solar (?:water|thermal)/.test(t)) return '/op-icons/misc/sun.png'
  if (/(loft|roof)/.test(t)) return '/op-icons/homescore/house.png'
  if (/(cavity|wall)/.test(t)) return '/op-icons/homescore/bricks.png'
  if (/floor/.test(t)) return '/op-icons/homescore/windows.png'
  if (/(led|light)/.test(t)) return '/op-icons/homescore/bulb.png'
  if (/(boiler|heat pump|heating)/.test(t)) return '/op-icons/homescore/flame.png'
  return '✦'
}
const askQuestions = computed<AskRow[]>(() => {
  const recs: any[] = property.value?.epcRecommendations || []
  const out: AskRow[] = []
  recs.slice(0, 3).forEach((r, i) => {
    const title = r?.title || `EPC recommendation ${i + 1}`
    out.push({
      id: r?.id || String(i),
      icon: iconForTitle(title),
      title: `Has the owner done: ${title}?`,
      sub:
        r?.description ||
        `Listed on the EPC. Ask if it's been done since${epcYear.value ? ` ${epcYear.value}` : ''}.`,
    })
  })
  out.push({
    id: 'gas-safety',
    icon: '/op-icons/homescore/flame.png',
    title: 'Do you have a Gas Safety certificate?',
    sub: 'A CP12 from a Gas Safe registered engineer confirms the boiler and gas appliances are safe — ask for the latest one.',
  })
  out.push({
    id: 'eicr',
    icon: '/op-icons/homescore/lightning.png',
    title: 'Do you have an EICR certificate?',
    sub: 'Electrical Installation Condition Report — not legally required, but worth asking.',
  })
  return out
})

// ── Costs tab ──
const heatingCost = computed(
  () => Number(epcField('heatingCostCurrent') ?? 0) || 0,
)
const hotWaterCost = computed(
  () => Number(epcField('hotWaterCostCurrent') ?? 0) || 0,
)
const lightingCost = computed(
  () => Number(epcField('lightingCostCurrent') ?? 0) || 0,
)
// Real water-company regional average (Discover Water 2024/25) from enrichment.
const waterInfo = computed(() => enrichment.value?.water ?? null)
const waterCost = computed(() => Number(waterInfo.value?.annual ?? 430) || 430)
const councilTaxCost = computed(() => {
  const fromEnrich = Number(enrichment.value?.councilTax?.annualEstimate ?? 0)
  if (fromEnrich > 0) return Math.round(fromEnrich)
  const real = Number((property.value as any)?.councilTaxAnnual ?? 0)
  if (real > 0) return Math.round(real)
  const band = (epcField('councilTaxBand') || '').toUpperCase()
  const map: Record<string, number> = {
    A: 1340,
    B: 1564,
    C: 1787,
    D: 2010,
    E: 2457,
    F: 2904,
    G: 3350,
    H: 4020,
  }
  return map[band] ?? 2010
})
const totalAnnual = computed(
  () =>
    Math.round(heatingCost.value) +
    Math.round(hotWaterCost.value) +
    Math.round(lightingCost.value) +
    waterCost.value +
    councilTaxCost.value,
)
interface CostLine {
  id: string
  icon: string
  title: string
  sub: string
  amount: number
}
const costLines = computed<CostLine[]>(() => {
  const lines: CostLine[] = []
  if (heatingCost.value > 0)
    lines.push({
      id: 'heating',
      icon: '/op-icons/homescore/flame.png',
      title: 'Heating',
      sub: epcField('mainheatDescription') || 'EPC figure',
      amount: Math.round(heatingCost.value),
    })
  if (hotWaterCost.value > 0)
    lines.push({
      id: 'hw',
      icon: '/op-icons/misc/waterDroplet.png',
      title: 'Hot water',
      sub: epcField('hotwaterDescription') || 'From main system',
      amount: Math.round(hotWaterCost.value),
    })
  if (lightingCost.value > 0) {
    const ledPct = Number(epcField('lowEnergyLighting') ?? 0)
    lines.push({
      id: 'light',
      icon: '/op-icons/homescore/bulb.png',
      title: 'Lighting',
      sub: ledPct ? `${Math.round(ledPct)}% LED` : 'EPC figure',
      amount: Math.round(lightingCost.value),
    })
  }
  lines.push({
    id: 'water',
    icon: '/op-icons/homescore/tap.png',
    title: 'Water & sewerage',
    sub: waterInfo.value?.company
      ? `${waterInfo.value.company} · regional avg`
      : 'Regional average · unmetered',
    amount: waterCost.value,
  })
  const band = (epcField('councilTaxBand') || '').toUpperCase()
  lines.push({
    id: 'ctax',
    icon: '/op-icons/homescore/house.png',
    title: 'Council tax',
    sub: band
      ? `Band ${band} · ${enrichment.value?.councilTax?.councilName || 'local council'}`
      : 'Estimated',
    amount: councilTaxCost.value,
  })
  return lines
})

// ── Sold tab ──
const estimatedValue = computed(() => {
  const v = Number(enrichment.value?.landRegistryEstimate ?? 0)
  return v > 0 ? v : null
})
const estimateSource = computed(
  () => enrichment.value?.landRegistrySource || 'based on Land Registry data',
)
function fmtSaleDate(d: string): string {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
const saleHistory = computed(() => {
  const arr: any[] = enrichment.value?.salesHistory?.thisProperty || []
  return arr.map((s) => ({
    price: Number(s.price) || 0,
    dateLabel: fmtSaleDate(s.date),
    meta:
      [s.propertyType, s.tenure].filter(Boolean).join(' · ') || 'Recorded sale',
  }))
})
const comparables = computed(() => {
  const arr: any[] = enrichment.value?.salesHistory?.nearbySales || []
  return arr.slice(0, 6).map((s) => ({
    price: Number(s.price) || 0,
    address: s.address || 'Nearby home',
    meta: [s.propertyType, s.tenure].filter(Boolean).join(' · ') || '',
    dateLabel: fmtSaleDate(s.date),
  }))
})
const tenureLabel = computed(() => {
  const t = (epcField('tenure') || '').toString()
  if (/freehold/i.test(t)) return 'Freehold'
  if (/leasehold/i.test(t)) return 'Leasehold'
  return t || 'Available via solicitor'
})

// ── Risks tab ──
const floodRisk = computed<string>(() => enrichment.value?.floodRisk || '')
const floodTone = computed(() => {
  const f = floodRisk.value.toLowerCase()
  if (/high|severe|medium/.test(f)) return 'flag'
  if (/low|very low/.test(f)) return 'clear'
  return 'nodata'
})
const floodLabel = computed(() => floodRisk.value || 'No data')
const floodSub = computed(() =>
  floodRisk.value
    ? `${floodRisk.value} risk across all sources`
    : 'Flood data not available',
)

const listedBuildings = computed<any[]>(() => {
  const direct =
    enrichment.value?.listedBuildings ||
    enrichment.value?.nearby?.listedBuildings ||
    []
  return Array.isArray(direct) ? direct : []
})
const isListed = computed(() => {
  const constraints: any[] =
    enrichment.value?.planningHistory?.constraints || []
  return constraints.some((c) =>
    /listed|conservation/i.test(c?.type || c?.name || ''),
  )
})
const listedTone = computed(() => (isListed.value ? 'note' : 'clear'))
const listedLabel = computed(() => (isListed.value ? 'Listed' : 'None'))
const listedSub = computed(() =>
  isListed.value
    ? 'Heritage constraints on file'
    : 'Not listed · not in a conservation area',
)

const planningApps = computed(() => {
  const apps: any[] = enrichment.value?.planningHistory?.applications || []
  return apps.map((a) => {
    const status = (a.decision || a.status || '').toString()
    const approved = /grant|approv|permit/i.test(status)
    return {
      description: a.description || a.applicationType || 'Planning application',
      status: status || 'On record',
      statusColor: approved ? 'var(--accent-dark)' : 'var(--warning-deep)',
      dateLabel: a.decisionDate ? fmtSaleDate(a.decisionDate) : '',
    }
  })
})

// Ground stability — built from planning.data.gov.uk's `contaminated-land`
// and `mineral-safeguarding-area` constraints (category: 'ground'). There's
// no free Coal Authority point API, so this is partial coverage.
const groundConstraints = computed<any[]>(() => {
  const constraints: any[] =
    enrichment.value?.planningHistory?.constraints || []
  return constraints.filter((c) => c?.category === 'ground')
})
const groundTone = computed(() =>
  groundConstraints.value.length ? 'note' : 'clear',
)
const groundLabel = computed(() =>
  groundConstraints.value.length ? 'Check' : 'None flagged',
)
const groundSub = computed(() => {
  if (!enrichmentLoaded.value) return 'Checking ground records…'
  if (groundConstraints.value.length) {
    return groundConstraints.value.map((c) => c.type).join(', ') + ' on record'
  }
  return 'No contaminated-land or mineral-safeguarding flags · Coal Authority report not connected'
})

interface RiskFlag {
  id: string
  icon: string
  title: string
  sub: string
  status: 'flag' | 'note'
  statusLabel: string
}
const epcRiskFlags = computed<RiskFlag[]>(() => {
  const recs: any[] = property.value?.epcRecommendations || []
  return recs.map((r, i) => {
    const saving = Number(r?.typicalSaving ?? 0)
    const title = r?.title || `EPC recommendation ${i + 1}`
    const status: 'flag' | 'note' = saving >= 100 ? 'flag' : 'note'
    return {
      id: r?.id || `rec-${i}`,
      icon: iconForTitle(title),
      title,
      sub: `${r?.description || 'Listed on the EPC.'}${saving > 0 ? ` Adds ~£${saving}/yr.` : ''}`,
      status,
      statusLabel: status === 'flag' ? 'Flag' : 'Note',
    }
  })
})

// ── Area tab ──
const crime = computed(() => enrichment.value?.crime || null)
const crimePerMonth = computed(() => {
  const t = Number(crime.value?.totalLast12m ?? 0)
  return Math.round(t / 12)
})
const crimeHeadline = computed(() => {
  const m = crimePerMonth.value
  if (m === 0) return 'No reported crime data'
  if (m < 25) return 'Low for an urban area'
  if (m < 60) return 'Around average for area type'
  return 'Higher than average — worth a look'
})
const crimeTrendText = computed(() => {
  const c: any = crime.value
  if (!c || c.yoyChangePct == null) return ''
  const dir = c.trendDirection
  const pct = Math.abs(c.yoyChangePct)
  if (dir === 'up') return `↑ ${pct}% vs prior 6mo`
  if (dir === 'down') return `↓ ${pct}% vs prior 6mo`
  return 'flat vs prior 6mo'
})
const crimeTrendClass = computed(() => {
  const dir = (crime.value as any)?.trendDirection
  // Down = good (green), up = worse (amber).
  return dir === 'down' ? 'trend-good' : dir === 'up' ? 'trend-bad' : ''
})

const crimeByCategory = computed(() => {
  const cats: any[] = crime.value?.byCategory || []
  const max = Math.max(1, ...cats.map((c) => Number(c.count) || 0))
  return [...cats]
    .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
    .slice(0, 6)
    .map((c) => {
      const count = Number(c.count) || 0
      const pct = Math.round((count / max) * 100)
      const tone = pct > 60 ? 'high' : pct > 30 ? 'mid' : 'low'
      return { label: c.label || c.category, count, pct, tone }
    })
})

function fmtDist(km: number): string {
  if (km == null) return ''
  const mi = km * 0.621371
  return mi < 0.1 ? `${Math.round(km * 1000)}m` : `${mi.toFixed(1)} mi`
}
const schools = computed(() => {
  const arr: any[] = enrichment.value?.nearby?.schools || []
  return arr.slice(0, 5).map((s) => ({
    name: s.name || 'School',
    meta: s.category || 'School',
    dist: fmtDist(s.distanceKm),
  }))
})
const broadband = computed(() => {
  const b = enrichment.value?.broadband
  return b && b.available ? b : null
})
const mobileNets = computed(() => {
  const m = enrichment.value?.mobileSignal
  if (!m || !m.available) return []
  const score = (net: any) => {
    if (!net) return 0
    let s = 0
    if (net.voice4g) s += 2
    if (net.data4g) s += 2
    if (net.data5g) s += 1
    return Math.min(5, s)
  }
  return [
    { name: 'EE', bars: score(m.EE) },
    { name: 'O2', bars: score(m.O2) },
    { name: 'Vodafone', bars: score(m.Vodafone) },
    { name: 'Three', bars: score(m.Three) },
  ]
})
const transport = computed(() => {
  const trains: any[] = enrichment.value?.nearby?.trains || []
  const buses: any[] = enrichment.value?.nearby?.busStops || []
  const out: any[] = []
  trains
    .slice(0, 2)
    .forEach((t) =>
      out.push({
        name: t.name || 'Station',
        dist: fmtDist(t.distanceKm),
        kind: 'rail',
      }),
    )
  buses
    .slice(0, 2)
    .forEach((b) =>
      out.push({
        name: b.name || 'Bus stop',
        dist: fmtDist(b.distanceKm),
        kind: 'bus',
      }),
    )
  return out
})
const healthcare = computed(() => {
  const amenities: any[] = enrichment.value?.nearby?.amenities || []
  return amenities
    .filter((a) => /doctor|hospital|pharmacy|clinic|gp/i.test(a.category || ''))
    .slice(0, 4)
    .map((a) => ({
      name: a.name || 'Healthcare',
      dist: fmtDist(a.distanceKm),
      kind: a.category,
    }))
})
// ONS census demographics — not wired yet (NOMIS API planned). Returns
// null so the Neighbourhood card shows its "not connected" note.
const neighbourhood = computed<{ label: string; value: string }[] | null>(
  () => {
    const d = enrichment.value?.demographics
    if (!d) return null
    const rows: { label: string; value: string }[] = []
    if (d.population != null)
      rows.push({ label: 'Population (LSOA)', value: String(d.population) })
    if (d.medianAge != null)
      rows.push({ label: 'Median age', value: String(d.medianAge) })
    if (d.ownerOccupiedPct != null)
      rows.push({ label: 'Owner-occupied', value: `${d.ownerOccupiedPct}%` })
    if (d.deprivationDecile != null)
      rows.push({
        label: 'Deprivation decile',
        value: `${d.deprivationDecile}/10`,
      })
    return rows.length ? rows : null
  },
)

// ── Street tab ──
const streetRank = computed<number | null>(() => streetData.value?.rank ?? null)
const streetTotal = computed<number | null>(
  () => streetData.value?.total ?? null,
)
function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
const streetRankLabel = computed(() => {
  const r = streetRank.value,
    t = streetTotal.value
  if (!r || !t) return ''
  if (r / t <= 0.33)
    return `Top third on this street · ${property.value?.postcode}`
  if (r / t <= 0.5)
    return `Better half of the street · ${property.value?.postcode}`
  if (r / t <= 0.66) return `Around average · ${property.value?.postcode}`
  return `Below average · ${property.value?.postcode}`
})
const streetCallout = computed(() => {
  const best = streetData.value?.bestCost,
    yours = streetData.value?.yourCost
  if (!best || !yours) return ''
  const diff = Math.max(0, Math.round(yours - best))
  if (diff <= 0) return ''
  return `The top homes on this street pay roughly <b>£${diff}/yr less</b>. The EPC pathway could close most of that gap.`
})
interface StreetBar {
  label: string
  cost: number
  pct: number
  tone: 'good' | 'avg' | 'mid' | 'you'
  isYou: boolean
}
const streetBars = computed<StreetBar[]>(() => {
  const neighbours: any[] = streetData.value?.neighbours || []
  const yours = Number(streetData.value?.yourCost ?? 0)
  if (!neighbours.length && !yours) return []
  const allCosts = [
    ...neighbours.map((n: any) => Number(n.cost) || 0),
    yours,
    Number(streetData.value?.averageCost ?? 0),
  ].filter((x) => x > 0)
  const max = allCosts.length ? Math.max(...allCosts) : 1
  const rows: StreetBar[] = neighbours.map((n: any) => {
    const cost = Number(n.cost) || 0
    let tone: StreetBar['tone'] = 'mid'
    if (cost <= max * 0.55) tone = 'good'
    else if (cost <= max * 0.7) tone = 'avg'
    return {
      label: n.label || 'Neighbour',
      cost,
      pct: Math.round((cost / max) * 100),
      tone,
      isYou: false,
    }
  })
  if (yours > 0)
    rows.push({
      label: 'You',
      cost: yours,
      pct: Math.round((yours / max) * 100),
      tone: 'you',
      isYou: true,
    })
  if (streetData.value?.averageCost) {
    const avg = Number(streetData.value.averageCost)
    rows.push({
      label: 'PC avg',
      cost: avg,
      pct: Math.round((avg / max) * 100),
      tone: 'avg',
      isYou: false,
    })
  }
  rows.sort((a, b) => a.cost - b.cost)
  return rows
})

// ── Buyer confidence ──
// "Compared to area" — real comparison using the same street-rank data the
// Street tab already shows, not a fabricated value. Null when there isn't
// enough enriched-neighbour data yet, so the template can show a dash.
const bsAreaLabel = computed<string | null>(() => {
  const r = streetRank.value,
    t = streetTotal.value
  if (!r || !t) return null
  return r / t <= 0.5 ? 'Below average' : 'Above average'
})
const bsAreaSubtext = computed<string | null>(() => {
  if (bsAreaLabel.value === 'Below average') return 'Lower running costs than similar homes'
  if (bsAreaLabel.value === 'Above average') return 'Higher running costs than similar homes'
  return null
})

// "£X below/above street average" — same averageCost the Street tab's
// bars already use, compared against this property's own running cost.
const bsCostVsAreaGood = computed<boolean | null>(() => {
  const avg = Number(streetData.value?.averageCost ?? 0)
  const yours = Number(totalAnnual.value ?? 0)
  if (!avg || !yours) return null
  return yours < avg
})
const bsCostVsAreaLabel = computed<string | null>(() => {
  const avg = Number(streetData.value?.averageCost ?? 0)
  const yours = Number(totalAnnual.value ?? 0)
  if (!avg || !yours) return null
  const diff = Math.round(Math.abs(yours - avg))
  if (diff === 0) return null
  return `£${diff} ${yours < avg ? 'below' : 'above'} street average`
})

// "Areas worth checking" — count of the 5 EPC pillars (heating, structure,
// efficiency, electrics, plumbing) epcStats already flags as 'low', not a
// decorative number.
const bsWorthCheckingCount = computed(
  () => epcStats.value.filter((s) => s.tone === 'low').length,
)

const confidenceTitle = computed(() => {
  const recs: any[] = property.value?.epcRecommendations || []
  const flagCount = recs.filter((r) =>
    /insulation|cavity|loft|floor|wall/i.test(r?.title || ''),
  ).length
  const score = displayScore.value
  if (!score) return 'No EPC on the public register'
  // Match the prototype's cautious framing: whenever the EPC flags fabric
  // issues, lead with "Worth investigating — N insulation flag(s)".
  if (flagCount) {
    return `Worth investigating — ${flagCount} insulation flag${flagCount > 1 ? 's' : ''}`
  }
  if (score >= 80) return 'Strong public record — minimal flags'
  if (score >= 60) return 'Above average public record'
  if (score >= 40) return 'Worth investigating'
  return 'Investigate before offering'
})

// Unclaimed claim CTA → property page with the "Choose your Passport" drawer
// auto-opened. Guests sign in first and resume there.
function goToClaimPassport() {
  const target = `/property/${propertyId.value}?claim=1`
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try { localStorage.setItem('redirectAfterLogin', target) } catch {}
    router.push('/onboarding/signin')
    return
  }
  router.push(target)
}

// Header card's passport-status pill — claim if nobody's started one yet,
// otherwise route to the same "buy/unlock" flow the rest of the page uses.
function onPassportPillClick() {
  if (passportState.value === 'unclaimed') {
    goToClaimPassport()
    return
  }
  goToBuyPassport()
}

// In-progress / published "buy the Passport" CTA → property page with the
// £99 unlock drawer auto-opened.
function goToBuyPassport() {
  const target = `/property/${propertyId.value}?unlock=1`
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try { localStorage.setItem('redirectAfterLogin', target) } catch {}
    router.push('/onboarding/signin')
    return
  }
  router.push(target)
}
// "See what verification gets you" → open the verify drawer (prototype modal).
const verifyDrawerOpen = ref(false)
function onVerify() {
  verifyDrawerOpen.value = true
}
// Start verification → buyer-profile verification steps. Guests sign in first
// and resume on the build flow.
function onVerifyStart() {
  verifyDrawerOpen.value = false
  const target = '/buyer-profile/build'
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try {
      localStorage.setItem('redirectAfterLogin', target)
    } catch {}
    router.push('/onboarding/signin')
    return
  }
  router.push(target)
}
// "Watch this property" / "Register interest" both open the watch drawer.
const watchDrawerOpen = ref(false)
function onWatch() {
  watchDrawerOpen.value = true
}
function onRegister() {
  watchDrawerOpen.value = true
}
// Drawer submit: persist the per-event notification prefs, then show the
// celebratory confirmation drawer in place (matching the "You're watching…"
// prototype) instead of navigating away. Guests sign in first and resume
// back here — the watch itself only gets saved once they're authed.
const watchConfirmedOpen = ref(false)
const watchConfirmedPrefs = ref<Record<string, boolean> | null>(null)
async function onWatchSubmit(prefs: Record<string, boolean>) {
  watchDrawerOpen.value = false
  // Guests land on the property page after sign-in — it already has a
  // ?watched=1 handler that persists the watch there. Prefs aren't carried
  // through that round-trip (pre-existing limitation), same as elsewhere.
  const target = `/property/${propertyId.value}?watched=1`
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try {
      localStorage.setItem('redirectAfterLogin', target)
    } catch {}
    router.push('/onboarding/signin')
    return
  }
  try {
    await fetch(`${config.public.apiBase}/property/${propertyId.value}/watch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(prefs),
    })
  } catch {}
  watchConfirmedPrefs.value = prefs
  watchConfirmedOpen.value = true
}

// "Create my Buyer Passport" CTA on the watch-confirmed drawer.
function goToBuildBuyerPassport() {
  watchConfirmedOpen.value = false
  const target = '/buyer-profile/build'
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try { localStorage.setItem('redirectAfterLogin', target) } catch {}
    router.push('/onboarding/signin')
    return
  }
  router.push(target)
}
// Open / buy the published Passport.
function onBuyPassport() {
  const pid = passportStatus.value?.passportId
  if (pid) router.push(`/passportview/${pid}`)
  else router.push(`/property/${propertyId.value}`)
}
</script>

<style scoped>
.inline-ic {
  width: 14px;
  height: 14px;
  object-fit: contain;
  vertical-align: -2px;
  display: inline-block;
  margin-right: 2px;
}
.hs-buyer {
  --primary: #231d45;
  --primary-2: #352d5c;
  --primary-3: #15102e;
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
  --warning-pale: #fff5e0;
  --warning-deep: #7a5500;
  --error: #e74c5e;
  --error-light: #f08594;
  --error-pale: #fcebea;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Soften weights to match the app */
.hs-buyer
  :is(
    .app-header-title,
    .hs-addr-line,
    .buyer-conf-title,
    .buyer-conf-num,
    .stat-value,
    .cost-total-num,
    .cost-line-title,
    .cost-line-amt,
    .risk-title,
    .street-rank-big,
    .street-bar-amt,
    .buyer-action-title,
    .br-card-title,
    .br-card-val,
    .sold-chart-h-est,
    .comp-row-addr,
    .comp-row-price,
    .tab-hero-stat-big,
    .bb-num,
    .school-name,
    .section-h
  ) {
  font-weight: 700;
}

@keyframes hs-buyer-fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim-1 {
  animation: hs-buyer-fade 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-2 {
  animation: hs-buyer-fade 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-3 {
  animation: hs-buyer-fade 0.35s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-4 {
  animation: hs-buyer-fade 0.35s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-5 {
  animation: hs-buyer-fade 0.35s 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: transparent;
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
  font-family: inherit;
}
.back-btn svg {
  width: 16px;
  height: 16px;
}
.app-header-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}
.app-header-spacer {
  width: 36px;
  flex-shrink: 0;
}
.app-header-title {
  font-size: 15px;
  color: var(--text);
  letter-spacing: -0.2px;
}
.app-header-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Amber address card */
.hs-addr-card-wrap {
  margin: 14px 20px 0;
}
.hs-addr-card {
  margin: 14px 20px 0;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  border-radius: 14px;
  color: white;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
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
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 65%
  );
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
  color: white;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 2px;
}
.hs-addr-meta {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
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
  font-weight: 700;
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
.epc-letter {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
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
  font-weight: 700;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.35);
}
.claim-cta-btn svg {
  width: 14px;
  height: 14px;
  color: white;
}
.claim-cta-btn.published {
  background: white;
  color: #8b4e0a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.claim-cta-btn.published svg {
  color: #8b4e0a;
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
.hs-addr-stat-count {
  font-weight: 700;
  color: white;
}

/* Buyer confidence */
.buyer-conf {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.buyer-conf-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.buyer-conf-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--warning-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.buyer-conf-info {
  flex: 1;
}
.buyer-conf-eyebrow {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.buyer-conf-eyebrow-ic {
  width: 13px;
  height: 13px;
  object-fit: contain;
}
.buyer-conf-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
}
.buyer-conf-title span {
  font-weight: 600;
  color: var(--text-secondary);
}
.buyer-conf-desc {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 5px;
}
.buyer-conf-num {
  font-size: 18px;
  color: var(--warning-deep);
  letter-spacing: -0.3px;
}
.buyer-conf-stats {
  display: flex;
  align-items: flex-start;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft, var(--border));
}
.buyer-conf-stat {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
  padding: 0 6px;
}
.buyer-conf-stat + .buyer-conf-stat {
  border-left: 1px solid var(--border-soft, var(--border));
}
.buyer-conf-stat-text {
  min-width: 0;
}
.buyer-conf-stat-ic {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 1px;
}
.buyer-conf-stat-label {
  font-size: 9.5px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.3;
}
.buyer-conf-stat-val {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-top: 3px;
}
.buyer-conf-stat-val span {
  font-size: 9.5px;
  font-weight: 600;
  color: var(--text-secondary);
}
.buyer-conf-stat-sub {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.3;
  margin-top: 3px;
}
.buyer-conf-stat-sub.good {
  color: var(--accent, #00a19a);
}
.buyer-conf-dial {
  position: relative;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
}
.buyer-conf-dial svg {
  width: 100%;
  height: 100%;
}
.buyer-conf-dial-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -0.3px;
}

/* Tabs */
.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 4px;
  margin: 14px 20px 0;
  box-shadow: var(--shadow-card);
}
.tab-bar.scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
.tab-bar.scroll::-webkit-scrollbar {
  display: none;
}
.tab-btn {
  flex: 0 0 auto;
  padding: 9px 14px;
  font-size: 11.5px;
  font-weight: 700;
  border: none;
  background: transparent;
  border-radius: 100px;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: inherit;
  white-space: nowrap;
}
.tab-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.25);
}
.tab-panels {
  padding: 14px 20px 0;
}
.tab-panel {
  animation: hs-buyer-fade 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.tab-note {
  margin-top: 8px;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Source tags */
.src-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 8px;
  background: var(--bg);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 100px;
}
.src-tag::before {
  content: '🔗';
  font-size: 9px;
}
.src-tag.teal {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border-color: var(--accent-pale);
}
.src-tag.light {
  background: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Energy / stats */
.stats-card {
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.stats-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.stats-card-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.stats-card-intro {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
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
}
.stat-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.stat-bar-fill.high {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.stat-bar-fill.mid {
  background: linear-gradient(90deg, var(--warning), #f0b933);
}
.stat-bar-fill.low {
  background: linear-gradient(90deg, var(--error), var(--error-light));
}
.stat-value {
  width: 46px;
  text-align: right;
  font-size: 11px;
  color: var(--text);
  flex-shrink: 0;
}
.stat-value.v-high {
  color: var(--accent-dark);
}
.stat-value.v-low {
  color: var(--error);
}
.stat-value.v-mid {
  color: var(--warning-deep);
}
.stats-note {
  padding: 10px 12px;
  background: var(--warning-pale);
  border: 1px solid rgba(245, 166, 35, 0.3);
  border-radius: 10px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--warning-deep);
  font-weight: 500;
  line-height: 1.4;
}
.section-h {
  margin-top: 14px;
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 6px 0 10px;
}
.section-h:has(+ .section-h-sub) {
  padding-bottom: 2px;
}
.section-h-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  padding-bottom: 10px;
}
.questions-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
}
.ask-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}
.ask-row:last-child {
  border-bottom: none;
}
.ask-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.ask-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.ask-sub {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Costs */
.cost-total-card {
  padding: 18px 18px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border-radius: 14px;
  color: white;
  margin-bottom: 10px;
  box-shadow: 0 8px 24px rgba(0, 161, 154, 0.25);
  position: relative;
  overflow: hidden;
}
.cost-total-card::after {
  content: '';
  position: absolute;
  top: -30%;
  right: -15%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.18) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.cost-total-card > * {
  position: relative;
  z-index: 1;
}
.cost-total-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
  font-weight: 700;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  display: inline-block;
}
.pulse-dot.white {
  background: white;
}
.cost-total-num {
  font-size: 32px;
  letter-spacing: -1px;
  line-height: 1;
}
.cost-total-num span {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}
.cost-total-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6px;
}
.cost-total-srcs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.cost-line {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 6px;
  box-shadow: var(--shadow-card);
}
.cost-line-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.cost-line-info {
  flex: 1;
  min-width: 0;
}
.cost-line-title {
  font-size: 12.5px;
  color: var(--text);
}
.cost-line-sub {
  font-size: 10.5px;
  color: var(--text-secondary);
  margin-top: 1px;
}
.cost-line-amt {
  font-size: 13px;
  color: var(--text);
  letter-spacing: -0.2px;
  text-align: right;
}
.cost-line-amt-sub {
  font-size: 9.5px;
  color: var(--text-faint);
  margin-top: 1px;
  text-align: right;
}

/* Expandable br-card */
.br-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  margin-bottom: 10px;
  overflow: hidden;
}
.br-card.open {
  box-shadow: 0 8px 20px rgba(35, 29, 69, 0.1);
  border-color: var(--accent-pale);
}
.br-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  cursor: pointer;
}
.br-card-head:hover {
  background: var(--accent-paler);
}
.br-card-ico {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.br-card-ico.teal {
  background: linear-gradient(135deg, var(--accent-paler), var(--accent-pale));
  color: var(--accent-dark);
}
.br-card-info {
  flex: 1;
  min-width: 0;
}
.br-card-title {
  font-size: 13.5px;
  color: var(--text);
  letter-spacing: -0.2px;
}
.br-card-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.br-card-val {
  font-size: 14px;
  color: var(--text);
  letter-spacing: -0.3px;
  text-align: right;
  flex-shrink: 0;
}
.br-card-val.accent {
  color: var(--accent-dark);
}
.br-card-chev {
  font-size: 14px;
  color: var(--text-faint);
  font-weight: 700;
  margin-left: 6px;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.br-card.open .br-card-chev {
  transform: rotate(90deg);
  color: var(--accent-dark);
}
.br-card-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.br-card-body.open {
  max-height: 900px;
}
.br-card-body-inner {
  padding: 12px 16px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
  border-top: 1px dashed var(--border-soft);
}
.br-card-body-inner :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.br-card-srcrow {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 10px;
  border-top: 1px dashed var(--border-soft);
}
.br-card-srcrow-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-right: 4px;
}

/* Sold chart */
.sold-chart {
  background: linear-gradient(135deg, var(--accent-paler), var(--card) 80%);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
}
.sold-chart-h {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.sold-chart-h-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.sold-chart-h-est {
  font-size: 18px;
  color: var(--accent-dark);
  letter-spacing: -0.4px;
}
.sold-chart-h-est small {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  display: block;
}

/* Comparable rows */
.comp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.comp-row + .comp-row {
  border-top: 1px dashed var(--border-soft);
}
.comp-row-info {
  flex: 1;
  min-width: 0;
}
.comp-row-addr {
  font-size: 12px;
  color: var(--text);
}
.comp-row-meta {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 1px;
}
.comp-row-price {
  font-size: 14px;
  color: var(--accent-dark);
  letter-spacing: -0.2px;
  text-align: right;
}
.comp-row-date {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-faint);
  text-align: right;
  margin-top: 1px;
}

/* Risks */
.risk-srcs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-bottom: 10px;
}
.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-card);
}
.risk-item.col {
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
}
.risk-item-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.risk-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.risk-icon.clear {
  background: var(--accent-paler);
}
.risk-icon.note {
  background: var(--warning-pale);
}
.risk-icon.flag {
  background: var(--error-pale);
}
.risk-icon.nodata {
  background: var(--bg);
}
.risk-body {
  flex: 1;
  min-width: 0;
}
.risk-title {
  font-size: 13px;
  color: var(--text);
}
.risk-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.risk-status {
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.risk-status.clear {
  color: var(--accent-dark);
}
.risk-status.note {
  color: var(--warning);
}
.risk-status.flag {
  color: var(--error);
}
.risk-status.nodata {
  color: var(--text-faint);
}
.risk-drill {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-soft);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.risk-drill :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.risk-drill-note {
  margin-top: 6px;
  color: var(--text-faint);
  font-size: 11px;
}

/* Area · hero stat */
.tab-hero-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
}
.tab-hero-stat-big {
  font-size: 30px;
  color: var(--accent-dark);
  letter-spacing: -1px;
  line-height: 1;
}
.tab-hero-stat-big small {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}
.tab-hero-stat-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 4px;
}
.tab-hero-stat-body {
  flex: 1;
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid var(--border-soft);
}
.tab-hero-stat-headline {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}
.tab-hero-stat-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
}
.trend-good {
  color: var(--accent-dark);
  font-weight: 700;
}
.trend-bad {
  color: var(--warning-deep);
  font-weight: 700;
}

/* Crime */
.crime-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}
.crime-row + .crime-row {
  border-top: 1px dashed var(--border-soft);
}
.crime-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  flex: 1;
}
.crime-bar {
  width: 80px;
  height: 5px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
}
.crime-bar-fill {
  height: 100%;
  border-radius: 100px;
}
.crime-bar-fill.low {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.crime-bar-fill.mid {
  background: linear-gradient(90deg, #ffd58a, var(--warning));
}
.crime-bar-fill.high {
  background: linear-gradient(90deg, #f87171, var(--error));
}
.crime-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  min-width: 34px;
  text-align: right;
}

/* Schools */
.school-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
}
.school-row + .school-row {
  border-top: 1px dashed var(--border-soft);
}
.school-ofsted {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 8.5px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  line-height: 1.1;
  padding: 3px;
  text-align: center;
}
.school-ofsted.nodata {
  background: var(--bg);
  color: var(--text-faint);
}
.school-ofsted big {
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}
.school-info {
  flex: 1;
  min-width: 0;
}
.school-name {
  font-size: 12.5px;
  color: var(--text);
  letter-spacing: -0.1px;
}
.school-meta {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 1px;
}
.school-dist {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-dark);
  text-align: right;
  flex-shrink: 0;
}

/* Broadband / mobile */
.bb-card {
  padding: 14px 16px;
  background: linear-gradient(135deg, #e6eefb, var(--card));
  border: 1px solid #c7e0ff;
  border-radius: 12px;
}
.bb-speed {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}
.bb-num {
  font-size: 28px;
  color: #1a1f71;
  letter-spacing: -0.7px;
  line-height: 1;
}
.bb-unit {
  font-size: 13px;
  font-weight: 700;
  color: #2d68c4;
}
.bb-bars {
  display: flex;
  gap: 4px;
}
.bb-bars i {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #d5ddf0;
}
.bb-bars i.on {
  background: linear-gradient(90deg, #2d68c4, #1a1f71);
}
.bb-mobile-h {
  margin-top: 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.bb-net-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text);
}
.bb-net-row + .bb-net-row {
  border-top: 1px dashed var(--border-soft);
}
.bb-net-name {
  display: flex;
  align-items: center;
  gap: 7px;
}
.bb-cov {
  display: flex;
  gap: 3px;
}
.bb-cov i {
  width: 5px;
  height: 8px;
  border-radius: 1px;
  background: var(--border);
}
.bb-cov i.on {
  background: var(--accent);
}

/* Street */
.street-rank-hero {
  padding: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-card);
  text-align: center;
}
.street-rank-big {
  font-size: 42px;
  color: var(--error);
  letter-spacing: -1.5px;
  line-height: 1;
}
.street-rank-big span {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-left: 4px;
}
.street-rank-small {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
  font-weight: 500;
}
.street-rank-callout {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
}
.street-rank-callout :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.street-bars {
  padding: 12px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.street-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}
.street-bar-row.you-row {
  background: var(--error-pale);
  border-radius: 8px;
  padding: 6px 8px;
  margin: 2px -2px;
}
.street-bar-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  width: 50px;
  flex-shrink: 0;
  text-align: right;
}
.street-bar-label.you {
  color: var(--error);
}
.street-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
}
.street-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.street-bar-fill.you {
  background: var(--error);
}
.street-bar-fill.good {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.street-bar-fill.avg {
  background: var(--accent);
}
.street-bar-fill.mid {
  background: var(--warning);
}
.street-bar-amt {
  font-size: 10.5px;
  width: 52px;
  flex-shrink: 0;
  text-align: right;
  color: var(--text);
}
.street-bar-amt.you {
  color: var(--error);
}

/* Empty-state note inside cards */
.br-empty-note {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  padding: 4px 0;
}
.sold-chart-h-est.muted {
  color: var(--text-faint);
}
.sold-chart-h-est.muted small {
  color: var(--text-faint);
}

/* ── State-aware buyer sections ── */
.state-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 20px 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fdf3e0, var(--card));
  border: 1.5px solid rgba(245, 166, 35, 0.3);
  border-radius: 14px;
}
.state-banner.in-progress {
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border-color: var(--accent-pale);
}
.state-banner.published {
  background: linear-gradient(135deg, #e6f0ff, var(--card));
  border-color: #c7e0ff;
}
.state-banner-ico {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffd58a, var(--warning));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(245, 166, 35, 0.25);
}
.state-banner.in-progress .state-banner-ico {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.25);
}
.state-banner.published .state-banner-ico {
  background: linear-gradient(135deg, #5b8def, #1a1f71);
  box-shadow: 0 4px 10px rgba(45, 104, 196, 0.3);
}
.state-banner-body {
  flex: 1;
  min-width: 0;
}
.state-banner-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--warning-deep);
  letter-spacing: -0.1px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.state-banner.in-progress .state-banner-title {
  color: var(--accent-dark);
}
.state-banner.published .state-banner-title {
  color: #1a1f71;
}
.state-banner-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.state-banner-sub :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.state-banner-pill {
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 8px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 100px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.watch-card {
  margin: 14px 20px 0;
  /* padding: 18px; */
}
.watch-card-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.watch-card-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 6px;
}
.watch-card-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 14px;
}
.watch-card-sub :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.watch-trigger {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}
.watch-trigger + .watch-trigger {
  border-top: 1px dashed var(--border-soft);
}
.watch-trigger-ico {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.watch-trigger-body {
  flex: 1;
}
.watch-trigger-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.1px;
}
.watch-trigger-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.watch-trigger-sub :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.watch-cta {
  width: 100%;
  margin-top: 14px;
  padding: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.2s;
}
.watch-cta:hover {
  filter: brightness(1.06);
}
.watch-cta-note {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  text-align: center;
}

.pp-progress-hero {
  margin: 14px 20px 0;
  padding: 18px;
  background: linear-gradient(140deg, #2d2466 0%, #231d45 55%, #15102e 100%);
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 36px -10px rgba(35, 29, 69, 0.4);
}
.pp-progress-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 184, 176, 0.22), transparent 65%);
  pointer-events: none;
}
.pp-progress-hero > * {
  position: relative;
  z-index: 1;
}
.pp-progress-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.pp-progress-pct-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.pp-progress-pct {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1;
  color: #5eead4;
}
.pp-progress-frac {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
}
.pp-progress-bar {
  height: 8px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.14);
  overflow: hidden;
  margin: 10px 0 6px;
}
.pp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5eead4, var(--accent));
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.pp-progress-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.45;
}
.pp-progress-sub :deep(b) {
  color: #ffd58a;
  font-weight: 700;
}

.buy-pp-card {
  margin: 14px 20px 0;
  padding: 18px;
  background: var(--card);
  border: 1.5px solid var(--accent-pale);
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.1);
  position: relative;
  overflow: hidden;
}
.buy-pp-card::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.08), transparent 65%);
  pointer-events: none;
}
.buy-pp-card > * {
  position: relative;
  z-index: 1;
}
.buy-pp-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.buy-pp-badge {
  width: 40px;
  height: 48px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.3);
}
.buy-pp-grade {
  font-size: 9.5px;
  font-weight: 700;
  padding: 6px 11px;
  background: var(--primary);
  color: white;
  border-radius: 100px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(35, 29, 69, 0.25);
}
.buy-pp-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin-bottom: 6px;
}
.buy-pp-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 14px;
}
.buy-pp-sub :deep(b) {
  font-weight: 700;
}
.buy-pp-inside {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.buy-pp-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text);
  padding: 8px 10px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
}
.buy-pp-item-tick {
  color: var(--accent-dark);
  font-weight: 900;
  flex-shrink: 0;
}
.buy-pp-pricerow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border: 1px solid var(--accent-pale);
  border-radius: 12px;
  margin-bottom: 14px;
}
.buy-pp-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-dark);
  letter-spacing: -0.6px;
}
.buy-pp-price small {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}
.buy-pp-pricenote {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.4;
}
.buy-pp-pricenote :deep(b) {
  color: var(--accent-dark);
  font-weight: 700;
}
.buy-pp-cta {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s;
}
.buy-pp-cta:hover {
  filter: brightness(1.06);
}

.qoffer-card {
  margin: 14px 20px 0;
  padding: 16px 18px;
  background: linear-gradient(140deg, var(--primary), var(--primary-2));
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 14px 32px -10px rgba(35, 29, 69, 0.4);
}
.qoffer-card::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: -15%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 193, 89, 0.18),
    transparent 65%
  );
}
.qoffer-card > * {
  position: relative;
  z-index: 1;
}
.qoffer-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.qoffer-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1.2;
  margin-bottom: 5px;
}
.qoffer-sub {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.45;
  margin-bottom: 14px;
}
.qoffer-sub :deep(b) {
  font-weight: 700;
}
.qoffer-cta {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.qoffer-cta:hover {
  background: rgba(255, 255, 255, 0.22);
}
.qoffer-cta.locked {
  opacity: 0.7;
}

.verify-card {
  margin: 14px 20px 0;
  padding: 18px;
  background: linear-gradient(
    140deg,
    var(--primary) 0%,
    var(--primary-2) 60%,
    var(--primary-3) 100%
  );
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 36px -10px rgba(35, 29, 69, 0.4);
}
.verify-card::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.22), transparent 65%);
  pointer-events: none;
}
.verify-card > * {
  position: relative;
  z-index: 1;
}
.verify-card-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.verify-card-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 6px;
}
.verify-card-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
  margin-bottom: 14px;
}
.verify-card-sub :deep(b) {
  font-weight: 700;
}
.verify-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.verify-stat {
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  text-align: center;
}
.verify-stat-num {
  font-size: 18px;
  font-weight: 700;
  color: #ffd58a;
  letter-spacing: -0.4px;
  line-height: 1;
}
.verify-stat-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-top: 4px;
  line-height: 1.2;
}
.verify-cta {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s;
}
.verify-cta:hover {
  filter: brightness(1.06);
}

/* 3D icon images that replaced flat emoji inside icon wrappers */
.buyer-conf-icon img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  display: block;
}
.br-card-ico img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}
.risk-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}
.stat-icon {
  height: 20px;
}
.stat-icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
.ask-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ask-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.cost-line-icon img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}
.watch-trigger-ico img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}
.state-banner-ico img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}
.buy-pp-badge img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}
</style>
