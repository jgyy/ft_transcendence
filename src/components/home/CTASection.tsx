'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  const { data: session } = useSession();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border-y border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {session ? 'Ready to Compete?' : 'Join the Competition Today'}
        </h2>

        {/* Subheading */}
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {session
            ? 'Challenge players worldwide, climb the leaderboard, and prove you are the ultimate Pong champion.'
            : 'Sign up now and start playing against thousands of players worldwide. Create your account in seconds.'}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="secondary">
                  View Rankings
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div>
            <p className="text-2xl font-bold text-blue-400 mb-2">⚡</p>
            <h3 className="font-semibold text-white mb-1">Instant Matches</h3>
            <p className="text-sm text-gray-400">
              Find opponents instantly with our advanced matchmaking system
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400 mb-2">🏆</p>
            <h3 className="font-semibold text-white mb-1">Tournaments</h3>
            <p className="text-sm text-gray-400">
              Compete in tournaments and earn exclusive rewards
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-400 mb-2">🎮</p>
            <h3 className="font-semibold text-white mb-1">Game Library</h3>
            <p className="text-sm text-gray-400">
              Play against AI, friends, or strangers in real-time matches
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
