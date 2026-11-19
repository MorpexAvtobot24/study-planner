import { httpClient } from '../api/httpClient'
import type { ApiTodo, Task, TodosResponse } from '../types/task'

function toTask(todo: ApiTodo): Task {
  return {
    id: todo.id,
    title: todo.todo,
    description: '',
    completed: todo.completed,
    priority: 'medium',
    category: 'Загальне',
  }
}

function toApiTodo(task: Task): Pick<ApiTodo, 'todo' | 'completed' | 'userId'> {
  return { todo: task.title, completed: task.completed, userId: 1 }
}

async function getAll(limit: number, skip: number, signal?: AbortSignal) {
  const query = new URLSearchParams({ limit: String(limit), skip: String(skip) })
  const response = await httpClient.request<TodosResponse>(`/todos?${query.toString()}`, { signal })
  return { ...response, todos: response.todos.map(toTask) }
}

async function getById(id: number, signal?: AbortSignal): Promise<Task> {
  const response = await httpClient.request<ApiTodo>(`/todos/${id}`, { signal })
  return toTask(response)
}

async function create(task: Task): Promise<Task> {
  const response = await httpClient.request<ApiTodo>('/todos/add', {
    method: 'POST',
    body: toApiTodo(task),
  })
  return { ...task, id: response.id, title: response.todo, completed: response.completed }
}

async function update(id: number, data: Partial<Omit<Task, 'id'>>): Promise<Task> {
  const payload: Partial<Pick<ApiTodo, 'todo' | 'completed'>> = {}
  if (data.title !== undefined) payload.todo = data.title
  if (data.completed !== undefined) payload.completed = data.completed

  const response = await httpClient.request<ApiTodo>(`/todos/${id}`, {
    method: 'PATCH',
    body: payload,
  })
  return { ...toTask(response), ...data, id }
}

async function remove(id: number): Promise<void> {
  await httpClient.request<unknown>(`/todos/${id}`, { method: 'DELETE' })
}

export const taskRepository = {
  getAll,
  getById,
  create,
  update,
  delete: remove,
}
