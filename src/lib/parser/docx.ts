import { Document } from 'docx';
import { logger } from '../logger';

export async function parseDocx(content: ArrayBuffer): Promise<string> {
  try {
    logger.debug('Starting DOCX parsing');
    const doc = new Document(content);
    const text = await doc.getText();
    
    logger.debug('DOCX parsing completed', { 
      textLength: text.length 
    });
    
    if (!text.trim()) {
      throw new Error('No text content extracted from DOCX');
    }
    
    return text.trim();
  } catch (error) {
    logger.error('DOCX parsing failed:', error);
    throw new Error('Failed to parse DOCX document');
  }
}