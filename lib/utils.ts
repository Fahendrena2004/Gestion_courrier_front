import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to smartly merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date object to a localized string
 * @param date The date to format
 * @param locale The locale to use (defaults to 'mg-MG')
 */
export function formatDate(date: string | Date, locale: string = 'mg-MG'): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale);
}
