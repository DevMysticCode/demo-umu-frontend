<template>
  <!-- "‹ UmovingU" pill — sits at the very top of marketplace root
       screens (Home / Projects / Inbox if we want, etc.) and exits
       the sub-app, returning the user to the host UmovingU app's
       Explore page. Inside Capacitor / a WebView wrapper this would
       postMessage back to native; the web build just navigates. -->
  <button class="mp-app-back" type="button" @click="onBack">
    <span class="mp-app-back-chev">‹</span>
    UmovingU
  </button>
</template>

<script setup lang="ts">
const router = useRouter()

function onBack() {
  // If we're embedded in a native WebView, the host listens for a
  // "close" postMessage to dismiss the marketplace tab. Otherwise we
  // just route home in the host app.
  if (typeof window !== 'undefined') {
    const w = window as any
    if (w.ReactNativeWebView?.postMessage) {
      w.ReactNativeWebView.postMessage('close')
      return
    }
  }
  router.push('/explore')
}
</script>

<style scoped>
.mp-app-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 14px 20px -2px;
  padding: 7px 14px 7px 10px;
  border: 1px solid #e4e5ed;
  border-radius: 999px;
  background: #fff;
  color: #6b7089;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.04);
  transition: transform 0.12s ease;
}
.mp-app-back:active {
  transform: scale(0.96);
}
.mp-app-back-chev {
  font-size: 17px;
  line-height: 1;
  color: #008a84;
  margin-top: -2px;
}
</style>
