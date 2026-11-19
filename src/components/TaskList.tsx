import type { Task } from '../types/task'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  totalCount: number
  onToggleTask: (id: number) => void
  onDeleteTask: (id: number) => void
}

function TaskList({
  tasks,
  totalCount,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  if (totalCount === 0) {
    return (
      <p className="alert alert-info mb-0">
        Завдань поки немає. Додайте перше навчальне завдання.
      </p>
    )
  }

  if (tasks.length === 0) {
    return <p className="alert alert-secondary mb-0">За цим фільтром завдань немає.</p>
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  )
}

export default TaskList
