export type ToastVariant = 'success' | 'danger' | 'info' | 'warning'
export type UndoAction = 'delete' | 'clear'

export interface ToastNotice {
  message: string
  variant: ToastVariant
  undoAction?: UndoAction
}
