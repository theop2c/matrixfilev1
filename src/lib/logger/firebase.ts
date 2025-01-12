import {
  log,
  info,
  debug,
  warn,
  error,
  write
} from "firebase-functions/logger";

// Export Firebase logger functions
export const firebaseLogger = {
  log,
  info,
  debug,
  warn,
  error,
  write
};