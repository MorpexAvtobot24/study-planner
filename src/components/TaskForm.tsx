import { useState, type FormEvent } from 'react'
import { useTaskContext } from '../hooks/useTaskContext'
import type { Task } from '../types/task'

function isPriority(value: string): value is Task['priority'] {
  return value === 'low' || value === 'medium' || value === 'high'
}

function TaskForm() {
  const {
    editingTask,
    setEditingTask,
    addTask,
    updateTask,
    showToast,
    pendingDeleteId,
    pendingClearCompleted,
  } = useTaskContext()
  const [title, setTitle] = useState(editingTask?.title ?? '')
  const [description, setDescription] = useState(
    editingTask?.description ?? '',
  )
  const [category, setCategory] = useState(editingTask?.category ?? '')
  const [priority, setPriority] = useState<Task['priority']>(
    editingTask?.priority ?? 'medium',
  )
  const [titleError, setTitleError] = useState('')
  const isEditing = editingTask !== null
  const isPending = pendingDeleteId !== null || pendingClearCompleted

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setTitleError('')
  }

  const cancelEditing = () => {
    setEditingTask(null)
    resetForm()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      const message = 'Введіть назву завдання.'
      setTitleError(message)
      showToast(message, 'danger')
      return
    }

    const changes = {
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    }

    if (editingTask) {
      updateTask(editingTask.id, changes)
      setEditingTask(null)
    } else {
      addTask(changes)
    }
    resetForm()
  }

  return (
    <section className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 card-title mb-3">
          {isEditing ? 'Редагувати завдання' : 'Нове завдання'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="task-title" className="form-label">
              Назва <span className="text-danger">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className={`form-control${titleError ? ' is-invalid' : ''}`}
              value={title}
              disabled={isPending}
              onChange={(event) => {
                setTitle(event.target.value)
                if (titleError) setTitleError('')
              }}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'task-title-error' : undefined}
            />
            {titleError && (
              <div id="task-title-error" className="invalid-feedback">
                {titleError}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="task-description" className="form-label">
              Опис
            </label>
            <textarea
              id="task-description"
              className="form-control"
              rows={3}
              value={description}
              disabled={isPending}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="task-category" className="form-label">
              Категорія
            </label>
            <input
              id="task-category"
              type="text"
              className="form-control"
              value={category}
              disabled={isPending}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Наприклад, математика"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="task-priority" className="form-label">
              Пріоритет
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              disabled={isPending}
              onChange={(event) => {
                if (isPriority(event.target.value)) {
                  setPriority(event.target.value)
                }
              }}
            >
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
            </select>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-grow-1"
              disabled={isPending}
            >
              {isEditing ? 'Зберегти зміни' : 'Додати завдання'}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cancelEditing}
                disabled={isPending}
              >
                Скасувати
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

export default TaskForm
