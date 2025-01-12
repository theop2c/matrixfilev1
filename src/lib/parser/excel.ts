import * as XLSX from 'xlsx';
import { logger } from '../logger';

export async function parseExcel(content: ArrayBuffer): Promise<string> {
  try {
    logger.debug('Starting Excel parsing');
    const workbook = XLSX.read(content);
    let text = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      text += `Sheet: ${sheetName}\n${XLSX.utils.sheet_to_string(sheet)}\n\n`;
    });
    
    logger.debug('Excel parsing completed', { 
      sheets: workbook.SheetNames.length,
      textLength: text.length 
    });
    
    if (!text.trim()) {
      throw new Error('No text content extracted from Excel');
    }
    
    return text.trim();
  } catch (error) {
    logger.error('Excel parsing failed:', error);
    throw new Error('Failed to parse Excel document');
  }
}