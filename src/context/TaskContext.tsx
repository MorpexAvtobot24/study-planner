import {
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { TaskContext, type TaskContextValue } from './taskContextValue'
import {
  createInitialTaskState,
  taskReducer,
  type NewTask,
  type TaskChanges,
  type TaskState,
} from '../reducers/taskReducer'
import { initialTasks } from '../data/initialTasks'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { FilterType, Task } from '../types/task'
import type { ToastNotice, ToastVariant } from '../types/toast'

const TASKS_STORAGE_KEY = 'study-planner-tasks'
const FILTER_STORAGE_KEY = 'study-planner-filter'
const UNDO_DURATION_MS = 5000

interface TaskProviderProps {
  children: ReactNode
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false

  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'number' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.completed === 'boolean' &&
    (task.priority === 'low' ||
      task.priority === 'medium' ||
      task.priority === 'high') &&
    typeof task.category === 'string'
  )
}

function initializeTasks(): TaskState {
  try {
    const storedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY)
    if (storedTasks === null) return createInitialTaskState()

    const parsedTasks: unknown = JSON.parse(storedTasks)
    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isTask)) {
      throw new TypeError('Saved tasks have an invalid format.')
    }

    return createInitialTaskState(parsedTasks)
  } catch (error) {
    console.error('Could not load saved tasks; using the initial task list.', error)
    return createInitialTaskState(initialTasks)
  }
}

function isFilterType(value: unknown): value is FilterType {
  return value === 'all' || value === 'active' || value === 'completed'
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, undefined, initializeTasks)
  const [savedFilter, setSavedFilter] = useLocalStorage<FilterType>(
    FILTER_STORAGE_KEY,
    'all',
  )
  const filter = isFilterType(savedFilter) ? savedFilter : 'all'
  const [toast, setToast] = useState<ToastNotice | null>(null)
  const [undoProgress, setUndoProgress] = useState(0)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { tasks, pendingDeleteId, pendingDeleteTitle, pendingClearCompleted } =
    state
  const activeCount = tasks.filter((task) => !task.completed).length

  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`
  }, [activeCount])

  useEffect(() => {
    let notificationTimeout: number | undefined
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error('Could not save study planner tasks.', error)
      notificationTimeout = window.setTimeout(
        () =>
          setToast({
            message: 'Не вдалося зберегти завдання у сховищі браузера.',
            variant: 'danger',
          }),
        0,
      )
    }

    return () => {
      if (notificationTimeout !== undefined) {
        window.clearTimeout(notificationTimeout)
      }
    }
  }, [tasks])

  useEffect(() => {
    if (pendingDeleteId === null && !pendingClearCompleted) return

    const startedAt = Date.now()
    const timeoutId = window.setTimeout(() => {
      if (pendingDeleteId !== null) {
        dispatch({ type: 'confirmDelete', id: pendingDeleteId })
        setToast({
          message: pendingDeleteTitle
            ? `Завдання «${pendingDeleteTitle}» остаточно видалено.`
            : 'Завдання остаточно видалено.',
          variant: 'success',
        })
      } else {
        dispatch({ type: 'confirmClearCompleted' })
        setToast({
          message: 'Виконані завдання остаточно очищено.',
          variant: 'success',
        })
      }
      setUndoProgress(0)
    }, UNDO_DURATION_MS)
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      setUndoProgress(Math.max(0, 100 - (elapsed / UNDO_DURATION_MS) * 100))
    }, 50)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [
    pendingDeleteId,
    pendingDeleteTitle,
    pendingClearCompleted,
  ])

  useEffect(() => {
    if (!toast || toast.undoAction) return
    const timeoutId = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const showToast = (message: string, variant: ToastVariant = 'success') => {
    setToast({ message, variant })
  }

  const addTask = (taskDetails: NewTask) => {
    const allIds = [
      ...tasks.map((task) => task.id),
      ...(state.clearedTasks?.map(({ task }) => task.id) ?? []),
    ]
    const nextId = Math.max(0, ...allIds) + 1
    dispatch({
      type: 'add',
      task: { ...taskDetails, id: nextId, completed: false },
    })
    showToast('Завдання додано.')
  }

  const updateTask = (id: number, changes: TaskChanges) => {
    dispatch({ type: 'update', id, changes })
    showToast('Завдання оновлено.')
  }

  const toggleTask = (id: number) => dispatch({ type: 'toggle', id })

  const requestDelete = (id: number) => {
    if (pendingDeleteId !== null || pendingClearCompleted) return
    dispatch({ type: 'requestDelete', id })
    setEditingTask(null)
    setUndoProgress(100)
    setToast({
      message: 'Завдання буде видалено',
      variant: 'warning',
      undoAction: 'delete',
    })
  }

  const undoDelete = () => {
    if (pendingDeleteId === null) return
    dispatch({ type: 'undoDelete', id: pendingDeleteId })
    setUndoProgress(0)
    showToast('Видалення завдання скасовано.', 'info')
  }

  const clearCompleted = () => {
    if (pendingDeleteId !== null || pendingClearCompleted) return
    if (!tasks.some((task) => task.completed)) {
      showToast('Немає виконаних завдань для очищення.', 'info')
      return
    }

    dispatch({ type: 'clearCompleted' })
    setUndoProgress(100)
    setToast({
      message: 'Виконані завдання тимчасово очищено',
      variant: 'warning',
      undoAction: 'clear',
    })
  }

  const undoClearCompleted = () => {
    if (!pendingClearCompleted) return
    dispatch({ type: 'undoClearCompleted' })
    setUndoProgress(0)
    showToast('Очищення виконаних завдань скасовано.', 'info')
  }

  const resetTasks = () => {
    dispatch({ type: 'reset' })
    setEditingTask(null)
    setUndoProgress(0)
    showToast('Дані відновлено до початкового списку.')
  }

  const dismissToast = () => setToast(null)
  const setFilter = (nextFilter: FilterType) => setSavedFilter(nextFilter)

  const value: TaskContextValue = {
    tasks,
    filter,
    setFilter,
    addTask,
    updateTask,
    toggleTask,
    requestDelete,
    undoDelete,
    clearCompleted,
    undoClearCompleted,
    resetTasks,
    pendingDeleteId,
    pendingClearCompleted,
    toast,
    dismissToast,
    showToast,
    undoProgress,
    editingTask,
    setEditingTask,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
