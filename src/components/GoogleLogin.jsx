import { useEffect, useState } from 'react';
import { GoogleLogin as GisGoogleLogin } from '@react-oauth/google';
import { googleChallenge } from '../api/googleSignIn';

// eslint-disable-next-line react/prop-types
function GoogleLogin({ endpoint, onSuccess, onError }) {
  const [nonce, setNonce] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setNonce(null);
    if (endpoint) googleChallenge(endpoint, fetch, controller.signal)
      .then(value => { if (!cancelled) setNonce(value); })
      .catch(() => { if (!cancelled) onError('Google sign-in is unavailable. For linking, sign in to Portal first.'); });
    return () => { cancelled = true; controller.abort(); };
  }, [endpoint, attempt, onError]);
  if (!nonce) return <span>Preparing Google sign-in…</span>;
  return <GisGoogleLogin nonce={nonce} use_fedcm_for_button
    onSuccess={async response => {
      setNonce(null);
      try { await onSuccess(response); }
      finally { setAttempt(value => value + 1); }
    }}
    onError={() => {
      onError('Google sign-in was cancelled or failed. Try again.');
      setAttempt(value => value + 1);
    }} />;
}
export default GoogleLogin;
