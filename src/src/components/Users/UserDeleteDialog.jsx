import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import IconCancel from '@mui/icons-material/Close';
import IconDelete from '@mui/icons-material/Delete';

function UserDeleteDialog(props) {
    if (!props.open) {
        return null;
    }

    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{props.t('Please confirm')}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {props.t('Do you want to delete user %s?', props.user.common.name)}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" color="primary" onClick={() => props.deleteUser(props.user._id)} startIcon={<IconDelete />}>{props.t('Delete')}</Button>
            <Button variant="contained" color="grey" autoFocus onClick={props.onClose} startIcon={<IconCancel />}>{props.t('Cancel')}</Button>
        </DialogActions>
    </Dialog>;
}

UserDeleteDialog.propTypes = {
    t: PropTypes.func,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    user: PropTypes.object,
    deleteUser: PropTypes.func,
};

export default UserDeleteDialog;
