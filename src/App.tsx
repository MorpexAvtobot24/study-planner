import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { taskRepository } from './repositories/taskRepository'
import type { Task, TaskPriority } from './types/task'

const PAGE_SIZE = 10
const priorities: TaskPriority[] = ['low', 'medium', 'high']
const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Сталася невідома помилка.'
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [reloadToken, setReloadToken] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [operationError, setOperationError] = useState('')
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])
  const [localUpdates, setLocalUpdates] = useState<Record<number, Task>>({})
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [success, setSuccess] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: '',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    taskRepository
      .getAll(PAGE_SIZE, (page - 1) * PAGE_SIZE, controller.signal)
      .then((response) => {
        setTasks(response.todos)
        setTotal(response.total)
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) setListError(errorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, reloadToken])

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    },
    [],
  )

  const visibleTasks = useMemo(() => {
    const serverTasks =
      page === 1
        ? [...createdTasks, ...tasks.slice(0, Math.max(0, PAGE_SIZE - createdTasks.length))]
        : tasks

    return serverTasks
      .filter((task) => !deletedIds.includes(task.id))
      .map((task) => localUpdates[task.id] ?? task)
  }, [createdTasks, deletedIds, localUpdates, page, tasks])

  const pageCount = Math.max(1, Math.ceil((total + createdTasks.length - deletedIds.length) / PAGE_SIZE))

  function showSuccess(message: string) {
    setSuccess(message)
    if (successTimer.current) clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccess(''), 3500)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    try {
      const created = await taskRepository.create({
        id: 0,
        title: form.title.trim(),
        description: form.description.trim(),
        completed: false,
        priority: form.priority,
        category: form.category.trim() || 'Загальне',
      })
      if (page !== 1) setLoading(true)
      setCreatedTasks((previous) => [created, ...previous])
      setForm({ title: '', description: '', priority: 'medium', category: '' })
      setPage(1)
      showSuccess('Завдання успішно створено.')
    } catch (error) {
      setFormError(errorMessage(error))
    }
  }

  async function saveTask(task: Task, changes: Partial<Omit<Task, 'id'>>) {
    try {
      setOperationError('')
      const updated = await taskRepository.update(task.id, changes)
      setLocalUpdates((previous) => ({ ...previous, [task.id]: updated }))
      showSuccess('Завдання успішно оновлено.')
      return updated
    } catch (error) {
      setOperationError(errorMessage(error))
      return null
    }
  }

  async function handleDelete(task: Task) {
    try {
      setOperationError('')
      await taskRepository.delete(task.id)
      const isCreatedTask = createdTasks.some((item) => item.id === task.id)
      if (!isCreatedTask) setDeletedIds((previous) => [...previous, task.id])
      setCreatedTasks((previous) => previous.filter((item) => item.id !== task.id))
      setConfirmDeleteId(null)
      if (selectedId === task.id) setSelectedId(null)
      if (page > 1 && total + createdTasks.length - deletedIds.length <= (page - 1) * PAGE_SIZE + 1) {
        setLoading(true)
        setPage((previous) => Math.max(1, previous - 1))
      } else {
        setLoading(true)
        setReloadToken((previous) => previous + 1)
      }
      showSuccess('Завдання успішно видалено.')
    } catch (error) {
      setOperationError(errorMessage(error))
      setConfirmDeleteId(null)
    }
  }

  async function handleSaveTitle(task: Task) {
    const title = editTitle.trim()
    if (!title) return
    const updated = await saveTask(task, { title })
    if (updated) setEditingId(null)
  }

  return (
    <main className="container py-4 py-lg-5">
      <header className="mb-4">
        <p className="text-primary fw-semibold text-uppercase small mb-1">Навчання під контролем</p>
        <h1 className="display-5 fw-bold mb-2">Study Planner</h1>
        <p className="text-secondary mb-0">Плануйте завдання та відстежуйте свій прогрес.</p>
      </header>

      {success && (
        <div className="alert alert-success py-2" role="status">
          {success}
        </div>
      )}
      {operationError && (
        <div className="alert alert-danger py-2" role="alert">
          Не вдалося виконати дію: {operationError}
          <button aria-label="Закрити повідомлення" className="btn-close float-end" onClick={() => setOperationError('')} type="button" />
        </div>
      )}
      {listError && (
        <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2" role="alert">
          <span>Помилка: {listError}</span>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              setLoading(true)
              setListError('')
              setReloadToken((previous) => previous + 1)
            }}
            type="button"
          >
            Спробувати ще
          </button>
        </div>
      )}

      <section className="card shadow-sm border-0 mb-4" aria-labelledby="create-heading">
        <div className="card-body p-4">
          <h2 className="h5 mb-3" id="create-heading">Створити завдання</h2>
          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="task-title">Назва *</label>
                <input
                  className="form-control"
                  id="task-title"
                  maxLength={120}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                  value={form.title}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" htmlFor="task-category">Категорія</label>
                <input
                  className="form-control"
                  id="task-category"
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  value={form.category}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" htmlFor="task-priority">Пріоритет</label>
                <select
                  className="form-select"
                  id="task-priority"
                  onChange={(event) => setForm({ ...form, priority: event.target.value as TaskPriority })}
                  value={form.priority}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priorityLabels[priority]}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="task-description">Опис</label>
                <textarea
                  className="form-control"
                  id="task-description"
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={2}
                  value={form.description}
                />
              </div>
              {formError && <p className="text-danger mb-0" role="alert">{formError}</p>}
              <div className="col-12">
                <button className="btn btn-primary" type="submit">Додати завдання</button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section aria-labelledby="tasks-heading">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h4 mb-0" id="tasks-heading">Мої завдання</h2>
          {!loading && <span className="text-secondary small">{Math.max(0, total + createdTasks.length - deletedIds.length)} загалом</span>}
        </div>

        {loading ? (
          <div className="text-center py-5" role="status" aria-live="polite">
            <div className="spinner-border text-primary" aria-hidden="true" />
            <p className="mt-2 mb-0">Завантаження...</p>
          </div>
        ) : listError ? null : visibleTasks.length === 0 ? (
          <div className="alert alert-light border text-center py-4">Завдань не знайдено.</div>
        ) : (
          <div className="list-group shadow-sm">
            {visibleTasks.map((task) => (
              <article className="list-group-item p-3" key={task.id}>
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                  <div className="form-check">
                    <input
                      aria-label={`Позначити "${task.title}" виконаним`}
                      checked={task.completed}
                      className="form-check-input"
                      onChange={(event) => void saveTask(task, { completed: event.target.checked })}
                      type="checkbox"
                    />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="d-flex gap-2">
                        <input
                          aria-label="Нова назва завдання"
                          className="form-control form-control-sm"
                          onChange={(event) => setEditTitle(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void handleSaveTitle(task)
                            if (event.key === 'Escape') setEditingId(null)
                          }}
                          value={editTitle}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => void handleSaveTitle(task)} type="button">Зберегти</button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditingId(null)} type="button">Скасувати</button>
                      </div>
                    ) : (
                      <button
                        className={`btn btn-link p-0 text-start text-decoration-none fw-semibold ${task.completed ? 'text-secondary text-decoration-line-through' : 'text-dark'}`}
                        onClick={() => setSelectedId(task.id)}
                        type="button"
                      >
                        {task.title}
                      </button>
                    )}
                    <div className="small text-secondary mt-1">
                      {task.category} <span aria-hidden="true">·</span> {priorityLabels[task.priority]}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => { setEditingId(task.id); setEditTitle(task.title) }}
                      type="button"
                    >
                      Редагувати
                    </button>
                    {confirmDeleteId === task.id ? (
                      <div className="d-flex align-items-center gap-2" role="group" aria-label="Підтвердження видалення">
                        <span className="small text-danger text-nowrap">Ви впевнені?</span>
                        <button className="btn btn-danger btn-sm" onClick={() => void handleDelete(task)} type="button">Так</button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfirmDeleteId(null)} type="button">Ні</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => setConfirmDeleteId(task.id)} type="button">Видалити</button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !listError && total + createdTasks.length - deletedIds.length > 0 && (
          <nav className="d-flex align-items-center justify-content-center gap-3 mt-4" aria-label="Сторінки завдань">
            <button
              className="btn btn-outline-primary"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true)
                setPage((previous) => previous - 1)
              }}
              type="button"
            >
              Попередня
            </button>
            <span className="text-secondary" aria-live="polite">Сторінка {page} з {pageCount}</span>
            <button
              className="btn btn-outline-primary"
              disabled={page >= pageCount}
              onClick={() => {
                setLoading(true)
                setPage((previous) => previous + 1)
              }}
              type="button"
            >
              Наступна
            </button>
          </nav>
        )}
      </section>

      {selectedId !== null && (
        <TaskDetails taskId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </main>
  )
}

function TaskDetails({ taskId, onClose }: { taskId: number; onClose: () => void }) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    taskRepository
      .getById(taskId, controller.signal)
      .then(setTask)
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) setError(errorMessage(reason))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [taskId])

  return (
    <div className="details-backdrop" onClick={onClose}>
      <section
        aria-labelledby="details-heading"
        aria-modal="true"
        className="card shadow-lg details-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0" id="details-heading">Деталі завдання</h2>
          <button aria-label="Закрити" className="btn-close" onClick={onClose} type="button" />
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4" role="status">
              <div className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
              <span className="ms-2">Завантаження...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger mb-0" role="alert">{error}</div>
          ) : task ? (
            <dl className="row mb-0">
              <dt className="col-sm-4">Назва</dt><dd className="col-sm-8">{task.title}</dd>
              <dt className="col-sm-4">Опис</dt><dd className="col-sm-8">{task.description || 'Опис відсутній'}</dd>
              <dt className="col-sm-4">Категорія</dt><dd className="col-sm-8">{task.category}</dd>
              <dt className="col-sm-4">Пріоритет</dt><dd className="col-sm-8">{priorityLabels[task.priority]}</dd>
              <dt className="col-sm-4">Стан</dt><dd className="col-sm-8">{task.completed ? 'Виконано' : 'Не виконано'}</dd>
            </dl>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default App
