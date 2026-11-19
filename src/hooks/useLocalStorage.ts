import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key)
      return storedValue === null ? initialValue : (JSON.parse(storedValue) as T)
    } catch (error) {
      console.error(`Could not read localStorage key "${key}".`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Could not save localStorage key "${key}".`, error)
    }
  }, [key, value])

  return [value, setValue]
}
