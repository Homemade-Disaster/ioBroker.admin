// LicensesDialog
import { Component } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import IconRefresh from '@mui/icons-material/Refresh';

import { withWidth, Utils } from '@iobroker/adapter-react-v5';

const styles = () => ({
    tabPanel: {
        width: '100%',
        height: '100% ',
        overflow: 'auto',
        overflowX: 'hidden',
        padding: 15,
        // backgroundColor: blueGrey[ 50 ]
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    input: {
        width: 250,
        marginRight: 16,
    },
    button: {
        marginTop: 16,
    },
    uuidGreen: {
        color: 'green',
    },
    uuidGrey: {
        color: 'grey',
    },
    tableName: {
        width: 200,
    },
    tableDate: {
        width: 150,
        textAlign: 'right',
    },
    tableUuid: {
        width: 300,
    },
    tableValid: {
        width: 100,
    },
    tableVersion: {
        width: 50,
    },
    tableUsedIn: {
        width: 100,
    },
    tableDiv: {
        overflow: 'auto',
        height: 'calc(100% - 75px)',
    },
    tableCommercial: {
        width: 100,
    },
    licenseId: {
        fontSize: 10,
        opacity: 0.5,
        fontStyle: 'italic',
    },
});

class LicensesDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uuid: '',
            requesting: false,
            licenses: this.props.data.native.licenses || [],
            // readTime: this.props.data.native.readTime || 0,
        };
    }

    onLicensesChanged = (id, obj) => {
        if (id === 'system.licenses') {
            obj = obj || {};
            obj.native = obj.native || {};
            obj.native.licenses = obj.native.licenses || [];
            if (JSON.stringify(obj.native.licenses) !== JSON.stringify(this.state.licenses)) {
                window.alert(this.props.t('New licenses were stored'));
                this.setState({ licenses: obj.native.licenses /* , readTime: obj.native.licenses.readTime || 0 */ });
            } else {
                window.alert(this.props.t('Licenses have not changed'));
            }
        }
    };

    componentDidMount() {
        this.props.socket.getObject('system.meta.uuid')
            .then(obj => {
                this.props.socket.subscribeObject('system.licenses', this.onLicensesChanged);
                this.setState({ uuid: obj.native.uuid });
            });
    }

    componentWillUnmount() {
        this.props.socket.unsubscribeObject('system.licenses', this.onLicensesChanged);
    }

    doChange = (name, value) => {
        const newData = JSON.parse(JSON.stringify(this.props.data));
        newData.native[name] = value;
        this.props.onChange(newData);
    };

    static requestLicensesByHost(socket, host, login, password, t) {
        return new Promise((resolve, reject) => {
            socket.getRawSocket().emit('updateLicenses', login, password, (err, licenses) => {
                if (err === 'permissionError') {
                    reject(t('May not trigger "updateLicenses"'));
                } else if (err && err.error) {
                    reject(t(err.error));
                } else if (err) {
                    reject(t(err));
                } else {
                    resolve(licenses);
                }
            });
        });
    }

    async requestLicenses() {
        this.setState({ requesting: true });
        try {
            let password = this.props.data.native.password;
            // if the password was not changed
            if (password === '__SOME_PASSWORD__') {
                const obj = await this.props.socket.getObject('system.licenses');
                // if login was changed
                if (obj.native.login !== this.props.data.native.login) {
                    password = await this.props.socket.decrypt(obj.native.password);
                } else {
                    password = null;
                }
            }

            const licenses = await LicensesDialog.requestLicensesByHost(this.props.socket, this.props.host, password ? this.props.data.native.login : null, password, this.props.t);

            if (licenses !== null && licenses !== undefined) {
                if (password) {
                    window.alert(this.props.t('Licenses were not stored. They will be stored after the settings will be saved'));
                }

                this.setState({ licenses, requesting: false });
            } else {
                this.setState({ requesting: false });
            }
        } catch (error) {
            this.setState({ requesting: false });
            if (error === 'Authentication required') {
                window.alert(this.props.t('Cannot update licenses: %s', this.props.t('Authentication required')));
            } else {
                window.alert(this.props.t('Cannot update licenses: %s', error));
            }
        }
    }

    renderLicenses() {
        return <div className={this.props.classes.tableDiv}>
            <TableContainer>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell className={this.props.classes.tableName}>{this.props.t('Product')}</TableCell>
                            <TableCell className={this.props.classes.tableDate}>{this.props.t('Ordered at')}</TableCell>
                            <TableCell className={this.props.classes.tableUuid}>{this.props.t('UUID')}</TableCell>
                            <TableCell className={this.props.classes.tableValid}>{this.props.t('Valid till')}</TableCell>
                            <TableCell className={this.props.classes.tableVersion}>{this.props.t('V')}</TableCell>
                            <TableCell className={this.props.classes.tableUsedIn}>{this.props.t('Used by')}</TableCell>
                            <TableCell className={this.props.classes.tableCommercial}>{this.props.t('ra_Commercial')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.licenses && this.state.licenses.map(license => <TableRow key={license.id}>
                            <TableCell className={this.props.classes.tableName}>
                                <div>{license.product}</div>
                                <div className={this.props.classes.licenseId}>{license.id}</div>
                            </TableCell>
                            <TableCell className={this.props.classes.tableDate}>{new Date(license.time).toLocaleDateString()}</TableCell>
                            <TableCell className={Utils.clsx(this.props.classes.tableUuid, license.uuid && this.state.uuid === license.uuid ? this.props.classes.uuidGreen : (license.uuid ? this.props.classes.uuidGrey : ''))}>{license.uuid || ''}</TableCell>
                            <TableCell className={this.props.classes.tableValid}>{license.validTill === '0000-00-00 00:00:00' ? '' : license.validTill || ''}</TableCell>
                            <TableCell className={this.props.classes.tableVersion}>{license.version || ''}</TableCell>
                            <TableCell className={this.props.classes.tableUsedIn}>{license.usedBy || ''}</TableCell>
                            <TableCell className={this.props.classes.tableCommercial}>{license.invoice !== 'free' ? (license.invoice === 'MANUALLY_CREATED' ? '✓' : license.invoice) : '-'}</TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>;
    }

    render() {
        const { classes } = this.props;

        return <div className={classes.tabPanel}>
            <TextField
                variant="standard"
                className={this.props.classes.input}
                disabled={this.props.saving || this.state.requesting}
                value={this.props.data.native.login}
                helperText={this.props.t('for ioBroker.net portal')}
                label={this.props.t('Login/Email')}
                onChange={e => this.doChange('login', e.target.value)}
                inputProps={{
                    autoComplete: 'new-password',
                    form: { autoComplete: 'off' },
                }}
            />
            <TextField
                variant="standard"
                disabled={this.props.saving || this.state.requesting}
                className={this.props.classes.input}
                type="password"
                value={this.props.data.native.password}
                helperText={this.props.t('for ioBroker.net portal')}
                label={this.props.t('Password')}
                onChange={e => this.doChange('password', e.target.value)}
                inputProps={{
                    autoComplete: 'new-password',
                    form: { autoComplete: 'off' },
                }}
            />
            <Button
                variant="contained"
                startIcon={<IconRefresh />}
                disabled={
                    this.state.requesting ||
                    this.props.saving ||
                    !this.props.host ||
                    !this.props.data.native.password ||
                    !this.props.data.native.login
                }
                onClick={() => this.requestLicenses()}
                className={this.props.classes.button}
                color="grey"
            >
                {this.props.t('Check')}
            </Button>
            {this.renderLicenses()}
        </div>;
    }
}

LicensesDialog.propTypes = {
    t: PropTypes.func,
    data: PropTypes.object,
    host: PropTypes.string,
    saving: PropTypes.bool,
};

export default withWidth()(withStyles(styles)(LicensesDialog));
