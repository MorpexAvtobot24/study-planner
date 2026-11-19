import { initialTasks } from '../data/initialTasks'
import type { Task } from '../types/task'

export interface TaskState {
  tasks: Task[]
  pendingDeleteId: number | null
  pendingDeleteTitle: string | null
  pendingClearCompleted: boolean
  clearedTasks: Array<{ task: Task; index: number }> | null
}

export type NewTask = Omit<Task, 'id' | 'completed'>
export type TaskChanges = Pick<
  Task,
  'title' | 'description' | 'priority' | 'category'
>

export type TaskAction =
  | { type: 'add'; task: Task }
  | { type: 'toggle'; id: number }
  | { type: 'update'; id: number; changes: TaskChanges }
  | { type: 'requestDelete'; id: number }
  | { type: 'confirmDelete'; id: number }
  | { type: 'undoDelete'; id: number }
  | { type: 'clearCompleted' }
  | { type: 'confirmClearCompleted' }
  | { type: 'undoClearCompleted' }
  | { type: 'reset' }

export function createInitialTaskState(tasks: Task[] = initialTasks): TaskState {
  return {
    tasks,
    pendingDeleteId: null,
    pendingDeleteTitle: null,
    pendingClearCompleted: false,
    clearedTasks: null,
  }
}

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add':
      return { ...state, tasks: [...state.tasks, action.task] }
    case 'toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, completed: !task.completed }
            : task,
        ),
      }
    case 'update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, ...action.changes } : task,
        ),
      }
    case 'requestDelete': {
      if (state.pendingDeleteId !== null || state.pendingClearCompleted) {
        return state
      }

      const task = state.tasks.find((item) => item.id === action.id)
      if (!task) return state

      return {
        ...state,
        pendingDeleteId: task.id,
        pendingDeleteTitle: task.title,
      }
    }
    case 'confirmDelete':
      if (state.pendingDeleteId !== action.id) return state
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        pendingDeleteId: null,
        pendingDeleteTitle: null,
      }
    case 'undoDelete':
      if (state.pendingDeleteId !== action.id) return state
      return {
        ...state,
        pendingDeleteId: null,
        pendingDeleteTitle: null,
      }
    case 'clearCompleted': {
      if (state.pendingDeleteId !== null || state.pendingClearCompleted) {
        return state
      }

      const clearedTasks = state.tasks.flatMap((task, index) =>
        task.completed ? [{ task, index }] : [],
      )
      if (clearedTasks.length === 0) return state

      return {
        ...state,
        tasks: state.tasks.filter((task) => !task.completed),
        pendingClearCompleted: true,
        clearedTasks,
      }
    }
    case 'confirmClearCompleted':
      if (!state.pendingClearCompleted) return state
      return {
        ...state,
        pendingClearCompleted: false,
        clearedTasks: null,
      }
    case 'undoClearCompleted': {
      if (!state.pendingClearCompleted || !state.clearedTasks) return state

      const tasks = [...state.tasks]
      for (const { task, index } of state.clearedTasks) {
        tasks.splice(Math.min(index, tasks.length), 0, task)
      }

      return {
        ...state,
        tasks,
        pendingClearCompleted: false,
        clearedTasks: null,
      }
    }
    case 'reset':
      return createInitialTaskState()
    default:
      return state
  }
}
