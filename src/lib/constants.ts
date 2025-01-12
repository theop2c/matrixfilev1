export const USER_STORAGE_LIMITS = {
  freemium: 5 * 1024 * 1024, // 5MB
  premium: 20 * 1024 * 1024, // 20MB
  or: 50 * 1024 * 1024 // 50MB
} as const;

export const USER_ROLE_NAMES = {
  freemium: 'Free',
  premium: 'Premium',
  or: 'Gold'
} as const;