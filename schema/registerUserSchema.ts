import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(3, 'The name must be at least 3 characters long'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*()_|~\-]/,
      'Password must contain at least one special character',
    ),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
