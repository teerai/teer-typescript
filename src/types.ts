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

// Common billing fields without the meter/meters
type BillingFieldsBase = {
  customer: string
  email?: string
}

// Single meter option
type SingleMeterFields = BillingFieldsBase & {
  meter: string
  meters?: never
}

// Multiple meters option
type MultiMeterFields = BillingFieldsBase & {
  meter?: never
  meters: Record<string, string>
}

// Union type that allows either single meter or multiple meters
type BillingFields = SingleMeterFields | MultiMeterFields

export interface TeerBillingConfig {
  provider: BillingProvider
  fields: BillingFields
}

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
  billing?: TeerBillingConfig
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
 * Type definition for fetch function
 */
export type FetchFunction = typeof fetch

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

  /**
   * Custom fetch implementation
   */
  customFetch?: FetchFunction
}
