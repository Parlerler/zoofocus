export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-mono text-base md:text-lg font-bold tracking-[0.22em] text-foreground select-none ${className}`}>
      SOKT
    </span>
  );
}
