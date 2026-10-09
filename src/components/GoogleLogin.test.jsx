import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GoogleLogin from './GoogleLogin';

const fixture = vi.hoisted(() => ({ props: null, challenge: vi.fn() }));
vi.mock('@react-oauth/google', () => ({ GoogleLogin: props => { fixture.props = props; return null; } }));
vi.mock('../api/googleSignIn', () => ({ googleChallenge: fixture.challenge }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null; fixture.props = null; fixture.challenge.mockReset();
});
async function render(onSuccess = vi.fn(), onError = vi.fn()) {
  root = createRoot(document.createElement('div'));
  await act(async () => root.render(<GoogleLogin endpoint="https://portal.example/google" onSuccess={onSuccess} onError={onError} />));
}
describe('GIS Google button', () => {
  it('waits for the server nonce and passes it to GIS', async () => {
    let resolve;
    fixture.challenge.mockReturnValue(new Promise(done => { resolve = done; }));
    await render(); expect(fixture.props).toBeNull();
    await act(async () => resolve('server-nonce'));
    expect(fixture.props.nonce).toBe('server-nonce'); expect(fixture.props.use_fedcm_for_button).toBe(true);
  });
  it('submits the credential then obtains a fresh challenge', async () => {
    fixture.challenge.mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const submit = vi.fn().mockResolvedValue(undefined); await render(submit);
    await act(async () => fixture.props.onSuccess({ credential: 'private-token' }));
    expect(submit).toHaveBeenCalledWith({ credential: 'private-token' });
    expect(fixture.props.nonce).toBe('second'); expect(fixture.challenge).toHaveBeenCalledTimes(2);
  });
  it('fails without rendering GIS and aborts the request on unmount', async () => {
    fixture.challenge.mockRejectedValue(new Error('unavailable'));
    const error = vi.fn(); await render(vi.fn(), error);
    expect(error).toHaveBeenCalled(); expect(fixture.props).toBeNull();
    const signal = fixture.challenge.mock.calls[0][2];
    await act(async () => root.unmount()); root = null; expect(signal.aborted).toBe(true);
  });
});
