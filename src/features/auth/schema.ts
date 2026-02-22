import { z } from 'zod';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s-]{9,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(254, 'Email address is too long.')
    .regex(emailPattern, 'Please enter a valid email address.'),
  password: z
    .string()
    .trim()
    .min(1, 'Please enter your password.')
    .min(6, 'Password must be at least 6 characters.')
    .max(100, 'Password is too long.')
});

export const signUpSchema = z
  .object({
    garageName: z.string().trim().min(2, 'Garage name is required.'),
    email: z
      .string()
      .trim()
      .min(1, 'Please enter your email address.')
      .max(254, 'Email address is too long.')
      .regex(emailPattern, 'Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.')
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Phone number or email is required.')
    .refine(
      (value) => emailPattern.test(value) || phonePattern.test(value),
      'Enter a valid phone number or email.'
    )
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Please confirm your password.')
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
