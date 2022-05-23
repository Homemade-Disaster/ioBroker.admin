import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, CardMedia, makeStyles, Tab, Tabs, ThemeProvider, Typography } from '@material-ui/core';

import UpdateIcon from '@material-ui/icons/Update';
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote';
import CancelIcon from '@material-ui/icons/Cancel';
import PermDeviceInformationIcon from '@material-ui/icons/PermDeviceInformation';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import WarningIcon from '@material-ui/icons/Warning';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import MemoryIcon from '@material-ui/icons/Memory';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import I18n from '@iobroker/adapter-react/i18n';

import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';

let node = null;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        height: 'auto',
        display: 'flex',
        borderRadius: 4,
        flexDirection: 'column'
    },
    paper: {
        maxWidth: 1000,
        width: '100%'
    },
    flex: {
        display: 'flex',
    },
    overflowHidden: {
        overflow: 'hidden'
    },
    overflowAuto: {
        overflowY: 'auto'
    },
    pre: {
        overflow: 'auto',
        margin: 20,
        '& p': {
            fontSize: 18,
        }
    },
    blockInfo: {
        right: 20,
        top: 10,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        color: 'silver'
    },
    img: {
        marginLeft: 10,
        width: 45,
        height: 45,
        margin: 'auto 0',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("img/no-image.png") 100% 100% no-repeat',
            backgroundSize: 'cover',
            backgroundColor: '#fff',
        }
    },
    message: {
        justifyContent: 'space-between',
        display: 'flex',
        width: '100%',
        alignItems: 'center'
    },
    column: {
        flexDirection: 'column'
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 20
    },
    descriptionHeaderText: {
        margin: '18px 0'
    },
    silver: {
        color: 'silver'
    },
    button: {
        paddingTop: 18,
        paddingBottom: 5,
        position: 'sticky',
        bottom: 0,
        background: 'white',
        zIndex: 3
    },
    terminal: {
        fontFamily: 'monospace',
        fontSize: 14,
        marginLeft: 20
    },
    img2: {
        width: 25,
        height: 25,
        marginRight: 10,
        margin: 'auto 0',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("img/no-image.png") 100% 100% no-repeat',
            backgroundSize: 'cover',
            backgroundColor: '#fff',
        }
    },
    heading: {
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
    },
    headingTop: {
        display: 'flex',
        alignItems: 'center',
    },
    classNameBox: {
        padding: 24
    },
    textStyle: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    content: {
        overflow: 'hidden'
    },
    buttonStyle: {
        margin: 3
    },
    '@media screen and (max-width: 550px)': {
        classNameBox: {
            padding: 10
        },
        message: {
            flexWrap: 'wrap'
        },
        textStyle: {
            fontSize: '2.9vw'
        },
        terminal: {
            fontSize: '2.9vw',
            marginLeft: 0
        },
        silver: {
            fontSize: '2.9vw',
        },
        buttonStyle: {
            fontSize: '2.9vw',
        },
    },
}));

const Status = ({ name, ...props }) => {
    switch (name) {
        case 'restartLoop':
            return <UpdateIcon style={{ color: '#ffca00' }} {...props} />;
        case 'memIssues':
            return <MemoryIcon style={{ color: '#ffca00' }} {...props} />;
        case 'fsIoErrors':
            return <ImportExportIcon style={{ color: '#ffca00' }} {...props} />;
        case 'noDiskSpace':
            return <PermDeviceInformationIcon style={{ color: '#ffca00' }} {...props} />;
        case 'accessErrors':
            return <CancelPresentationIcon style={{ color: '#ffca00' }} {...props} />;
        case 'nonExistingFileErrors':
            return <CancelIcon style={{ color: '#ffca00' }} {...props} />;
        case 'remoteHostErrors':
            return <SettingsRemoteIcon style={{ color: '#ffca00' }} {...props} />;
        case 'heading':
            return <WarningIcon style={{
                color: '#ffca00',
                fontSize: 36,
                marginLeft: 25,
                marginRight: 10
            }} {...props} />;

        default:
            return <WarningIcon style={{ color: '#ffca00' }} {...props} />;
    }
}

const a11yProps = (index) => {
    return {
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
}

const TabPanel = ({ children, value, index, classNameBox, ...other }) => {
    return <div
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-force-tabpanel-${index}`}
        aria-labelledby={`scrollable-force-tab-${index}`}
        {...other}
    >
        { value === index &&
            <Box className={classNameBox}>
                <Typography component="div">{children}</Typography>
            </Box>
        }
    </div>;
}

const HostWarningDialog = ({ message, ackCallback, dateFormat, themeType, themeName, instances }) => {
    const classes = useStyles();

    const [open, setOpen] = useState(true);
    const [value, setValue] = useState(0);
    const [disabled, setDisabled] = useState([]);
    const [expanded, setExpanded] = useState(false);

    const onClose = () => {
        setOpen(false);
        if (node) {
            try {
                window.document.body.removeChild(node);
            } catch (e) {
                // ignore
            }
            node = null;
        }
    }

    const handleChange = (event, newValue) =>
        setValue(newValue);

    const handleChangeAccordion = panel => (event, isExpanded) =>
        setExpanded(isExpanded ? panel : false);

    const black = themeType === 'dark';

    return <ThemeProvider theme={theme(themeName)}>
        <Dialog
            onClose={onClose}
            open={open}
            classes={{ paper: classes.paper }}
        >
            <h2 className={classes.headingTop}><Status name="heading" />{I18n.t('Adapter warnings')}</h2>
            <DialogContent className={clsx(classes.flex, classes.overflowHidden)} dividers>
                <div className={classes.root}>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="on"
                            indicatorColor={black ? 'primary' : 'secondary'}
                            textColor="primary"
                        >
                            {Object.keys(message).map((name, idx) => <Tab
                                style={black ? null : { color: 'white' }}
                                disabled={disabled.includes(name)}
                                key={name} label={I18n.t(name)}
                                icon={<Status name={name} />}
                                {...a11yProps(idx)} />
                            )}
                        </Tabs>
                    </AppBar>
                    {Object.keys(message).map((name, idx) => <TabPanel
                        className={classes.overflowAuto}
                        classNameBox={classes.classNameBox}
                        key={`tabPanel-${name}`}
                        style={black ? { color: 'black' } : null}
                        value={value}
                        index={idx}>
                        <div className={classes.headerText} style={{ fontWeight: 'bold' }}>
                            {message[name].name[I18n.getLanguage()]}
                        </div>
                        <div className={classes.descriptionHeaderText}>
                            {message[name].description[I18n.getLanguage()]}
                        </div>
                        <div>
                            {message[name].instances ? Object.keys(message[name].instances).map(nameInst => {
                                const currentInstance = instances && instances[nameInst];
                                let icon = 'img/no-image.png';
                                if (currentInstance?.common?.icon && currentInstance?.common?.name) {
                                    icon = `adapter/${currentInstance.common.name}/${currentInstance.common.icon}`;
                                }
                                return <Accordion
                                    style={black ? null : { background: '#c0c0c052' }}
                                    key={nameInst} expanded={expanded === `${name}-${nameInst}`}
                                    onChange={handleChangeAccordion(`${name}-${nameInst}`)}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        classes={{ content: classes.content }}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography className={classes.heading}>
                                            <CardMedia className={classes.img2} component="img" image={icon} />
                                            <div className={classes.textStyle}>
                                                {nameInst.replace(/^system\.adapter\./, '')}
                                            </div>
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails className={classes.column}>
                                        {message[name].instances[nameInst].messages.map(msg =>
                                            <Typography key={msg.ts} component="div" className={classes.message}>
                                                <div className={classes.terminal}>{msg.message}</div>
                                                <div className={classes.silver}>{Utils.formatDate(new Date(msg.ts), dateFormat)}</div>
                                            </Typography>)}
                                    </AccordionDetails>
                                </Accordion>
                            }) : null}
                        </div>
                        <div className={classes.button}>
                            <Button
                                variant="contained"
                                autoFocus={Object.keys(message).length !== 1}
                                disabled={disabled.includes(name)}
                                style={disabled.includes(name) ? { background: 'silver' } : null}
                                className={classes.buttonStyle}
                                onClick={() => {
                                    ackCallback(name);
                                    setDisabled([...disabled, name]);
                                }}
                                color={Object.keys(message).length !== 1 ? 'primary' : 'default'}
                                startIcon={<CheckIcon />}
                            >
                                {I18n.t('Acknowledge')}
                            </Button>
                            {Object.keys(message).length === 1 && <Button
                                variant="contained"
                                disabled={disabled.includes(name)}
                                className={classes.buttonStyle}
                                style={disabled.includes(name) ? { background: 'silver' } : null}
                                onClick={() => {
                                    ackCallback(name);
                                    setDisabled([...disabled, name]);
                                    onClose();
                                }}
                                startIcon={<><CheckIcon /><CloseIcon /></>}
                                color="primary">
                                {I18n.t('Acknowledge & close')}
                            </Button>}
                        </div>
                    </TabPanel>
                    )}
                </div>
            </DialogContent >
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                    startIcon={<CloseIcon />}
                >
                    {I18n.t('Ok')}
                </Button>
            </DialogActions>
        </Dialog >
    </ThemeProvider >;
}

export const hostWarningDialogFunc = (message, dateFormat, themeType, themeName, instances, ackCallback) => {
    if (!node) {
        node = document.createElement('div');
        node.id = 'renderModal';
        document.body.appendChild(node);
    }
    return ReactDOM.render(<HostWarningDialog instances={instances} message={message} themeName={themeName} themeType={themeType} dateFormat={dateFormat} ackCallback={ackCallback} />, node);
}