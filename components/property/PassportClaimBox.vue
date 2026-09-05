<template>
  <div class="pcb">
    <!-- ── State box (replaces the old "Is this your property?" CTA) ── -->
    <!-- Tapping anywhere on the box now opens the explainer drawer first;
         the in-drawer "Claim it free" button is where the actual auth
         gate fires. Matches the in-progress / published boxes below.
         In `headless` mode the visible box is suppressed and the drawer
         is controlled entirely from the outside via `v-model:open-sheet`
         — used by callers (e.g. the property detail page) that already
         have their own "Claim this property" trigger button. -->
    <button
      v-if="state === 'unclaimed' && !headless"
      class="pcb-box"
      type="button"
      style="background: linear-gradient(135deg, #2d2456, #231d45)"
      @click="openSheet = 'unclaimed'"
    >
      <div class="pcb-left">
        <div class="pcb-main">This property is unclaimed</div>
        <div class="pcb-sub">
          Is it yours? Build your verified Passport in minutes.
        </div>
        <span class="pcb-explain" @click.stop="openSheet = 'unclaimed'">
          What does it mean to claim? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-arrow">→</div>
    </button>

    <button
      v-else-if="state === 'inProgress' && !headless"
      class="pcb-box"
      type="button"
      style="
        background: linear-gradient(
          135deg,
          #4dd4ce 0%,
          #00a19a 45%,
          #006e68 100%
        );
      "
      @click="openSheet = 'progress'"
    >
      <div class="pcb-left">
        <div class="pcb-main">A Passport is being built for this home</div>
        <div class="pcb-sub">
          The owner is preparing a verified record - be ready before it goes
          live.
        </div>
        <span class="pcb-explain" @click.stop="openSheet = 'progress'">
          What is a Passport in progress? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-ring">
        <svg viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="rgba(255,255,255,0.30)"
            stroke-width="4.5"
            fill="none"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="#fff"
            stroke-width="4.5"
            fill="none"
            stroke-dasharray="125.66"
            :stroke-dashoffset="125.66 - (pct / 100) * 125.66"
            stroke-linecap="round"
            transform="rotate(-90 25 25)"
          />
        </svg>
        <span>{{ pct }}<small>%</small></span>
      </div>
    </button>

    <!-- Published-passport "champagne band" — animated gold conic-gradient
         border + sheen sweep, ported from prisma/published-band-standalone.html.
         The card itself is white so the verified record feels premium /
         document-like, distinct from the dark unclaimed and in-progress
         bands. -->
    <button
      v-else-if="!headless"
      class="pcb-pubwrap"
      type="button"
      @click="openSheet = 'published'"
    >
      <div class="pcb-pub">
        <div class="pcb-pub-body">
          <div class="pcb-pub-title">
            This property has a published Passport
          </div>
          <div class="pcb-pub-sub">
            Gain access to the full verified record - certificates, history
            &amp; more.
          </div>
          <span class="pcb-pub-inside" @click.stop="openSheet = 'published'">
            What's inside the Passport? <span class="pcb-pub-q">?</span>
          </span>
        </div>
        <div class="pcb-pub-price">
          <span class="pcb-pub-amt">£99</span>
          <span class="pcb-pub-arrow">→</span>
        </div>
      </div>
    </button>

    <!-- ── Explainer drawers ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="cxd">
        <div
          v-if="openSheet"
          class="cxd-overlay"
          @click.self="openSheet = null"
        >
          <div class="cxd-sheet" @click.stop>
            <div class="cxd-grip" />

            <!-- UNCLAIMED — content mirrors prisma/property-passport-let-it-prototype.html
                 (Screen 0 / TUTORIAL). Five steps now (Claim · Ownership ·
                 Passport · Build · Publish) rather than the older four, and
                 the callout is the "Every car has a logbook" framing. -->
            <template v-if="openSheet === 'unclaimed'">
              <div class="cx2-header">
                <div class="cx2-header-text">
                  <div class="cx2-eyebrow-row">
                    <div class="cx2-eyebrow">Property Passport™</div>
                    <span class="cx2-state-pill cx2-state-pill--unclaimed"
                      >Unclaimed</span
                    >
                  </div>
                  <div class="cx2-title">Your home's permanent record.</div>
                  <div class="cx2-subtitle">
                    Build it once. Keep it for life.
                  </div>
                  <div class="cx2-body">
                    A Property Passport brings all your important information
                    together in one secure, verified record that stays with your
                    home.
                  </div>
                </div>
                <div class="cx2-header-illustration">
                  <img
                    src="/op-icons/passport-covers/property_passport_teal_tilted_left_on_tile.png"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>
              <div class="cx-stats cx-stats--4col">
                <div class="cx-stat">
                  <img
                    src="/op-icons/investment/priceTagPound2.png"
                    alt=""
                    class="cx-stat-ic"
                    loading="lazy"
                  />
                  <div class="cx-stat-num">Free</div>
                  <div class="cx-stat-label">Property Passport</div>
                </div>
                <div class="cx-stat">
                  <img
                    src="/op-icons/calendar/clock.png"
                    alt=""
                    class="cx-stat-ic"
                    loading="lazy"
                  />
                  <div class="cx-stat-num">2 min</div>
                  <div class="cx-stat-label">To claim your home</div>
                </div>
                <div class="cx-stat">
                  <img
                    src="/op-icons/calendar/shield.png"
                    alt=""
                    class="cx-stat-ic"
                    loading="lazy"
                  />
                  <div class="cx-stat-num">For life</div>
                  <div class="cx-stat-label">Stays with the property</div>
                </div>
                <div class="cx-stat">
                  <img
                    src="/op-icons/investment/key.png"
                    alt=""
                    class="cx-stat-ic"
                    loading="lazy"
                  />
                  <div class="cx-stat-num">Ready</div>
                  <div class="cx-stat-label">When you sell or let</div>
                </div>
              </div>
              <div class="cx-callout navy cx-callout--car">
                <div class="cx-callout-body">
                  <div class="cx-callout-h">
                    Every car has a logbook - your home should too
                  </div>
                  <div class="cx-callout-v">
                    A car's history follows it from owner to owner. Your home's
                    important information is scattered across emails, drawers
                    and different organisations. A Property Passport brings it
                    together into one <b>permanent, verified record</b>.
                  </div>
                </div>
                <img
                  src="/op-icons/misc/carWithLogBook.png"
                  alt=""
                  class="cx-callout-car"
                  loading="lazy"
                />
              </div>
              <div class="cx-section-h">
                Your Passport journey · tap to learn more
              </div>
              <div class="cx-steps">
                <template v-for="(s, i) in unclaimedSteps" :key="s.n">
                  <div
                    class="cx-step cx-step-tap"
                    :class="{ active: activeStep === s.n }"
                    :style="{ '--cx-step-i': i }"
                    @click="activeStep = activeStep === s.n ? null : s.n"
                  >
                    <div class="cx-step-num" :class="s.n === 1 ? 'on' : 'off'">
                      {{ s.n }}
                    </div>
                    <div class="cx-step-name" :class="{ off: s.n !== 1 }">
                      {{ s.name }}
                    </div>
                  </div>
                  <div
                    v-if="i < unclaimedSteps.length - 1"
                    class="cx-step-line"
                  />
                </template>
              </div>
              <Transition name="cx-detail">
                <div v-if="activeStepData" class="cx-step-detail">
                  <div class="cx-step-detail-icon">
                    <img :src="activeStepData.icon" alt="" loading="lazy" />
                  </div>
                  <div class="cx-step-detail-body">
                    <div class="cx-step-detail-h">{{ activeStepData.h }}</div>
                    <div class="cx-step-detail-v">{{ activeStepData.v }}</div>
                    <div class="cx-step-detail-happens">
                      <strong>What happens:</strong>
                      {{ activeStepData.happens }}
                    </div>
                  </div>
                </div>
              </Transition>
              <div class="cx2-secure">
                <div class="cx2-secure-ic-wrap">
                  <img
                    src="/op-icons/investment/padlock.png"
                    alt=""
                    class="cx2-secure-ic"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div class="cx2-secure-h">
                    Secure. Verified. Yours forever.
                  </div>
                  <div class="cx2-secure-v">
                    Your Passport is securely linked to your property, not just
                    you. It stays with the property through owning, letting and
                    selling.
                  </div>
                </div>
              </div>
              <div class="cxd-cta-col">
                <button
                  class="cxd-btn primary"
                  type="button"
                  @click="onPrimary('claim-passport')"
                >
                  Claim my property →
                </button>
                <button
                  class="cxd-btn secondary"
                  type="button"
                  @click="openSheet = null"
                >
                  Not now
                </button>
              </div>
              <div class="cx-foot">
                <img
                  src="/op-icons/investment/padlock.png"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                Secure KYC · Encrypted data · You're in control
              </div>
            </template>

            <!-- IN PROGRESS -->
            <!-- PRIVATE — claimed but not yet published, regardless of how
                 much has actually been built. No completion % anywhere in
                 this drawer (owner or not) — that stays owner-only,
                 surfaced on the owner's own dashboard, not here. See
                 plans/watch-visibility-strategy-audit.md. -->
            <template v-else-if="openSheet === 'private'">
              <div class="cx2-header">
                <div class="cx2-header-text">
                  <div class="cx2-eyebrow-row">
                    <div class="cx2-eyebrow">Property Passport™</div>
                    <span class="cx2-state-pill cx2-state-pill--private"
                      >Claimed · Private</span
                    >
                  </div>
                  <div class="cx2-title">{{ privateDrawerHero.title }}</div>
                  <div v-if="privateDrawerHero.subtitle" class="cx2-subtitle">
                    {{ privateDrawerHero.subtitle }}
                  </div>
                  <div class="cx2-body">{{ privateDrawerBody }}</div>
                </div>
                <div class="cx2-header-illustration">
                  <img
                    src="/op-icons/passport-covers/property_passport_teal_tilted_left_on_tile.png"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>

              <!-- Owner: their own passport, short "keep building" nudge —
                   no buyer-framed reassurance/stat row/journey stepper below,
                   that content explains what happens to someone who doesn't
                   control the Passport, which isn't the person reading this.
                   See plans/passport-drawer-owner-vs-public.md. -->
              <template v-if="isOwnerOrCollaborator">
                <div class="cx-callout cx-callout--icon">
                  <img
                    src="/op-icons/homescore/clipboard.png"
                    alt=""
                    class="cx-callout-icon"
                    loading="lazy"
                  />
                  <div class="cx-callout-body">
                    <div class="cx-callout-h">Keep building your Passport</div>
                    <div class="cx-callout-v">
                      Add information, documents and verification at your own
                      pace. You decide if and when anything becomes public.
                    </div>
                  </div>
                </div>
              </template>

              <!-- Non-owner: unchanged — matches the prototype exactly. -->
              <template v-else>
                <div class="cx-callout cx-callout--icon">
                  <img
                    src="/op-icons/claim/padlock.png"
                    alt=""
                    class="cx-callout-icon"
                    loading="lazy"
                  />
                  <div class="cx-callout-body">
                    <div class="cx-callout-h">Not every Passport is public</div>
                    <div class="cx-callout-v">
                      Homeowners decide what they share and when they share it.
                      Information that has not been published remains private.
                    </div>
                  </div>
                </div>
                <div class="cx-stats cx-stats--3col">
                  <div class="cx-stat">
                    <img
                      src="/op-icons/claim/padlock.png"
                      alt=""
                      class="cx-stat-ic"
                      loading="lazy"
                    />
                    <div class="cx-stat-num">Private by default</div>
                    <div class="cx-stat-label">Owner controlled</div>
                  </div>
                  <div class="cx-stat">
                    <img
                      src="/op-icons/misc/exploreWatching.png"
                      alt=""
                      class="cx-stat-ic"
                      loading="lazy"
                    />
                    <div class="cx-stat-num">Watch quietly</div>
                    <div class="cx-stat-label">No unnecessary alerts</div>
                  </div>
                  <div class="cx-stat">
                    <img
                      src="/op-icons/misc/bell.png"
                      alt=""
                      class="cx-stat-ic"
                      loading="lazy"
                    />
                    <div class="cx-stat-num">Know when it changes</div>
                    <div class="cx-stat-label">Get notified</div>
                  </div>
                </div>
                <div class="cx-section-h">
                  How a Property Passport works · tap a step to understand the
                  journey
                </div>
                <div class="cx-steps">
                  <template v-for="(s, i) in privateJourneySteps" :key="s.n">
                    <div
                      class="cx-step cx-step-tap"
                      :class="{ active: activeStep === s.n }"
                      :style="{ '--cx-step-i': i }"
                      @click="activeStep = activeStep === s.n ? null : s.n"
                    >
                      <div
                        class="cx-step-num"
                        :class="s.filled ? 'filled-teal' : 'off'"
                      >
                        {{ s.n }}
                      </div>
                      <div class="cx-step-name" :class="{ off: !s.filled }">
                        {{ s.name }}
                      </div>
                    </div>
                    <div
                      v-if="i < privateJourneySteps.length - 1"
                      class="cx-step-line"
                    />
                  </template>
                </div>
                <Transition name="cx-detail">
                  <div v-if="activeStepData" class="cx-step-detail">
                    <div class="cx-step-detail-icon">
                      <img :src="activeStepData.icon" alt="" loading="lazy" />
                    </div>
                    <div class="cx-step-detail-body">
                      <div class="cx-step-detail-h">{{ activeStepData.h }}</div>
                      <div class="cx-step-detail-v">{{ activeStepData.v }}</div>
                      <div class="cx-step-detail-happens">
                        <strong>What happens:</strong>
                        {{ activeStepData.happens }}
                      </div>
                    </div>
                  </div>
                </Transition>
              </template>

              <div class="cxd-cta-col">
                <!-- Owner/collaborator viewing their own still-private
                     passport → straight to continue building it; everyone
                     else → the buyer-facing notify-me watch flow. -->
                <button
                  v-if="isOwnerOrCollaborator"
                  class="cxd-btn primary"
                  type="button"
                  @click="onOwnerContinue"
                >
                  <img
                    src="/op-icons/homescore/clipboard.png"
                    alt=""
                    class="inline-ic"
                    loading="lazy"
                  />
                  Continue building your Passport
                </button>
                <button
                  v-else
                  class="cxd-btn primary"
                  type="button"
                  @click="onPrimary('watch')"
                >
                  <img
                    src="/op-icons/misc/exploreWatching.png"
                    alt=""
                    class="inline-ic"
                    loading="lazy"
                  />
                  Watch this property
                </button>
                <button
                  class="cxd-btn secondary"
                  type="button"
                  @click="openSheet = null"
                >
                  Not now
                </button>
              </div>
              <div class="cx-foot">
                <img
                  src="/op-icons/investment/padlock.png"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                Secure verification · Encrypted data · You're in control
              </div>
            </template>

            <!-- The old "IN PROGRESS" drawer (openSheet === 'progress') was
                 removed here — superseded by PRIVATE above, which now
                 covers every pre-publish state regardless of completion
                 (see the model note near privateJourneySteps). Its
                 markup showed a live completion % and a "Completed so
                 far" checklist to any viewer, which the Private/Partially
                 Public/Public model keeps owner-only — see
                 plans/watch-visibility-strategy-audit.md. -->

            <!-- PARTIALLY PUBLIC / PUBLIC — reaching either one means the
                 owner has been through all four journey phases; what
                 differs is only how much of the built content is
                 currently shared, which this drawer deliberately doesn't
                 quantify (no "X% complete", no per-step done/not-done
                 breakdown) — see plans/watch-visibility-strategy-audit.md
                 for why. -->
            <template v-else>
              <div class="cx2-header">
                <div class="cx2-header-text">
                  <div class="cx2-eyebrow-row">
                    <div class="cx2-eyebrow">Property Passport™</div>
                    <span
                      class="cx2-state-pill"
                      :class="
                        openSheet === 'public'
                          ? 'cx2-state-pill--public'
                          : 'cx2-state-pill--partial'
                      "
                      >{{
                        openSheet === 'public'
                          ? 'Claimed · Public'
                          : 'Claimed · Partially Public'
                      }}</span
                    >
                  </div>
                  <div class="cx2-title">{{ publicDrawerHero.title }}</div>
                  <div class="cx2-subtitle">
                    {{ publicDrawerHero.subtitle }}
                  </div>
                  <div class="cx2-body">{{ publicDrawerBody }}</div>
                </div>
                <div class="cx2-header-illustration">
                  <img
                    src="/op-icons/passport-covers/property_passport_teal_tilted_left_on_tile.png"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </div>
              <div class="cx-callout cx-callout--icon">
                <img
                  src="/op-icons/onboarding/trustShield.png"
                  alt=""
                  class="cx-callout-icon"
                  loading="lazy"
                />
                <div class="cx-callout-body">
                  <div class="cx-callout-h">{{ publishedDateLabel }}</div>
                  <div class="cx-callout-v">
                    The information shown has been verified by the owner.
                  </div>
                </div>
              </div>
              <!-- Owner vs. buyer framing — the one thing this drawer was
                   entirely missing before: same content shown to everyone,
                   whoever they were. See
                   plans/passport-drawer-owner-vs-public.md. -->
              <div class="cx-section-h">{{ publicDrawerReasons.title }}</div>
              <div class="cx-reasons">
                <div
                  v-for="r in publicDrawerReasons.items"
                  :key="r"
                  class="cx-reason"
                >
                  <span class="cx-reason-tick">✓</span>{{ r }}
                </div>
              </div>
              <div class="cx-section-h">Passport journey</div>
              <div class="cx-steps">
                <template v-for="(s, i) in publishedJourneySteps" :key="s.n">
                  <div
                    class="cx-step cx-step-tap"
                    :class="{ active: activeStep === s.n }"
                    :style="{ '--cx-step-i': i }"
                    @click="activeStep = activeStep === s.n ? null : s.n"
                  >
                    <div class="cx-step-num filled-teal">✓</div>
                    <div class="cx-step-name">{{ s.name }}</div>
                  </div>
                  <div
                    v-if="i < publishedJourneySteps.length - 1"
                    class="cx-step-line"
                  />
                </template>
              </div>
              <Transition name="cx-detail">
                <div v-if="activeStepData" class="cx-step-detail">
                  <div class="cx-step-detail-icon">
                    <img :src="activeStepData.icon" alt="" loading="lazy" />
                  </div>
                  <div class="cx-step-detail-body">
                    <div class="cx-step-detail-h">{{ activeStepData.h }}</div>
                    <div class="cx-step-detail-v">{{ activeStepData.v }}</div>
                    <div class="cx-step-detail-happens">
                      <strong>What happens:</strong>
                      {{ activeStepData.happens }}
                    </div>
                  </div>
                </div>
              </Transition>
              <div class="cx-section-h">
                {{
                  openSheet === 'public'
                    ? 'Included in this published Passport'
                    : 'Included so far'
                }}
              </div>
              <div class="cx-item-grid">
                <div class="cx-item">
                  <div class="cx-item-ico">
                    <img
                      src="/op-icons/onboarding/trustShield.png"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div class="cx-item-body">
                    <div class="cx-item-title">Ownership &amp; Title</div>
                    <div class="cx-item-sub">Land Registry verified</div>
                  </div>
                  <div class="cx-item-tick">✓</div>
                </div>
                <div class="cx-item">
                  <div class="cx-item-ico">
                    <img
                      src="/op-icons/buyer-passport/epcRating.png"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div class="cx-item-body">
                    <div class="cx-item-title">EPC Certificate</div>
                    <div class="cx-item-sub">Grade C · Expires 2032</div>
                  </div>
                  <div class="cx-item-tick">✓</div>
                </div>
                <div class="cx-item">
                  <div class="cx-item-ico">
                    <img
                      src="/op-icons/homescore/house.png"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div class="cx-item-body">
                    <div class="cx-item-title">Property Information</div>
                    <div class="cx-item-sub">Address, type, tenure</div>
                  </div>
                  <div class="cx-item-tick">✓</div>
                </div>
                <div class="cx-item">
                  <div class="cx-item-ico">
                    <img
                      src="/op-icons/buyer-passport/titleNumber.png"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div class="cx-item-body">
                    <div class="cx-item-title">
                      Certificates &amp; Guarantees
                    </div>
                    <div class="cx-item-sub">5 documents included</div>
                  </div>
                  <div class="cx-item-tick">✓</div>
                </div>
              </div>
              <div class="cxd-cta-col">
                <button
                  class="cxd-btn primary"
                  type="button"
                  @click="
                    isOwnerOrCollaborator ? onOwnerContinue() : onPrimary('buy')
                  "
                >
                  View Passport
                </button>
                <button
                  v-if="isOwnerOrCollaborator"
                  class="cxd-btn outline-accent"
                  type="button"
                  @click="onOwnerContinue"
                >
                  👤 Manage access &amp; sharing
                </button>
              </div>
              <div class="cx-foot">
                <img
                  src="/op-icons/investment/padlock.png"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                Secure verification · Encrypted data · You're in control
              </div>
            </template>
          </div>
        </div>
      </Transition>

      <!-- ── Auth-required popup ─────────────────────────────────────
           Shown when a guest taps a primary CTA inside the drawer. Sits
           above the drawer (z-index 1200) so the user can dismiss back to
           the explainer if they're not ready to sign in. -->
      <Transition name="authd">
        <div
          v-if="authPrompt"
          class="authd-overlay"
          @click.self="authPrompt = null"
        >
          <div class="authd-card" @click.stop>
            <div class="authd-icon">
              <img src="/op-icons/claim/padlock.png" alt="" loading="lazy" />
            </div>
            <div class="authd-title">{{ authPromptCopy.title }}</div>
            <div class="authd-body">{{ authPromptCopy.body }}</div>
            <div class="authd-actions">
              <button
                class="authd-btn primary"
                type="button"
                @click="goAuth('signup')"
              >
                Create free account
              </button>
              <button
                class="authd-btn secondary"
                type="button"
                @click="goAuth('signin')"
              >
                I already have an account
              </button>
              <button
                class="authd-btn ghost"
                type="button"
                @click="authPrompt = null"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    state: 'unclaimed' | 'inProgress' | 'published'
    progressPct?: number
    sectionsDone?: number
    sectionsTotal?: number
    /** Property id used to build the post-login redirect target so the
     *  user returns to the property page with the right drawer auto-opened
     *  after they sign in. Falls back to silent emit if not provided. */
    propertyId?: string | null
    /** When true, suppress the visible state box and only render the
     *  explainer drawer. Used by callers that already have their own
     *  "Claim this property" trigger button. Pair with `v-model:open-sheet`
     *  to control the drawer programmatically. */
    headless?: boolean
    /** External control of which sheet is open. Used in headless mode so
     *  the parent can open `'unclaimed'` / `'private'` / `'partiallyPublic'`
     *  / `'public'` from its own button. Two-way bound via
     *  `update:openSheet`. */
    openSheet?: 'unclaimed' | 'private' | 'partiallyPublic' | 'public' | null
    /** True when the current viewer owns (or collaborates on) this
     *  passport - flips the progress/published drawers' primary action
     *  from a buyer-facing "watch/buy" to the owner's own "continue
     *  building" route, and shows the owner-only "Manage access &
     *  sharing" button on the published drawer. */
    isOwnerOrCollaborator?: boolean
    /** ISO date string for the "Published on {date}" line on the
     *  published drawer. Falls back to a generic label when not given. */
    publishedAt?: string | null
  }>(),
  {
    progressPct: 60,
    sectionsDone: 4,
    sectionsTotal: 8,
    propertyId: null,
    headless: false,
    openSheet: null,
    isOwnerOrCollaborator: false,
    publishedAt: null,
  },
)

const emit = defineEmits<{
  // Fired from the "This property is unclaimed" box and the cxUnclaimed
  // drawer's "Claim it free →" button — the new login → property-page flow.
  (e: 'claim-passport'): void
  (e: 'watch'): void
  (e: 'buy'): void
  // Owner/collaborator's own "View progress" / "View Passport" action on
  // the progress/published drawers — no auth-gate needed (they're already
  // signed in and own the thing), so this bypasses onPrimary entirely.
  (e: 'continue-building'): void
  (
    e: 'update:openSheet',
    v: 'unclaimed' | 'private' | 'partiallyPublic' | 'public' | null,
  ): void
}>()

const pct = computed(() =>
  Math.max(0, Math.min(100, Math.round(props.progressPct ?? 0))),
)

// Owner vs. buyer framing for the partiallyPublic/public drawer — this
// used to be the exact same copy for everyone regardless of who was
// looking, which was the core critique in
// plans/passport-drawer-owner-vs-public.md. Same structure either way
// (hero + one supporting line + a 3-line reasons block), just written
// for who's actually reading it.
const publicDrawerHero = computed(() => {
  const isPublic = openSheet.value === 'public'
  if (props.isOwnerOrCollaborator) {
    return isPublic
      ? {
          title: 'Your Property Passport is now live',
          subtitle: 'Your verified property record has been published.',
        }
      : {
          title: 'Your Property Passport is partially public',
          subtitle: 'Some of your verified information is now live.',
        }
  }
  return isPublic
    ? {
        title: 'This property has a live Property Passport',
        subtitle: 'Verified information shared by the homeowner.',
      }
    : {
        title: 'This property has partial Passport information',
        subtitle: 'Some verified information has been shared by the homeowner.',
      }
})
const publicDrawerBody = computed(() =>
  props.isOwnerOrCollaborator
    ? 'You control exactly what buyers, tenants, agents and your solicitor can see.'
    : 'Buyers, tenants, agents and solicitors can access the information the owner has chosen to share.',
)

// Same owner-vs-buyer split as publicDrawerHero/publicDrawerBody above,
// for the 'private' drawer. Previously this whole drawer was one shared,
// buyer-voiced block ("Want to know if that changes?", "The owner hasn't
// published...") shown to the owner too — see
// plans/passport-drawer-owner-vs-public.md.
const privateDrawerHero = computed(() =>
  props.isOwnerOrCollaborator
    ? { title: 'Your Property Passport is private', subtitle: '' }
    : {
        title: 'This Passport is private.',
        subtitle: 'Want to know if that changes?',
      },
)
const privateDrawerBody = computed(() =>
  props.isOwnerOrCollaborator
    ? 'Only you can see the information in your Passport.'
    : "The owner hasn't published any information from this home's Property Passport yet.",
)
const publicDrawerReasons = computed(() => {
  const isPublic = openSheet.value === 'public'
  if (props.isOwnerOrCollaborator) {
    return {
      title: 'What happens now',
      items: isPublic
        ? [
            'Buyers can view your published information',
            "You stay in control of what's shared",
            'You can keep updating your Passport anytime',
          ]
        : [
            "Buyers can see what you've shared so far",
            "You stay in control of what's shared",
            "Publish more, or the full record, whenever you're ready",
          ],
    }
  }
  return {
    title: 'Why this matters',
    items: isPublic
      ? [
          'See key property information sooner',
          'Understand more before you make contact',
          'Watch for future updates',
        ]
      : [
          "See what's available so far",
          'Understand more before you make contact',
          'Get notified as more is added',
        ],
  }
})

const publishedDateLabel = computed(() => {
  if (!props.publishedAt) return 'Published'
  const d = new Date(props.publishedAt)
  if (Number.isNaN(d.getTime())) return 'Published'
  const dateStr = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `Published on ${dateStr}`
})

// In standard (non-headless) mode the component owns `openSheet` locally —
// tapping the colored box flips it. In headless mode the parent drives it
// via v-model so the colored box can be replaced by the parent's own CTA.
const localOpenSheet = ref<
  'unclaimed' | 'private' | 'partiallyPublic' | 'public' | null
>(null)
const openSheet = computed<
  'unclaimed' | 'private' | 'partiallyPublic' | 'public' | null
>({
  get: () => (props.headless ? props.openSheet : localOpenSheet.value),
  set: (v) => {
    if (props.headless) emit('update:openSheet', v)
    else localOpenSheet.value = v
  },
})

// Auth gate state — which primary action the guest tried to take from
// inside the drawer. Null = no prompt visible.
type PrimaryAction = 'claim-passport' | 'watch' | 'buy'
const authPrompt = ref<PrimaryAction | null>(null)

const authPromptCopy = computed(() => {
  if (authPrompt.value === 'claim-passport') {
    return {
      title: 'Sign in to claim this property',
      body: "You'll need a free account to verify ownership and build your Passport. Takes about a minute.",
    }
  }
  if (authPrompt.value === 'watch') {
    return {
      title: 'Sign in to watch this property',
      body: 'Create a free account or sign in so we can notify you the moment this Passport publishes.',
    }
  }
  return {
    title: 'Sign in to unlock this Passport',
    body: 'Create a free account or sign in to access the full verified record for this property.',
  }
})

function hasAuth(): boolean {
  if (typeof localStorage === 'undefined') return false
  return Boolean(localStorage.getItem('token'))
}

// Build the post-login redirect target. Claim → ?claim=1, watch →
// ?watched=1, buy → ?unlock=1 (mirrors the parent's existing
// goToClaimPassport / persistWatch / goToBuyPassport routing — watch
// and buy resume completely differently on return, so they can't share
// a flag).
function redirectTargetFor(action: PrimaryAction): string | null {
  if (!props.propertyId) return null
  const flag =
    action === 'claim-passport'
      ? 'claim=1'
      : action === 'watch'
      ? 'watched=1'
      : 'unlock=1'
  return `/property/${props.propertyId}?${flag}`
}

// ── Animated stats in the unclaimed drawer ─────────────────────────
function goAuth(mode: 'signin' | 'signup') {
  const action = authPrompt.value
  if (!action) return
  const target = redirectTargetFor(action)
  if (target && typeof localStorage !== 'undefined') {
    localStorage.setItem('redirectAfterLogin', target)
  }
  // Close drawer + prompt before navigating so back-nav lands cleanly.
  authPrompt.value = null
  openSheet.value = null
  const path = mode === 'signup' ? '/onboarding/signup' : '/onboarding/signin'
  navigateTo(path)
}

// Mirrors the "Your Passport journey" prototype — Claim → Verify → Build →
// Publish. Claim now folds in the old Ownership check (KYC + Land Registry
// happen together as one £15 step) and Verify covers choosing what the
// Passport is being built for.
const unclaimedSteps = [
  { n: 1, name: 'Claim' },
  { n: 2, name: 'Verify' },
  { n: 3, name: 'Build' },
  { n: 4, name: 'Publish' },
]
// Master Property Passport journey copy — the developer-provided text
// for the 1·2·3·4 step details. Shared verbatim across every drawer
// (unclaimed / private / partiallyPublic / public); only which step is
// active by default differs per drawer (see openSheet watcher below).
const stepDetails: Record<
  number,
  { h: string; v: string; happens: string; icon: string }
> = {
  1: {
    h: '1 · Claim your home',
    v: "We confirm that you're authorised to manage this property. A quick identity and ownership check confirms that the home is yours and helps prevent a property from being claimed by someone who shouldn't have access to it.",
    happens:
      'Identity checked · Ownership confirmed · Property securely claimed',
    icon: '/op-icons/verify-identity/idCardChecked.png',
  },
  2: {
    h: '2 · Verify the property',
    v: 'We connect the Passport to the correct property and trusted records. Ownership and key property details can be checked against trusted sources so the Passport is linked to the home itself - not simply to the person who created it.',
    happens:
      'Ownership verified · Property record matched · Trusted data connected',
    icon: '/op-icons/homescore/clipboard.png',
  },
  3: {
    h: '3 · Build your Passport',
    v: 'Bring the important information about your home together in one place. Add property details, documents, certificates, guarantees, improvements and other important information. Where possible, information can be checked against trusted sources and marked as verified. The Passport can continue to grow and stay up to date over time.',
    happens:
      'Information added · Documents stored · Verification builds over time',
    icon: '/op-icons/investment/clipboardChecklist.png',
  },
  4: {
    h: '4 · Publish or keep private',
    v: "You decide what happens next. Keep your Property Passport private while you continue building it, or choose to publish approved information when you're ready. Publishing does not mean everything in the Passport becomes public. The homeowner controls what information is shared. A Passport also does not need to be 100% complete before it can be published - it only needs to meet the required publication threshold.",
    happens:
      'You control visibility · Choose what is shared · Keep updating after publication',
    icon: '/op-icons/misc/eye.png',
  },
}
// Same four steps, but for a viewer who ISN'T the one claiming — the
// unclaimedSteps copy above is written second-person ("you're
// authorised...", "the home is yours"), which is only correct in the
// `unclaimed` drawer where the visitor genuinely is about to claim it.
// The `private`/`partiallyPublic`/`public` journey steppers show this
// same walkthrough to someone watching a property that's already been
// claimed by somebody else — third person throughout, per the
// client-provided prototype (claimedPropertyWatchDrawer.jpeg).
const claimedStepDetails: Record<
  number,
  { h: string; v: string; happens: string; icon: string }
> = {
  1: {
    h: '1 · Claim',
    v: "The property is claimed. The homeowner confirms they're authorised to manage this Property Passport. This securely connects the Passport to the person responsible for the home.",
    happens:
      'Identity checked · Ownership confirmed · Passport securely claimed',
    icon: '/op-icons/verify-identity/idCardChecked.png',
  },
  2: {
    h: '2 · Verify',
    v: 'Property details are verified. Key property details can be checked against trusted sources, helping connect the Passport to the correct home and build a more reliable property record.',
    happens:
      'Property record matched · Trusted data connected · Key details verified',
    icon: '/op-icons/homescore/clipboard.png',
  },
  3: {
    h: '3 · Build',
    v: 'The Passport is built. The homeowner can add property details, documents, certificates, guarantees and improvements over time. The Passport can continue to grow as the home changes.',
    happens: 'Property details added · Documents stored · Record kept up to date',
    icon: '/op-icons/investment/clipboardChecklist.png',
  },
  4: {
    h: '4 · Publish',
    v: 'The homeowner chooses what to share. The homeowner decides if and when parts of the Property Passport become public. A Passport can remain completely private, and publishing does not mean everything inside is shared.',
    happens:
      'Visibility controlled by the homeowner · Selected details can be published · Private details stay private',
    icon: '/op-icons/misc/eye.png',
  },
}
// No step pre-selected — the detail panel starts collapsed on every
// drawer and only appears once the visitor taps a step number
// themselves (previously a step was auto-highlighted per state with
// its detail always showing; now it's opt-in and animated in).
const activeStep = ref<number | null>(null)
const activeStepData = computed(() => {
  if (activeStep.value == null) return null
  const details = openSheet.value === 'unclaimed' ? stepDetails : claimedStepDetails
  return details[activeStep.value] ?? null
})
// Collapse back to nothing every time a drawer opens (covers both
// headless mode, where the parent drives `openSheet`, and normal mode,
// where tapping the colored box drives it locally) — otherwise a step
// left open from a previous visit would still show on the next open.
watch(openSheet, (v) => {
  if (v) activeStep.value = null
})

// Step-circle fill states for the private / partiallyPublic / public
// drawers — distinct from `unclaimedSteps` above (which stays tap-to-switch
// with its own on/off/active styling) since these are a static read-out
// of what's happened, not an interactive chooser. `done` draws a
// checkmark instead of the step number; `filled` colors the circle.
//
// privateJourneySteps deliberately doesn't try to reflect real build
// progress (it's the same generic "just claimed" read-out regardless of
// how much has actually been filled in) — the Private/Partially Public/
// Public model keeps completion % owner-only, and a decorative step
// diagram that quietly varied with it would leak the same information
// back out through a side door.
const privateJourneySteps = unclaimedSteps.map((s) => ({
  ...s,
  filled: s.n === 1,
  done: false,
}))
// Shared by both partiallyPublic and public — reaching either one means
// the owner has been through all four phases (claim, verify, build,
// publish); "partially public" only describes how much of the built
// content is currently shared, not which phases happened. See
// plans/watch-visibility-strategy-audit.md.
const publishedJourneySteps = [
  { n: 1, name: 'Claim', filled: true, done: true },
  { n: 2, name: 'Verify', filled: true, done: true },
  { n: 3, name: 'Build', filled: true, done: true },
  { n: 4, name: 'Publish', filled: true, done: true },
]

// Owner/collaborator's own path on the progress/published drawers — they're
// already signed in and it's their own passport, so skip the buyer-facing
// auth-gated onPrimary entirely and let the parent route them straight to
// continuing/viewing it.
function onOwnerContinue() {
  openSheet.value = null
  emit('continue-building')
}

function onPrimary(action: PrimaryAction) {
  // Authed users → straight through to the parent's existing routing.
  // Guests → show the in-drawer auth prompt (Sign in / Create account).
  if (hasAuth()) {
    openSheet.value = null
    ;(emit as (e: PrimaryAction) => void)(action)
    return
  }
  authPrompt.value = action
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
.pcb {
  --primary: #231d45;
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
  margin: 14px 20px 0;
}

/* ── State box ── */
.pcb-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 18px;
  border: none;
  border-radius: 16px;
  min-height: 96px;
  color: white;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 6px 22px rgba(35, 29, 69, 0.2);
  transition: filter 0.15s;
}
.pcb-box:hover {
  filter: brightness(1.05);
}
.pcb-left {
  min-width: 0;
  flex: 1;
}
.pcb-main {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.pcb-sub {
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.78;
  margin-top: 4px;
  line-height: 1.4;
}
.pcb-explain {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  cursor: pointer;
}
.pcb-explain:hover {
  color: #fff;
}
.pcb-q {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  flex-shrink: 0;
}
.pcb-arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  font-weight: 800;
  flex-shrink: 0;
}
.pcb-right {
  font-size: 22px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.5px;
}

/* ── Published "champagne band" ──────────────────────────────────
   White card framed by a spinning gold conic-gradient border + sheen
   sweep. Mirrors prisma/published-band-standalone.html so the verified
   passport reads as a premium, document-like surface - distinct from
   the dark unclaimed / in-progress bands. */
.pcb-pubwrap {
  position: relative;
  width: 100%;
  border-radius: 18px;
  padding: 2px;
  overflow: hidden;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 12px 30px rgba(193, 138, 56, 0.16);
}
.pcb-pubwrap::before {
  content: '';
  position: absolute;
  inset: -60%;
  background: conic-gradient(
    from 0deg,
    #c9a052,
    #c9a052 58%,
    #f6e0a6 70%,
    #ffffff 75%,
    #f6e0a6 80%,
    #c9a052 92%,
    #c9a052
  );
  animation: pcbPubSpin 4.6s linear infinite;
}
@keyframes pcbPubSpin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pcb-pubwrap::before {
    animation: none;
  }
}
.pcb-pub {
  position: relative;
  z-index: 1;
  border-radius: 16px;
  background: #fff;
  padding: 13px 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}
.pcb-pub::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 42%;
  background: linear-gradient(
    100deg,
    transparent,
    rgba(216, 178, 96, 0.2),
    transparent
  );
  transform: translateX(-220%) skewX(-18deg);
  animation: pcbPubSheen 5.6s ease-in-out 1.6s infinite;
}
@keyframes pcbPubSheen {
  0% {
    transform: translateX(-220%) skewX(-18deg);
  }
  24%,
  100% {
    transform: translateX(360%) skewX(-18deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pcb-pub::after {
    animation: none;
  }
}
.pcb-pub-body {
  flex: 1;
  position: relative;
  z-index: 2;
  min-width: 0;
}
.pcb-pub-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  line-height: 1.2;
}
.pcb-pub-sub {
  font-size: 11.5px;
  color: #6b6a82;
  line-height: 1.4;
  margin-top: 5px;
}
.pcb-pub-inside {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
  font-size: 11.5px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
}
.pcb-pub-q {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #faeeda;
  color: #9a6f22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  flex: none;
}
.pcb-pub-price {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
.pcb-pub-amt {
  font-size: 28px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.6px;
}
.pcb-pub-arrow {
  font-size: 24px;
  font-weight: 700;
  color: #231d45;
  animation: pcbPubNudge 1.6s ease-in-out infinite;
}
@keyframes pcbPubNudge {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pcb-pub-arrow {
    animation: none;
  }
}
.pcb-ring {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}
.pcb-ring svg {
  width: 46px;
  height: 46px;
  display: block;
}
.pcb-ring svg circle:last-of-type {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
  transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.pcb-ring span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.pcb-ring span small {
  font-size: 8px;
  font-weight: 700;
  opacity: 0.85;
  margin-left: 1px;
}

/* ── Drawer overlay + sheet ── */
.cxd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  --primary: #231d45;
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
  color: var(--text);
}
.cxd-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.cxd-grip {
  width: 42px;
  height: 4px;
  background: var(--border);
  border-radius: 100px;
  margin: 10px auto 0;
}

/* ── cx2-* - plain white-background variant of the drawer header, used
   by the "unclaimed" sheet's redesigned prototype instead of the dark
   .cx-hero band the other sheets still use. ── */
.cx2-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 22px 0;
}
.cx2-header-text {
  flex: 1;
  min-width: 0;
}
.cx2-header-illustration {
  flex-shrink: 0;
  width: 120px;
  padding-top: 4px;
}
.cx2-header-illustration img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
.cx2-illustration--badged {
  position: relative;
}
.cx2-illustration-badge {
  position: absolute !important;
  width: 34px !important;
  height: 34px !important;
  right: -4px;
  bottom: 4px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.2);
  padding: 6px;
  box-sizing: border-box;
}
.cx2-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.cx2-eyebrow-row .cx2-eyebrow {
  margin-bottom: 0;
}
.cx2-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent-dark);
  margin-bottom: 6px;
}
/* Explicit state label beside the eyebrow - spells out "claimed" +
   the visibility state right at the top of the drawer, rather than
   leaving it implied by the narrative title below (see
   plans/passport-status-wording-clarity.md). */
.cx2-state-pill {
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.3px;
  padding: 3px 9px;
  border-radius: 999px;
  color: #fff;
  white-space: nowrap;
}
.cx2-state-pill--unclaimed {
  background: #231d45;
}
.cx2-state-pill--private {
  background: #231d45;
}
.cx2-state-pill--partial {
  background: #231d45;
}
.cx2-state-pill--public {
  background: #231d45;
}
.cx2-title {
  font-size: 21px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.2;
}
.cx2-subtitle {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-dark);
  margin-top: 2px;
}
.cx2-body {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-top: 8px;
}
.cx2-secure {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 22px 0;
  padding: 14px;
  background: var(--bg);
  border-radius: 14px;
}
.cx2-secure-ic-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e7e5f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cx2-secure-ic {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.cx2-secure-h {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.1px;
}
.cx2-secure-v {
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 3px;
}

/* ── cx-* drawer content (ported from prototype) ── */
.cx-hero {
  border-radius: 16px;
  padding: 20px;
  margin: 14px 22px 0;
  position: relative;
  overflow: hidden;
  color: white;
}
.cx-hero::after {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.cx-hero.navy {
  background: var(--primary);
}
.cx-hero.teal {
  background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 45%, #006e68 100%);
}
.cx-hero.amber {
  background: linear-gradient(135deg, #f0b460 0%, #d4822a 45%, #7a3a05 100%);
}
/* Champagne / gold drawer hero - same palette as the published band on
   the card so the drawer reads as a continuation of the surface you
   tapped. Dark text on a warm gold base to keep the "premium document"
   feel; the band itself is white-on-gold-border, the drawer hero is
   gold-on-gold for visual depth. */
.cx-hero.purple {
  background: linear-gradient(135deg, #f6e0a6 0%, #c9a052 55%, #9a6f22 100%);
  color: #231d45;
}
.cx-hero.purple .cx-hero-eyebrow {
  color: rgba(35, 29, 69, 0.7);
}
.cx-hero.purple .cx-hero-title,
.cx-hero.purple .cx-hero-sub {
  color: #231d45;
}
.cx-hero-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}
.cx-hero-title {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}
.cx-hero-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.55;
  position: relative;
  z-index: 1;
}
.cx-callout {
  background: var(--bg);
  border-radius: 14px;
  padding: 14px;
  margin: 14px 22px 0;
  border-left: 3px solid var(--accent);
}
.cx-callout.navy {
  border-left-color: var(--primary);
}
.cx-callout--car {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cx-callout-body {
  flex: 1;
  min-width: 0;
}
.cx-callout-car {
  width: 64px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}
/* Small icon + text variant - "Not every Passport is public" (lock),
   "Published on {date}" (shield) - matches the prototype, which shows
   a leading icon on every callout, not just the car one. */
.cx-callout--icon {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cx-callout-icon {
  width: 38px;
  height: 38px;
  object-fit: contain;
  flex-shrink: 0;
}
.cx-callout.purple {
  border-left-color: #5b3795;
  background: #f5f1fc;
}
.cx-callout.purple .cx-callout-h {
  color: #5b3795;
}
.cx-callout.amber {
  border-left-color: #d4822a;
  background: #fef9f0;
}
.cx-callout-h {
  font-size: 9px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.cx-callout.navy .cx-callout-h {
  color: var(--primary);
}
.cx-callout.amber .cx-callout-h {
  color: #b07a1c;
}
.cx-callout-v {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.cx-callout-v b {
  color: var(--text);
  font-weight: 800;
}
.cx-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 14px 22px 0;
}
.cx-stat {
  background: var(--bg);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.cx-stat-num {
  font-size: 20px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.5px;
}
.cx-stat-anim {
  font-variant-numeric: tabular-nums;
}
.cx-stat-live {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.cx-stat-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 0 rgba(0, 196, 188, 0.7);
  animation: cxStatPulse 1.6s ease-out infinite;
}
@keyframes cxStatPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 196, 188, 0.65);
  }
  70% {
    box-shadow: 0 0 0 9px rgba(0, 196, 188, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 196, 188, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cx-stat-pulse {
    animation: none;
  }
}
.cx-stat-label {
  font-size: 10px;
  color: var(--text-faint);
  margin-top: 2px;
  font-weight: 600;
  line-height: 1.3;
}
/* 4-across variant used by the redesigned "unclaimed" sheet - smaller
   type + an icon per stat so four fit comfortably in one row. */
.cx-stats--4col {
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.cx-stats--4col .cx-stat {
  padding: 10px 6px;
}
.cx-stat-ic {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin: 0 auto 6px;
  display: block;
}
.cx-stats--4col .cx-stat-num {
  font-size: 12.5px;
  letter-spacing: -0.2px;
}
.cx-stats--4col .cx-stat-label {
  font-size: 8.5px;
}
/* 3-across variant - noPublicPassport's "Private by default / Watch
   quietly / Know when it changes" row. Same icon-plus-label shape as
   --4col, just one column wider each. */
.cx-stats--3col {
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.cx-stats--3col .cx-stat {
  padding: 10px 6px;
}
.cx-stats--3col .cx-stat-num {
  font-size: 11.5px;
  letter-spacing: -0.2px;
}
.cx-stats--3col .cx-stat-label {
  font-size: 8.5px;
}
/* "Why this matters" / "What happens now" - owner vs. buyer framing on
   the partiallyPublic/public drawer. */
.cx-reasons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 22px 4px;
}
.cx-reason {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.35;
}
.cx-reason-tick {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-pale);
  color: var(--accent-dark);
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  margin-top: 1px;
}
.cx-section-h {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 16px 22px 10px;
}
.cx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg);
  border-radius: 11px;
  padding: 10px 12px;
  margin: 0 22px 7px;
}
.cx-item-ico img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}
.cx-item-ico {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.cx-item-body {
  flex: 1;
  min-width: 0;
}
.cx-item-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--text);
}
.cx-item-sub {
  font-size: 10px;
  color: var(--text-faint);
  margin-top: 1px;
}
.cx-item-tick {
  color: var(--accent-dark);
  font-weight: 800;
  font-size: 13px;
}
/* 2-column layout for the progress/published drawers' checklist -
   .cx-item itself is unchanged (still the icon+text+tick row), this
   just arranges several of them side by side instead of stacking
   full-width like the single-column usages elsewhere. */
.cx-item-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0 22px 14px;
}
.cx-item-grid .cx-item {
  margin: 0;
}
.cx-steps {
  display: flex;
  align-items: flex-start;
  margin: 0 22px 18px;
}
.cx-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
}
.cx-step-num {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cx-step-num.on {
  background: var(--primary);
  color: white;
}
.cx-step-num.off {
  background: var(--border);
  color: var(--text-faint);
}
/* Static (non-tap) fill states for the noPublicPassport/progress/
   published journey steppers - teal or purple depending on the drawer,
   independent of the tap-to-switch .on/.off/.active states above (which
   stay exclusive to the original interactive "unclaimed" stepper). */
.cx-step-num.filled-teal {
  background: var(--accent);
  color: white;
}
.cx-step-num.filled-purple {
  background: #5b3795;
  color: white;
}
.cx-step-name {
  font-size: 10px;
  font-weight: 700;
  color: var(--text);
}
.cx-step-name.off {
  color: var(--text-faint);
}
.cx-step-line {
  flex: 0 0 auto;
  width: 14px;
  height: 2px;
  background: var(--border);
  margin-top: 17px;
}
.cx-step-line--purple {
  background: #5b3795;
}
.cx-step-tap {
  cursor: pointer;
  padding: 6px 2px 4px;
  border-radius: 10px;
  transition: background 0.15s;
}
.cx-step-tap:hover {
  background: var(--bg);
}
.cx-step-tap .cx-step-num {
  position: relative;
  transition: transform 0.15s;
}

/* Gentle breathing animation on every step circle to signal these
   are interactive targets, not decorative dots. Pauses on hover so
   the user's actual selection doesn't fight the animation. */
.cx-step-tap .cx-step-num::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid transparent;
  pointer-events: none;
}
.cx-step-tap:hover .cx-step-num {
  animation-play-state: paused;
}

.cx-step-tap.active .cx-step-num {
  transform: scale(1.12);
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.15);
  animation: cx-step-pulse 1.8s ease-in-out infinite;
}
/* Radiating tap-ripple on the active step - the primary "you can tap
   these" cue. Sits behind the circle so it doesn't obscure the number. */
.cx-step-tap.active .cx-step-num::after {
  border-color: rgba(0, 161, 154, 0.5);
  animation: cx-step-ripple 1.8s ease-out infinite;
}
@keyframes cx-step-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.15);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(0, 161, 154, 0.05);
  }
}
@keyframes cx-step-ripple {
  0% {
    transform: scale(1);
    opacity: 0.55;
    border-width: 2px;
  }
  80% {
    transform: scale(1.6);
    opacity: 0;
    border-width: 1px;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
    border-width: 1px;
  }
}

/* First-load "attention bounce" on the whole stepper - a single wave
   from left to right so testers immediately see it responding to
   nothing, hinting the row is interactive. Fires once, then quiet. */
.cx-steps .cx-step-tap {
  animation: cx-step-nudge 1s ease-in-out;
  animation-delay: calc(var(--cx-step-i, 0) * 120ms);
  animation-fill-mode: both;
}
@keyframes cx-step-nudge {
  0%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
}

/* Respect user reduced-motion preference - animations off entirely. */
@media (prefers-reduced-motion: reduce) {
  .cx-step-tap.active .cx-step-num,
  .cx-step-tap.active .cx-step-num::after,
  .cx-steps .cx-step-tap {
    animation: none;
  }
}
.cx-step-tap.active .cx-step-num.off {
  background: var(--accent);
  color: white;
}
.cx-step-tap.active .cx-step-num.on {
  background: var(--accent);
}
.cx-step-tap.active .cx-step-name {
  color: var(--accent-dark) !important;
  font-weight: 800;
}
.cx-step-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 22px 4px;
  padding: 16px 15px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
}
/* Collapsed by default, animates open when a step is tapped. max-height
   is an approximate cap (generous enough for the longest step copy) -
   the usual trick for animating an intrinsically-sized block since
   height:auto can't be transitioned directly. */
.cx-detail-enter-active,
.cx-detail-leave-active {
  transition: opacity 0.22s ease, max-height 0.28s ease, transform 0.22s ease,
    margin 0.28s ease;
  overflow: hidden;
}
.cx-detail-enter-from,
.cx-detail-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: -4px;
  margin-bottom: -4px;
  transform: translateY(-6px);
}
.cx-detail-enter-to,
.cx-detail-leave-from {
  opacity: 1;
  max-height: 300px;
}
.cx-step-detail-icon {
  width: 68px;
  height: 68px;
  flex-shrink: 0;
}
.cx-step-detail-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.cx-step-detail-body {
  min-width: 0;
  flex: 1;
}
.cx-step-detail-h {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-dark);
  margin-bottom: 4px;
  letter-spacing: -0.1px;
}
.cx-step-detail-v {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.55;
}
.cx-step-detail-happens {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--accent-dark);
  line-height: 1.5;
}
.cx-step-detail-happens strong {
  color: var(--text);
  font-weight: 800;
}
.cx-progress-track {
  height: 8px;
  background: var(--border-soft);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 22px 16px;
}
.cx-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #4dd4ce);
  border-radius: 4px;
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.cx-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0 22px 6px;
}
.cx-progress-row span:first-child {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
}
.cx-progress-row span:last-child {
  font-size: 11px;
  color: var(--text-faint);
}
.cx-foot {
  text-align: center;
  font-size: 11px;
  color: var(--text-faint);
  line-height: 1.6;
  padding: 4px 30px 16px;
}

/* CTA row */
.cxd-cta-row {
  padding: 18px 22px 8px;
  display: flex;
  gap: 8px;
}
.cxd-cta-col {
  padding: 18px 22px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cxd-btn {
  flex: 1;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.cxd-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.cxd-btn.primary:hover {
  filter: brightness(1.06);
}
.cxd-btn.secondary {
  background: var(--card);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
}
.cxd-btn.outline-accent {
  background: var(--card);
  border: 1.5px solid var(--accent);
  color: var(--accent-dark);
}
.cxd-btn.purple {
  background: linear-gradient(135deg, #5b3795, #3f2569);
  color: white;
  box-shadow: 0 4px 14px rgba(91, 55, 149, 0.3);
}
.cxd-btn.purple:hover {
  filter: brightness(1.06);
}
.cxd-btn.outline-purple {
  background: var(--card);
  border: 1.5px solid #5b3795;
  color: #5b3795;
}

.cxd-enter-active,
.cxd-leave-active {
  transition: opacity 0.25s ease;
}
.cxd-enter-active .cxd-sheet,
.cxd-leave-active .cxd-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.cxd-enter-from,
.cxd-leave-to {
  opacity: 0;
}
.cxd-enter-from .cxd-sheet,
.cxd-leave-to .cxd-sheet {
  transform: translateY(100%);
}

/* ── Auth-required popup (sits above the drawer) ── */
.authd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 17, 42, 0.62);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, sans-serif;
}
.authd-card {
  width: 100%;
  max-width: 22rem;
  background: #fff;
  border-radius: 18px;
  padding: 22px 22px 18px;
  box-shadow: 0 24px 60px rgba(35, 29, 69, 0.45);
  text-align: center;
  color: #231d45;
}
.authd-icon {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #f0fdfa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  overflow: hidden;
}
.authd-icon img {
  width: 65px;
  height: 65px;
  object-fit: contain;
  display: block;
}
.authd-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
  line-height: 1.25;
}
.authd-body {
  font-size: 13px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.55;
  margin-bottom: 18px;
}
.authd-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.authd-btn {
  width: 100%;
  padding: 13px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  letter-spacing: -0.1px;
}
.authd-btn.primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.authd-btn.primary:hover {
  filter: brightness(1.06);
}
.authd-btn.secondary {
  background: #fff;
  border: 1.5px solid #e4e5ed;
  color: #231d45;
}
.authd-btn.secondary:hover {
  background: #f5f6fa;
}
.authd-btn.ghost {
  background: transparent;
  color: #6b7089;
  font-weight: 700;
  padding: 8px;
}
.authd-btn.ghost:hover {
  color: #231d45;
}
.authd-enter-active,
.authd-leave-active {
  transition: opacity 0.22s ease;
}
.authd-enter-active .authd-card,
.authd-leave-active .authd-card {
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.authd-enter-from,
.authd-leave-to {
  opacity: 0;
}
.authd-enter-from .authd-card,
.authd-leave-to .authd-card {
  transform: scale(0.94);
}
</style>
