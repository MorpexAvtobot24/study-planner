import { createContext } from 'react'
import type { FilterType, Task } from '../types/task'
import type { NewTask, TaskChanges } from '../reducers/taskReducer'
import type { ToastNotice, ToastVariant } from '../types/toast'

export interface TaskContextValue {
  tasks: Task[]
  filter: FilterType
  setFilter: (filter: FilterType) => void
  addTask: (task: NewTask) => void
  updateTask: (id: number, changes: TaskChanges) => void
  toggleTask: (id: number) => void
  requestDelete: (id: number) => void
  undoDelete: () => void
  clearCompleted: () => void
  undoClearCompleted: () => void
  resetTasks: () => void
  pendingDeleteId: number | null
  pendingClearCompleted: boolean
  toast: ToastNotice | null
  dismissToast: () => void
  showToast: (message: string, variant?: ToastVariant) => void
  undoProgress: number
  editingTask: Task | null
  setEditingTask: (task: Task | null) => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
