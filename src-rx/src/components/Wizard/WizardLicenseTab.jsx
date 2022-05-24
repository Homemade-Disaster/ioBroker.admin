import { createRef, Component } from 'react';
import {withStyles} from '@mui/styles';
import withWidth from '../withWidth';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import IconWorld from '@mui/icons-material/Language';
import IconCheck from '@mui/icons-material/Check';
import IconCancel from '@mui/icons-material/Close';

import I18n from '@iobroker/adapter-react-v5/i18n';
import LicenseTexts from '../LicenseTexts';

const TOOLBAR_HEIGHT = 64;

const styles = theme => ({
    paper: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
    },
    gridDiv: {
        height: 'calc(100% - ' + TOOLBAR_HEIGHT + 'px)',
        width: '100%',
        overflow: 'hidden',
        padding: theme.spacing(2),
        textAlign: 'center'
    },
    languageSelect: {
        minWidth: 200,
        marginRight: theme.spacing(3),
    },
    licenseDiv: {
        width: '100%',
        height: `calc(100% - ${theme.mixins.toolbar.minHeight + parseInt(theme.spacing(1), 10) + 70}px)`,
        overflow: 'auto',
    },
    grow: {
        flexGrow: 1,
    },
    statAccept: {
        marginTop: 10,
        color: '#ff636e',
    },
    statAcceptDiv: {
        display: 'inline-block',
    },
    statAcceptNote: {
        textAlign: 'left',
        marginLeft: 32,
    },
    greenButton: {
        marginLeft: theme.spacing(1),
    },
    toolbar: {
        height: TOOLBAR_HEIGHT,
        lineHeight: TOOLBAR_HEIGHT + 'px',
    },
    licenseTextDiv: {
        width: '100%',
        maxWidth: 600,
        textAlign: 'left',
        margin: 'auto',
    },
    licenseText: {
        marginBottom: 15,
    }
});

class WizardLicenseTab extends Component {
    constructor(props) {
        super(props);

        this.state = {
            statisticsAccepted: false,
            lang: this.props.lang || I18n.getLanguage(),
            notAgree: false,
        };

        this.focusRef = createRef();
    }

    componentDidMount() {
        this.focusRef.current && this.focusRef.current.focus();
    }

    renderNotAgree() {
        if (!this.state.notAgree) {
            return null;
        }
        return <Dialog
            open={true}
            onClose={() => this.setState({ notAgree: false }) }
        >
            <DialogTitle >{ this.props.t('Message') }</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <span role="img" aria-label="unhappy">😒</span> { this.props.t('Sorry, you cannot use ioBroker.')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => this.setState({ notAgree: false }) }
                    color="primary"
                    startIcon={<IconCheck/>}
                >
                    { I18n.t('Understand') }
                </Button>
            </DialogActions>
        </Dialog>
    }

    renderLicenseText() {
        let lines = LicenseTexts[I18n.getLanguage()] || LicenseTexts.en;
        lines = lines.split('\n');
        return <div className={this.props.classes.licenseTextDiv}>{lines.map((line, i) => <div className={this.props.classes.licenseText} key={i}>{line}</div>)}</div>;
    }

    render() {
        return <Paper className={ this.props.classes.paper }>
            <Grid container className={ this.props.classes.gridDiv } direction="column">
                <Grid item>
                    <FormControl variant="standard" className={ this.props.classes.languageSelect }>
                        <InputLabel><IconWorld/>{ this.props.t('Language') }</InputLabel>
                        <Select
                            variant="standard"
                            value={ I18n.getLanguage() }
                            onChange={e => {
                                I18n.setLanguage(e.target.value);
                                this.setState( { lang: e.target.value });
                            }}
                        >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="de">Deutsch</MenuItem>
                            <MenuItem value="ru">русский</MenuItem>
                            <MenuItem value="pt">Portugues</MenuItem>
                            <MenuItem value="nl">Nederlands</MenuItem>
                            <MenuItem value="fr">français</MenuItem>
                            <MenuItem value="it">Italiano</MenuItem>
                            <MenuItem value="es">Espanol</MenuItem>
                            <MenuItem value="pl">Polski</MenuItem>
                            <MenuItem value="zh-cn">简体中文</MenuItem>
                        </Select>
                    </FormControl>
                    <div className={ this.props.classes.statAcceptDiv }>
                        <FormControlLabel
                            className={ this.props.classes.statAccept }
                            control={<Checkbox ref={ this.focusRef } checked={ this.state.statisticsAccepted } onChange={e => this.setState({statisticsAccepted: e.target.checked }) } />}
                            label={ this.props.t('I agree with the collection of anonymous statistics.') }
                        />
                        <div className={ this.props.classes.statAcceptNote }>{ this.props.t('(This can be disabled later in settings)') }</div>
                    </div>
                </Grid>
                <Grid item>
                    <h1>{ this.props.t('License terms') }</h1>
                </Grid>
                <Grid item className={ this.props.classes.licenseDiv }>
                    {this.renderLicenseText()}
                </Grid>
            </Grid>
            <Toolbar className={ this.props.classes.toolbar }>
                <div className={ this.props.classes.grow }/>
                <Button variant="contained" color="grey" onClick={ () => this.setState({notAgree: true}) } startIcon={<IconCancel/>}>{ this.props.t('Not agree') }</Button>
                <Button variant="contained" color="primary" className={ this.props.classes.greenButton } disabled={ !this.state.statisticsAccepted } onClick={ () => this.props.onDone({lang: this.state.lang}) } startIcon={<IconCheck/>}>{ this.props.t('Agree') }</Button>
                <div className={ this.props.classes.grow }/>
            </Toolbar>
            { this.renderNotAgree() }
        </Paper>;
    }
}

WizardLicenseTab.propTypes = {
    t: PropTypes.func,
    socket: PropTypes.object,
    onDone: PropTypes.func.isRequired,
};

export default withWidth()(withStyles(styles)(WizardLicenseTab));
