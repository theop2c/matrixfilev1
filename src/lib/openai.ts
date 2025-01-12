import { OPENAI_API_KEY, OPENAI_CONFIG } from './config';
import { logger } from './logger';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const SYSTEM_PROMPT = `You are a document analysis assistant. Your role is to analyze the provided document and answer questions about it.

Here are your instructions:
1. ONLY use information from the provided document content
2. If asked about information not in the document, clearly state that it's not present
3. When answering, cite relevant parts of the document
4. Keep responses focused and relevant to the document
5. Format your responses clearly and professionally

Remember:
- Stay strictly within the document's content
- Be precise in your answers
- Use direct quotes when appropriate
- Maintain professional communication`;

export async function sendMessageToOpenAI(
  messages: OpenAIMessage[],
  documentContent: string
): Promise<string> {
  try {
    logger.debug('Preparing OpenAI request with document context');

    // Create a clear context with document content
    const context = `${SYSTEM_PROMPT}\n\nDocument Content:\n${documentContent}\n\nAnalyze the above document and answer questions about it.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        ...OPENAI_CONFIG,
        messages: [
          { role: 'system', content: context },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('OpenAI API error:', { 
        status: response.status, 
        errorData 
      });
      throw new Error(
        `OpenAI API Error (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const data: OpenAIResponse = await response.json();
    logger.debug('OpenAI response received', { 
      tokens: data.usage,
      finishReason: data.choices[0].finish_reason
    });

    return data.choices[0].message.content;
  } catch (error) {
    logger.error('OpenAI request failed:', error);
    throw error;
  }
}