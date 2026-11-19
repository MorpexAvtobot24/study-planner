import type { ToastNotice } from '../types/toast'

interface ToastProps {
  toast: ToastNotice | null
  progress: number
  onUndo: () => void
  onDismiss: () => void
}

function Toast({ toast, progress, onUndo, onDismiss }: ToastProps) {
  if (!toast) return null

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`toast show border-${toast.variant}`} role="status">
        <div className="toast-header">
          <strong className="me-auto">Study Planner</strong>
          <button
            type="button"
            className="btn-close"
            aria-label="Закрити сповіщення"
            onClick={onDismiss}
          />
        </div>
        <div className="toast-body">
          <p className="mb-2">{toast.message}</p>
          {toast.undoAction && (
            <>
              <div
                className="progress mb-2"
                role="progressbar"
                aria-label="Час для скасування"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-bar progress-bar-striped"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={onUndo}
              >
                Скасувати
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Toast
