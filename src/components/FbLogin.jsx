import React from 'react';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { FacebookLoginButton } from 'react-social-login-buttons';

function FbLogin({onSuccess}) {
    return (
        <FacebookLogin
        appId="603230757035427"
        autoLoad={false}
        fields="name,email"
        scope="public_profile,email"
        callback={onSuccess}
        render={renderProps => (
          <FacebookLoginButton onClick={renderProps.onClick}/>
        )}
        />
    );
  }
  
  export default FbLogin;
