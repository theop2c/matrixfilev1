import { makeOpenAIRequest } from './client';
import { SYSTEM_PROMPTS } from '../config';
import type { OpenAIMessage } from '../types';
import { logger } from '../../logger';

export async function analyzeDocument(
  messages: OpenAIMessage[],
  documentContent: string
): Promise<string> {
  try {
    logger.debug('Preparing document analysis request');

    const context = `${SYSTEM_PROMPTS.documentAnalysis}\n\nDocument Content:\n${documentContent}\n\nAnalyze the above document and answer questions about it.`;

    const fullMessages = [
      { role: 'system', content: context },
      ...messages
    ];

    return await makeOpenAIRequest(fullMessages);
  } catch (error) {
    logger.error('Document analysis failed:', error);
    throw error;
  }
}