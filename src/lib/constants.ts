export const USER_STORAGE_LIMITS = {
  freemium: 5 * 1024 * 1024, // 5MB
  premium: 20 * 1024 * 1024, // 20MB
  gold: 50 * 1024 * 1024 // 50MB
} as const;

export const USER_ROLE_NAMES = {
  freemium: 'Free',
  premium: 'Premium',
  gold: 'Gold'
} as const;

export const USER_MATRIX_LIMITS = {
  freemium: 5,
  premium: 20,
  gold: 50
} as const;

export const USER_ANALYSE_LIMITS = {
  freemium: 5,
  premium: 20,
  gold: 50
} as const;

export const USER_QUESTION_LIMITS = {
  freemium: 10,
  premium: 50,
  gold: 100
} as const;