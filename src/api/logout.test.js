import { describe, expect, it, vi } from 'vitest';
import { cancelConsent, redirectDomainLogoutUrl } from './logout';

describe('consent cancellation logout', () => {
  it('constructs the exact redirect-domain logout URL', () => {
    expect(redirectDomainLogoutUrl('https://portal.example/app/callback?code=one'))
      .toBe('https://portal.example/logout');
  });

  it('rejects a malformed redirect URL before making a request', async () => {
    const fetchImpl = vi.fn();
    const navigate = vi.fn();

    await expect(cancelConsent(
      'not-an-absolute-url',
      'https://signin.example/deny',
      fetchImpl,
      navigate
    )).rejects.toBeInstanceOf(TypeError);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('uses a credentialed, headerless and bodyless POST before redirecting', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    const navigate = vi.fn();

    await cancelConsent(
      'https://portal.example/app/callback',
      'https://signin.example/deny',
      fetchImpl,
      navigate
    );

    expect(fetchImpl).toHaveBeenCalledWith('https://portal.example/logout', {
      method: 'POST',
      credentials: 'include'
    });
    expect(fetchImpl.mock.calls[0][1]).not.toHaveProperty('headers');
    expect(fetchImpl.mock.calls[0][1]).not.toHaveProperty('body');
    expect(navigate).toHaveBeenCalledWith('https://signin.example/deny');
  });

  it.each([
    ['a non-204 response', () => Promise.resolve({ ok: true, status: 200, statusText: 'OK' })],
    ['a CORS or network failure', () => Promise.reject(new TypeError('Failed to fetch'))]
  ])('does not redirect after %s', async (_label, response) => {
    const navigate = vi.fn();

    await expect(cancelConsent(
      'https://portal.example/callback',
      'https://signin.example/deny',
      vi.fn(response),
      navigate
    )).rejects.toBeTruthy();

    expect(navigate).not.toHaveBeenCalled();
  });
});
