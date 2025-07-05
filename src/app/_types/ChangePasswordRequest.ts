import { z } from 'zod';
import { passwordSchema } from './CommonSchemas';

/**
 * Validation schema for the change password request.
 */
export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'], // Set the error on the confirmation field
  });

/**
 * TypeScript type for the change password request, inferred from the Zod schema.
 */
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;