import { logger } from './logger';

// OpenAI Configuration
export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini', // Updated model
  temperature: 0.7,
  max_tokens: 1000,
  presence_penalty: 0.1,
  frequency_penalty: 0.1,
};

// Get OpenAI API key from environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  const error = 'Missing OpenAI API key in environment variables';
  logger.error(error);
  throw new Error(error);
}

export const OPENAI_API_KEY = apiKey;