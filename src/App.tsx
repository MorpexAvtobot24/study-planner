import Header from './components/Header'
import TaskFilters from './components/TaskFilters'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import TaskStats from './components/TaskStats'
import Toast from './components/Toast'
import { TaskProvider } from './context/TaskContext'
import { useTaskContext } from './hooks/useTaskContext'

function StudyPlanner() {
  const {
    tasks,
    pendingDeleteId,
    pendingClearCompleted,
    toast,
    undoProgress,
    undoDelete,
    undoClearCompleted,
    clearCompleted,
    resetTasks,
    dismissToast,
    editingTask,
  } = useTaskContext()
  const completedCount = tasks.filter((task) => task.completed).length
  const hasPendingAction =
    pendingDeleteId !== null || pendingClearCompleted

  const handleUndo = () => {
    if (toast?.undoAction === 'delete') undoDelete()
    if (toast?.undoAction === 'clear') undoClearCompleted()
  }

  return (
    <main className="container py-4 py-md-5">
      <Header />
      <TaskStats />

      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-5">
          <TaskForm key={editingTask?.id ?? 'new'} />
        </div>
        <div className="col-12 col-lg-7">
          <section aria-label="Список завдань">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <TaskFilters />
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearCompleted}
                  disabled={completedCount === 0 || hasPendingAction}
                >
                  Очистити виконані
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={resetTasks}
                >
                  Скинути дані
                </button>
              </div>
            </div>
            <TaskList />
          </section>
        </div>
      </div>
      <Toast
        toast={toast}
        progress={undoProgress}
        onUndo={handleUndo}
        onDismiss={dismissToast}
      />
    </main>
  )
}

function App() {
  return (
    <TaskProvider>
      <StudyPlanner />
    </TaskProvider>
  )
}

export default App
