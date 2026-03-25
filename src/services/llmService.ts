
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

const OLLAMA_BASE_URL = 'http://localhost:11434/api/chat';

/**
 * Streams chat tokens from local Ollama instance.
 */
export async function* streamChatMessage(model: string, messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<ChatChunk> {
  const response = await fetch(OLLAMA_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal, // Abort the request if the user clicks Stop
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: true,
      options: {
        temperature: 0.0,
        num_ctx: 4096,
        mirostat: 0,
        num_predict: -1
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Ollama connection failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('ReadableStream not supported by browser.');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
           try {
             const chunk: ChatChunk = JSON.parse(line);
             yield chunk;
           } catch (e) {
             console.error('Error parsing streaming line:', line, e);
           }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Fallback for non-streaming requests
 */
export async function sendChatMessage(model: string, messages: ChatMessage[]): Promise<ChatMessage> {
  const response = await fetch(OLLAMA_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  });
  if (!response.ok) throw new Error(`Ollama Error: ${response.status}`);
  const data = await response.json();
  return data.message;
}
