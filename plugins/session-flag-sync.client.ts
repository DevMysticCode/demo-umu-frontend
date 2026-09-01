// Backfills the umu_has_session flag cookie (see composables/useSessionFlag.ts
// and middleware/guest.ts) for sessions that predate it — a user already
// logged in before this shipped has a valid token in localStorage but
// nothing ever set the cookie for them, since it's only written at
// login/signup time. Without this, those users would keep seeing the old
// landing-page flash until their token expires and they log in again
// (up to 7 days). Runs once per app boot, client-only: if a token exists
// but the flag doesn't, set it — so their very next visit to `/` gets the
// fast, flash-free SSR redirect.
export default defineNuxtPlugin(() => {
  const token = localStorage.getItem('token')
  if (token) setSessionFlag()
})
