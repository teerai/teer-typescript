import { Teer } from '../src/index'

async function main() {
  // Initialize the client with your API key
  const client = new Teer('your-api-key')

  try {
    // Create a meter event
    const meterEvent = await client.billing.meterEvents.create({
      identifier: 'idmp_12345678',
      event_name: 'ai_search_api',
      timestamp: '2024-06-01T12:00:00.000Z',
      payload: {
        stripe_customer_id: 'cus_12345678',
        value: '25',
      },
    })

    console.log('Meter event created:', meterEvent)
  } catch (error) {
    console.error('Error creating meter event:', error)
  }
}

main().catch(console.error)
