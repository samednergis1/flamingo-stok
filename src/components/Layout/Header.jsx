import useStore from '../../store/useStore';
import Logo from './Logo';

export default function Header() {
  const theme = useStore((s) => s.theme);
  const username = useStore((s) => s.username);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const logout = useStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 animate-slide-in">
          <Logo size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {username ? `Hoş geldin, ${username}` : 'Stok & Satış Yönetimi'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-ghost rounded-full p-2.5 transition-transform duration-300 hover:rotate-12"
            aria-label="Tema değiştir"
          >
            <span className="inline-block transition-transform duration-500" key={theme}>
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="btn-ghost rounded-xl px-3 py-2 text-xs text-gray-500 sm:text-sm"
            title="Çıkış yap"
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
}
