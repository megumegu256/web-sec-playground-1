import { z } from 'zod';

/**
 * Common schema for password strength validation.
 * Requires at least 8 characters, one lowercase letter, one uppercase letter, and one number.
 */
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number.' });