import { saveMatrixAnalysisToDb } from '@/lib/api/matrix';
import { logger } from '@/lib/logger';
import type { MatrixAnalysis } from './types';

// Function to save the analysis
export async function saveAnalysisAction(
  matrixId: string,
  fileId: string,
  userId: string,
  name: string,
  responses: Record<string, string>,
  
 
): Promise<MatrixAnalysis> {
  try {
    if (!userId) {
      throw new Error('User ID is required to save analysis');
    }

    // Save analysis to the database
    const analysisId = await saveMatrixAnalysisToDb(
      matrixId,
      fileId,
      userId,
      name,
      responses
    );

    // Create the analysis object
    const analysis: MatrixAnalysis = {
      id: analysisId,
      matrixId,
      fileId,
      userId,
      name,
      responses: Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        response,
      })),
      createdAt: new Date(),
    };

    logger.debug('Analysis saved successfully', { analysisId });
    return analysis;
  } catch (error) {
    logger.error('Failed to save analysis:', error);
    throw error;
  }
}
