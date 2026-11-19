type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  signal?: AbortSignal
}

export class HttpError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const baseUrl = import.meta.env.VITE_API_URL

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!baseUrl) {
    throw new Error('Не задано VITE_API_URL у конфігурації середовища.')
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  if (!response.ok) {
    const responseText = await response.text()
    let message = `HTTP-помилка ${response.status}: ${response.statusText}`
    if (responseText) {
      try {
        const payload: unknown = JSON.parse(responseText)
        if (typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string') {
          message = payload.message
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error
      }
    }
    throw new HttpError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const httpClient = { request }
