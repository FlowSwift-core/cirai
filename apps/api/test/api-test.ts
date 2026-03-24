import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, convertToModelMessages } from 'ai';

async function runTest() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error('Missing NVIDIA_API_KEY');
    return;
  }

  const client = createOpenAICompatible({
    name: 'nim',
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  const messages = [
    {
      id: 'msg1',
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: 'Hello, AI' }],
    },
  ];

  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: client('openai/gpt-oss-120b'),
    system: 'You are a test assistant.',
    messages: modelMessages,
  });

  // Print streamed output
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

runTest().catch(console.error);
