import { z } from 'zod';

/**
 * Schema for the user profile data that is sent to the client.
 * Excludes sensitive information like the password hash.
 */
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
});

/**
 * TypeScript type for the user profile.
 */
export type UserProfile = z.infer<typeof userProfileSchema>;