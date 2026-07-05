const SIZES = {
  sm: 'h-9 sm:h-10',
  md: 'h-14',
  lg: 'h-20',
  xl: 'h-28 sm:h-32',
};

export default function Logo({ size = 'md', className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center dark:rounded-xl dark:bg-[#f8ebe3]/95 dark:px-2.5 dark:py-1 dark:shadow-[0_0_20px_rgba(249,61,99,0.12)] ${className}`}
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
