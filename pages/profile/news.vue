<template>
  <div class="nw-page mobile-container">
    <!-- Nav bar -->
    <div class="nw-nav-bar">
      <button class="nw-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="nw-nav-title">News</div>
      <div style="width: 38px" />
    </div>

    <main class="nw-body">
      <div class="atm-bg teal" />
      <p class="nw-intro">Property law and compliance updates that affect your Passport - curated, not automated. New items are added as the law actually changes.</p>

      <!-- Featured — the single most significant item, shown big -->
      <a v-if="featured" class="nw-hero" :href="featured.url" target="_blank" rel="noopener">
        <div class="nw-hero-ic" :class="`nw-ic--${featured.tag}`">
          <img :src="iconForTag(featured.tag)" alt="" class="nw-hero-ic-img" loading="lazy" />
        </div>
        <span class="nw-tag" :class="`nw-tag--${featured.tag}`">{{ featured.tagLabel }}</span>
        <div class="nw-hero-t">{{ featured.title }}</div>
        <div class="nw-hero-s">{{ featured.summary }}</div>
        <div class="nw-hero-foot">
          <span class="nw-src">{{ featured.source }}</span>
          <span class="nw-dot">·</span>
          <span class="nw-date">{{ formatDate(featured.date) }}</span>
          <span class="nw-go">Read the update ↗</span>
        </div>
      </a>

      <div class="section-heading">More updates</div>
      <a v-for="n in rest" :key="n.id" class="nw-row" :href="n.url" target="_blank" rel="noopener">
        <div class="nw-row-ic" :class="`nw-ic--${n.tag}`">
          <img :src="iconForTag(n.tag)" alt="" class="nw-row-ic-img" loading="lazy" />
        </div>
        <div class="nw-row-bd">
          <span class="nw-tag nw-tag--sm" :class="`nw-tag--${n.tag}`">{{ n.tagLabel }}</span>
          <div class="nw-row-t">{{ n.title }}</div>
          <div class="nw-row-s">{{ n.summary }}</div>
          <div class="nw-row-foot">
            <span class="nw-src">{{ n.source }}</span>
            <span class="nw-dot">·</span>
            <span class="nw-date">{{ formatDate(n.date) }}</span>
          </div>
        </div>
        <span class="nw-chev">›</span>
      </a>

      <div style="height: 24px" />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'News - UmovingU', middleware: 'auth' })

const goBack = useGoBack('/profile')

const featured = computed(() => NEWS_ITEMS.find((n) => n.featured) ?? NEWS_ITEMS[0])
const rest = computed(() => NEWS_ITEMS.filter((n) => n.id !== featured.value?.id))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// 3D-isometric icon per tag, matching the compliance section icons
// elsewhere in the app. These filenames don't exist yet — see the
// icon-generation prompts handed to the client; falls back to the
// browser's default broken-image box until they're added, same as any
// other missing icon in this codebase.
function iconForTag(tag: string) {
  return `/op-icons/news/${tag}.png`
}
</script>

<style scoped>
.nw-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}
.nw-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.nw-nav-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.nw-nav-icon-btn:hover { background: #f0f2f1; }
.nw-nav-icon-btn svg { width: 18px; height: 18px; }
.nw-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}
.nw-body { position: relative; padding: 4px 22px 0; }
.atm-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(
    ellipse 60% 80% at 50% 0%,
    rgba(61, 189, 163, 0.14),
    transparent 65%
  );
}
.nw-intro {
  position: relative;
  z-index: 1;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
  margin: 4px 0 18px;
}

.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 18px 0 10px;
}

/* Featured hero card */
.nw-hero {
  display: block;
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(140deg, #2d2466, #231d45 60%, #15102e);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}
.nw-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 196, 188, 0.18), transparent 65%);
}
.nw-hero-ic {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}
.nw-hero-ic-img { width: 30px; height: 30px; object-fit: contain; }
.nw-hero-t {
  font-size: 21px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.4px;
  line-height: 1.25;
  margin-top: 10px;
  position: relative;
  z-index: 1;
}
.nw-hero-s {
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.55;
  margin-top: 8px;
  position: relative;
  z-index: 1;
}
.nw-hero-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  z-index: 1;
}
.nw-src { font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.6); }
.nw-dot { color: rgba(255, 255, 255, 0.35); font-size: 11px; }
.nw-date { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.6); }
.nw-go { margin-left: auto; font-size: 11.5px; font-weight: 800; color: #5eead4; }

/* Tag pill */
.nw-tag {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 100px;
  position: relative;
  z-index: 1;
}
.nw-tag--law { background: rgba(192, 73, 47, 0.25); color: #ffb3a0; }
.nw-tag--update { background: rgba(0, 196, 188, 0.2); color: #5eead4; }
.nw-tag--news { background: rgba(61, 99, 201, 0.25); color: #a8c0ff; }
.nw-tag--sm { position: static; }

/* Row list */
.nw-row {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 15px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  margin-bottom: 10px;
  text-decoration: none;
}
.nw-row-ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nw-row-ic-img { width: 24px; height: 24px; object-fit: contain; }
.nw-ic--law { background: #fbeae5; }
.nw-ic--update { background: #f2faf8; }
.nw-ic--news { background: #e8edfb; }
.nw-row-bd { flex: 1; min-width: 0; }
.nw-row-bd .nw-tag--law { background: #fbeae5; color: #992e1a; }
.nw-row-bd .nw-tag--update { background: #f2faf8; color: #008a84; }
.nw-row-bd .nw-tag--news { background: #e8edfb; color: #3d63c9; }
.nw-row-t {
  font-size: 14.5px;
  font-weight: 700;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.3;
  margin-top: 8px;
}
.nw-row-s {
  font-size: 12px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.45;
  margin-top: 4px;
}
.nw-row-foot { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
.nw-row-foot .nw-src { color: #a8a9ad; }
.nw-row-foot .nw-dot { color: #d4d4d8; }
.nw-row-foot .nw-date { color: #a8a9ad; font-weight: 500; }
.nw-chev { font-size: 18px; color: #d4d4d8; flex-shrink: 0; align-self: center; }
</style>
