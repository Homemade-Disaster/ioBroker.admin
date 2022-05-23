// CertificatesDialog.js
import {Component} from 'react';
import clsx from 'clsx';
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types';

import withWidth from '@material-ui/core/withWidth';
import {withStyles} from '@material-ui/core/styles';

import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import Utils from '../../Utils';

// icons

const styles = theme => ({
    tabPanel: {
        width: '100%',
        height: '100% ',
        overflow: 'auto',
        overflowX: 'hidden',
        padding: 15,
        position: 'relative'
    },
    tableContainer: {
        zIndex: 100
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    },
    buttonPanel: {
        paddingBottom: 40,
        display: 'flex'
    },
    descriptionPanel: {
        width: '100%',
        backgroundColor: 'transparent',
        marginLeft: 40,
        border: 'none',
        display: 'flex',
        alignItems: 'center'
    },
    littleRow: {
        width: 110
    },
    nameRow: {
        width: 220
    },
    input: {
        width: '100%'
    }
});

class CertificatesDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chClass: false
        };
    }

    certToArray(certs) {
        return Utils.objectMap(certs, (cert, name) => {
            return {
                title: name,
                data: cert
            }
        });
    }

    arrayToCert(array) {
        let result = {};
        for (let k in array) {
            result[array[k].title] = array[k].data
        }

        return result;
    }

    render() {
        const {classes} = this.props;
        const arr = this.certToArray(this.props.data.native.certificates);
        const rows = arr.map((e, i) => {
            return <TableRow key={i} className="float_row">
                <TableCell className={this.props.classes.littleRow + ' float_cell'}>
                    {i + 1}
                </TableCell>
                <TableCell className={this.props.classes.nameRow + ' float_cell'}>
                    <TextField
                        value={e.title}
                        InputLabelProps={{
                            readOnly: false,
                            shrink: true,
                        }}
                        className={this.props.classes.input + ' xs-centered'}
                        onChange={evt => this.onChangeText(evt, e.title, 'title')}
                    />
                </TableCell>
                <TableCell className="grow_cell float_cell">
                    <TextField
                        id={'default_' + i}
                        value={e.data}
                        InputLabelProps={{
                            readOnly: false,
                            shrink: true,
                        }}
                        className={this.props.classes.input + ' xs-centered'}
                        onChange={evt => this.onChangeText(evt, e.title, 'data')}
                    />
                </TableCell>
                <TableCell className={this.props.classes.littleRow + ' float_cell'}>
                    <Fab
                        size="small"
                        color="secondary"
                        aria-label="add"
                        onClick={evt => this.onDelete(e.title)}
                    >
                        <DeleteIcon/>
                    </Fab>
                </TableCell>
            </TableRow>
        })
        return <div className={classes.tabPanel}>
            <Dropzone noClick>
                {({getRootProps, getInputProps, acceptedFiles, fileRejections}) => (
                    <div {...getRootProps({
                        className: this.state.chClass ? 'drop-container drop-dop' : 'drop-container',
                        onDragEnter: evt => this.setState({chClass: true}),
                        onDragLeave: evt => this.setState({chClass: false}),
                        onDrop: evt => {
                            if (fileRejections.length > 0) {
                                let msg = [];
                                // eslint-disable-next-line array-callback-return
                                fileRejections.map((e => {
                                    let m = e.file.name + ': ';
                                    let mm = [];
                                    e.errors.forEach(ee => mm.push(ee.message));
                                    msg.push(m + mm.join(','));
                                }));

                                alert(msg.join(', '));
                            }

                            if (acceptedFiles.length > 0) {
                                // eslint-disable-next-line array-callback-return
                                acceptedFiles.map(file => {
                                    const reader = new FileReader();
                                    reader.onload = async e =>
                                        this.onAdd(file.name, e.target.result);
                                    reader.readAsText(file);
                                })

                            } else if (fileRejections.length === 0) {
                                alert(this.props.t('No files exists'));
                            }
                            this.setState({chClass: false});
                        }
                    })}>
                        <input {...getInputProps()} />
                    </div>
                )}
            </Dropzone>
            <div className={classes.buttonPanel}>
                <Fab
                    size="small"
                    className="small_size"
                    color="primary"
                    aria-label="add"
                    onClick={() => this.onAdd()}
                >
                    <AddIcon/>
                </Fab>
                <Paper variant="outlined" className={classes.descriptionPanel}>
                    {this.props.t('certs_hint')}
                </Paper>
            </div>
            <TableContainer className={classes.tableContainer}>
                <Table className={classes.table} aria-label="customized table">
                    <TableHead>
                        <TableRow className="float_row">
                            <TableCell className={clsx(this.props.classes.littleRow, 'float_cell')}> </TableCell>
                            <TableCell className={clsx(this.props.classes.nameRow, 'float_cell')}>
                                {this.props.t('name')}
                            </TableCell>
                            <TableCell className={clsx('grow_cell', 'float_cell')}>
                                {this.props.t('Certificate')}
                            </TableCell>
                            <TableCell className={clsx(this.props.classes.littleRow, 'float_cell')}> </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>;
    }

    onChangeText = (evt, id, name) => {
        const value = evt.target.value;
        let newData = JSON.parse(JSON.stringify(this.props.data))
        let array = this.certToArray(newData.native.certificates);
        array.find(element => element.title === id)[name] = value;
        newData.native.certificates = this.arrayToCert(array);
        this.props.onChange(newData);
    }

    onDelete = id => {
        let newData = JSON.parse(JSON.stringify(this.props.data))
        let array = this.certToArray(newData.native.certificates);
        let index = array.findIndex(element => element.title === id);
        delete array[index];
        newData.native.certificates = this.arrayToCert(array);
        this.props.onChange(newData);
    }

    onAdd = (title, data) => {
        let newData = JSON.parse(JSON.stringify(this.props.data))
        let array = this.certToArray(newData.native.certificates);
        if (!title) {
            let i = 1;
            // eslint-disable-next-line
            while (array.find(item => item.title === this.props.t('certificate') + '_' + i)) {
                i++;
            }
            title = this.props.t('certificate') + '_' + i;
        }

        array.push({
            title: title ? title : '__',
            data:  data  ? data  : ''
        });
        newData.native.certificates = this.arrayToCert(array);
        this.props.onChange(newData);
    }
}

CertificatesDialog.propTypes = {
    t: PropTypes.func,
    data: PropTypes.object,
    onChange: PropTypes.func,
};

export default withWidth()(withStyles(styles)(CertificatesDialog));



