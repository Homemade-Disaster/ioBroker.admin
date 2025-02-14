import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    TextField,
    IconButton,
} from '@mui/material';

import Utils from './wrapper/Components/Utils';
import CopyIcon from './wrapper/icons/IconCopy';

import ConfigGeneric from './ConfigGeneric';

const styles = () => ({
    fullWidth: {
        width: '100%',
    },
});

class ConfigTextSendTo extends ConfigGeneric {
    componentDidMount() {
        super.componentDidMount();

        this.askInstance();
    }

    askInstance() {
        if (this.props.alive) {
            let data = this.props.schema.data;
            if (data === undefined && this.props.schema.jsonData) {
                data = this.getPattern(this.props.schema.jsonData);
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error(`Cannot parse json data: ${data}`);
                }
            }

            if (data === undefined) {
                data = null;
            }

            this.props.socket.sendTo(`${this.props.adapterName}.${this.props.instance}`, this.props.schema.command || 'send', data)
                .then(text => this.setState({ text: text || '', context: this.getContext() }));
        }
    }

    getContext() {
        const context = {};
        if (Array.isArray(this.props.schema.alsoDependsOn)) {
            this.props.schema.alsoDependsOn.forEach(attr =>
                context[attr] = ConfigGeneric.getValue(this.props.data, attr));
        }
        return JSON.stringify(context);
    }

    renderItem(/* error, disabled, defaultValue */) {
        if (this.state.text === undefined) {
            return null;
        }

        if (this.props.alive) {
            const context = this.getContext();
            if (context !== this.state.context) {
                setTimeout(() => this.askInstance(), 300);
            }
        }

        if (this.props.schema.container === 'text') {
            return <TextField
                variant="standard"
                fullWidth
                InputProps={{
                    endAdornment: this.props.schema.copyToClipboard ?
                        <IconButton
                            size="small"
                            onClick={() => {
                                Utils.copyToClipboard(this.state.text);
                                window.alert('Copied');
                            }}
                        >
                            <CopyIcon />
                        </IconButton>
                        : undefined,
                }}
                value={this.state.text}
                label={this.getText(this.props.schema.label)}
                helperText={this.renderHelp(this.props.schema.help, this.props.schema.helpLink, this.props.schema.noTranslation)}
            />;
        }
        return <div className={this.props.classes.fullWidth}>{this.state.text}</div>;
    }
}

ConfigTextSendTo.propTypes = {
    socket: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    schema: PropTypes.object,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
};

export default withStyles(styles)(ConfigTextSendTo);
