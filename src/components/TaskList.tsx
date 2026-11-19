import { useTaskContext } from '../hooks/useTaskContext'
import TaskItem from './TaskItem'

function TaskList() {
  const { tasks, filter } = useTaskContext()
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  if (tasks.length === 0) {
    return (
      <p className="alert alert-info mb-0">
        Завдань поки немає. Додайте перше навчальне завдання.
      </p>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <p className="alert alert-secondary mb-0">
        За цим фільтром завдань немає.
      </p>
    )
  }

  return (
    <div>
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}

export default TaskList
