/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_FIREBASE_EXTENSION_URL: string
  readonly VITE_STRIPE_SUCCESS_URL: string
  readonly VITE_STRIPE_CANCEL_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  dataLayer: { [key: string]: unknown }[]; // Replace with the exact shape of the objects in the array
  gtag: (...args: unknown[]) => void; // Use `unknown[]` if the argument types are not known
}
