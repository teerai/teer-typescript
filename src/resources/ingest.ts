import { Resource, TeerClient } from './resource'
import { IngestData, RequestConfigOptions } from '../types'

// Track API URL

/**
 * Ingest Resource for handling ingest operations
 */
export class IngestResource extends Resource {
  constructor(client: TeerClient) {
    const resourceBaseUrl = client.defaultRequestConfig.trackURL
    super(client, 'ingest', resourceBaseUrl)
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
