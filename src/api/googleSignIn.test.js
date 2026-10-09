import { describe, it, expect, vi } from 'vitest';
import { googleEndpoint, googleModeUrl, googleChallenge, submitGoogleCredential } from './googleSignIn';

describe('Google GIS transport', () => {
  it('requires a configured HTTPS origin and separates linking', () => {
    expect(googleEndpoint('https://portal.example')).toBe('https://portal.example/google');
    expect(googleEndpoint('https://portal.example', true)).toBe('https://portal.example/google/link');
    for (const value of [undefined, '', 'http://portal.example', 'https://u:p@portal.example', 'https://portal.example/path', 'https://portal.example?x=1', 'https://portal.example#x']) {
      expect(() => googleEndpoint(value)).toThrow();
    }
  });
  it('requests a cookie-backed nonce and validates its shape', async () => {
    const nonce = 'a'.repeat(43); const challengeId = 'a'.repeat(22);
    const transport = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nonce, challengeId }) });
    const signal = new AbortController().signal;
    expect(await googleChallenge('https://portal.example/google', transport, signal)).toEqual({ nonce, challengeId });
    expect(transport).toHaveBeenCalledWith('https://portal.example/google?challenge=1', expect.objectContaining({ method: 'POST', credentials: 'include', signal }));
    await expect(googleChallenge('endpoint', async () => ({ ok: true, json: async () => ({ nonce: 'short' }) }))).rejects.toThrow();
    await expect(googleChallenge('endpoint', async () => ({ ok: false }))).rejects.toThrow();
  });
  it('changes link mode without losing state or hash', () => {
    const url = new URL(googleModeUrl('https://signin.example/?link_google=1&state=a%26b#/login', false));
    expect(url.searchParams.has('link_google')).toBe(false);
    expect(url.searchParams.get('state')).toBe('a&b'); expect(url.hash).toBe('#/login');
  });
  it('distinguishes link conflicts from infrastructure outages', async () => {
    for (const [status, message] of [[409, /link/i], [503, /unavailable/i], [429, /many/i]]) {
      await expect(submitGoogleCredential('endpoint', 'token', '', 'a'.repeat(22), async () => ({ ok: false, status }))).rejects.toThrow(message);
    }
    expect(await submitGoogleCredential('endpoint', 'token', '', 'a'.repeat(22), async () => ({ ok: true, text: async () => '' }))).toEqual({ scopes: [], redirectUri: null, denyUri: null });
  });
  it('sends credentials and state only in the POST body', async () => {
    const transport = vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({ linked: true }) });
    expect(await submitGoogleCredential('https://portal.example/google/link', 'private-token', 'a&b', 'a'.repeat(22), transport)).toEqual({ linked: true });
    const [url, options] = transport.mock.calls[0];
    expect(url).toBe('https://portal.example/google/link');
    expect(options.method).toBe('POST'); expect(options.credentials).toBe('include');
    expect(JSON.parse(options.body)).toEqual({ credential: 'private-token', state: 'a&b', challengeId: 'a'.repeat(22) });
    await expect(submitGoogleCredential(url, '', '', 'a'.repeat(22), transport)).rejects.toThrow();
    await expect(submitGoogleCredential(url, 'token', '', 'a'.repeat(22), async () => ({ ok: false }))).rejects.toThrow();
  });
});
