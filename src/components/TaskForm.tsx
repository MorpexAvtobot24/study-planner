import { useState, type FormEvent } from 'react'
import type { Task } from '../types/task'

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [titleError, setTitleError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setTitleError('Введіть назву завдання.')
      return
    }

    onAddTask({
      title: trimmedTitle,
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    })
    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setTitleError('')
  }

  return (
    <section className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 card-title mb-3">Нове завдання</h2>
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
              onChange={(event) =>
                setPriority(event.target.value as Task['priority'])
              }
            >
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Додати завдання
          </button>
        </form>
      </div>
    </section>
  )
}

export default TaskForm
