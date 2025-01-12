import { logger } from '../logger';

const MAX_CHUNK_SIZE = 6000; // Safe limit for GPT-4 context window
const OVERLAP_SIZE = 500; // Overlap between chunks to maintain context

export function splitContentIntoChunks(content: string): string[] {
  try {
    // Split content into sentences first
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      // If adding this sentence would exceed chunk size, start a new chunk
      if ((currentChunk + sentence).length > MAX_CHUNK_SIZE) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // Start new chunk with overlap from previous chunk
        const lastChunkOverlap = currentChunk.slice(-OVERLAP_SIZE);
        currentChunk = lastChunkOverlap + sentence;
      } else {
        currentChunk += sentence;
      }
    }

    // Add the last chunk if it's not empty
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    logger.debug('Content split into chunks', { 
      totalChunks: chunks.length,
      averageChunkSize: chunks.reduce((acc, chunk) => acc + chunk.length, 0) / chunks.length 
    });

    return chunks;
  } catch (error) {
    logger.error('Error splitting content into chunks:', error);
    throw error;
  }
}