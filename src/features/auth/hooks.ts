'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword
} from '@/features/auth/api';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  type ForgotPasswordSchema,
  type LoginSchema,
  type ResetPasswordSchema,
  type SignUpSchema
} from '@/features/auth/schema';
import { useToast } from '@/hooks/use-toast';

export function useLoginForm() {
  const router = useRouter();
  const toast = useToast();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      if (!result.success) {
        form.setError('root', {
          message: result.error ?? 'Incorrect email or password.'
        });
        return;
      }

      toast.success('Welcome back');
      router.push('/dashboard');
      router.refresh();
    }
  });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => {
      form.clearErrors('root');
      mutation.mutate({
        email: values.email.trim().toLowerCase(),
        password: values.password.trim()
      });
    })
  };
}

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    status,
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    role: session?.user.role,
    logout
  };
}

export function useSignUpForm() {
  const router = useRouter();
  const toast = useToast();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      garageName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: SignUpSchema) => {
      const registerResult = await register({
        garageName: values.garageName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password
      });

      if (!registerResult.success || !registerResult.data) {
        return {
          success: false as const,
          error: registerResult.error ?? 'Could not create account.'
        };
      }

      const loginResult = await login({
        email: registerResult.data.email,
        password: values.password
      });

      if (!loginResult.success) {
        return {
          success: false as const,
          error: loginResult.error ?? 'Account created, but sign in failed.'
        };
      }

      return { success: true as const };
    },
    onSuccess: (result) => {
      if (!result.success) {
        form.setError('root', { message: result.error });
        return;
      }

      toast.success('Account created successfully.');
      router.push('/dashboard');
      router.refresh();
    }
  });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => {
      form.clearErrors('root');
      mutation.mutate(values);
    })
  };
}

export function useForgotPasswordForm(options?: { onSuccess?: () => void }) {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: ''
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordSchema) => {
      const result = await forgotPassword({ identifier: values.identifier });

      if (!result.success) {
        return {
          success: false as const,
          error: result.error ?? 'Could not send reset instructions.'
        };
      }

      return { success: true as const };
    },
    onSuccess: (result) => {
      if (!result.success) {
        form.setError('root', { message: result.error });
        return;
      }

      options?.onSuccess?.();
    }
  });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => {
      form.clearErrors('root');
      mutation.mutate(values);
    })
  };
}

export function useResetPasswordForm(options?: {
  onSuccess?: () => void;
  token?: string;
}) {
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  });

  const mutation = useMutation({
    mutationFn: async (values: ResetPasswordSchema) => {
      const result = await resetPassword({
        password: values.password,
        token: options?.token
      });

      if (!result.success) {
        return {
          success: false as const,
          error: result.error ?? 'Could not reset password.'
        };
      }

      return { success: true as const };
    },
    onSuccess: (result) => {
      if (!result.success) {
        form.setError('root', { message: result.error });
        return;
      }

      options?.onSuccess?.();
    }
  });

  return {
    form,
    mutation,
    onSubmit: form.handleSubmit((values) => {
      form.clearErrors('root');
      mutation.mutate(values);
    })
  };
}
