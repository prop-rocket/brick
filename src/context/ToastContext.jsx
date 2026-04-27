import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, opts = {}) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, retry: opts.retry ?? null, duration: opts.duration ?? 4000 }
    setToasts((prev) => [...prev.slice(-2), toast]) // max 3
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration)
    }
    return id
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showError = useCallback(
    (message = 'Something went wrong. Try again.', retry) => {
      return addToast(message, { retry })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss, showError }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
