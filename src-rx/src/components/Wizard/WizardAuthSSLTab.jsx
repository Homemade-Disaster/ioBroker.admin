import { createRef, Component } from 'react';
import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Paper from  '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormGroup from '@material-ui/core/FormGroup';

import IconCheck from '@material-ui/icons/Check';

const TOOLBAR_HEIGHT = 64;

const styles = theme => ({
    paper: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
    },
    title: {
        color: theme.palette.secondary.main,
    },
    form: {
        height: 'calc(100% - ' + (TOOLBAR_HEIGHT + theme.spacing(1)) + 'px)',
        overflow: 'auto',
    },
    input: {
        width: 400,
        textAlign: 'left',
    },
    inputLine: {
        width: 400,
        margin: 'auto',
        marginBottom: 50
    },
    grow: {
        flexGrow: 1,
    },
    toolbar: {
        height:     TOOLBAR_HEIGHT,
        lineHeight: TOOLBAR_HEIGHT + 'px',
    }
});

class WizardAuthSSLTab extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: !!this.props.auth,
            secure: !!this.props.secure,
        };

        this.focusRef = createRef();
    }

    componentDidMount() {
        this.focusRef.current && this.focusRef.current.focus();
    }

    render() {
        return <Paper className={ this.props.classes.paper }>
            <form className={ this.props.classes.form} noValidate autoComplete="off">
                <Grid container direction="column">
                    <Grid item>
                        <h2 className={ this.props.classes.title }>{ this.props.t('It is suggested to enable the authentication in admin') }</h2>
                    </Grid>
                    <Grid item className={this.props.classes.inputLine}>
                        <FormGroup>
                            <FormControlLabel
                                className={this.props.classes.input}
                                control={
                                    <Checkbox
                                        checked={this.state.auth}
                                        onChange={() => this.setState({auth: !this.state.auth})}
                                    />
                                }
                                label={this.props.t('Authentication in Admin')}

                            />
                            <FormHelperText>{this.props.t('Activate the check of password in admin if you plan to access your ioBroker is not in "Demilitarized Zone"')}</FormHelperText>
                        </FormGroup>
                    </Grid>
                    <Grid item>
                        <FormControl className={this.props.classes.input}>
                            <InputLabel>{this.props.t('Certificates')}</InputLabel>
                            <Select
                                value={this.state.secure}
                                onChange={e => this.setState({secure: e.target.value})}
                            >
                                <MenuItem value={false}>{this.props.t('No SSL')}</MenuItem>
                                <MenuItem value={true}>{this.props.t('Use self signed certificates')}</MenuItem>
                            </Select>
                            <FormHelperText>{this.state.secure ?
                                this.props.t('Browsers will inform you about the problem with self-signed certificates, but the communication is encrypted.') :
                                this.props.t('Your communication with admin is not encrypted')}</FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>
            </form>
            <Toolbar className={ this.props.classes.toolbar }>
                <div className={ this.props.classes.grow }/>
                <Button color="primary" variant="contained" onClick={ () => this.props.onDone({auth: this.state.auth, secure: this.state.secure}) } startIcon={<IconCheck/>}>{ this.props.t('Apply') }</Button>
            </Toolbar>
        </Paper>;
    }
}

WizardAuthSSLTab.propTypes = {
    auth: PropTypes.bool,
    secure: PropTypes.bool,
    t: PropTypes.func,
    socket: PropTypes.object,
    onDone: PropTypes.func.isRequired,
};

export default withWidth()(withStyles(styles)(WizardAuthSSLTab));
