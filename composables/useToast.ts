interface ToastOptions {
  message: string
  icon?: string
  iconEmoji?: string
  duration?: number
}

const toastState = reactive({
  isVisible: false,
  message: '',
  icon: '',
  iconEmoji: '',
  duration: 2000,
})

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    toastState.message = options.message
    toastState.icon = options.icon || ''
    toastState.iconEmoji = options.iconEmoji || '🏠'
    toastState.duration = options.duration || 2000
    toastState.isVisible = true

    setTimeout(() => {
      toastState.isVisible = false
    }, toastState.duration)
  }

  const hideToast = () => {
    toastState.isVisible = false
  }

  return {
    toastState: readonly(toastState),
    showToast,
    hideToast,
  }
}
