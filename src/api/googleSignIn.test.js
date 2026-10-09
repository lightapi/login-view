import { describe, it, expect, vi } from 'vitest';
import { googleEndpoint, googleChallenge, submitGoogleCredential } from './googleSignIn';

describe('Google GIS transport', () => {
  it('requires a configured HTTPS origin and separates linking', () => {
    expect(googleEndpoint('https://portal.example')).toBe('https://portal.example/google');
    expect(googleEndpoint('https://portal.example', true)).toBe('https://portal.example/google/link');
    for (const value of [undefined, '', 'http://portal.example', 'https://u:p@portal.example', 'https://portal.example/path', 'https://portal.example?x=1', 'https://portal.example#x']) {
      expect(() => googleEndpoint(value)).toThrow();
    }
  });
  it('requests a cookie-backed nonce and validates its shape', async () => {
    const nonce = 'a'.repeat(43);
    const transport = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nonce }) });
    const signal = new AbortController().signal;
    expect(await googleChallenge('https://portal.example/google', transport, signal)).toBe(nonce);
    expect(transport).toHaveBeenCalledWith('https://portal.example/google?challenge=1', expect.objectContaining({ method: 'POST', credentials: 'include', signal }));
    await expect(googleChallenge('endpoint', async () => ({ ok: true, json: async () => ({ nonce: 'short' }) }))).rejects.toThrow();
    await expect(googleChallenge('endpoint', async () => ({ ok: false }))).rejects.toThrow();
  });
  it('sends credentials and state only in the POST body', async () => {
    const transport = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ linked: true }) });
    expect(await submitGoogleCredential('https://portal.example/google/link', 'private-token', 'a&b', transport)).toEqual({ linked: true });
    const [url, options] = transport.mock.calls[0];
    expect(url).toBe('https://portal.example/google/link');
    expect(options.method).toBe('POST'); expect(options.credentials).toBe('include');
    expect(JSON.parse(options.body)).toEqual({ credential: 'private-token', state: 'a&b' });
    await expect(submitGoogleCredential(url, '', '', transport)).rejects.toThrow();
    await expect(submitGoogleCredential(url, 'token', '', async () => ({ ok: false }))).rejects.toThrow();
  });
});
