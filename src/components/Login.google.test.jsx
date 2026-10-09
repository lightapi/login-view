import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
const fixture = vi.hoisted(() => ({ google: null, submit: vi.fn() }));
vi.mock('./GoogleLogin', () => ({ default: props => { fixture.google = props; return null; } }));
vi.mock('./FbLogin', () => ({ default: () => null }));
vi.mock('./GithubLogin', () => ({ default: () => null }));
vi.mock('@mui/styles', () => ({ makeStyles: () => () => ({}) }));
vi.mock('../api/googleSignIn', async importOriginal => ({ ...(await importOriginal()), submitGoogleCredential: fixture.submit }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
function location(value) {
  const original = window;
  vi.stubGlobal('window', new Proxy(original, { get: (target, name) => name === 'location' ? value : Reflect.get(target, name, target) }));
}
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null; fixture.google = null; fixture.submit.mockReset(); vi.unstubAllGlobals(); vi.unstubAllEnvs();
});
async function render() {
  vi.stubEnv('VITE_PORTAL_ORIGIN', 'https://portal.example');
  container = document.createElement('div'); root = createRoot(container);
  await act(async () => root.render(<Login />));
}
describe('Google linking page', () => {
  it('removes link mode from the Back to sign in destination', async () => {
    location({ search: '?link_google=1&state=a%26b', href: 'https://signin.example/?link_google=1&state=a%26b#/login' });
    await render(); const url = new URL(container.querySelector('a').href);
    expect(url.searchParams.has('link_google')).toBe(false); expect(url.searchParams.get('state')).toBe('a&b');
    expect(url.hash).toBe('#/login');
  });
  it('navigates after linking without rendering Consent or Deny', async () => {
    const assign = vi.fn();
    location({ search: '?link_google=1', href: 'https://signin.example/?link_google=1', assign });
    fixture.submit.mockResolvedValue({ linked: true, redirectUri: 'https://portal.example/#/dashboard', scopes: [] });
    await render();
    await act(async () => fixture.google.onSuccess({ credential: 'token', challengeId: 'a'.repeat(22) }));
    expect(assign).toHaveBeenCalledWith('https://portal.example/#/dashboard');
    expect(container.textContent).toContain('Link your Google account');
    expect(container.textContent).not.toContain('Deny'); expect(container.textContent).not.toContain('Consent');
  });
});
