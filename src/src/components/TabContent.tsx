import type { ReactNodeLike } from 'prop-types';
import { withStyles } from '@mui/styles';
import { Grid } from '@mui/material';
import { Utils } from '@iobroker/adapter-react-v5';
import React from 'react';

const styles = {
    root: {
        height: '100%',
        overflow: 'hidden',
    },
    overflowAuto: {
        overflow: 'auto',
    },
} as const;

interface TabContentProps {
    /** The content of the component. */
    children: ReactNodeLike;
    /** Overflow behavior */
    overflow: string;
    /** Additional css classes */
    classes: { [key in keyof typeof styles]: string};
}

class TabContent extends React.Component<TabContentProps> {
    render(): React.JSX.Element {
        const { classes } = this.props;

        return <Grid
            item
            className={Utils.clsx(classes.root, { [classes.overflowAuto]: this.props.overflow === 'auto' })}
        >
            {this.props.children}
        </Grid>;
    }
}

export default withStyles(styles)(TabContent);
