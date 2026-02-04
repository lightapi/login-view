import React from 'react';

import { useGoogleLogin } from '@react-oauth/google';
import { GoogleLoginButton } from 'react-social-login-buttons';

function GoogleLogin({ onSuccess }) {

  const login = useGoogleLogin({
    onSuccess,
    onError: (res) => {
      console.log('Login failed: res:', res);
      alert(
        `Failed to login. Please ping this to support@lightapi.net`
      );
    },
    flow: 'auth-code',
  });

  return (
    <GoogleLoginButton onClick={() => login()} />
  );
}

export default GoogleLogin;