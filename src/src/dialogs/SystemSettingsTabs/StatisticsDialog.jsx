// StatisticsDialog.js

import { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import AceEditor from 'react-ace';
import 'ace-builds/src-min-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/worker-json';
import 'ace-builds/src-min-noconflict/theme-clouds_midnight';
import 'ace-builds/src-min-noconflict/theme-chrome';
import 'ace-builds/src-min-noconflict/ext-language_tools';

import {
    Grid, Paper, Card, Typography, MenuItem,
    FormControl, Select, InputLabel,
} from '@mui/material';

import blueGrey from '@mui/material/colors/blueGrey';

import withWidth from '@iobroker/adapter-react-v5/Components/withWidth';

// eslint-disable-next-line no-undef
ace.config.set('basePath', 'lib/js/ace');

const styles = theme => ({
    tabPanel: {
        width: '100%',
        height: '100% ',
        overflow: 'auto',
        padding: 15,
        // backgroundColor: blueGrey[ 50 ]
    },
    note: {
        padding: 15,
        backgroundColor: blueGrey[500],
        color: '#FFF',
        overflow: 'auto',
        flex: 'none',
    },
    sentData: {
        padding: 15,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: '100%',
    },
    descriptionPanel: {
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        overflow: 'auto',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
});

class StatisticsDialog extends Component {
    static getTypes() {
        return [
            {
                id: 'none',
                title: 'none',
            },
            {
                id: 'normal',
                title: 'normal',
            },
            {
                id: 'no-city',
                title: 'no-city',
            },
            {
                id: 'extended',
                title: 'extended',
            },
        ];
    }

    getTypesSelector = () => {
        const { classes } = this.props;
        const { common } = this.props.data;
        const items = StatisticsDialog.getTypes().map((elem, index) =>
            <MenuItem value={elem.title} key={index}>
                {this.props.t(elem.title)}
            </MenuItem>);

        return <FormControl variant="standard" className={classes.formControl}>
            <InputLabel shrink id="statistics-label">
                {this.props.t('Statistics')}
            </InputLabel>
            <Select
                disabled={this.props.saving}
                variant="standard"
                className={classes.formControl}
                id="statistics"
                value={common.diag}
                displayEmpty
                onChange={this.handleChangeType}
            >
                {items}
            </Select>
        </FormControl>;
    };

    doChange = (name, value) => {
        const newData = JSON.parse(JSON.stringify(this.props.data));
        newData.common[name] = value;
        this.props.onChange(newData);
    };

    handleChangeType = evt => {
        this.doChange('diag', evt.target.value);
        if (this.props.handle) {
            this.props.handle(evt.target.value);
        }
    };

    render() {
        const { classes } = this.props;
        return <div className={classes.tabPanel} style={{ height: '100%' }}>
            <Grid container spacing={3} className="sendData-grid" style={{ height: '100%' }}>
                <Grid item lg={4} md={4} xs={12} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Card className={classes.note}>
                        <Typography gutterBottom variant="h6" component="div">
                            {this.props.t('Note:')}
                        </Typography>
                        <Typography
                            paragraph
                            variant="body2"
                            component="div"
                            dangerouslySetInnerHTML={{ __html: this.props.t('diag-note') }}
                        />
                    </Card>
                    {this.getTypesSelector()}
                    {this.props.dataAux ? <Paper
                        variant="outlined"
                        className={classes.descriptionPanel}
                    >
                        <ul>
                            {Object.keys(this.props.dataAux).map(key => <li key={key}>{key}</li>)}
                        </ul>
                    </Paper> : null}
                </Grid>
                <Grid
                    item
                    lg={8}
                    md={4}
                    xs={12}
                    className="sendData-grid"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                    <Paper className={classes.sentData}>
                        <Typography gutterBottom variant="h6" component="div">
                            {this.props.t('Sent data:')}
                        </Typography>
                    </Paper>
                    <AceEditor
                        mode="json"
                        width="100%"
                        height="100%"
                        showPrintMargin
                        showGutter
                        highlightActiveLine
                        readOnly
                        theme={this.props.themeType === 'dark' ? 'clouds_midnight' : 'chrome'}
                        value={JSON.stringify(this.props.dataAux, null, 2)}
                        name="UNIQUE_ID_OF_DIV"
                        fontSize={14}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            tabSize: 2,
                        }}
                        editorProps={{ $blockScrolling: true }}
                    />
                </Grid>
            </Grid>
        </div>;
    }
}

StatisticsDialog.propTypes = {
    t: PropTypes.func,
    data: PropTypes.object,
    dataAux: PropTypes.object,
    themeType: PropTypes.string,
    handle: PropTypes.func.isRequired,
    saving: PropTypes.bool,
};

export default withWidth()(withStyles(styles)(StatisticsDialog));
