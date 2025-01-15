import * as pdfjsLib from 'pdfjs-dist';
import { logger } from '../logger';

// Initialize PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = /* @vite-ignore */ new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (workerError) {
  logger.error('Failed to configure PDF.js worker', workerError);
}

// Function to parse a PDF file and extract text
export async function parsePDF(content: ArrayBuffer): Promise<string> {
  try {
    logger.debug('Starting PDF parsing');
    
    // Validate PDF header
    const pdfHeader = new Uint8Array(content.slice(0, 5));
    const header = String.fromCharCode(...pdfHeader);
    if (header !== '%PDF-') {
      throw new Error('Le fichier ne semble pas être un PDF valide');
    }

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: content,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true,
      nativeImageDecoderSupport: 'none',
      ignoreErrors: true,
    });

    const pdf = await loadingTask.promise;
    
    if (pdf.numPages === 0) {
      throw new Error('Le PDF ne contient aucune page');
    }

    let text = '';
    let successfulPages = 0;
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (textContent.items.length === 0) {
          logger.warn(`Page ${i} is empty or contains no extractable text`);
          continue;
        }

        // Extract text with proper spacing and structure
        const pageText = textContent.items
          .reduce((acc: string, item: any) => {
            const itemText = item.str || '';
            return acc + (acc && !acc.endsWith(' ') ? ' ' : '') + itemText;
          }, '')
          .trim();

        if (pageText) {
          text += pageText + '\n\n';
          successfulPages++;
        }
      } catch (pageError) {
        logger.error(`Error processing page ${i}:`, pageError);
        continue;
      }
    }
    
    if (successfulPages === 0) {
      throw new Error('Impossible d\'extraire le texte du PDF. Le document pourrait être numérisé ou protégé.');
    }
    
    logger.debug('PDF parsing completed', { 
      totalPages: pdf.numPages,
      successfulPages,
      textLength: text.length 
    });
    
    // Clean up the text
    const cleanedText = text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[^\S\n]+/g, ' ')
      .trim();

    if (!cleanedText) {
      throw new Error('Aucun texte n\'a pu être extrait du PDF');
    }
    
    return cleanedText;

  } catch (error) {
    logger.error('PDF parsing failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF structure')) {
        throw new Error('La structure du PDF est invalide ou le fichier est corrompu');
      } else if (error.message.includes('Password')) {
        throw new Error('Le PDF est protégé par mot de passe');
      } else if (error.message.includes('XRef')) {
        throw new Error('Le PDF est endommagé ou mal formaté');
      }
      throw error;
    }
    
    throw new Error('Impossible de lire le document PDF. Vérifiez que le fichier n\'est pas corrompu ou protégé.');
  }
}
