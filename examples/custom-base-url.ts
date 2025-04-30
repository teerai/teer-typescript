import { Teer } from '../src/index'

async function main() {
  // Initialize the client with your API key and a custom base URL
  const client = new Teer('your-api-key', {
    baseURL: 'https://custom-api.example.com',
  })

  try {
    console.log('Client base URL:', client.baseURL)
    console.log('Default request config:', client.defaultRequestConfig)

    // This will use the custom base URL instead of the default track.teer.ai
    const response = await client.ingest.send({
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      function_id: 'custom-base-url-example',
      usage: {
        input: 1000,
        output: 2000,
      },
    })

    console.log('Response:', response)

    // You can also override the baseURL for a specific request
    const response2 = await client.ingest.send(
      {
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
        function_id: 'custom-base-url-override',
        usage: {
          input: 1500,
          output: 3000,
        },
      },
      {
        baseURL: 'https://another-custom-api.example.com',
      }
    )

    console.log('Response 2:', response2)
  } catch (error) {
    console.error('Error:', error)
  }
}

main().catch(console.error)
