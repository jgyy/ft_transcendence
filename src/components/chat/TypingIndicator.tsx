'use client';

interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const typingText =
    users.length === 1
      ? `${users[0]} is typing...`
      : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]} are typing...`;

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
      </div>
      <span>{typingText}</span>
    </div>
  );
}
