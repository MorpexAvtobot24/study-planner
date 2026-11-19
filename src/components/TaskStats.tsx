import { useTaskContext } from '../hooks/useTaskContext'

function TaskStats() {
  const { tasks } = useTaskContext()
  const completedCount = tasks.filter((task) => task.completed).length
  const activeCount = tasks.length - completedCount

  const stats = [
    { label: 'Усього завдань', count: tasks.length, color: 'primary' },
    { label: 'Виконано', count: completedCount, color: 'success' },
    { label: 'Не виконано', count: activeCount, color: 'warning' },
  ]

  return (
    <section className="row g-3" aria-label="Статистика завдань">
      {stats.map((stat) => (
        <div className="col-12 col-sm-4" key={stat.label}>
          <div className="card h-100">
            <div className="card-body">
              <p className="text-secondary mb-1">{stat.label}</p>
              <p className={`h3 text-${stat.color} mb-0`}>{stat.count}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default TaskStats
