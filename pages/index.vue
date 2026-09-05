<template>
  <div class="ld-page mobile-container" :data-screen="screen">
    <!-- ══════════════════════ LANDING ══════════════════════ -->
    <div v-show="screen === 'landing'" class="ld-screen">
      <!-- Brand row -->
      <div class="brand-row">
        <div class="brand-mark">
          <div class="brand-logo">
            <OPIcon name="logo" class="w-[32px] h-[32px]" />
          </div>
          <span>umovingu</span>
        </div>
        <div class="brand-spacer" />
        <div class="beta-pill">Beta</div>
      </div>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-title">
          Know your home<br /><span class="lt-teal">inside out.</span>
        </div>
        <div class="hero-sub">
          Everything about your home, in one place. Understand what it costs to
          run, discover what you could save, and build a Property Passport that
          stays with your home.
        </div>
        <button
          type="button"
          class="hero-tour-link"
          @click="landingTour.restart()"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          See how it works
        </button>
      </div>

      <!-- The deck -->
      <div class="deck-wrap">
        <div
          v-for="card in cards"
          :key="card.id"
          class="deck-card"
          :class="card.id"
          :data-pos="positionOf(card.id)"
          :data-tour="card.id"
          @click="bringToFront(card.id)"
        >
          <div class="dc-peek">
            <div class="dc-peek-row">
              <span class="dc-peek-label">{{ card.peekLabel }}</span>
              <span class="dc-peek-pill">{{ card.peekPill }}</span>
              <svg
                class="dc-peek-chev"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div class="dc-peek-sub">{{ card.peekSub }}</div>
          </div>

          <div class="dc-top">
            <div class="dc-eyebrow">
              <span class="dot" />{{ card.peekLabel }}
            </div>
            <div class="dc-pill">{{ card.peekPill }}</div>
          </div>

          <!-- Explore body -->
          <div v-if="card.id === 'explore'" class="dc-content">
            <div class="dc-header-block">
              <div class="dc-header-text-col">
                <div class="dc-headline">Explore any<br />UK property</div>
                <div class="dc-sub">
                  See what we already know - value, history, energy, planning,
                  local area and more.
                </div>
              </div>
              <img
                src="/op-icons/misc/exploreProperty.png"
                alt=""
                class="dc-card-hero-img"
              />
            </div>
            <div class="dc-explore-badge">
              <span class="dc-explore-badge-check">✓</span>
              Free <span class="dc-explore-badge-sep">•</span> No account needed
            </div>
          </div>

          <!-- HomeScore body -->
          <div v-if="card.id === 'HomeScore'" class="dc-content">
            <div class="dc-header-block">
              <div class="dc-headline">
                Could your home be costing you<br />more than it should?
              </div>
              <img
                src="/op-icons/landing/homeScoreCard.png"
                alt=""
                class="dc-card-hero-img"
              />
            </div>
            <div class="dc-sub">
              Discover hidden savings, compare with similar homes and see what
              your property is really telling you.
            </div>
            <div class="dc-hs-row">
              <div class="dc-hs-gauge">
                <svg viewBox="0 0 88 88">
                  <circle
                    class="g-bg"
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke-width="5"
                  />
                  <circle
                    class="g-fill"
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke-width="5"
                    stroke-dasharray="226.2"
                    stroke-dashoffset="58.8"
                  />
                </svg>
                <div class="g-num">
                  <div class="gn-big">74</div>
                  <div class="gn-small">/ 100</div>
                </div>
              </div>
              <div class="dc-hs-meta-list">
                <div class="dc-hs-meta-item">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M4 1.5h6l2.5 2.5v10.5h-8.5a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5z"
                    />
                    <path d="M10 1.5V4a.5.5 0 0 0 .5.5H13" />
                    <line x1="5" y1="8" x2="11" y2="8" />
                    <line x1="5" y1="10.5" x2="11" y2="10.5" />
                  </svg>
                  <span>Bills <strong>22% above</strong> similar homes</span>
                </div>
                <div class="dc-hs-meta-item">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M1.5 8 8 2l6.5 6" />
                    <path d="M3.5 6.5V14h9V6.5" />
                    <path d="M6.5 14v-4h3v4" />
                  </svg>
                  <span
                    >Potential savings up to <strong>£330/year</strong></span
                  >
                </div>
                <div class="dc-hs-meta-item">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M8 14.5S2.5 11.8 2.5 6.8C2.5 3.9 4.8 2 7.3 2.6c.5.12.9.4 1.2.8 3.4-1.2 6 1.1 6 4 0 4.5-6.5 7.1-6.5 7.1z"
                    />
                    <path d="M8 14.5V7" />
                  </svg>
                  <span>Lower your bills and carbon footprint</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Property Passport body -->
          <div v-if="card.id === 'passport'" class="dc-content">
            <div class="dc-header-block">
              <div class="dc-headline">
                Everything your buyer<br />will ask for. Before they ask.
              </div>
              <img
                src="/op-icons/landing/propertyPassportCard.png"
                alt=""
                class="dc-card-hero-img"
              />
            </div>
            <div class="dc-sub">
              Store, verify and securely share everything from deeds and
              planning to guarantees and surveys.

              <br>
              <button
                type="button"
                class="see-a-sample"
                @click.stop="showPassportSample"
              >
                See a sample
              </button>
            </div>
          </div>

          <!-- Aisha body -->
          <div v-if="card.id === 'aisha'" class="dc-content">
            <div class="dc-header-block">
              <div class="dc-headline">Aisha sold<br />in 14 days.</div>
              <img
                src="/op-icons/landing/realStoryCard.png"
                alt=""
                class="dc-card-hero-img"
              />
            </div>
            <div class="dc-sub">
              A two-bed semi in Coventry. No surveys lost. No fall-throughs.
              Sold March 2026.
            </div>
            <div class="dc-ai-row">
              <div class="dc-ai-num">14<span class="unit">days</span></div>
              <div class="dc-ai-text">
                vs UK average <strong>179 days</strong>. <strong>£0</strong> in
                lost survey fees.
              </div>
            </div>
          </div>

          <!-- Market body -->
          <div v-if="card.id === 'market'" class="dc-content">
            <div class="dc-header-block">
              <div class="dc-headline">UK home sales<br />are broken.</div>
              <img
                src="/op-icons/landing/marketTodayCard.png"
                alt=""
                class="dc-card-hero-img"
              />
            </div>
            <div class="dc-sub">
              A third collapse before completion. The average that does complete
              takes nearly six months.
            </div>
            <div class="dc-mk-row">
              <div class="dc-mk-cell">
                <div class="dc-mk-num">179<span class="unit">days</span></div>
                <div class="dc-mk-label">Avg sale</div>
              </div>
              <div class="dc-mk-cell">
                <div class="dc-mk-num">1 in 3</div>
                <div class="dc-mk-label">Collapse</div>
              </div>
              <div class="dc-mk-cell">
                <div class="dc-mk-num">£2.7k</div>
                <div class="dc-mk-label">Lost</div>
              </div>
            </div>
          </div>

          <div class="dc-foot">
            <button
              type="button"
              class="dc-cta"
              @click.stop="onCardCta(card.id)"
            >
              {{ card.cta }}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="deck-dots">
        <span
          v-for="card in cards"
          :key="card.id"
          class="deck-dot"
          :class="{ active: stack[0] === card.id }"
          @click="bringToFront(card.id)"
        />
      </div>

      <div class="cta-section">
        <div class="cta-cards">
          <button
            type="button"
            class="cta-card"
            @click="navigateTo('/onboarding/signin')"
          >
            <img
              src="/op-icons/landing/signIn.png"
              alt=""
              class="cta-card-icon"
            />
            <span class="cta-card-link">Sign in</span>
          </button>
          <button
            type="button"
            class="cta-card primary"
            @click="navigateTo('/onboarding/signup')"
          >
            <img
              src="/op-icons/landing/createAccount.png"
              alt=""
              class="cta-card-icon"
            />
            <span class="cta-card-link">Create account</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════ MARKET ══════════════════════ -->
    <div v-show="screen === 'market'" class="ld-screen">
      <div class="back-bar">
        <button class="back-btn" type="button" @click="dismissSubscreen">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="back-bar-title">Why moves fail</div>
      </div>

      <div class="market-hero">
        <div class="market-eyebrow">Why we built it</div>
        <div class="market-title">UK home sales<br />are broken.</div>
        <div class="market-sub">
          A third of all sales collapse before they reach completion. Of the
          ones that do, the average takes nearly six months - almost all of it
          spent waiting for paperwork that could have been ready on day one.
          Here's what's actually going wrong, what's being done about it, and
          why we built UMU.
        </div>
      </div>

      <!-- THE NUMBERS -->
      <div class="market-section-h">The numbers</div>

      <div class="market-stat-block navy">
        <div class="market-stat-num">
          179<span class="ms-d">days</span>
          <span class="ms-arrow">→</span>
          <span class="ms-target"
            >14<span class="ms-target-unit">days</span></span
          >
        </div>
        <div class="market-stat-label">12× slower</div>
        <div class="market-stat-headline">UK avg vs. with Passport</div>
        <div class="market-stat-text">
          The average UK home sale takes <strong>179 days</strong> from offer
          accepted to completion. Almost all of that time is the buyer's
          solicitor asking for documents the seller didn't have ready - title
          deeds, planning permissions, FENSA certificates, surveys, fittings
          forms. With a Property Passport in place from day one, that drops to
          around <strong>14 days</strong>.
        </div>
      </div>

      <div class="market-stat-block teal">
        <div class="market-stat-num">1 in 3</div>
        <div class="market-stat-label">Sales collapse</div>
        <div class="market-stat-headline">No safety net before completion</div>
        <div class="market-stat-text">
          <strong>Roughly 33% of agreed UK property sales fall through</strong>
          before completion. The most common cause is a problem revealed in the
          buyer's solicitor's enquiries weeks into the transaction - something
          the seller didn't know about, or didn't think mattered. By that point
          both sides have spent thousands.
        </div>
      </div>

      <div class="market-stat-block deep">
        <div class="market-stat-num">£2,700</div>
        <div class="market-stat-label">Lost per consumer</div>
        <div class="market-stat-headline">Per failed sale, on average</div>
        <div class="market-stat-text">
          The average buyer or seller burns about
          <strong>£2,700 per fall-through</strong> - survey fees, legal fees,
          mortgage application fees, removal deposits, and the personal cost of
          stress and time off work. Multiply across the country and the figure
          is roughly <strong>£900 million a year</strong> in waste.
        </div>
      </div>

      <!-- WHY IT HAPPENS -->
      <div class="market-section-h">Why it happens</div>

      <p class="market-para">
        The English property system has a quiet design flaw at its heart:
        <strong>everything important is revealed at the wrong time.</strong> A
        buyer falls in love with a house, makes an offer, gets it accepted - and
        only then do the questions begin. Where are the title deeds? Has the
        loft conversion got building regs? Is there a covenant on the boundary?
        When was the boiler last serviced?
      </p>

      <p class="market-para">
        The seller scrambles. Most of these answers exist somewhere - in a
        drawer, an old email, a council archive - but finding them takes weeks.
        While the seller hunts, the buyer waits. Their mortgage offer expires.
        Their patience runs out. Or worse, a survey reveals damp, or a search
        flags a planning issue, or a leasehold condition turns out to be more
        onerous than it looked. The buyer pulls out. The seller starts again.
      </p>

      <p class="market-para">
        The system assumes
        <strong>discovery should happen during the transaction.</strong>
        That's the design flaw. By the time problems surface, they're expensive,
        emotional, and binary - fix it now or lose the sale. Most sellers had no
        idea anything was wrong. They just wanted to move.
      </p>

      <div class="market-pull-quote">
        "You don't know what you don't know - until you're three weeks in and
        the buyer's solicitor asks for something you can't find."
        <div class="market-pull-attr">
          Industry observation
          <span class="illustrative-tag">Illustrative</span>
        </div>
      </div>

      <!-- GOVERNMENT SECTION -->
      <div class="market-section-h">What's changing</div>

      <div class="govt-card">
        <div class="govt-eyebrow">Policy update</div>
        <div class="govt-headline">The government is acting.</div>
        <div class="govt-text">
          The case for upfront information has been understood at a policy level
          for some time. <strong>Mandation is coming</strong> - every UK
          property will be required to have a Property Passport-equivalent
          record before being put on the market. The aim is to surface what
          buyers' solicitors will inevitably ask for, before the offer stage
          rather than after it. Estate agents, conveyancers, and consumer bodies
          have been broadly supportive. UMU has been engaged in the
          conversations leading up to this change, and is one of the providers
          preparing for the new regime.
        </div>
      </div>

      <!-- FOUNDER SECTION -->
      <div class="market-section-h">Why I started UMU</div>

      <div class="founder-card">
        <div class="founder-eyebrow">From the founder</div>
        <div class="founder-headline">
          I've spent over 34 years in this industry. I've watched the same thing
          happen, again and again.
        </div>

        <div class="founder-para">
          I've seen heartbreak. I've seen tears. I've watched people lose homes
          they'd already mentally moved into, lose deposits they couldn't afford
          to lose, lose months of their lives to a process that promised to
          deliver and didn't. I've watched buyers and sellers alike feel
          completely <strong>out of control</strong>
          - because every answer they need only arrives after they've already
          committed.
        </div>

        <div class="founder-para">
          Every pitfall you can imagine, I've seen play out. The survey that
          revealed something the seller genuinely didn't know about. The
          leasehold condition that wasn't flagged until exchange. The chain that
          broke because the third party in it had paperwork they couldn't find.
          None of these are dramatic stories on their own - they're the quiet,
          ordinary failures that happen tens of thousands of times a year in
          this country.
        </div>

        <div class="founder-para">
          UMU exists because
          <strong>none of it has to be like this.</strong> The information the
          buyer's solicitor will ask for is, almost without exception, already
          discoverable. It's just discovered too late. If we surface it on day
          one - verified, transferable, owned by the seller - the whole rhythm
          of the transaction changes. The seller stays in control of their own
          home's record. The buyer makes informed decisions. The system finally
          serves the people inside it instead of testing them.
        </div>

        <div class="founder-para">That's why I built this.</div>

        <div class="founder-sig">
          UMU's founder
          <span class="illustrative-tag">Draft copy · review with founder</span>
        </div>
      </div>

      <!-- COMPARISON -->
      <div class="market-section-h">With vs without a Passport</div>

      <div class="compare-grid">
        <div class="compare-cell without">
          <div class="compare-cell-label">Without</div>
          <div class="compare-row bad">
            <span class="day">Day 0</span
            ><span class="what">Offer accepted</span>
          </div>
          <div class="compare-row bad">
            <span class="day">Day 21</span
            ><span class="what">Survey reveals issue</span>
          </div>
          <div class="compare-row bad">
            <span class="day">Day 47</span
            ><span class="what">Buyer renegotiates</span>
          </div>
          <div class="compare-row bad">
            <span class="day">Day 74</span
            ><span class="what">Pulls out, starts again</span>
          </div>
          <div class="compare-row bad">
            <span class="day">Day 179</span
            ><span class="what">Eventual completion</span>
          </div>
        </div>
        <div class="compare-cell with">
          <div class="compare-cell-label">With UMU</div>
          <div class="compare-row good">
            <span class="day">Day -30</span
            ><span class="what">Passport ready</span>
          </div>
          <div class="compare-row good">
            <span class="day">Day 0</span
            ><span class="what">Offer accepted</span>
          </div>
          <div class="compare-row good">
            <span class="day">Day 2</span
            ><span class="what">Solicitor reviews record</span>
          </div>
          <div class="compare-row good">
            <span class="day">Day 11</span><span class="what">Exchange</span>
          </div>
          <div class="compare-row good">
            <span class="day">Day 14</span><span class="what">Completion</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="market-final-cta">
        <div class="mfc-eyebrow">This is what UMU is for</div>
        <div class="mfc-headline">Start with a free HomeScore.</div>
        <div class="mfc-sub">
          No card needed. See what your home tells you in 60 seconds. Upgrade to
          a Passport when you're ready to sell.
        </div>
        <button
          class="mfc-btn"
          type="button"
          @click="navigateTo('/onboarding/signup')"
        >
          Get started - it's free
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <div style="height: 24px" />
    </div>

    <!-- ══════════════════════ AISHA ══════════════════════ -->
    <div v-show="screen === 'aisha'" class="ld-screen">
      <div class="back-bar">
        <button class="back-btn" type="button" @click="dismissSubscreen">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="back-bar-title">A real story</div>
      </div>

      <div class="aisha-hero">
        <div class="aisha-eyebrow">A real story · Coventry, March 2026</div>
        <div class="aisha-title">
          Aisha sold her two-bed in <em>fourteen days.</em>
        </div>
        <div class="aisha-byline">
          <div class="aisha-byline-av">A</div>
          <div>
            <div class="aisha-byline-name">Aisha Patel</div>
            <div class="aisha-byline-meta">Seller · 5 min read</div>
          </div>
        </div>
      </div>

      <!-- Numbers strip — designed tiles -->
      <div class="aisha-numbers">
        <div class="aisha-num-cell teal">
          <div class="aisha-num-big">14<span class="unit">days</span></div>
          <div class="aisha-num-label">Offer to completion</div>
        </div>
        <div class="aisha-num-cell gold">
          <div class="aisha-num-big">£0</div>
          <div class="aisha-num-label">Lost in survey fees</div>
        </div>
        <div class="aisha-num-cell navy">
          <div class="aisha-num-big">£2.7<span class="unit">k</span></div>
          <div class="aisha-num-label">Saved vs UK avg</div>
        </div>
      </div>

      <!-- Chapter 1 -->
      <div class="aisha-section-h">
        <span class="aisha-section-num">01</span>
        <span class="aisha-section-rule" />
        <span class="aisha-section-num">Before</span>
      </div>
      <div class="aisha-section-title">Why she <em>started early.</em></div>
      <p class="aisha-para">
        Aisha had watched her parents lose a sale four years ago. The buyer's
        solicitor asked for FENSA certificates her mother couldn't find, and
        after two months of searching, the buyer pulled out. They lost £3,400 in
        survey fees. Her mother started again from scratch.
      </p>
      <p class="aisha-para">
        When Aisha decided to sell her two-bed semi in Coventry, she didn't want
        to risk the same outcome. She started preparing the paperwork
        <strong>three weeks before her first viewing.</strong>
      </p>

      <div class="aisha-pull">
        <div class="aisha-pull-quote">
          "I didn't want my house to fall through because the buyer's solicitor
          needed a bit of paper I couldn't find."
        </div>
        <div class="aisha-pull-attr">- Aisha</div>
      </div>

      <!-- Chapter 2 -->
      <div class="aisha-section-h">
        <span class="aisha-section-num">02</span>
        <span class="aisha-section-rule" />
        <span class="aisha-section-num">During</span>
      </div>
      <div class="aisha-section-title">
        A passport, ready <em>before the first viewing.</em>
      </div>
      <p class="aisha-para">
        Aisha set up her Property Passport in late February. Title deeds came
        through automatically from HM Land Registry. The Coventry council's
        planning portal returned her search results in three days. The 2019
        FENSA certificate - the one her mother couldn't find - was already on
        file with the installer.
      </p>
      <p class="aisha-para">
        By the time the agent put a board up, the Passport was complete.
        <strong>Fourteen sections, all verified, all ready to share.</strong>
        She listed on March 3rd.
      </p>

      <!-- Chapter 3 -->
      <div class="aisha-section-h">
        <span class="aisha-section-num">03</span>
        <span class="aisha-section-rule" />
        <span class="aisha-section-num">After</span>
      </div>
      <div class="aisha-section-title">
        Fourteen days, <em>start to finish.</em>
      </div>
      <p class="aisha-para">
        Two viewings on the first weekend. An offer at the asking price by
        Wednesday. The buyer's solicitor downloaded Aisha's Passport on Thursday
        morning - and by Thursday afternoon, they'd raised exactly two
        enquiries, both about the loft conversion.
      </p>
      <p class="aisha-para">
        Both questions had answers waiting in the Passport. Building regs
        sign-off from 2014. The original architect's plan. Searches were already
        in. Exchange happened on day 11. Completion on day 14.
      </p>

      <div class="aisha-pull">
        <div class="aisha-pull-quote">
          "We had a Passport ready before our first viewing. The buyer's
          solicitor had everything they needed in a day. No surveys lost, no
          fall-through."
        </div>
        <div class="aisha-pull-attr">- Aisha</div>
      </div>

      <!-- Closing CTA -->
      <div class="aisha-final-cta">
        <div class="afc-eyebrow-pill">Ready when you are</div>
        <div class="afc-headline">Sell like Aisha did.</div>
        <div class="afc-sub">
          Start with a free HomeScore. Upgrade to a Passport when you're ready
          to list.
        </div>
        <button
          class="afc-btn"
          type="button"
          @click="navigateTo('/onboarding/signup')"
        >
          Start a Property Passport
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <div style="height: 24px" />
    </div>

    <!-- ══════════════════════ SAMPLE PASSPORT ══════════════════════ -->
    <div v-show="screen === 'sample'" class="ld-screen">
      <div class="back-bar">
        <button class="back-btn" type="button" @click="dismissSubscreen">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="back-bar-title">Sample Property Passport</div>
      </div>

      <div class="sample-banner">
        <div class="sample-banner-tag">Sample</div>
        <div class="sample-banner-text">
          A demo passport for an illustrative property - not a real listing.
        </div>
      </div>

      <!-- Buyer-access strip — only on the buyer view -->
      <div v-if="currentSample.isBuyerView" class="buyer-access-strip">
        <div class="bas-icon">🔓</div>
        <div class="bas-info">
          <div class="bas-title">You unlocked this passport</div>
          <div class="bas-sub">
            Read-only access · expires in 30 days · paid £49
          </div>
        </div>
      </div>

      <div class="sample-type-picker">
        <button
          v-for="t in sampleTypes"
          :key="t.value"
          type="button"
          class="stp-btn"
          :class="{ active: sampleType === t.value }"
          @click="sampleType = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Real-app-faithful sample passports — each component mirrors its
           live page (hero, dashboard, action row, collaborators, subtabs)
           but lists only 4 curated sections + a "+ N more" hint. -->
      <SellerSampleView v-if="sampleType === 'seller'" />
      <LandlordSampleView v-else-if="sampleType === 'landlord'" />
      <BuyerSampleView v-else-if="sampleType === 'buyer'" />

      <!-- CTA bar — shown for every sample type (seller, landlord, buyer) -->
      <div v-if="currentSample.isBuyerView" class="sample-cta-bar buyer">
        <div class="scb-headline">Like what you see?</div>
        <div class="scb-sub">{{ currentSample.ctaSub }}</div>
        <div class="buyer-cta-row">
          <button
            class="buyer-cta secondary"
            type="button"
            @click="navigateTo('/onboarding/signup')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
            Save
          </button>
          <button
            class="buyer-cta secondary"
            type="button"
            @click="navigateTo('/onboarding/signup')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
            Message
          </button>
          <button
            class="buyer-cta secondary"
            type="button"
            @click="navigateTo('/onboarding/signup')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
            </svg>
            Report
          </button>
        </div>
        <button
          class="scb-btn"
          type="button"
          @click="navigateTo('/onboarding/signup')"
          style="margin-top: 12px"
        >
          Make an offer
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <div v-else class="sample-cta-bar">
        <div class="scb-headline">Want one for your home?</div>
        <div class="scb-sub">{{ currentSample.ctaSub }}</div>
        <button
          class="scb-btn"
          type="button"
          @click="navigateTo('/onboarding/signup')"
        >
          {{ currentSample.ctaLabel }}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Coach-mark tour for the four landing cards. Teleports to body so it
         sits above the deck regardless of where the page is scrolled. -->
    <TourCoach :tour="landingTour" />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'
import SellerSampleView from '~/components/landing/SellerSampleView.vue'
import LandlordSampleView from '~/components/landing/LandlordSampleView.vue'
import BuyerSampleView from '~/components/landing/BuyerSampleView.vue'
import TourCoach from '~/components/homescore/TourCoach.vue'
import { useHomescoreTour } from '~/composables/useHomescoreTour'

definePageMeta({ middleware: 'guest' })

type Screen = 'landing' | 'market' | 'aisha' | 'sample'
type SampleType = 'seller' | 'landlord' | 'buyer'

const screen = ref<Screen>('landing')
const sampleType = ref<SampleType>('seller')

// Screen switches render different content in place on the same route, so
// the browser never resets scroll on its own — without this the new screen
// can render already scrolled to wherever the previous one was left.
watch(screen, (next, prev) => {
  if (next !== prev && import.meta.client) window.scrollTo(0, 0)
})

// Allow deep-linking to the sample sub-screen via /?sample=seller|landlord|buyer
const route = useRoute()
onMounted(() => {
  const s = route.query.sample
  if (s === 'seller' || s === 'landlord' || s === 'buyer') {
    sampleType.value = s
    screen.value = 'sample'
  }
})

// Smart back handler for the sample / aisha / market screens. Authenticated
// users always came from /dashboard (via "See a sample Passport" on the
// HomeScore/Passport card), so back should return them there — NOT to the
// marketing landing deck, which is meant for unauthenticated visitors. The
// fall-back for guests is the in-page landing screen.
function dismissSubscreen() {
  if (typeof window !== 'undefined' && localStorage.getItem('token')) {
    navigateTo('/dashboard', { replace: true })
    return
  }
  screen.value = 'landing'
}

const cards = [
  {
    id: 'explore',
    peekLabel: 'Explore',
    peekSub: 'See what we already know about any UK home.',
    peekPill: 'Free',
    cta: 'Explore property',
  },
  {
    id: 'HomeScore',
    peekLabel: 'HomeScore',
    peekSub: 'Could your home be costing you more than it should?',
    peekPill: 'Free',
    cta: 'Check your home',
  },
  {
    id: 'passport',
    peekLabel: 'Property Passport',
    peekSub: "Build your home's verified digital record.",
    peekPill: 'Solicitor-grade',
    cta: 'Start a property passport',
  },
  {
    id: 'aisha',
    peekLabel: 'A real story',
    peekSub: 'See how UMU is helping homeowners.',
    peekPill: '5 min read',
    cta: 'Read her story',
  },
  {
    id: 'market',
    peekLabel: 'Why Moves Fail',
    peekSub: 'Live property market insights.',
    peekPill: 'Why it matters',
    cta: 'Read the case',
  },
]
// Fixed reference order the deck always rotates around — never mutated,
// so every rotation (manual click or tour step) is relative to this same
// circle rather than whatever order a previous click left `stack` in.
// Without that, "bring X to front" by splicing X out and prepending it
// only preserves the OTHER cards' relative order, not the full circular
// order (e.g. clicking the 2nd card would put the 1st card 2nd instead
// of sending it to the back, behind everything that followed it).
const CANONICAL_IDS = cards.map((c) => c.id)
const stack = ref<string[]>([...CANONICAL_IDS])

function positionOf(id: string) {
  return stack.value.indexOf(id) + 1
}
function rotateStackTo(id: string) {
  const idx = CANONICAL_IDS.indexOf(id)
  if (idx === -1) return
  stack.value = [...CANONICAL_IDS.slice(idx), ...CANONICAL_IDS.slice(0, idx)]
}
function bringToFront(id: string) {
  if (stack.value[0] === id) {
    onCardCta(id)
    return
  }
  rotateStackTo(id)
}
function onCardCta(id: string) {
  if (id === 'explore') navigateTo('/discover')
  else if (id === 'HomeScore') navigateTo('/homescore')
  // Was '/claim' — a single-property claim flow, wrong for a landing card
  // that's introducing the whole Property Passport ecosystem rather than
  // one specific claim. Routes to the dashboard's passport home instead,
  // matching where "Passport" already lands from the main nav.
  else if (id === 'passport') navigateTo('/dashboard')
  else if (id === 'aisha') screen.value = 'aisha'
  else if (id === 'market') screen.value = 'market'
}

// "See a sample" pill on the Property Passport card — was previously
// what the main CTA button did before it was repointed at /claim.
function showPassportSample() {
  screen.value = 'sample'
}

// ── Coach-mark tour ────────────────────────────────────────────────────
// Walks through the four landing cards one by one. The deck normally only
// shows the front card in full — to make sure the card being explained is
// visible, we reorder the stack so the current step's card sits on top
// before the spotlight measures the target.
const landingTour = useHomescoreTour({
  storageKey: 'umu-tour-landing',
  autoStart: true,
  steps: [
    {
      sel: '[data-tour="explore"]',
      title: 'Explore any UK property',
      body: 'See what we already know - value, history, energy, planning, local area and more. Free, no account needed.',
    },
    {
      sel: '[data-tour="HomeScore"]',
      title: 'HomeScore - free in 60 seconds',
      body: 'A quick read on how your home compares to the street: running costs, EPC rating, where you could save. No signup needed.',
    },
    {
      sel: '[data-tour="passport"]',
      title: 'Property Passport - solicitor-grade',
      body: "A verified record of everything a buyer's solicitor will ask for - deeds, planning, surveys, fittings. Ready from day one, not three weeks into a sale.",
    },
    {
      sel: '[data-tour="aisha"]',
      title: 'A real story - Aisha, Coventry',
      body: 'A two-bed semi sold in 14 days with no fall-throughs, because the paperwork was ready before the first viewing. Tap to read how.',
    },
    {
      sel: '[data-tour="market"]',
      title: 'Why we built this',
      body: "A third of UK sales collapse. The ones that complete take almost six months. Here's the case for fixing it - and the numbers behind it.",
    },
  ],
})

// The tour's steps target cards by `[data-tour="id"]` selector and skip the
// 'explore' card (it's not part of the walkthrough) — so the step index does
// NOT line up with `cards`' own index and must never be used to index it
// directly (that previously brought the wrong card to front on every step).
function tourStepCardId(i) {
  const sel = landingTour.steps[i]?.sel
  return sel?.match(/data-tour="([^"]+)"/)?.[1]
}

// Whenever the tour advances, bring the matching card to the front so the
// spotlight lands on the card we're talking about (cards are stacked with
// `data-pos` and only the front one is fully visible).
watch(
  () => landingTour.idx.value,
  (i) => {
    if (!landingTour.active.value) return
    const cardId = tourStepCardId(i)
    if (cardId && stack.value[0] !== cardId) {
      rotateStackTo(cardId)
    }
  },
  { immediate: false },
)
// Also reorder when the tour first opens (idx=0 already, watch won't fire).
watch(
  () => landingTour.active.value,
  (on) => {
    if (!on) return
    const cardId = tourStepCardId(landingTour.idx.value)
    if (cardId && stack.value[0] !== cardId) {
      rotateStackTo(cardId)
    }
  },
)

const sampleTypes: { value: SampleType; label: string }[] = [
  { value: 'seller', label: 'Seller' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'buyer', label: 'Buyer' },
]

// Full 17-section seller dataset — used by both the SELLER and the BUYER
// view (the buyer view is identical to the seller view, just read-only with
// buyer-specific banners and CTAs).
const SELLER_PROPERTY = {
  addr: '55, Woodfield Road',
  postcode: 'Coventry, CV5 6AJ',
  bookAddress: '55, Woodfield<br/>Road<br/>CV5 6AJ',
  value: '£420,000',
  pills: ['🏠 4 bed', 'House', '📐 1,406 sqft'],
}

// Curated 4 sections — sample stays scannable (full live passport has 17).
const SELLER_SECTIONS = [
  {
    name: 'Title Deeds & Plan',
    sub: 'HM Land Registry · CV722359',
    icon: '📜',
    illusBg: 'linear-gradient(135deg,#fff,#f5f4f0)',
    status: 'Verified',
    statusTone: 'done',
    pct: 100,
  },
  {
    name: 'Searches',
    sub: 'Local authority · Drainage · Environmental',
    icon: '🔍',
    illusBg: 'linear-gradient(135deg,#e2f1ea,#fff)',
    status: 'Verified',
    statusTone: 'done',
    pct: 100,
  },
  {
    name: 'Fixtures & Fittings',
    sub: 'TA10 · 24 items declared',
    icon: '🛋️',
    illusBg: 'linear-gradient(135deg,#fdf4dc,#fff)',
    status: 'Verified',
    statusTone: 'done',
    pct: 100,
  },
  {
    name: 'Boundaries',
    sub: 'Identified and confirmed',
    icon: '📐',
    illusBg: 'linear-gradient(135deg,#e2f1ea,#fff)',
    status: 'Verified',
    statusTone: 'done',
    pct: 100,
  },
]
const SELLER_MORE = {
  moreText: '+ 13 more sections',
  moreMeta:
    'Occupiers · Services · Disputes · Insurance · Environmental · Parking · ...',
}

const samples: Record<SampleType, any> = {
  seller: {
    bookLabel: 'Property Passport',
    bookAddress: SELLER_PROPERTY.bookAddress,
    eyebrow: 'Verified Property Passport',
    addr: SELLER_PROPERTY.addr,
    postcode: SELLER_PROPERTY.postcode,
    stats: [
      { num: '74', label: 'HS' },
      { num: '17', label: 'Sections' },
      { num: '100', suffix: '%', label: 'Complete' },
    ],
    value: SELLER_PROPERTY.value,
    valueLabel: 'Estimated value',
    completion: '100% complete · 0 red flags',
    pills: SELLER_PROPERTY.pills,
    recordsHeading: 'Official records',
    recordsSub:
      'Verified documents that define the legal and structural status of the property.',
    recordStats: [
      { tone: 'green', num: '17', label: 'Fully<br/>answered' },
      { tone: 'amber', num: '0', label: 'Partially' },
      { tone: 'grey', num: '0', label: 'Not yet<br/>shared' },
    ],
    sections: SELLER_SECTIONS,
    moreText: SELLER_MORE.moreText,
    moreMeta: SELLER_MORE.moreMeta,
    ctaSub: 'Solicitor-grade documentation, ready before your first viewing.',
    ctaLabel: 'Start a Property Passport',
  },
  landlord: {
    bookLabel: 'Landlord Passport',
    bookAddress: '14 Hazel Grove<br/>SK7 4BL',
    eyebrow: 'Letting Passport · Active',
    addr: '14 Hazel Grove',
    postcode: 'Stockport, SK7 4BL',
    stats: [
      { num: '11', label: 'Docs' },
      { num: '83', suffix: '%', label: 'Compliant' },
      { num: '1', label: 'Tenant' },
    ],
    value: '£1,200/mo',
    valueLabel: 'Current rent',
    completion: 'Gas Safety renewing in 30 days',
    pills: ['🏠 3 bed', 'Mid-terrace', '🪪 Tenant verified'],
    recordsHeading: 'Compliance & tenancy',
    recordsSub:
      'Statutory documents for letting plus tenancy paperwork - kept current and shareable.',
    recordStats: [
      { tone: 'green', num: '9', label: 'Valid' },
      { tone: 'amber', num: '1', label: 'Renew<br/>soon' },
      { tone: 'grey', num: '1', label: 'To<br/>upload' },
    ],
    sections: [
      {
        name: 'Gas Safety (CP12)',
        sub: 'Annual · renewing in 30 days',
        icon: '🔥',
        illusBg: 'linear-gradient(135deg,#fef3c7,#fff)',
        status: '⚠ Renew soon',
        statusTone: 'warn',
        pct: 80,
      },
      {
        name: 'Electrical Safety (EICR)',
        sub: '5-yearly · valid to Apr 2028',
        icon: '⚡',
        illusBg: 'linear-gradient(135deg,#e2f1ea,#fff)',
        status: '✓ Satisfactory',
        statusTone: 'done',
        pct: 100,
      },
      {
        name: 'Tenancy Agreement (AST)',
        sub: 'Signed · J. Smith · 12-month term',
        icon: '📜',
        illusBg: 'linear-gradient(135deg,#e2f1ea,#fff)',
        status: '✓ Active',
        statusTone: 'done',
        pct: 100,
      },
      {
        name: 'Deposit Protection',
        sub: 'DPS · £1,200 protected',
        icon: '£',
        illusBg: 'linear-gradient(135deg,#e2f1ea,#fff)',
        status: '✓ Protected',
        statusTone: 'done',
        pct: 100,
      },
    ],
    moreText: '+ 8 more sections',
    moreMeta:
      'EPC · Smoke & CO · Legionella · Insurance · Right to Rent · Inventory · ...',
    ctaSub: 'Stay compliant. Share with your tenant in one tap.',
    ctaLabel: 'Start a Landlord Passport',
  },
  buyer: {
    bookLabel: 'Property Passport',
    bookAddress: SELLER_PROPERTY.bookAddress,
    eyebrow: 'Buyer access · read-only',
    addr: SELLER_PROPERTY.addr,
    postcode: SELLER_PROPERTY.postcode,
    stats: [
      { num: '74', label: 'HS' },
      { num: '17', label: 'Sections' },
      { num: '100', suffix: '%', label: 'Complete' },
    ],
    value: SELLER_PROPERTY.value,
    valueLabel: 'Asking price',
    completion: 'Verified passport · 0 red flags',
    pills: SELLER_PROPERTY.pills,
    recordsHeading: 'What this passport tells you',
    recordsSub:
      'Every section the seller has shared with you. Tap any section to read the answers and download the supporting documents.',
    recordStats: [
      { tone: 'green', num: '17', label: 'Fully<br/>answered' },
      { tone: 'amber', num: '0', label: 'Partially' },
      { tone: 'grey', num: '0', label: 'Not yet<br/>shared' },
    ],
    sections: SELLER_SECTIONS,
    moreText: SELLER_MORE.moreText,
    moreMeta: SELLER_MORE.moreMeta,
    ctaSub:
      'Save this property, message the owner, or download the full report to share with your solicitor.',
    ctaLabel: 'Save & message owner',
    isBuyerView: true,
  },
}

const currentSample = computed(() => samples[sampleType.value])
</script>

<style scoped>
.ld-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  position: relative;
  overflow-x: hidden;
}
.ld-screen {
  padding-bottom: 32px;
}

.brand-row {
  display: flex;
  align-items: center;
  padding: 14px 22px 0;
  padding-top: calc(14px + env(safe-area-inset-top));
  gap: 8px;
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.brand-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #00a19a;
}
.brand-spacer {
  flex: 1;
}
.beta-pill {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: 1.4px;
  padding: 4px 10px;
  border-radius: 100px;
  border: 1px solid #00a19a;
  text-transform: uppercase;
}

.hero {
  padding: 22px 22px 0;
}
.hero-title {
  font-size: 30px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1px;
  line-height: 1.02;
  margin-bottom: 8px;
}
.hero-title .lt-teal {
  color: #00a19a;
}
.hero-sub {
  font-size: 14.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
}
.hero-tour-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #00a19a;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.1px;
  padding: 10px 0 0;
  cursor: pointer;
}
.hero-tour-link:hover {
  color: #007e78;
}
.hero-tour-link svg {
  width: 15px;
  height: 15px;
}

/* Deck */
.deck-wrap {
  margin: 22px 22px 0;
  position: relative;
  height: 608px;
}
.deck-card {
  position: absolute;
  left: 0;
  right: 0;
  height: 360px;
  border-radius: 22px;
  cursor: pointer;
  transition: top 0.55s cubic-bezier(0.22, 0.94, 0.32, 1.04),
    transform 0.55s cubic-bezier(0.22, 0.94, 0.32, 1.04), box-shadow 0.4s,
    opacity 0.4s;
  overflow: hidden;
  padding: 22px;
  display: flex;
  flex-direction: column;
  color: #fff;
  box-shadow: 0 18px 40px -10px rgba(0, 0, 0, 0.32),
    0 4px 8px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.deck-card.HomeScore {
  background: radial-gradient(
      circle at 88% 24%,
      rgba(255, 255, 255, 0.16),
      transparent 28%
    ),
    linear-gradient(135deg, #00aaa4 0%, #00968f 100%);
}
.deck-card.passport {
  background: radial-gradient(
      circle at 82% 24%,
      rgba(124, 104, 186, 0.35),
      transparent 34%
    ),
    linear-gradient(135deg, #211b44 0%, #1a1536 100%);
}
.deck-card.aisha {
  background: #c18a38;
}
.deck-card.market {
  background: #1a1535;
}
.deck-card[data-pos='1'] {
  top: 0;
  transform: scale(1);
  z-index: 4;
}
.deck-card[data-pos='2'] {
  top: 62px;
  transform: scale(0.985);
  z-index: 3;
}
.deck-card[data-pos='3'] {
  top: 124px;
  transform: scale(0.97);
  z-index: 2;
}
.deck-card[data-pos='4'] {
  top: 186px;
  transform: scale(0.955);
  z-index: 1;
}
.deck-card[data-pos='5'] {
  top: 248px;
  transform: scale(0.94);
  z-index: 0;
}

.dc-peek {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 58px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 10px 22px;
  pointer-events: none;
}
.dc-peek-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dc-peek-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 1;
  min-width: 0;
}
.dc-peek-label::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}
.dc-peek-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dc-peek-chev {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}
.dc-peek-pill {
  font-size: 11px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 3px 9px;
  border-radius: 100px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
}
.deck-card[data-pos='1'] .dc-peek {
  opacity: 0;
  transition: opacity 0.25s;
}
.deck-card:not([data-pos='1']) .dc-peek {
  opacity: 1;
  transition: opacity 0.4s 0.2s;
}
.deck-card:not([data-pos='1']) .dc-content,
.deck-card:not([data-pos='1']) .dc-foot {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s;
}
.deck-card[data-pos='1'] .dc-content,
.deck-card[data-pos='1'] .dc-foot {
  opacity: 1;
  transition: opacity 0.4s 0.2s;
}

.see-a-sample {
  margin-top: 20px;
  display: inline-block;
  font-size: 16px;
  font-family: inherit;
  color: inherit;
  border: 0.5px solid #00a19a;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 400;
  background: #00a19a8f;
  cursor: pointer;
}

.dc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}
.dc-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2.2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.88);
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.dc-eyebrow .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #bdf4f0;
}
.dc-pill {
  font-size: 11px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  padding: 6px 12px;
  border-radius: 100px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: 0;
  white-space: nowrap;
}

.dc-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}
.dc-header-block {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  position: relative;
}
.dc-card-hero-img {
  width: 108px;
  max-height: 100px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 14px 18px rgba(0, 0, 0, 0.22));
}
.dc-headline {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.12;
}
.dc-sub {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
}

/* ── Explore card - the one light-background card in the deck; every
   other card assumes white-on-dark text, so eyebrow/pill/headline/sub
   all need dark-text overrides here. ── */
.deck-card.explore {
  background: radial-gradient(
      circle at 85% 18%,
      rgba(0, 161, 154, 0.1),
      transparent 45%
    ),
    linear-gradient(160deg, #ddf3ec 0%, #f0faf7 100%);
  color: #231d45;
}
.deck-card.explore .dc-eyebrow {
  color: #00817c;
}
.deck-card.explore .dc-eyebrow .dot {
  background: #00a19a;
}
.deck-card.explore .dc-pill {
  background: rgba(0, 161, 154, 0.12);
  color: #00817c;
}
.deck-card.explore .dc-headline {
  color: #231d45;
}
.deck-card.explore .dc-sub {
  color: #6b7089;
}
/* Text column sits alongside the illustration in .dc-header-block, with
   .dc-sub directly under the headline - otherwise .dc-sub sat below the
   whole (taller) image row, leaving a slab of empty space under the
   shorter two-line headline before any text continued. */
.dc-header-text-col {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.dc-header-text-col .dc-sub {
  margin-top: 10px;
}
.deck-card.explore .dc-card-hero-img {
  width: 148px;
  max-height: 140px;
}
.dc-explore-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}
.dc-explore-badge-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  flex-shrink: 0;
}
.dc-explore-badge-sep {
  color: #c7c5d6;
}
/* ── Peek state (card stacked behind another) - same white-on-dark
   assumption as the front-facing overrides above, needs the same
   dark-on-light treatment for the explore card specifically. ── */
.deck-card.explore .dc-peek-label {
  color: #231d45;
}
.deck-card.explore .dc-peek-label::before {
  background: #00a19a;
}
.deck-card.explore .dc-peek-sub {
  color: #6b7089;
}
.deck-card.explore .dc-peek-chev {
  color: #9c98ad;
}
.deck-card.explore .dc-peek-pill {
  background: rgba(0, 161, 154, 0.12);
  color: #00817c;
  border-color: rgba(0, 161, 154, 0.2);
}

.deck-card.HomeScore .dc-headline,
.deck-card.passport .dc-headline {
  font-size: 22px;
  line-height: 1.08;
  max-width: 64%;
}
.deck-card.HomeScore .dc-card-hero-img {
  position: absolute;
  right: -4px;
  top: 10px;
  width: 38%;
  max-height: 122px;
}
.deck-card.passport .dc-card-hero-img {
  position: absolute;
  right: -4px;
  top: 18px;
  width: 37%;
  max-height: 118px;
}
.deck-card.HomeScore .dc-sub,
.deck-card.passport .dc-sub {
  margin-top: 8px;
  max-width: 60%;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.32;
}

.dc-hs-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
}
.dc-hs-gauge {
  width: 60px;
  height: 60px;
  position: relative;
  flex-shrink: 0;
}
.dc-hs-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.dc-hs-gauge .g-bg {
  stroke: rgba(255, 255, 255, 0.2);
}
.dc-hs-gauge .g-fill {
  stroke: #fff;
  stroke-linecap: round;
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
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1;
}
.gn-small {
  font-size: 7.5px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 2px;
}
.dc-hs-meta-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dc-hs-meta-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.3;
}
.dc-hs-meta-item svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.85);
}
.dc-hs-meta-item strong {
  color: #fff;
  font-weight: 800;
}

.dc-ai-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
}
.dc-ai-num {
  font-size: 56px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -2px;
  line-height: 0.9;
  flex-shrink: 0;
}
.dc-ai-num .unit {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 800;
  margin-left: 4px;
}
.dc-ai-text {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.5;
}
.dc-ai-text strong {
  color: #fff;
  font-weight: 800;
}

.dc-mk-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 18px;
}
.dc-mk-cell {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
}
.dc-mk-num {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1;
  margin-bottom: 4px;
}
.dc-mk-num .unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 800;
  margin-left: 2px;
}
.dc-mk-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  line-height: 1.2;
}

.dc-foot {
  margin-top: auto;
  padding-top: 10px;
  position: relative;
  z-index: 2;
}
.dc-cta {
  width: 100%;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 11px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
  transition: all 0.15s;
}
.dc-cta:hover {
  background: rgba(255, 255, 255, 0.26);
}
.dc-cta svg {
  width: 13px;
  height: 13px;
}
.deck-card.HomeScore .dc-cta,
.deck-card.passport .dc-cta,
.deck-card.aisha .dc-cta,
.deck-card.market .dc-cta,
.deck-card.explore .dc-cta {
  width: min(100%, 212px);
  justify-content: space-between;
  border: 0;
  border-radius: 999px;
  padding: 13px 18px;
  font-size: 15px;
}
.deck-card.HomeScore .dc-cta {
  background: #fff;
  color: #008f88;
}
.deck-card.HomeScore .dc-cta:hover {
  background: rgba(255, 255, 255, 0.92);
}
/* Explore card is light-background (every other card is dark), so its
   button needs to be the one solid/dark-enough surface for contrast -
   same rgba(255,255,255,...) treatment the others use would be
   invisible on white. */
.deck-card.explore .dc-cta {
  background: #00a19a;
  color: #fff;
}
.deck-card.explore .dc-cta:hover {
  background: #00918b;
}
.deck-card.passport .dc-cta {
  /* "Start a property passport" is the longest CTA label in the deck -
     the shared 212px cap above (sized for the other cards' shorter
     text) wraps it onto two lines, so this card needs its own wider
     cap to keep it on one line. */
  width: min(100%, 300px);
  white-space: nowrap;
  background: rgba(103, 83, 170, 0.62);
  color: #fff;
}
.deck-card.passport .dc-cta:hover {
  background: rgba(113, 92, 184, 0.78);
}
.deck-card.aisha .dc-cta {
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
}
.deck-card.aisha .dc-cta:hover {
  background: rgba(0, 0, 0, 0.3);
}
.deck-card.market .dc-cta {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.deck-card.market .dc-cta:hover {
  background: rgba(255, 255, 255, 0.24);
}
.deck-card.HomeScore .dc-cta svg,
.deck-card.passport .dc-cta svg,
.deck-card.aisha .dc-cta svg,
.deck-card.market .dc-cta svg {
  width: 18px;
  height: 18px;
}

.deck-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 18px 22px 0;
}
.deck-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ececef;
  transition: all 0.3s;
  cursor: pointer;
}
.deck-dot.active {
  width: 22px;
  border-radius: 100px;
  background: #00a19a;
}

.cta-section {
  padding: 18px 22px 24px;
}
.cta-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.cta-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  font-family: inherit;
  background: #f7f7fa;
  border: 1px solid #ececef;
  border-radius: 12px;
  padding: 11px 10px;
  cursor: pointer;
}
.cta-card.primary {
  background: linear-gradient(135deg, #e2f7f5, #f0fbfa);
  border-color: rgba(0, 161, 154, 0.25);
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.14);
}
.cta-card-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}
.cta-card-link {
  min-width: 0;
  font-size: 13.5px;
  color: #231d45;
  font-weight: 800;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

/* Sub-screen back bar */
.back-bar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 10px;
  background: #fff;
  border-bottom: 1px solid #ececef;
  position: sticky;
  top: 0;
  z-index: 5;
}
.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fafafa;
  color: #231d45;
  border: 1px solid #ececef;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: inherit;
}
.back-btn svg {
  width: 14px;
  height: 14px;
}
.back-bar-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  flex: 1;
}

/* Market screen */
.market-hero {
  padding: 24px 22px 22px;
  border-bottom: 1px solid #f5f5f7;
}
.market-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.market-title {
  font-size: 32px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1.1px;
  line-height: 1;
  margin-bottom: 12px;
}
.market-sub {
  font-size: 14px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
}

.market-section-h {
  font-size: 12px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 28px 22px 14px;
}

.market-stat-block {
  margin: 0 22px 12px;
  padding: 24px 22px 22px;
  border-radius: 18px;
  position: relative;
  overflow: hidden;
}
.market-stat-block.navy {
  background: #231d45;
}
.market-stat-block.teal {
  background: #00a19a;
}
.market-stat-block.deep {
  background: #1a1535;
}
.market-stat-block::after {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0) 70%
  );
}
.market-stat-num {
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -2px;
  line-height: 0.95;
  margin-bottom: 10px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  position: relative;
  z-index: 1;
}
.ms-d,
.ms-target-unit {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 800;
  margin-left: 4px;
}
.ms-arrow {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
}
.ms-target {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: -0.6px;
  font-weight: 800;
}
.market-stat-label {
  font-size: 11px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.72);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.market-stat-headline {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.4px;
  line-height: 1.25;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}
.market-stat-text {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
  position: relative;
  z-index: 1;
}
.market-stat-text strong {
  color: #fff;
  font-weight: 800;
}

.market-para {
  padding: 0 22px;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #231d45;
  line-height: 1.6;
}
.market-para strong {
  color: #231d45;
  font-weight: 800;
}

/* Pull quote */
.market-pull-quote {
  margin: 22px 22px;
  padding: 16px 0 16px 18px;
  border-left: 3px solid #00a19a;
  font-size: 18px;
  font-weight: 700;
  color: #231d45;
  line-height: 1.35;
  letter-spacing: -0.3px;
}
.market-pull-attr {
  font-size: 12px;
  font-weight: 700;
  color: #9c98ad;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-top: 12px;
}
.illustrative-tag {
  display: inline-block;
  margin-left: 6px;
  font-size: 9px;
  background: #fafafa;
  color: #6b6783;
  padding: 2px 6px;
  border-radius: 100px;
  letter-spacing: 0.3px;
  text-transform: none;
}

/* Government section - navy strip */
.govt-card {
  margin: 0 22px 14px;
  background: #231d45;
  color: #fff;
  border-radius: 16px;
  padding: 18px;
  position: relative;
  overflow: hidden;
}
.govt-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.govt-eyebrow::before {
  content: '';
  width: 14px;
  height: 1px;
  background: #00a19a;
}
.govt-headline {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 10px;
  color: #fff;
}
.govt-text {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
  letter-spacing: -0.1px;
}
.govt-text strong {
  color: #fff;
  font-weight: 800;
}

/* Founder section - soft cream */
.founder-card {
  margin: 0 22px 14px;
  background: #f7f2e8;
  border: 1px solid #efe6cd;
  border-radius: 16px;
  padding: 20px 18px;
}
.founder-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #6b6783;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.founder-eyebrow::before {
  content: '';
  width: 14px;
  height: 1px;
  background: #9c98ad;
}
.founder-headline {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin-bottom: 12px;
  color: #231d45;
}
.founder-para {
  font-size: 15px;
  font-weight: 500;
  color: #231d45;
  line-height: 1.6;
  letter-spacing: -0.1px;
  margin-bottom: 12px;
}
.founder-para:last-child {
  margin-bottom: 0;
}
.founder-para strong {
  font-weight: 800;
}
.founder-sig {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(35, 29, 69, 0.1);
  font-size: 12px;
  font-weight: 700;
  color: #6b6783;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}
.founder-sig .illustrative-tag {
  font-size: 9px;
  background: rgba(35, 29, 69, 0.06);
  color: #6b6783;
  padding: 3px 7px;
  border-radius: 100px;
  letter-spacing: 0.3px;
  text-transform: none;
  font-weight: 700;
  margin-left: 0;
}

/* With/without comparison - joined grid */
.compare-grid {
  margin: 0 22px 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #ececef;
  border: 1px solid #ececef;
  border-radius: 14px;
  overflow: hidden;
}
.compare-cell {
  background: #fff;
  padding: 14px 12px;
}
.compare-cell.without {
  background: #fafafa;
}
.compare-cell-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.compare-cell.without .compare-cell-label {
  color: #6b6783;
}
.compare-cell.with .compare-cell-label {
  color: #00a19a;
}
.compare-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-top: 1px solid #f5f5f7;
  font-size: 13px;
  font-weight: 600;
  color: #231d45;
  line-height: 1.4;
  letter-spacing: -0.1px;
}
.compare-row:first-of-type {
  border-top: none;
  padding-top: 0;
}
.compare-row .day {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.4px;
  flex-shrink: 0;
  width: 38px;
  padding-top: 2px;
}
.compare-row .what {
  flex: 1;
}
.compare-row.bad .what {
  color: #b85b36;
}
.compare-row.good .what {
  color: #00a19a;
  font-weight: 800;
}

/* Closing CTA */
.market-final-cta {
  margin: 24px 22px;
  padding: 22px 20px;
  background: #231d45;
  color: #fff;
  border-radius: 18px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.market-final-cta::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -25%;
  width: 70%;
  height: 180%;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.22), transparent 60%);
  pointer-events: none;
}
.mfc-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}
.mfc-headline {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}
.mfc-sub {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  margin-bottom: 18px;
  position: relative;
  z-index: 2;
}
.mfc-btn {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
  position: relative;
  z-index: 2;
}
.mfc-btn:hover {
  background: #00b6ae;
}
.mfc-btn svg {
  width: 13px;
  height: 13px;
}

/* ── AISHA STORY SCREEN ───────────────────────────────────── */
.aisha-hero {
  padding: 28px 22px 24px;
  border-bottom: 1px solid #f5f5f7;
}
.aisha-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.aisha-title {
  font-size: 30px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1px;
  line-height: 1.05;
  margin-bottom: 16px;
}
.aisha-title em {
  font-style: normal;
  color: #00a19a;
  font-weight: 800;
  letter-spacing: -1px;
}
.aisha-byline {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #6b6783;
  letter-spacing: -0.1px;
}
.aisha-byline-av {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c18a38 0%, #8a5f1f 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}
.aisha-byline-name {
  font-weight: 800;
  color: #231d45;
}
.aisha-byline-meta {
  color: #9c98ad;
}

.aisha-numbers {
  background: transparent;
  padding: 24px 22px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.aisha-num-cell {
  position: relative;
  padding: 18px 14px 14px;
  border-radius: 14px;
  text-align: left;
}
.aisha-num-cell.teal {
  background: #00a19a;
}
.aisha-num-cell.navy {
  background: #231d45;
}
.aisha-num-cell.gold {
  background: #c18a38;
}
.aisha-num-big {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1.5px;
  line-height: 1;
  margin-bottom: 10px;
}
.aisha-num-big .unit {
  font-size: 14px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: -0.1px;
  margin-left: 3px;
}
.aisha-num-label {
  font-size: 9px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  line-height: 1.35;
}

.aisha-section-h {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 28px 22px 14px;
}
.aisha-section-num {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
}
.aisha-section-rule {
  flex: 1;
  height: 1px;
  background: #ececef;
}
.aisha-section-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  line-height: 1.2;
  padding: 0 22px 14px;
}
.aisha-section-title em {
  font-style: normal;
  color: #00a19a;
  font-weight: 800;
}
.aisha-para {
  padding: 0 22px;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #231d45;
  line-height: 1.6;
  letter-spacing: -0.1px;
}
.aisha-para strong {
  font-weight: 800;
}

.aisha-pull {
  margin: 22px 22px;
  padding: 14px 0 14px 18px;
  border-left: 3px solid #00a19a;
}
.aisha-pull-quote {
  font-size: 18px;
  font-weight: 700;
  color: #231d45;
  line-height: 1.4;
  letter-spacing: -0.3px;
  margin-bottom: 10px;
}
.aisha-pull-attr {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.aisha-final-cta {
  margin: 24px 22px;
  padding: 22px 20px 20px;
  background: #fff;
  border: 1px solid #e5f4f2;
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.04);
}
.afc-eyebrow-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: #007e78;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  padding: 5px 11px;
  border-radius: 100px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.afc-headline {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1.15;
  margin-bottom: 8px;
}
.afc-sub {
  font-size: 15px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
  margin-bottom: 18px;
  letter-spacing: -0.05px;
  padding: 0 4px;
}
.afc-btn {
  display: inline-flex;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 11px 22px;
  border-radius: 100px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: -0.2px;
}
.afc-btn:hover {
  background: #00b6ae;
}
.afc-btn svg {
  width: 11px;
  height: 11px;
  opacity: 0.85;
}

/* Sample passport */
.sample-banner {
  margin: 16px 22px 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fef3c7, #fff);
  border: 1px solid rgba(193, 138, 56, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.sample-banner-tag {
  font-size: 11px;
  font-weight: 800;
  background: #c18a38;
  color: #fff;
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.sample-banner-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #6b4e9f;
  line-height: 1.4;
}

.sample-type-picker {
  display: flex;
  gap: 6px;
  padding: 14px 22px 6px;
}
.stp-btn {
  flex: 1;
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 100px;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  color: #6b6783;
  cursor: pointer;
  letter-spacing: -0.2px;
  transition: all 0.18s;
}
.stp-btn.active {
  background: #231d45;
  color: #fff;
  border-color: #231d45;
}

.passport-header {
  margin: 14px 22px 0;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, #f5f5f7, #fff);
  border: 1px solid #ececef;
  display: flex;
  gap: 16px;
}
.passport-header.tone-seller {
  background: linear-gradient(135deg, #fdf4dc, #fff);
  border-color: rgba(193, 138, 56, 0.32);
}
.passport-header.tone-landlord {
  background: linear-gradient(135deg, #e2f1ea, #fff);
  border-color: rgba(0, 161, 154, 0.32);
}
.passport-header.tone-buyer {
  background: linear-gradient(135deg, #ede5ff, #fff);
  border-color: rgba(157, 123, 255, 0.32);
}

.ph-book {
  width: 96px;
  flex-shrink: 0;
  aspect-ratio: 5 / 7;
  border-radius: 8px 12px 12px 8px;
  background: linear-gradient(135deg, #00a19a, #007e78);
  position: relative;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.tone-seller .ph-book {
  background: linear-gradient(135deg, #c18a38, #8a5f1f);
}
.tone-buyer .ph-book {
  background: linear-gradient(135deg, #231d45, #1a1535);
}
.ph-book-spine {
  position: absolute;
  left: 4px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.4);
}
.ph-book-label-top {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
  text-align: center;
  margin-left: 8px;
}
.ph-book-logo {
  margin: 0 0 8px 8px;
}
.ph-book-addr {
  font-size: 8.5px;
  font-weight: 800;
  text-align: center;
  margin-top: auto;
  margin-left: 8px;
  line-height: 1.25;
  letter-spacing: -0.2px;
}

.ph-info {
  flex: 1;
  min-width: 0;
}
.ph-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.ph-addr {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.ph-postcode {
  font-size: 13px;
  font-weight: 700;
  color: #6b6783;
  margin-top: 2px;
  margin-bottom: 12px;
}
.ph-stats {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ph-stat {
  flex: 1;
  text-align: left;
}
.phs-num {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
}
.phs-pct {
  font-size: 12px;
  color: #6b6783;
  margin-left: 1px;
}
.phs-label {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 2px;
}
.ph-stat-divider {
  width: 1px;
  height: 24px;
  background: #ececef;
}

.addr-block {
  margin: 14px 22px 0;
  padding: 18px;
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 18px;
}
.addr-h {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.6px;
}
.addr-sub {
  font-size: 14px;
  font-weight: 700;
  color: #6b6783;
  margin-top: 2px;
  margin-bottom: 14px;
}
.addr-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.addr-value {
  font-size: 24px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.6px;
}
.addr-value-label {
  font-size: 12px;
  font-weight: 700;
  color: #9c98ad;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  flex: 1;
}
.addr-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 800;
  background: #e2f1ea;
  color: #007e78;
  padding: 4px 10px;
  border-radius: 100px;
}
.addr-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.addr-pill {
  font-size: 12px;
  font-weight: 800;
  background: #f5f5f7;
  color: #4a4566;
  padding: 5px 11px;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.or-header {
  padding: 22px 22px 8px;
}
.or-h {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  margin-bottom: 4px;
}
.or-sub {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
}

.or-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 0 22px 14px;
}
.or-stat {
  padding: 12px;
  border-radius: 14px;
  text-align: center;
}
.or-stat.green {
  background: #e2f1ea;
  color: #007e78;
}
.or-stat.amber {
  background: #fef3c7;
  color: #92400e;
}
.or-stat.grey {
  background: #f5f5f7;
  color: #6b6783;
}
.ors-num {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
}
.ors-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 6px;
  line-height: 1.2;
}

.section-cards {
  padding: 0 22px;
}
.sec-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 16px;
  margin-bottom: 8px;
}
.sec-illus {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.sec-info {
  flex: 1;
  min-width: 0;
}
.sec-name {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.sec-sub {
  font-size: 12px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 1px;
}
.sec-status-pill {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.3px;
}
.sec-status-pill.done {
  background: #e2f1ea;
  color: #007e78;
}
.sec-status-pill.warn {
  background: #fef3c7;
  color: #92400e;
}
.sec-status-pill.grey {
  background: #f5f5f7;
  color: #6b6783;
}
.sec-progress-col {
  width: 56px;
  flex-shrink: 0;
}
.sec-bar {
  height: 4px;
  background: #f5f5f7;
  border-radius: 100px;
  overflow: hidden;
}
.sec-bar-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 100px;
  transition: width 0.3s;
}
.sec-pct {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  text-align: right;
  margin-top: 4px;
}
.sec-arrow {
  color: #9c98ad;
  font-size: 18px;
  flex-shrink: 0;
}

.sec-more {
  margin-top: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #f5f5f7, #fff);
  border: 1px dashed #ececef;
  border-radius: 14px;
  text-align: center;
}
.sec-more-text {
  font-size: 13px;
  font-weight: 800;
  color: #4a4566;
}
.sec-more-meta {
  font-size: 12px;
  font-weight: 600;
  color: #9c98ad;
  margin-top: 4px;
  line-height: 1.4;
}

.sample-cta-bar {
  margin: 22px 22px 0;
  padding: 24px 22px;
  background: linear-gradient(135deg, #00a19a, #007e78);
  border-radius: 22px;
  text-align: center;
  color: #fff;
  box-shadow: 0 16px 36px rgba(0, 161, 154, 0.4);
}
.scb-headline {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin-bottom: 6px;
}
.scb-sub {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin-bottom: 14px;
}
.scb-btn {
  width: 100%;
  background: #fff;
  color: #00857f;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  padding: 13px 18px;
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
}
.scb-btn svg {
  width: 14px;
  height: 14px;
}

/* ── Buyer-view extras ────────────────────────── */
.buyer-access-strip {
  margin: 10px 22px 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, #ede5ff, #fff);
  border: 1px solid rgba(157, 123, 255, 0.32);
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.bas-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(157, 123, 255, 0.2);
}
.bas-info {
  flex: 1;
  min-width: 0;
}
.bas-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.bas-sub {
  font-size: 12px;
  font-weight: 700;
  color: #6b4e9f;
  margin-top: 2px;
}

.sample-cta-bar.buyer {
  background: linear-gradient(135deg, #231d45, #1a1535);
  box-shadow: 0 16px 36px rgba(35, 29, 69, 0.4);
}

.buyer-cta-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
}
.buyer-cta {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 10px 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  letter-spacing: -0.2px;
  transition: all 0.15s;
}
.buyer-cta:hover {
  background: rgba(255, 255, 255, 0.24);
}
.buyer-cta svg {
  width: 14px;
  height: 14px;
}
.buyer-cta.secondary {
  background: rgba(255, 255, 255, 0.16);
}
</style>
