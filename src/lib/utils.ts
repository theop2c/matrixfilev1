import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date: string | number | Date | null | undefined): string {
  if (!date) {
    console.error("Invalid date input:", date);
    return "Invalid date"; // Return a fallback or placeholder value
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    console.error("Unable to parse date:", date);
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
