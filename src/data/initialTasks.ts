import type { Task } from '../types/task'

export const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Підготувати конспект з біології',
    description: 'Опрацювати тему клітинного дихання та виписати ключові поняття.',
    completed: false,
    priority: 'high',
    category: 'Біологія',
  },
  {
    id: 2,
    title: 'Розв’язати задачі з алгебри',
    description: 'Виконати вправи 12–18 про квадратні рівняння.',
    completed: false,
    priority: 'medium',
    category: 'Математика',
  },
  {
    id: 3,
    title: 'Прочитати розділ з історії',
    description: 'Прочитати розділ про Українську революцію та занотувати дати.',
    completed: true,
    priority: 'low',
    category: 'Історія',
  },
  {
    id: 4,
    title: 'Підготувати усний переказ',
    description: 'Повторити нову лексику та підготувати короткий переказ англійською.',
    completed: false,
    priority: 'medium',
    category: 'Англійська мова',
  },
]
