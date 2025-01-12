import { logger } from '../logger';
import { parsePDF } from './pdf';
import { parseDocx } from './docx';
import { parseExcel } from './excel';
import { readFile } from './utils';

export async function parseFile(file: File): Promise<string> {
  try {
    logger.info('Starting file parsing', { 
      filename: file.name,
      type: file.type,
      size: file.size 
    });

    const extension = file.name.split('.').pop()?.toLowerCase();
    const content = await readFile(file);

    let parsedContent: string;
    
    switch (extension) {
      case 'pdf':
        parsedContent = await parsePDF(content);
        break;
      case 'docx':
        parsedContent = await parseDocx(content);
        break;
      case 'xlsx':
        parsedContent = await parseExcel(content);
        break;
      default:
        throw new Error(`Format de fichier non supporté: ${extension}`);
    }

    // Validate parsed content
    if (!parsedContent || parsedContent.trim().length === 0) {
      throw new Error('Aucun contenu n\'a pu être extrait du fichier');
    }

    // Clean and normalize the content
    parsedContent = parsedContent
      .replace(/\s+/g, ' ')
      .replace(/[^\S\n]+/g, ' ')
      .trim();

    logger.info('File parsing completed successfully', {
      contentLength: parsedContent.length
    });

    return parsedContent;
  } catch (error) {
    logger.error('File parsing failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Une erreur est survenue lors de l\'analyse du fichier');
  }
}