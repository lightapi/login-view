# Google Identity Services

The Google button uses GIS `GoogleLogin` and sends its ID token in a credentialed JSON POST to the deployment-configured Portal gateway. It first obtains a server nonce and passes that nonce to GIS. Authorization-code exchange and referrer-derived Google endpoints are removed.

Set these public build variables:

```dotenv
VITE_PORTAL_ORIGIN=https://portal.example
VITE_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

The Portal origin must be absolute HTTPS, with no credentials, path, query or fragment. Without a valid origin the Google button is disabled. The historical public Google client ID remains the fallback; configure your own client ID and match the gateway `googleClientId`. Register the login-view HTTPS origin as an authorized JavaScript origin in Google Cloud. Configure CSP to allow the GIS script/frame/connect endpoints required by Google.

Sign-in posts to `/google`. To link Google to an existing Portal account, sign in to Portal first and choose the linking link, or open this login page with `?link_google=1`. The dedicated linking page posts to `/google/link`; the target account is taken from its authenticated Portal cookie, never from a browser-supplied user ID. A successful link returns to the configured Portal route. The existing account, email and permissions remain intact. Email collisions require explicit linking; there is no automatic email match.

Deploy alongside https://github.com/networknt/light-spa-4j/issues/171 and https://github.com/lightapi/light-portal/issues/865. Apply the Portal SQL migration and service-principal configuration first; enable the matching gateway and UI together. Configure exact-origin credentialed CORS for `/google` and `/google/link`, sticky gateway routing, and cookie-compatible hosting. A challenge expires after five minutes; retries obtain a fresh challenge. Browsers that block third-party cookies may need same-site hosting.

API tests exercise nonce validation, fixed-origin routing, and POST-only credential transport. They do not make real Google calls. Qualify the paired deployment with a real Google test account before production activation.
