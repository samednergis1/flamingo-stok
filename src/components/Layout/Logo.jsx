const SIZES = {
  sm: 'h-9 sm:h-10',
  md: 'h-14',
  lg: 'h-20',
  xl: 'h-28 sm:h-32',
};

export default function Logo({ size = 'md', className = '' }) {
  return (
    <img
      src="/flamingo-logo-new.png"
      alt="Flamingo Vitamin Bar & Cafe"
      className={`w-auto object-contain dark:brightness-0 dark:invert ${SIZES[size]} ${className}`}
      draggable={false}
    />
  );
}
