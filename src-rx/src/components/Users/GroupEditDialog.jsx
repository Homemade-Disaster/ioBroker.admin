import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core';
import clsx from 'clsx';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TextFieldsIcon from '@material-ui/icons/TextFields';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PageviewIcon from '@material-ui/icons/Pageview';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import ImageIcon from '@material-ui/icons/Image';
import IconCancel from '@material-ui/icons/Close';
import IconCheck from '@material-ui/icons/Check';

import { IOTextField, IOColorPicker } from '../IOFields/Fields';

import Utils from '@iobroker/adapter-react/Components/Utils';
import IconPicker from '@iobroker/adapter-react/Components/IconPicker';

import Group1 from '../../assets/groups/group1.svg';
import Group2 from '../../assets/groups/group2.svg';
import Group3 from '../../assets/groups/group3.svg';
import Group4 from '../../assets/groups/group4.svg';
import Group5 from '../../assets/groups/group5.svg';
import Group6 from '../../assets/groups/group6.svg';
import Group7 from '../../assets/groups/group7.svg';
import Group8 from '../../assets/groups/group8.svg';
import Group9 from '../../assets/groups/group9.svg';
import Group10 from '../../assets/groups/group10.svg';

const GROUPS_ICONS = [Group1, Group2, Group3, Group4, Group5, Group6, Group7, Group8, Group9, Group10];

function PermissionsTab(props) {
    let mapObject = function (object, mapFunction) {
        return Object.values(object).map((value, index) => {
            let key = Object.keys(object)[index];
            return mapFunction(value, key);
        });
    }

    let acl = props.group.common.acl;

    // Initialize ACL if not exists or is invalid
    acl = acl || {};

    acl.object = acl.object || {
        read: true,
        list: true,
        write: true,
        'delete': false,
    };
    acl.object = Object.assign({}, {read: true, list: true, write: true, 'delete': false,}, acl.object);

    acl.state = acl.state || {
        read: true,
        list: true,
        write: true,
        'delete': false,
    };
    acl.state = Object.assign({}, {read: true, list: true, write: true, 'delete': false,}, acl.state);

    acl.users = acl.users || {
        write: false,
        'delete': false,
        create: false
    };
    acl.users = Object.assign({}, {write: false, 'delete': false, create: false}, acl.users);

    acl.other = acl.other || {
        http: false,
        execute: false,
        sendto: true
    };
    acl.other = Object.assign({}, {http: false, execute: false, sendto: true}, acl.other);

    acl.file = acl.file || {
        read: true,
        list: true,
        write: false,
        'delete': false,
        create: false
    };
    acl.file = Object.assign({}, {read: true, list: true, write: false, 'delete': false, create: false}, acl.file);

    return <Grid container spacing={props.innerWidth < 500 ? 1 : 4} className={props.classes.dialog} key="PermissionsTab">{
            mapObject(props.group.common.acl || {}, (block, blockKey) =>
                <Grid item xs={12} md={12} key={blockKey}>
                    <h2 className={props.classes.permHeaders}>{props.t('group_acl_' + blockKey)}</h2>
                    {mapObject(block, (perm, permKey) =>
                        <FormControlLabel
                            key={permKey}
                            control={<Checkbox
                                disabled={props.group._id === 'system.group.administrator'}
                                checked={perm}
                                onChange={e => {
                                    let newData = Utils.clone(props.group);
                                    newData.common.acl[blockKey][permKey] = e.target.checked;
                                    props.onChange(newData);
                                }}
                            />}
                            label={props.t('group_acl_' + permKey)}
                            labelPlacement="top"
                        />
                    )}
                </Grid>)
        }
    </Grid>;
}

const styles = theme => ({
    contentRoot:{
        padding: '16px 24px'
    }
});

function GroupEditDialog(props) {
    const [tab, setTab] = useState(0);

    let [originalId, setOriginalId] = useState(null);

    useEffect(() => {
        setOriginalId(props.group._id);
        if (props.isNew) {
            const icon = GROUPS_ICONS[Math.round(Math.random() * (GROUPS_ICONS.length - 1))];

            icon && Utils.getSvg(icon)
                .then(fileBlob => {
                    let newData = Utils.clone(props.group);
                    newData.common.icon = fileBlob;
                    props.onChange(newData);
                });
        }
    // eslint-disable-next-line
    }, [props.open]);

    if (!props.open) {
        return null;
    }

    let idExists = props.groups.find(group => group._id === props.group._id);
    let idChanged = props.group._id !== originalId;

    let canSave = props.group._id !== 'system.group.' &&
        props.group.common.password === props.group.common.passwordRepeat;

    const getShortId = _id =>
        _id.split('.').pop();

    const name2Id = name =>
        name.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();

    const changeShortId = (_id, short) => {
        let idArray = _id.split('.');
        idArray[idArray.length-1] = short;
        return idArray.join('.');
    }

    if (props.isNew) {
        if (idExists) {
            canSave = false;
        }
    } else {
        if (idExists && idChanged) {
            canSave = false;
        }
    }

    let description = props.getText(props.group.common.desc);
    let name = props.getText(props.group.common.name);

    let mainTab = <Grid container spacing={props.innerWidth < 500 ? 1 : 4} className={props.classes.dialog}>
        <Grid item xs={12} md={6}>
            <IOTextField
                label="Name"
                t={props.t}
                value={ name }
                onChange={e => {
                    let newData = Utils.clone(props.group);
                    if (!props.group.common.dontDelete && name2Id(newData.common.name) === getShortId(newData._id)) {
                        newData._id = changeShortId(newData._id, name2Id(e.target.value));
                    }
                    newData.common.name = e.target.value;
                    props.onChange(newData);
                }}
                autoComplete="off"
                icon={TextFieldsIcon}
                classes={props.classes}
            />
        </Grid>
         <Grid item xs={12} md={6}>
            <IOTextField
                label="ID edit"
                t={props.t}
                disabled={props.group.common.dontDelete}
                value={ props.group._id.split('.')[props.group._id.split('.').length-1] }
                onChange={e => {
                    let newData = Utils.clone(props.group);
                    newData._id = changeShortId(newData._id, name2Id(e.target.value));
                    props.onChange(newData);
                }}
                icon={LocalOfferIcon}
                classes={props.classes}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <IOTextField
                label="ID preview"
                t={props.t}
                disabled
                value={ props.group._id }
                icon={PageviewIcon}
                classes={props.classes}
        />
        </Grid>
        <Grid item xs={12} md={6}>
            <IOTextField
                label="Description"
                t={props.t}
                value={ description }
                onChange={e => {
                    let newData = Utils.clone(props.group);
                    newData.common.desc = e.target.value;
                    props.onChange(newData);
                }}
                icon={DescriptionIcon}
                classes={props.classes}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <IconPicker
                label="Icon"
                icons={GROUPS_ICONS}
                t={props.t}
                lang={props.lang}
                value={ props.group.common.icon }
                onChange={fileBlob => {
                    let newData = Utils.clone(props.group);
                    newData.common.icon = fileBlob;
                    props.onChange(newData);
                }}
                previewClassName={props.classes.iconPreview}
                icon={ImageIcon}
                classes={props.classes}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <IOColorPicker
                label="Color"
                t={props.t}
                value={ props.group.common.color }
                previewClassName={props.classes.iconPreview}
                onChange={color => {
                    let newData = Utils.clone(props.group);
                    newData.common.color = color;
                    props.onChange(newData);
                }}
                icon={ColorLensIcon}
                className={props.classes.colorPicker}
                classes={props.classes}
            />
        </Grid>
    </Grid>;

    let selectedTab = [mainTab, PermissionsTab(props)][tab];

    return <Dialog
        open={props.open}
        onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                props.onClose();
            }
        }}
        fullWidth={props.innerWidth < 500}
    >
        <DialogTitle className={props.classes.dialogTitle}>
            <Tabs
                variant="fullWidth"
                value={tab}
                onChange={(e, newTab) => setTab(newTab)}
            >
                <Tab label={props.t('Main')} value={0} />
                <Tab label={props.t('Permissions')} value={1} />
            </Tabs>
        </DialogTitle>
        <DialogContent classes={{root: clsx(props.innerWidth < 500 ? props.classes.narrowContent : '', props.classes.contentRoot)}}>
            { selectedTab }
        </DialogContent>
        <DialogActions className={props.classes.dialogActions} >
            <Button variant="contained" color="primary" autoFocus onClick={() => props.saveData(props.isNew ? null : originalId)} disabled={!canSave} startIcon={<IconCheck />}>{props.t('Save')}</Button>
            <Button variant="contained" onClick={props.onClose} startIcon={<IconCancel />}>{props.t('Cancel')}</Button>
        </DialogActions>
    </Dialog>;
}

GroupEditDialog.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    groups: PropTypes.array,
    group: PropTypes.object,
    isNew: PropTypes.bool,
    onChange: PropTypes.func,
    saveData: PropTypes.func,
    innerWidth: PropTypes.number,
    getText: PropTypes.func,
};

export default withStyles(styles)(GroupEditDialog);
