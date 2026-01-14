import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign Up - ft_transcendence',
  description: 'Create a new ft_transcendence account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white mb-2 inline-block hover:text-blue-400">
            ft_transcendence
          </Link>
          <p className="text-gray-400 text-sm">Competitive Pong Gaming Platform</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>
          <RegisterForm />
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-blue-400 hover:text-blue-300">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
