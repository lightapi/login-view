import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(theme => ({
    error: {
        color: '#ff0000',
    },
}));

function ErrorMessage({ error }) {
    const classes = useStyles();
    return (
        <div className={classes.error}>{error}</div>
    )
}

export default ErrorMessage;
