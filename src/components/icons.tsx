export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path strokeLinejoin="round" d="M12 19.4 4.8 12.6a4.2 4.2 0 0 1 6-6L12 7.8l1.2-1.2a4.2 4.2 0 0 1 6 6L12 19.4Z" />
    </svg>
  );
}
