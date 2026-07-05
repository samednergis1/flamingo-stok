const SIZES = {
  sm: 'h-9 sm:h-10',
  md: 'h-14',
  lg: 'h-20',
  xl: 'h-28 sm:h-32',
};

export default function Logo({ size = 'md', className = '', forceLight = false }) {
  const wrapperClass = forceLight
    ? ''
    : 'dark:rounded-xl dark:bg-cream-100/10 dark:px-2.5 dark:py-1';

  return (
    <span
      className={`inline-flex items-center justify-center ${wrapperClass} ${className}`}
    >
      <img
        src="/flamingo-logo-new.png"
        alt="Flamingo Vitamin Bar & Cafe"
        className={`w-auto object-contain ${SIZES[size]}`}
        draggable={false}
      />
    </span>
  );
}
