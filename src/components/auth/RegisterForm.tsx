'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return;
      }

      setSuccess(true);

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // If auto-login fails, redirect to login page
        router.push('/login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
      console.error(`${provider} sign in error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500 text-red-400 rounded">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-900/20 border border-green-500 text-green-400 rounded">
          Account created successfully! Signing you in...
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.email ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="your_username"
          {...register('username')}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.username ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.username && (
          <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
        )}
        <p className="text-gray-400 text-xs mt-1">
          3-20 characters, alphanumeric with underscore/hyphen
        </p>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••"
          {...register('password')}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.password ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.password && (
          <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Password Confirm Field */}
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <input
          id="passwordConfirm"
          type="password"
          placeholder="••••••"
          {...register('passwordConfirm')}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-800 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            errors.passwordConfirm ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.passwordConfirm && (
          <p className="text-red-400 text-sm mt-1">{errors.passwordConfirm.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 text-white font-medium rounded transition-colors"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-900 text-gray-400">Or sign up with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub
        </button>
      </div>

      {/* Sign In Link */}
      <p className="text-center text-gray-400 text-sm">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
