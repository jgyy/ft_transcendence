'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  const { data: session } = useSession();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo/Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          ft_transcendence
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-fade-in-delay-1">
          Competitive Pong Gaming Platform
        </p>

        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in-delay-2">
          Challenge players worldwide in real-time multiplayer matches, compete in tournaments,
          and dominate the global leaderboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-delay-3">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button size="lg">
                  Play Now
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="secondary">
                  View Leaderboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">
                  Get Started
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 text-center animate-fade-in-delay-4">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-blue-400">1000+</p>
            <p className="text-gray-400">Active Players</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-purple-400">500+</p>
            <p className="text-gray-400">Daily Matches</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-pink-400">50+</p>
            <p className="text-gray-400">Tournaments</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <svg
          className="w-6 h-6 text-gray-400 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
