import { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import PropTypes from 'prop-types';

import { Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';

import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

const styles = {
    checkIcon: {
        color: green[700]
    },
    cancelIcon: {
        color: red[700]
    },
    wrapperContent:{
        display: 'flex',
        flexFlow: 'nowrap',
        alignItems: 'inherit'
    }
};

class State extends Component {

    getIcon() {
        if (this.props.state) {
            return <CheckCircleIcon className={ this.props.classes.checkIcon } />;
        } else {
            return <CancelIcon className={ this.props.classes.cancelIcon } />;
        }
    }

    render() {
        return <Grid
            item
            container
            className={this.props.classes.wrapperContent}
            alignItems="center"
            direction="row"
            spacing={ 1 }
        >
            <Grid item>
                { this.getIcon() }
            </Grid>
            <Grid item>
                <Typography>
                    { this.props.children }
                </Typography>
            </Grid>
        </Grid>;
    }
}

State.propTypes = {
    state: PropTypes.bool
};

export default withStyles(styles)(State);