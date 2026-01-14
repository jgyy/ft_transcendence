'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/achievements', label: 'Achievements' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              ft_transcendence
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* User Menu */}
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <img
                        src={session.user?.image || '/images/default-avatar.png'}
                        alt={session.user?.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium hidden sm:inline">
                        {session.user?.name}
                      </span>
                    </button>
                  }
                  align="right"
                >
                  <DropdownItem>
                    <Link href={`/users/${session.user?.id}`} className="w-full">
                      Profile
                    </Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link href="/dashboard" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownItem>
                  <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
                </Dropdown>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-800 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
