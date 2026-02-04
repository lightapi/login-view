import React, { useEffect } from 'react';
import { GithubLoginButton } from 'react-social-login-buttons';

const CLIENT_ID = 'f13cddcfe475920deca7';
const REDIRECT_URI = `${window.location.origin}/github/callback`; // Adjust if deployed path differs
const SCOPE = 'user:email';

function GithubLogin({ onSuccess, onError }) {

    useEffect(() => {
        const handleMessage = (event) => {
            // Ensure the message is from our own origin
            if (event.origin !== window.location.origin) return;

            if (event.data && event.data.type === 'GITHUB_AUTH_SUCCESS') {
                if (event.data.code) {
                    onSuccess({ code: event.data.code });
                } else {
                    if (onError) onError('No code received');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onSuccess, onError]);

    const handleLogin = () => {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Get the state from the query parameter
        const queryParams = new URLSearchParams(window.location.search);
        const state = queryParams.get('state');

        // If no state is provided, we might want to log an error or handle it appropriately. 
        // For now, we proceed, but the callback verification might fail if state is expected.
        if (!state) {
            console.warn("No state found in URL query parameters.");
        }

        const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPE}&state=${state}`;

        window.open(
            url,
            'GithubLogin',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );
    };

    return (
        <GithubLoginButton onClick={handleLogin} />
    );
}

export default GithubLogin;
