interface ToastOptions {
  message: string;
  icon?: string;
  iconEmoji?: string;
  duration?: number;
}

interface ToastState extends ToastOptions {
  isVisible: boolean;
}

export function useToast() {
  const toastState = ref<ToastState>({
    isVisible: false,
    message: '',
    icon: undefined,
    iconEmoji: undefined,
    duration: 2500,
  });

  let timer: ReturnType<typeof setTimeout> | null = null;

  function showToast(options: ToastOptions) {
    if (timer) clearTimeout(timer);
    toastState.value = { isVisible: true, duration: 2500, ...options };
    timer = setTimeout(() => {
      toastState.value.isVisible = false;
    }, toastState.value.duration);
  }

  function hideToast() {
    if (timer) clearTimeout(timer);
    toastState.value.isVisible = false;
  }

  return { toastState, showToast, hideToast };
}
