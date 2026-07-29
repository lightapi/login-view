export const redirectDomainLogoutUrl = redirectUrl =>
  new URL('/logout', redirectUrl).toString();

export async function cancelConsent(
  redirectUrl,
  denyUrl,
  fetchImpl = fetch,
  navigate = url => { window.location.href = url; }
) {
  const response = await fetchImpl(redirectDomainLogoutUrl(redirectUrl), {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok || response.status !== 204) {
    throw new Error(response.statusText || `Unexpected logout status ${response.status}`);
  }

  navigate(denyUrl);
}
