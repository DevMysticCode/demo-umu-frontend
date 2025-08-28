<template>
  <footer class="create-account-or-login">
    <div class="create-account-or-login__buttons">
      <UButton @click="onCreateAccount"
        class="create-account-or-login__button create-account-or-login__button-create-account">
        Create Account
      </UButton>

      <UButton @click="onLogin" class="create-account-or-login__button create-account-or-login__button--login">
        Log in
      </UButton>
    </div>
  </footer>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['onCreateAccount', 'onLogin'])

const onCreateAccount = () => {
  emit('onCreateAccount')
}

const onLogin = () => {
  emit('onLogin')
}
</script>

<style scoped>
.create-account-or-login {
  @apply fixed bottom-0 max-w-md w-full px-4 pb-6;

  &__buttons {
    @apply flex flex-col gap-3;
  }

  &__button {
    display: flex;
    height: 50px;
    padding: 14px 20px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    align-self: stretch;
    border-radius: 12px;
    color: white;
    transition: background-color 0.15s ease;
    font-size: 17px;
  }

  &__button--login {
    background-color: var(--brand-alt-aqua);

    /* TODO these should be themed */
    &:hover {
      /* TODO: this is a hack to make the button look like it's active. Need input from designer */
      background-color: color-mix(in srgb, var(--brand-alt-aqua) 70%, white 30%);
    }
  }

  &__button-create-account {
    @apply bg-white;
    color: var(--brand-alt-aqua);

    &:hover {
      /* TODO: this is a hack to make the button look like it's active. Need input from designer */
      background-color: color-mix(in srgb, var(--grays-white) 70%, var(--brand-alt-aqua) 30%);
    }
  }

}
</style>