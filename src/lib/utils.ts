import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` is a utility to conditionally join class names and resolve Tailwind conflicts.
 * Combines `clsx` and `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
