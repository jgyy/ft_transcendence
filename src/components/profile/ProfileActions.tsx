'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface ProfileActionsProps {
  userId: string;
  username: string;
}

type FriendshipStatus = 'none' | 'pending' | 'friends' | 'self';

export function ProfileActions({ userId, username }: ProfileActionsProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [isLoading, setIsLoading] = useState(false);

  // Don't show actions for own profile
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!session?.user?.id || isOwnProfile) return;

      try {
        const response = await fetch('/api/users/friends');
        if (!response.ok) return;

        const data = await response.json();
        const { friends, pendingRequests } = data.data;

        const isFriend = friends.some((f: any) => f.id === userId);
        const isPending = pendingRequests.some((r: any) => r.user.id === userId);

        if (isFriend) {
          setFriendshipStatus('friends');
        } else if (isPending) {
          setFriendshipStatus('pending');
        } else {
          setFriendshipStatus('none');
        }
      } catch (err) {
        console.error('Error checking friendship:', err);
      }
    };

    checkFriendshipStatus();
  }, [userId, session?.user?.id, isOwnProfile]);

  const handleAddFriend = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/users/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        showToast({
          type: 'error',
          message: data.error || 'Failed to send friend request',
        });
        return;
      }

      setFriendshipStatus('pending');
      showToast({
        type: 'success',
        message: 'Friend request sent!',
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to send friend request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user?.id) {
    return null;
  }

  if (isOwnProfile) {
    return null;
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Message Button */}
      <Link href={`/chat/${userId}`} className="flex-1 md:flex-none">
        <Button variant="secondary">
          💬 Message
        </Button>
      </Link>

      {/* Friend Button */}
      {friendshipStatus === 'none' && (
        <Button
          onClick={handleAddFriend}
          isLoading={isLoading}
          className="flex-1 md:flex-none"
        >
          👥 Add Friend
        </Button>
      )}

      {friendshipStatus === 'pending' && (
        <Button variant="secondary" disabled className="flex-1 md:flex-none">
          ⏳ Request Pending
        </Button>
      )}

      {friendshipStatus === 'friends' && (
        <Button variant="secondary" disabled className="flex-1 md:flex-none">
          ✓ Friends
        </Button>
      )}

      {/* Challenge Button */}
      <Link href={`/play?opponent=${userId}`} className="flex-1 md:flex-none">
        <Button>
          🎮 Challenge
        </Button>
      </Link>
    </div>
  );
}
