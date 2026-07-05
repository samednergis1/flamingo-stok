export const AUTH_PASSWORD = '202502';
export const AUTH_SESSION_KEY = 'flamingo-bar-auth';

export function getSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(username) {
  sessionStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({
      username: username.trim() || null,
      loggedInAt: new Date().toISOString(),
    })
  );
}

export function clearSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function validateLogin(password) {
  return password === AUTH_PASSWORD;
}
