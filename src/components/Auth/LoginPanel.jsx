import { useState } from 'react';
import useStore from '../../store/useStore';
import Logo from '../Layout/Logo';

export default function LoginPanel() {
  const login = useStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Lütfen şifrenizi girin.');
      return;
    }

    setLoading(true);
    const ok = login(password, username);
    setLoading(false);

    if (!ok) {
      setError('Hatalı şifre. Tekrar deneyin.');
      setPassword('');
    }
  };

  return (
    <div className="login-screen theme-transition flex min-h-screen items-center justify-center p-4">
      <div className="login-card animate-fade-in-up w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="xl" className="mx-auto mb-5 animate-float" forceLight />
          <p className="text-lg font-medium text-gray-700">
            Hoş Geldiniz!
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Stok & Satış Yönetim Paneli
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-medium text-gray-500">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Adınızı yazabilirsiniz..."
              className="input-field"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-500">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              className="input-field"
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {error && (
            <div className="toast-error text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Sadece yetkili personel giriş yapabilir.
        </p>
      </div>
    </div>
  );
}
