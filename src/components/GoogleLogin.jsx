import { useEffect, useState } from 'react';
import { GoogleLogin as GisGoogleLogin } from '@react-oauth/google';
import { googleChallenge } from '../api/googleSignIn';

// eslint-disable-next-line react/prop-types
function GoogleLogin({ endpoint, onSuccess, onError }) {
  const [challenge, setChallenge] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setChallenge(null);
    if (endpoint) googleChallenge(endpoint, fetch, controller.signal)
      .then(value => { if (!cancelled) setChallenge(value); })
      .catch(error => { if (!cancelled) onError(error.message); });
    return () => { cancelled = true; controller.abort(); };
  }, [endpoint, attempt, onError]);
  if (!challenge) return <span>Preparing Google sign-in…</span>;
  return <GisGoogleLogin nonce={challenge.nonce} use_fedcm_for_button
    onSuccess={async response => {
      setChallenge(null);
      try { await onSuccess({ ...response, challengeId: challenge.challengeId }); }
      finally { setAttempt(value => value + 1); }
    }}
    onError={() => {
      onError('Google sign-in was cancelled or failed. Try again.');
      setAttempt(value => value + 1);
    }} />;
}
export default GoogleLogin;
