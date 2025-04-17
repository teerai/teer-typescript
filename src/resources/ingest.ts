import { Resource, TeerClient } from './resource'
import { IngestData, RequestConfigOptions } from '../types'

// Track API URL
const TEER_TRACK_BASE_URL = 'https://track.teer.ai'

/**
 * Ingest Resource for handling ingest operations
 */
export class IngestResource extends Resource {
  constructor(client: TeerClient) {
    // Use the track API URL for ingest operations
    super(client, 'ingest', TEER_TRACK_BASE_URL)
  }

  /**
   * Send usage data to the Teer API
   *
   * @param data The usage data to send
   * @param options Optional request configuration (timeout, retries, etc.)
   */
  async send(data: IngestData, options?: RequestConfigOptions): Promise<any> {
    return this.request(
      {
        method: 'POST',
        path: '',
        data,
      },
      options
    )
  }
}
