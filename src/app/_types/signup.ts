import { z } from 'zod';
import { passwordSchema } from './CommonSchemas';

/**
 * Validation schema for the signup request.
 */
export const signupRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: passwordSchema,
  name: z.string().min(1, { message: 'Name is required.' }),
});

/**
 * TypeScript type for the signup request, inferred from the Zod schema.
 */
export type SignupRequest = z.infer<typeof signupRequestSchema>;