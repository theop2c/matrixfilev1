import { OPENAI_API_KEY, MODEL_CONFIG } from '../config';
import type { OpenAIMessage, OpenAIResponse } from '../types';
import { logger } from '../../logger';

export async function makeOpenAIRequest(messages: OpenAIMessage[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_CONFIG.name,
        messages,
        temperature: MODEL_CONFIG.temperature,
        max_tokens: MODEL_CONFIG.maxTokens,
        presence_penalty: MODEL_CONFIG.presencePenalty,
        frequency_penalty: MODEL_CONFIG.frequencyPenalty,
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