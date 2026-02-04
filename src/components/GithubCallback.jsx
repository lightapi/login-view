import React, { useEffect } from 'react';

/**
 * Handles the redirect from GitHub OAuth.
 * Extracts the 'code' query parameter and posts it back to the opener window.
 */
function GithubCallback() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', code }, window.location.origin);
                window.close();
            } else {
                // Fallback if not opened in a popup (e.g. direct navigation)
                console.error('No opener window found. Cannot pass auth code.');
            }
        } else {
            console.error('No code found in URL parameters.');
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3>Processing GitHub Login...</h3>
            <p>Please wait, this window will close automatically.</p>
        </div>
    );
}

export default GithubCallback;
