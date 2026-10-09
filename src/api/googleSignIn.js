/** Only a deployment-configured Portal origin may receive Google credentials. */
export function googleEndpoint(portalOrigin, link = false) {
  const origin = new URL(portalOrigin);
  if (origin.protocol !== 'https:' || origin.username || origin.password
      || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Configure a valid HTTPS Portal origin for Google sign-in.');
  }
  return origin.origin + (link ? '/google/link' : '/google');
}

export function googleModeUrl(href, link) {
  const url = new URL(href);
  if (link) url.searchParams.set('link_google', '1');
  else url.searchParams.delete('link_google');
  return url.href;
}

export async function googleChallenge(endpoint, fetchImpl = fetch, signal) {
  const reply = await fetchImpl(endpoint + '?challenge=1', {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: '{}', signal,
  });
  if (!reply.ok) {
    if (reply.status === 401) throw new Error('Sign in to Portal before linking Google.');
    if (reply.status === 429) throw new Error('Too many Google sign-in attempts. Wait five minutes and try again.');
    throw new Error('Google sign-in is temporarily unavailable. Try again later.');
  }
  const body = await reply.json();
  if (typeof body.nonce !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.nonce)
      || typeof body.challengeId !== 'string' || !/^[A-Za-z0-9_-]{22}$/.test(body.challengeId)) {
    throw new Error('Invalid Google sign-in challenge.');
  }
  return body;
}

export async function submitGoogleCredential(endpoint, credential, state, challengeId, fetchImpl = fetch) {
  if (typeof credential !== 'string' || !credential || credential.length > 8192
      || typeof challengeId !== 'string' || !/^[A-Za-z0-9_-]{22}$/.test(challengeId)) {
    throw new Error('Google did not return a valid sign-in credential.');
  }
  const reply = await fetchImpl(endpoint, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, state, challengeId }),
  });
  if (!reply.ok) {
    if (reply.status === 409) throw new Error('This Google account conflicts with an existing account. Sign in to that account to link Google.');
    if (reply.status === 503) throw new Error('Google sign-in is temporarily unavailable. Try again later.');
    if (reply.status === 429) throw new Error('Too many Google sign-in attempts. Wait five minutes and try again.');
    if (reply.status === 403) throw new Error('Google sign-in was rejected. Start a fresh attempt or contact your administrator.');
    throw new Error('Google sign-in failed. Start a fresh attempt.');
  }
  const text = await reply.text();
  return text ? JSON.parse(text) : { scopes: [], redirectUri: null, denyUri: null };
}
