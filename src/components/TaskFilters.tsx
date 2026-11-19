import { useTaskContext } from '../hooks/useTaskContext'
import type { FilterType } from '../types/task'

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'active', label: 'Не виконані' },
  { value: 'completed', label: 'Виконані' },
]

function TaskFilters() {
  const { tasks, filter: activeFilter, setFilter } = useTaskContext()
  const completedCount = tasks.filter((task) => task.completed).length
  const counts: Record<FilterType, number> = {
    all: tasks.length,
    active: tasks.length - completedCount,
    completed: completedCount,
  }

  return (
    <nav
      className="d-flex flex-wrap gap-2"
      aria-label="Фільтри завдань"
    >
      {filters.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`btn ${
            activeFilter === item.value ? 'btn-primary' : 'btn-outline-primary'
          }`}
          aria-pressed={activeFilter === item.value}
          onClick={() => setFilter(item.value)}
        >
          {item.label}{' '}
          <span
            className={`badge ${
              activeFilter === item.value ? 'text-bg-light' : 'text-bg-secondary'
            }`}
          >
            {counts[item.value]}
          </span>
        </button>
      ))}
    </nav>
  )
}

export default TaskFilters
