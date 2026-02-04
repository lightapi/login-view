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

        // Generate a random state for CSRF protection
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('github_auth_state', state);

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
