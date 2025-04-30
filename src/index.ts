import { version } from '../package.json'
import { TeerError, TeerAPIError, TeerTimeoutError, TeerNetworkError } from './errors'
import { RequestOptions, IngestData, RequestConfigOptions } from './types'
import { Resource, IngestResource, BillingResource, MeterEventsResource, MeterEventCreateParams, MeterEvent } from './resources'

// Re-export error classes, types, and resources
export { TeerError, TeerAPIError, TeerTimeoutError, TeerNetworkError }
export { RequestOptions, IngestData, RequestConfigOptions }
export { Resource, IngestResource, BillingResource, MeterEventsResource, MeterEventCreateParams, MeterEvent }

// API base URL
const TEER_API_BASE_URL = 'https://api.teer.ai'

// Default request timeout in milliseconds (10 seconds)
const DEFAULT_TIMEOUT_MS = 10000

// Maximum number of retries for transient errors
const MAX_RETRIES = 3

// Retry delay base in milliseconds (with exponential backoff)
const RETRY_DELAY_MS = 300

/**
 * Teer client for interacting with the Teer API
 */
export class Teer {
  public static readonly sdkVersion: string = version
  public static readonly namespace: string = 'v1'
  public static readonly baseURL: string = TEER_API_BASE_URL

  public readonly ingest: IngestResource
  public readonly billing: BillingResource

  // Private fields
  private readonly _apiKey: string
  private readonly _baseURL: string
  private readonly _defaultRequestConfig: RequestConfigOptions

  /**
   * Create a new Teer client
   *
   * @param apiKey Your Teer API key
   * @param options Optional configuration options including baseURL and request settings
   */
  constructor(apiKey: string, options: RequestConfigOptions = {}) {
    this._apiKey = apiKey
    this._baseURL = options.baseURL || TEER_API_BASE_URL
    this._defaultRequestConfig = {
      timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
      maxRetries: options.maxRetries || MAX_RETRIES,
      retryDelayMs: options.retryDelayMs || RETRY_DELAY_MS,
    }
    this.ingest = new IngestResource(this)
    this.billing = new BillingResource(this)
  }

  /**
   * Get the API key
   */
  get apiKey(): string {
    return this._apiKey
  }

  /**
   * Get the base URL
   */
  get baseURL(): string {
    return this._baseURL
  }

  /**
   * Get the default request configuration
   */
  get defaultRequestConfig(): RequestConfigOptions {
    return { ...this._defaultRequestConfig }
  }

  /**
   * Make a request to the Teer API
   *
   * @param path The path to the API endpoint
   * @param method The HTTP method to use
   * @param data The data to send with the request
   * @param customBaseUrl Optional custom base URL to override the default
   * @param options Additional request options
   * @returns The response from the API
   */
  async makeRequest<T = any>(
    path: string,
    method: string,
    data?: any,
    customBaseUrl?: string,
    options: RequestConfigOptions = {}
  ): Promise<T> {
    // Merge the provided options with the default request config
    // Options provided directly to the method call take precedence over defaults
    const timeoutMs = options.timeoutMs ?? this._defaultRequestConfig.timeoutMs ?? DEFAULT_TIMEOUT_MS
    const maxRetries = options.maxRetries ?? this._defaultRequestConfig.maxRetries ?? MAX_RETRIES
    const retryDelayMs = options.retryDelayMs ?? this._defaultRequestConfig.retryDelayMs ?? RETRY_DELAY_MS

    // Use the provided custom base URL or fall back to the instance base URL
    const baseUrl = customBaseUrl || this.baseURL
    const url = `${baseUrl}/${Teer.namespace}/${path}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'User-Agent': `@teerai/sdk/${Teer.sdkVersion}`,
    }

    const requestInfo = {
      method,
      path,
      baseUrl,
      headers,
    }

    // Retry logic
    let lastError: Error | null = null
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add exponential backoff delay for retries
        if (attempt > 0) {
          const delay = retryDelayMs * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        // Create fetch request with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

        const fetchOptions: RequestInit = {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        }

        try {
          const response = await fetch(url, fetchOptions)
          clearTimeout(timeoutId)

          // Handle API errors
          if (!response.ok) {
            let errorData: any
            let errorMessage = ''

            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              try {
                errorData = await response.json()
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
              } catch (e) {
                errorData = await response.text()
                errorMessage = errorData
              }
            } else {
              errorData = await response.text()
              errorMessage = errorData
            }

            // Create API error with detailed information
            const apiError = new TeerAPIError({
              message: errorMessage,
              status: response.status,
              statusText: response.statusText,
              data: errorData,
              headers: response.headers,
              request: requestInfo,
            })

            // Only retry on server errors (5xx) and rate limit errors (429)
            if (apiError.isServerError || apiError.isRateLimitError) {
              // For rate limit errors, use the Retry-After header if available
              if (apiError.isRateLimitError) {
                const retryAfter = response.headers.get('Retry-After')
                if (retryAfter) {
                  const retrySeconds = parseInt(retryAfter, 10)
                  if (!isNaN(retrySeconds)) {
                    await new Promise((resolve) => setTimeout(resolve, retrySeconds * 1000))
                  }
                }
              }

              lastError = apiError
              continue // Retry the request
            }

            throw apiError // Don't retry client errors
          }

          // Process successful response
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            return await response.json()
          }

          return null as unknown as T
        } catch (error) {
          clearTimeout(timeoutId)

          // Handle timeout errors
          if (error instanceof DOMException && error.name === 'AbortError') {
            throw new TeerTimeoutError({
              timeoutMs,
              request: requestInfo,
            })
          }

          // Re-throw the error
          throw error
        }
      } catch (error) {
        lastError = error as Error

        // Only retry on network errors, timeouts, and server errors
        if (
          error instanceof TeerTimeoutError ||
          error instanceof TeerNetworkError ||
          (error instanceof TeerAPIError && error.isServerError)
        ) {
          continue // Retry the request
        }

        // Don't retry other errors
        throw error
      }
    }

    // If we've exhausted all retries, throw the last error
    if (lastError) {
      throw lastError
    }

    // This should never happen, but TypeScript requires a return statement
    return null as unknown as T
  }
}
