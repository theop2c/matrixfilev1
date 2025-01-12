import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config';
import { OPENAI_CONFIG, SYSTEM_PROMPT } from './config';
import { splitContentIntoChunks } from './chunking';
import type { OpenAIMessage } from './types';
import { logger } from '../logger';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function sendMessageToOpenAI(
  messages: OpenAIMessage[],
  documentContent: string
): Promise<string> {
  try {
    logger.debug('Preparing OpenAI request');

    // Split content into manageable chunks
    const chunks = splitContentIntoChunks(documentContent);
    let finalResponse = '';

    // Process each chunk with context from previous responses
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLastChunk = i === chunks.length - 1;

      // Prepare context with current chunk
      const chunkContext = `${SYSTEM_PROMPT}\n\nPartie ${i + 1}/${chunks.length} du document:\n${chunk}\n\n${
        isLastChunk ? 'Ceci est la dernière partie du document.' : 'Ceci est une partie du document, il y en a d\'autres qui suivent.'
      }`;

      const completion = await openai.chat.completions.create({
        ...OPENAI_CONFIG,
        messages: [
          { role: 'system', content: chunkContext },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Réponse vide de l\'API OpenAI');
      }

      finalResponse += (finalResponse ? '\n\n' : '') + response;
    }

    logger.debug('OpenAI processing completed', { 
      chunks: chunks.length,
      responseLength: finalResponse.length 
    });

    return finalResponse;
  } catch (error) {
    logger.error('OpenAI request failed:', error);
    throw new Error('Erreur lors de la communication avec OpenAI');
  }
}