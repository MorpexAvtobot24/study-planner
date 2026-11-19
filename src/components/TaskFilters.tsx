import type { FilterType, Task } from '../types/task'

interface TaskFiltersProps {
  tasks: Task[]
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'active', label: 'Не виконані' },
  { value: 'completed', label: 'Виконані' },
]

function TaskFilters({
  tasks,
  activeFilter,
  onFilterChange,
}: TaskFiltersProps) {
  const completedCount = tasks.filter((task) => task.completed).length
  const counts: Record<FilterType, number> = {
    all: tasks.length,
    active: tasks.length - completedCount,
    completed: completedCount,
  }

  return (
    <nav
      className="d-flex flex-wrap gap-2 mb-3"
      aria-label="Фільтри завдань"
    >
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={`btn ${
            activeFilter === filter.value ? 'btn-primary' : 'btn-outline-primary'
          }`}
          aria-pressed={activeFilter === filter.value}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}{' '}
          <span
            className={`badge ${
              activeFilter === filter.value ? 'text-bg-light' : 'text-bg-secondary'
            }`}
          >
            {counts[filter.value]}
          </span>
        </button>
      ))}
    </nav>
  )
}

export default TaskFilters
