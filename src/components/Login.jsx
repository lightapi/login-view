import React,  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar, Button, CssBaseline, TextField, MenuItem, Select, FormControl,
  InputLabel, FormControlLabel, Checkbox, Typography, Divider, List, ListItem,
  ListItemText, Container
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { makeStyles } from '@mui/styles';
import ErrorMessage from './ErrorMessage';
import GoogleLogin from './GoogleLogin';
import FbLogin from './FbLogin';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  loginButtons: {
    width: '100%',
    marginTop: theme.spacing(1),
  }
}));


function Login() {
  const classes = useStyles();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [state, setState] = useState('');
  const [clientId, setClientId] = useState('');
  const [userType, setUserType] = useState('C');
  const [redirectUri, setRedirectUri] = useState('');
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [denyUrl, setDenyUrl] = useState(null);
  const [scopes, setScopes] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setState(params.get('state') || '');
    setClientId(params.get('client_id') || '');
    setUserType(params.get('user_type') || 'C');
    setRedirectUri(params.get('redirect_uri') || '');
  }, []);

  const handleChange = setter => e => setter(e.target.value);

  const handleAccept = event => {
    event.preventDefault();
    //console.log("handleAccept is called");
    window.location.href = redirectUrl;
  };

  const handleCancel = event => {
    event.preventDefault();
    // here we use the redirectUrl to construct the deny url because the cookies
    // are saved to the redirect domain instead of signin.lightapi.net domain.
    //console.log("redirectUrl = ", redirectUrl);
    let pathArray = redirectUrl.split('/');
    let logoutPath = pathArray[0] + '//' + pathArray[2] + '/logout';
    //console.log("fetch url = ", logoutPath);
    // remove the server set cookies as the Javascript cannot access some of them. 
    fetch(logoutPath, { credentials: 'include'})
    .then(response => {
      if(response.ok) {
        window.location.href = denyUrl;
      } else {
        throw Error(response.statusText);
      }
    })
    .catch(error => {
        console.log("error=", error);
        setError(error.toString());
    });
  }

  function ScopeItems() {
    console.log("scopes =", scopes);
    return (
      <List component="nav" aria-label="secondary mailbox folders">
        {scopes.map((item, index) => (
          <ListItem key={index} button>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    )
  }

  const onGoogleSuccess = (res) => {
    console.log('Google Login Success: authorization code:', res.code);
    console.log('referrer: ', document.referrer);
    let pathArray = document.referrer.split('/');
    let host = pathArray[0] + '//' + pathArray[2];
    console.log('host = ', host);
    fetch(host + '/google?code=' + res.code, {redirect: 'follow', credentials: 'include'})
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(data => {
        console.log("data =", data);
        setRedirectUrl(data.redirectUri);
        setDenyUrl(data.denyUri);
        setScopes(data.scopes);
      })
      .catch(err => {
        err.text().then(errorMessage => {
          setError(errorMessage);
        })
      });
  };

  const onFacebookSuccess = (res) => {
    console.log('Login Success: accessToken:', res.accessToken);
    console.log('referrer: ', document.referrer);
    let pathArray = document.referrer.split('/');
    let host = pathArray[0] + '//' + pathArray[2];
    console.log('host = ', host);
    fetch(host + '/facebook?accessToken=' + res.accessToken, {redirect: 'follow', credentials: 'include'})
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(data => {
          console.log("data =", data);
          setRedirectUrl(data.redirectUri);
          setDenyUrl(data.denyUri);
          setScopes(data.scopes);
      })
      .catch(err => {
        err.text().then(errorMessage => {
          setError(errorMessage);
        })
      });
  };

  const handleSubmit = event => {
    //console.log("username = " + username + " password = " + password + " remember = " + remember);
    //console.log("state = " + state + " clientId = " + clientId + " userType = " + userType + " redirectUri = " + redirectUri);
    event.preventDefault();

    // state, user_type and redirect_uri might be empty
    let data = {
      j_username: username,
      j_password: password,
      remember: remember ? 'Y' : 'N',
      client_id: clientId
    };

    Object.assign(data, (state) && { state: state}, (userType) && {user_type: userType}, (redirectUri) && {redirect_uri: redirectUri})
    //console.log("data = " + data);
    const formData = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');

    //console.log(formData);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        // as we are using light-gateway to route all requests, it is not necessary to have service_url in the header. 
        // ...(process.env.REACT_APP_SAAS_URL) && {'service_url': process.env.REACT_APP_SAAS_URL}
    };
    //console.log(headers);

    fetch("/oauth2/EF3wqhfWQti2DUVrvYNM7g/code", {
      method: 'POST',
      redirect: 'follow',
      credentials: 'include',
      headers: headers,
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(json => {
      //console.log(json);
      setRedirectUrl(json.redirectUri);
      setDenyUrl(json.denyUri);
      setScopes(json.scopes);
    })
    .catch(error => {
        error.text().then(errorMessage => {
        console.log("error=", errorMessage);
        const data = {
          email: username,
          password: password
        };
        const cmd = {
          host: 'lightapi.net',
          service: 'user',
          action: 'loginUser',
          version: '0.1.0',
          data: data
        };
        const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
        const message = 'Login Failed! Click <a href="link">here</a> to identify root cause.'
        setError(message.replace('link', url));
      })
    });
  };
  
  if(redirectUrl !== null) {
    //console.log("display consent");
    //console.log(scopes);
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <form className={classes.form} noValidate onSubmit={handleAccept}>
            <Typography component="h1" variant="h5">
              Consent
            </Typography>  
            This application would like to access: 
            <Divider/>
            <List component="nav" aria-label="secondary mailbox folders">
              <ScopeItems/>
             </List>
            <Divider/>
            <Button
              type="submit"
              variant="contained"
              onClick={handleCancel}
              className={classes.submit}
            >
              Deny
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleAccept}
              className={classes.submit}
            >
              Accept
            </Button>
          </form>  
        </div>
      </Container>  
    )
  } 

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <ErrorMessage error={error}/>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="j_username"
                label="Email"
                name="j_username"
                value={username}
                autoComplete="username"
                autoFocus
                onChange={handleChange(setUsername)}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="j_password"
                value={password}
                label="Password"
                type="password"
                id="j_password"
                autoComplete="password"
                onChange={handleChange(setPassword)}
            />
            <input
              name="state"
              value={state}
              type="hidden"
              id="state"
            />
            <input
              name="client_id"
              value={clientId}
              type="hidden"
              id="client_id"
            />
            <FormControl fullWidth>
              <InputLabel id="user_type_label">User Type</InputLabel>
              <Select
                id="user_type"
                labelId="user_type_label"
                value={userType}
                label="User Type"
                onChange={handleChange(setUserType)}
              >
                <MenuItem value={'C'}>Customer</MenuItem>
                <MenuItem value={'E'}>Employee</MenuItem>
              </Select>
            </FormControl>
            <input
              name="redirect_uri"
              value={redirectUri}
              type="hidden"
              id="redirect_uri"
            />
            <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                onChange={handleChange(setRemember)}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
              Sign In
            </Button>
          </form>
          <div>Forget your password? <Link to="/forget">Reset Here</Link></div>
          <div className={classes.loginButtons}>
            <GoogleLogin onSuccess={onGoogleSuccess}/>
            <FbLogin onSuccess={onFacebookSuccess}/>
          </div>
        </div>
      </Container>
  );
}

export default Login;
