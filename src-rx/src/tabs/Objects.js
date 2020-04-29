import withWidth from '@material-ui/core/withWidth';
import {withStyles} from '@material-ui/core/styles';
import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';

import ObjectBrowser from '../components/ObjectBrowser';

const styles = theme => ({
    root: {
        paddingTop: 5,
        paddingLeft: 5,
        width: 'calc(100% - 10px)',
        height: 'calc(100% - 10px)',
        overflow: 'hidden',
        position: 'relative',
    },
});

class Objects extends React.Component {

    constructor(props) {

        super(props);

        this.filters = window.localStorage.getItem(this.dialogName) || '{}';

        try {
            this.filters = JSON.parse(this.filters);
        } catch (e) {
            this.filters = {};
        }

        this.state =  {
            selected: this.props.selected || '',
            name:     ''
        };
    }

    render() {
        return (
            <Paper className={ this.props.classes.root }>
                <ObjectBrowser
                    prefix={ this.props.prefix }
                    defaultFilters={ this.filters }
                    statesOnly={ this.props.statesOnly }
                    style={ {width: '100%', height: '100%'} }
                    connection={ this.props.socket }
                    selected={ this.state.selected }
                    name={ this.state.name }
                    theme={ this.props.themeName }
                    onFilterChanged={ filterConfig => {
                        this.filters = filterConfig;
                        window.localStorage.setItem(this.dialogName, JSON.stringify(filterConfig));
                    }}
                />
            </Paper>
        );
    }
}

Objects.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    socket: PropTypes.object,
    themeName: PropTypes.string,
    expertMode: PropTypes.bool,
};

export default withWidth()(withStyles(styles)(Objects));