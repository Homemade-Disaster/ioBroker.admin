import React, { useState } from 'react';

import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';

import AddIcon from '@material-ui/icons/AddBox';

import I18n from '@iobroker/adapter-react/i18n';
import Utils from '../components/Utils'; // @iobroker/adapter-react/i18n

import CustomModal from '../components/CustomModal';

const stateTypeArray = [
    'boolean',
    'string',
    'number',
    'array',
    'object',
    'mixed'
];

const stateDefValues = {
    'boolean': false,
    'string': '',
    'number': 0,
};

const TYPES = {
    state:   {name: 'Datapoint', value: 'state'},
    channel: {name: 'Channel', value: 'channel'},
    device:  {name: 'Device', value: 'device'},
    folder:  {name: 'Folder', value: 'folder'}
};

const ObjectAddNewContent = ({ onClose, onApply, open, selected, extendObject, objects }) => {
    const names = {
        state:   I18n.t('New state'),
        channel: I18n.t('New channel'),
        device:  I18n.t('New device'),
        folder:  I18n.t('New folder'),
    };

    const types = [];

    // analyse possible types
    const parentType = objects[selected]?.type;
    if (parentType === 'channel') {
        types.push(TYPES.state);
    } else if (parentType === 'device') {
        types.push(TYPES.state);
        types.push(TYPES.channel);
    } else {
        types.push(TYPES.state);
        types.push(TYPES.channel);
        types.push(TYPES.device);

        if (selected.startsWith('0_userdata.') ||
            selected.startsWith('alias.0.') ||
            selected === '0_userdata' ||
            selected === 'alias.0') {
            types.push(TYPES.folder);
        }
    }

    const [name, setName] = useState(names.state);
    const [type, setType] = useState('state');
    const [stateType, setStateType] = useState('object');
    const [unique, setUnique] = useState(!objects[buildId(names.state)]);

    function buildId(name) {
        return name.toString().replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_');
    }

    return <CustomModal
        open={open}
        fullWidth
        maxWidth="lg"
        titleButtonApply="add"
        applyDisabled={!name || !unique || !parentType.length}
        onClose={onClose}
        onApply={() => {
            const newObj = {
                common: {
                    name,
                    desc: 'Manually created',
                },
                type
            };

            if (type === 'state') {
                newObj.common = {
                    ...newObj.common,
                    role: '',
                    type: stateType,
                    read: true,
                    write: true,
                    def: stateDefValues[stateType]
                };
            } else if (type !== 'folder') {
                newObj.common = {
                    ...newObj.common,
                    role: '',
                    icon: '',
                };
            } else {
                delete newObj.common.desc;
            }

            extendObject(`${selected}.${name.split(' ').join('_')}`, newObj);
            onApply();
        }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
                margin: 10,
                fontSize: 20
            }}><AddIcon/> {I18n.t('Add new object:')} <span style={{fontStyle: 'italic'}}>{selected}.{name}</span></div>
            <TextField
                label={I18n.t('Parent')}
                style={{ margin: '5px 0' }}
                disabled
                value={selected}
            />
            <TextField
                label={I18n.t('Name')}
                style={{ margin: '5px 0' }}
                value={name}
                onChange={el => {
                    setUnique(!objects[buildId(el.target.value)]);
                    setName(el.target.value);
                }}
            />
            <FormControl style={{ marginTop: 10, marginBottom: 10 }}>
                <InputLabel>{I18n.t('Type')}</InputLabel>
                <Select
                    value={type}
                    onChange={(el) => {
                        if (name === names[type]) {
                            setName(names[el.target.value]);
                            setUnique(objects[buildId(names[el.target.value])]);
                        }
                        setType(el.target.value);
                    }}
                >
                    {types.map(el => <MenuItem key={el.value} value={el.value}>{I18n.t(el.name)}</MenuItem>)}
                </Select>
            </FormControl>
            {type === 'state' && <FormControl >
                <InputLabel>{I18n.t('State type')}</InputLabel>
                <Select
                    value={stateType}
                    onChange={el => setStateType(el.target.value)}
                >
                    {stateTypeArray.map(el => <MenuItem key={el} value={el}>{el}</MenuItem>)}
                </Select>
            </FormControl>}
        </div>
    </CustomModal>;
}

export default ObjectAddNewContent;