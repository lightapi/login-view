/** Only a deployment-configured Portal origin may receive Google credentials. */
export function googleEndpoint(portalOrigin, link = false) {
  const origin = new URL(portalOrigin);
  if (origin.protocol !== 'https:' || origin.username || origin.password
      || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Configure a valid HTTPS Portal origin for Google sign-in.');
  }
  return origin.origin + (link ? '/google/link' : '/google');
}

export async function googleChallenge(endpoint, fetchImpl = fetch, signal) {
  const reply = await fetchImpl(endpoint + '?challenge=1', {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: '{}', signal,
  });
  if (!reply.ok) throw new Error('Google sign-in could not start. For linking, sign in to Portal first.');
  const body = await reply.json();
  if (typeof body.nonce !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.nonce)) {
    throw new Error('Invalid Google sign-in challenge.');
  }
  return body.nonce;
}

export async function submitGoogleCredential(endpoint, credential, state, fetchImpl = fetch) {
  if (typeof credential !== 'string' || !credential || credential.length > 8192) {
    throw new Error('Google did not return a valid sign-in credential.');
  }
  const reply = await fetchImpl(endpoint, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, state }),
  });
  if (!reply.ok) throw new Error('Google sign-in failed. If an account already exists, sign in to it and link Google.');
  return reply.json();
}
