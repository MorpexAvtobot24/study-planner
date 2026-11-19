import { useState } from 'react'
import Header from './components/Header'
import TaskFilters from './components/TaskFilters'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import { initialTasks } from './data/initialTasks'
import type { FilterType, Task } from './types/task'

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<FilterType>('all')

  const addTask = (taskDetails: Omit<Task, 'id' | 'completed'>) => {
    setTasks((currentTasks) => {
      const nextId = Math.max(0, ...currentTasks.map((task) => task.id)) + 1

      return [...currentTasks, { ...taskDetails, id: nextId, completed: false }]
    })
  }

  const toggleTask = (id: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (id: number) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id))
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  return (
    <main className="container py-4 py-md-5">
      <Header />
      <TaskStats tasks={tasks} />

      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-5">
          <TaskForm onAddTask={addTask} />
        </div>
        <div className="col-12 col-lg-7">
          <section aria-label="Список завдань">
            <TaskFilters
              tasks={tasks}
              activeFilter={filter}
              onFilterChange={setFilter}
            />
            <TaskList
              tasks={filteredTasks}
              totalCount={tasks.length}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
            />
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
