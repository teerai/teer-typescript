/**
 * Base class for all Teer errors
 */
export class TeerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TeerError'
    Object.setPrototypeOf(this, TeerError.prototype)
  }
}

/**
 * Error thrown when the API returns an error response
 */
export class TeerAPIError extends TeerError {
  readonly status: number
  readonly statusText: string
  readonly data: any
  readonly headers: Headers
  readonly request: {
    method: string
    path: string
    baseUrl: string
    headers: HeadersInit
  }

  constructor({
    message,
    status,
    statusText,
    data,
    headers,
    request,
  }: {
    message: string
    status: number
    statusText: string
    data: any
    headers: Headers
    request: {
      method: string
      path: string
      baseUrl: string
      headers: HeadersInit
    }
  }) {
    super(`${status} ${statusText}: ${message}`)
    this.name = 'TeerAPIError'
    this.status = status
    this.statusText = statusText
    this.data = data
    this.headers = headers
    this.request = request
    Object.setPrototypeOf(this, TeerAPIError.prototype)
  }

  /**
   * Whether this error is a server error (5xx)
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600
  }

  /**
   * Whether this error is a client error (4xx)
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  /**
   * Whether this error is a rate limit error (429)
   */
  get isRateLimitError(): boolean {
    return this.status === 429
  }
}

/**
 * Error thrown when a request times out
 */
export class TeerTimeoutError extends TeerError {
  readonly timeoutMs: number
  readonly request: {
    method: string
    path: string
    baseUrl: string
  }

  constructor({
    timeoutMs,
    request,
  }: {
    timeoutMs: number
    request: {
      method: string
      path: string
      baseUrl: string
    }
  }) {
    super(`Request timed out after ${timeoutMs}ms`)
    this.name = 'TeerTimeoutError'
    this.timeoutMs = timeoutMs
    this.request = request
    Object.setPrototypeOf(this, TeerTimeoutError.prototype)
  }
}

/**
 * Error thrown when there's a network error
 */
export class TeerNetworkError extends TeerError {
  readonly cause: Error
  readonly request: {
    method: string
    path: string
    baseUrl: string
  }

  constructor({
    cause,
    request,
  }: {
    cause: Error
    request: {
      method: string
      path: string
      baseUrl: string
    }
  }) {
    super(`Network error: ${cause.message}`)
    this.name = 'TeerNetworkError'
    this.cause = cause
    this.request = request
    Object.setPrototypeOf(this, TeerNetworkError.prototype)
  }
}
