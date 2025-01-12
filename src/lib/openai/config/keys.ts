import { logger } from '../../logger';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  const error = 'Missing OpenAI API key in environment variables';
  logger.error(error);
  throw new Error(error);
}

export { OPENAI_API_KEY };