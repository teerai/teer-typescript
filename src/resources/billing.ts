import { Resource, TeerClient } from './resource'
import { RequestConfigOptions } from '../types'

/**
 * Base interface for meter event fields
 */
export interface MeterEventFieldsBase {
  /**
   * Optional identifier for the meter event
   */
  identifier?: string

  /**
   * Name of the event (required)
   */
  event_name: string

  /**
   * Optional timestamp for the event (ISO 8601 format)
   */
  timestamp?: string
}

/**
 * Stripe-specific meter event fields
 */
export interface StripeMeterEventFields extends MeterEventFieldsBase {
  /**
   * Payload data for the Stripe event
   */
  payload: {
    stripe_customer_id: string
    value: string
  }
}

/**
 * Parameters for creating a meter event with Stripe provider
 */
export interface StripeMeterEventCreateParams {
  /**
   * Provider type - Stripe
   */
  provider: 'stripe'

  /**
   * Stripe-specific fields
   */
  fields: StripeMeterEventFields
}

/**
 * Union type for all supported provider meter event params
 */
export type MeterEventCreateParams = StripeMeterEventCreateParams
// Add more provider types here in the future, e.g.:
// | OtherProviderMeterEventCreateParams

/**
 * Response type for meter events
 */
export interface MeterEvent {
  id: string
  event_name: string
  timestamp: string
  payload: Record<string, any>
  identifier?: string
  created_at: string
  updated_at: string
}

/**
 * Resource for meter events operations
 */
export class MeterEventsResource extends Resource {
  constructor(client: TeerClient) {
    const resourceBaseUrl = client.defaultRequestConfig.trackURL
    super(client, 'billing/meter-events', resourceBaseUrl)
  }

  /**
   * Create a meter event to record usage
   *
   * @param params Parameters for creating a meter event
   * @param options Optional request configuration
   * @returns The created meter event
   */
  async create(params: MeterEventCreateParams, options?: RequestConfigOptions): Promise<MeterEvent> {
    return this.request(
      {
        method: 'POST',
        path: '',
        data: params,
      },
      options
    )
  }
}

/**
 * Billing Resource for handling billing operations
 */
export class BillingResource extends Resource {
  /**
   * Meter events resource for recording usage
   */
  public readonly meterEvents: MeterEventsResource

  constructor(client: TeerClient) {
    const resourceBaseUrl = client.defaultRequestConfig.trackURL
    super(client, 'billing', resourceBaseUrl)
    this.meterEvents = new MeterEventsResource(client)
  }
}
