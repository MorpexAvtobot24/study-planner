import type { Task } from '../types/task'

interface TaskItemProps {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

const priorityColors: Record<Task['priority'], string> = {
  low: 'text-bg-success',
  medium: 'text-bg-warning',
  high: 'text-bg-danger',
}

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const checkboxId = `task-completed-${task.id}`

  return (
    <article
      className={`card mb-3 ${
        task.completed ? 'bg-light text-secondary' : 'shadow-sm'
      }`}
    >
      <div className="card-body">
        <div className="d-flex align-items-start gap-3">
          <div className="form-check pt-1">
            <input
              id={checkboxId}
              className="form-check-input"
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
            />
            <label className="visually-hidden" htmlFor={checkboxId}>
              Позначити «{task.title}» як виконане
            </label>
          </div>
          <div className="flex-grow-1">
            <h3
              className={`h5 card-title ${
                task.completed ? 'text-decoration-line-through text-secondary' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="card-text mb-3">{task.description}</p>
            )}
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="badge text-bg-secondary">{task.category}</span>
              <span className={`badge ${priorityColors[task.priority]}`}>
                Пріоритет: {priorityLabels[task.priority]}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(task.id)}
            aria-label={`Видалити завдання «${task.title}»`}
          >
            Видалити
          </button>
        </div>
      </div>
    </article>
  )
}

export default TaskItem
