'use client';

/**
 * Animated loading spinner with pulsing dots pattern.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex gap-1.5">
        <div className="h-3 w-3 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-3 w-3 rounded-full bg-[var(--color-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-3 w-3 rounded-full bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
