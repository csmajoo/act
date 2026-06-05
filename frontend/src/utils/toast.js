// Simple global toast notification system
// Usage: import toast from './utils/toast'
//        toast.success('Berhasil disimpan!')
//        toast.error('Gagal menyimpan')
//        toast.info('Memuat data...')
//        toast.warning('Perhatian!')

let listeners = []
let toastId = 0

const subscribe = (listener) => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

const notify = (toasts) => {
  listeners.forEach(l => l(toasts))
}

let toasts = []

const addToast = (type, message, options = {}) => {
  const id = ++toastId
  const duration = options.duration ?? 3500
  const title = options.title || ''

  const toast = { id, type, message, title }
  toasts = [...toasts, toast]
  notify(toasts)

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }

  return id
}

const removeToast = (id) => {
  toasts = toasts.filter(t => t.id !== id)
  notify(toasts)
}

const toast = {
  subscribe,
  remove: removeToast,
  success: (message, options) => addToast('success', message, { title: 'Berhasil', ...options }),
  error: (message, options) => addToast('error', message, { title: 'Gagal', ...options }),
  warning: (message, options) => addToast('warning', message, { title: 'Peringatan', ...options }),
  info: (message, options) => addToast('info', message, { title: 'Info', ...options })
}

export default toast
