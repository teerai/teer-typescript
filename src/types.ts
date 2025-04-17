/**
 * Options for making API requests
 */
export interface RequestOptions {
  method: string
  path: string
  data?: any
}

/**
 * Data structure for ingest requests
 */
type BillingProvider = 'stripe'

export interface IngestData {
  provider: 'anthropic' | 'openai' | 'google'
  model: string
  // Core usage metrics
  usage: {
    input: number
    output: number
    cache?: {
      anthropic?: {
        cache_creation_input_tokens?: number
        cache_read_input_tokens?: number
      }
      openai?: {
        input_cached_tokens?: number
      }
      google?: {
        cached_content_token_count?: number
      }
    }
  }
  // Identification
  function_id?: string
  // Teer specific metadata
  platform?: {
    rate_card_id: string
  }
  billing?: {
    provider: BillingProvider
    fields: {
      customer: string
    }
  }
  // Extensible metadata
  metadata?: Record<string, unknown>

  // Tracing metadata
  trace_id?: string
  span_id?: string
  parent_span_id?: string

  // Execution context
  batch?: boolean // Whether this was part of a batch operation as it has impact on pricing
}

/**
 * Options for configuring request behavior
 */
export interface RequestConfigOptions {
  /**
   * Custom base URL for the API
   */
  baseURL?: string

  /**
   * Request timeout in milliseconds
   */
  timeoutMs?: number

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number

  /**
   * Base delay between retries in milliseconds (will increase with exponential backoff)
   */
  retryDelayMs?: number
}
