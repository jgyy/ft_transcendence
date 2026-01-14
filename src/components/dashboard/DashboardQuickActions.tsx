'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Play Now */}
      <Link href="/play" className="block">
        <Button className="w-full h-20 text-lg font-semibold flex items-center justify-center gap-2">
          <span className="text-2xl">🎮</span>
          Play Now
        </Button>
      </Link>

      {/* Create Tournament */}
      <Link href="/tournaments/create" className="block">
        <Button variant="secondary" className="w-full h-20 text-lg font-semibold flex items-center justify-center gap-2">
          <span className="text-2xl">🏆</span>
          Create Tournament
        </Button>
      </Link>

      {/* View Friends */}
      <Link href="/friends" className="block">
        <Button variant="secondary" className="w-full h-20 text-lg font-semibold flex items-center justify-center gap-2">
          <span className="text-2xl">👥</span>
          View Friends
        </Button>
      </Link>
    </div>
  );
}
