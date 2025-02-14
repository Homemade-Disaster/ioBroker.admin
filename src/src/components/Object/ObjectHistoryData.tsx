import React, { Component } from 'react';
import { Styles, withStyles } from '@mui/styles';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker, DatePicker } from '@mui/x-date-pickers';

import {
    Paper,
    LinearProgress,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Toolbar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    FormControlLabel,
    Checkbox,
    Grid,
    TableHead,
    TableRow,
    TableCell,
    TextField,
    TableBody,
    TableContainer,
} from '@mui/material';

import {
    Utils, withWidth, TableResize, AdminConnection,
} from '@iobroker/adapter-react-v5';

// icons
import { FaPlusSquare as InsertIcon, FaDownload as ExportIcon } from 'react-icons/fa';
import {
    Edit as IconEdit,
    Delete as IconDelete,
    Close as IconClose,
} from '@mui/icons-material';

// @ts-expect-error this is weird
import type { SystemConfig } from '@iobroker/socket-client';
import { localeMap } from './utils';

function padding3(ms: number) {
    if (ms < 10) {
        return `00${ms}`;
    } if (ms < 100) {
        return `0${ms}`;
    }
    return ms;
}

const styles = (theme: any) => ({
    paper: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
    },
    tableDiv: {
        height: `calc(100% - ${theme.mixins.toolbar.minHeight + parseInt(theme.spacing(1), 10)}px)`,
        overflow: 'hidden',
        width: '100%',
    },
    container: {
        height: '100%',
    },
    table: {
        // tableLayout: 'fixed',
        minWidth: 960,
        width: '100%',
        '& td:nth-of-type(5)': {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        },
        '& tr:nth-child(even)': {
            backgroundColor: theme.palette.mode === 'dark' ? '#383838' : '#b2b2b2',
        },
    },
    row: {
        userSelect: 'none',
        /* '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        }, */
        position: 'relative',
        '&:hover': {
            opacity: 0.7,
        },
        '& td': {
            position: 'relative',
        },
    },
    updatedRow: {
        animation: 'updated 1s',
    },
    rowInterpolated: {
        opacity: 0.5,
    },
    selectHistoryControl: {
        width: 130,
    },
    selectRelativeTime: {
        marginLeft: 10,
        width: 200,
    },
    notAliveInstance: {
        opacity: 0.5,
    },
    customRange: {
        color: theme.palette.primary.main,
    },
    rowSelected: {
        background: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        '& td': {
            color: theme.palette.secondary.contrastText,
            background: theme.palette.secondary.main,
        },
    },
    rowFocused: {
        position: 'absolute',
        pointerEvents: 'none',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: 3,
        border: `1px dotted ${theme.palette.action.active}`,
    },
    grow: {
        flexGrow: 1,
    },
    editorTimePicker: {
        marginLeft: theme.spacing(1),
        width: 120,
    },
    editorDatePicker: {
        marginLeft: theme.spacing(1),
        width: 150,
    },
    msInput: {
        width: 50,
        paddingTop: 16,
        marginLeft: 5,
        '& label': {
            marginTop: 15,
        },
    },
    cellAckTrue: {
        color: theme.palette.mode === 'dark' ? '#66ff7f' : '#04a821',
    },
    cellAckFalse: {
        color: '#FF6666',
    },
    toolbarTime: {
        width: 100,
        marginTop: 9,
        marginLeft: theme.spacing(1),
    },
    toolbarDate: {
        width: 160,
        marginTop: 9,
    },
    toolbarTimeGrid: {
        marginLeft: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        border: '1px dotted #AAAAAA',
        borderRadius: theme.spacing(1),
    },
    noLoadingProgress: {
        width: '100%',
        height: 4,
    },

    colValue: {

    },
    colAck: {
        // width: 50,
    },
    colFrom: {
        // width: 150,
    },
    colLastChange: {
        // width: 200,
    },
    colTs: {
        // width: 200,
    },
    dateInput: {
        width: 140,
        marginRight: theme.spacing(1),
    },
    timeInput: {
        width: 100,
    },
}) satisfies Styles<any, any>;

interface ObjectHistoryDataProps {
    t: (...text: string[]) => string;
    lang: ioBroker.Languages;
    expertMode: boolean;
    socket: AdminConnection;
    obj: Record<string, any>;
    customsInstances: any[];
    themeName: string;
    objects: Record<string, any>;
    isFloatComma: boolean;
    classes: Record<string, any>;
}

interface ObjectHistoryDataState {
    areYouSure?: boolean;
    historyInstance: string;
    relativeRange: any;
    start: number;
    end: number;
    values: any;
    selected: number[];
    lastSelected: any;
    lastSelectedColumn: any;
    updateOpened: boolean;
    insertOpened: boolean;
    historyInstances: null | Record<string, any>[];
    lcVisible: boolean;
    ackVisible: boolean;
    fromVisible: boolean;
    /** 'insert', 'update', 'delete' */
    supportedFeatures: string[];
    dateFormat: string;
    edit: Record<string, any>;
    loading?: boolean;
    suppressMessage?: number | boolean;
}

class ObjectHistoryData extends Component<ObjectHistoryDataProps, ObjectHistoryDataState> {
    private readonly adminInstance: number;

    private readonly supportedFeaturesPromises: Record<string, any>;

    private readonly unit: string;

    private timeTimer?: ReturnType<typeof setTimeout>;

    private readSupportedFeaturesTimeout?: ReturnType<typeof setTimeout>;

    private rangeValues: any;

    private rangeRef?: React.RefObject<any>;

    constructor(props: ObjectHistoryDataProps) {
        super(props);

        let relativeRange      = (((window as any)._localStorage) || window.localStorage).getItem('App.relativeRange') || 'absolute';
        const start              = parseInt((((window as any)._localStorage) || window.localStorage).getItem('App.absoluteStart'), 10) || 0;
        const end                = parseInt((((window as any)._localStorage) || window.localStorage).getItem('App.absoluteEnd'), 10)   || 0;
        let selected           = (((window as any)._localStorage) || window.localStorage).getItem('App.historySelected') || '';
        const lastSelected       = parseInt((((window as any)._localStorage) || window.localStorage).getItem('App.historyLastSelected'), 10) || null;
        const lastSelectedColumn = (((window as any)._localStorage) || window.localStorage).getItem('App.historyLastSelectedColumn') || null;

        if ((!start || !end) && (!relativeRange || relativeRange === 'absolute')) {
            relativeRange = '30';
        }

        if (start && end) {
            relativeRange = 'absolute';
        }

        try {
            selected = JSON.parse(selected);
        } catch (e) {
            selected = [];
        }

        this.state = {
            start,
            end,
            values: null,
            relativeRange,
            selected,
            lastSelected,
            lastSelectedColumn,
            historyInstance: '',
            updateOpened: false,
            insertOpened: false,
            historyInstances: null,
            // defaultHistory: '',
            lcVisible: true,
            // qVisible: true,
            ackVisible: true,
            fromVisible: true,
            supportedFeatures: [],
            dateFormat: 'dd.MM.yyyy',
            edit: {},
        };
        this.adminInstance = parseInt(window.location.search.slice(1), 10) || 0;

        this.supportedFeaturesPromises = {};

        this.unit = this.props.obj.common && this.props.obj.common.unit ? ` ${this.props.obj.common.unit}` : '';

        this.timeTimer = undefined;

        this.prepareData()
            .then(() => this.readHistoryRange())
            .then(() => {
                if (relativeRange !== 'absolute') {
                    this.setRelativeInterval(this.state.relativeRange, true);
                } else {
                    this.readHistory();
                }
            });
    }

    readSupportedFeatures(historyInstance: string) {
        historyInstance = historyInstance || this.state.historyInstance;
        if (!historyInstance) {
            return Promise.resolve([]);
        } if (this.supportedFeaturesPromises[historyInstance]) {
            return this.supportedFeaturesPromises[historyInstance];
        }

        this.supportedFeaturesPromises[historyInstance] = new Promise(resolve => {
            this.readSupportedFeaturesTimeout && clearTimeout(this.readSupportedFeaturesTimeout);
            this.readSupportedFeaturesTimeout = setTimeout(() => {
                this.readSupportedFeaturesTimeout = undefined;
                resolve([]);
            }, 2_000);

            this.props.socket.sendTo(historyInstance, 'features', null)
                .then((result: any) => {
                    if (this.readSupportedFeaturesTimeout) {
                        this.readSupportedFeaturesTimeout && clearTimeout(this.readSupportedFeaturesTimeout);
                        this.readSupportedFeaturesTimeout = undefined;
                        resolve(result ? result.supportedFeatures || [] : []);
                    } else {
                        this.setState({ supportedFeatures: result ? result.supportedFeatures || [] : [] });
                    }
                });
        });
        return this.supportedFeaturesPromises[historyInstance];
    }

    componentDidMount() {
        this.props.socket.subscribeState(this.props.obj._id, this.onChange);
    }

    componentWillUnmount() {
        this.timeTimer && clearTimeout(this.timeTimer);
        this.timeTimer = undefined;

        this.props.socket.unsubscribeState(this.props.obj._id, this.onChange);
    }

    onChange = (id: string, state: ioBroker.State) => {
        if (id === this.props.obj._id &&
            state &&
            this.state.values &&
            (!this.state.values.length || this.state.values[this.state.values.length - 1].ts < state.ts)) {
            const values = [...this.state.values, state];
            this.setState({ values });
        }
    };

    prepareData() {
        let list: Record<string, any>[];
        return this.getHistoryInstances()
            .then((_list: Record<string, any>[]) => {
                list = _list;
                // read default history
                return this.props.socket.getCompactSystemConfig();
            })
            .then((config: SystemConfig) => {
                const defaultHistory = config?.common?.defaultHistory;

                // find current history
                // first read from localstorage
                let historyInstance = ((window as any)._localStorage || window.localStorage).getItem('App.historyInstance') || '';
                if (!historyInstance || !list.find(it => it.id === historyInstance && it.alive)) {
                    // try default history
                    historyInstance = defaultHistory;
                }
                if (!historyInstance || !list.find(it => it.id === historyInstance && it.alive)) {
                    // find first alive history
                    historyInstance = list.find(it => it.alive);
                    if (historyInstance) {
                        historyInstance = historyInstance.id;
                    }
                }
                // get first entry
                if (!historyInstance && list.length) {
                    historyInstance = defaultHistory;
                }
                return this.readSupportedFeatures(historyInstance)
                    .then((supportedFeatures: string[]) => new Promise<void>(resolve => {
                        // supportedFeatures = ['insert', 'update', 'delete'];

                        this.setState({
                            historyInstances: list,
                            // defaultHistory,
                            historyInstance,
                            supportedFeatures,
                            dateFormat: (config.common.dateFormat || 'dd.MM.yyyy').replace(/D/g, 'd').replace(/Y/g, 'y'),
                        }, () => resolve());
                    }));
            });
    }

    getHistoryInstances() {
        const list: Record<string, any>[] = [];
        const ids: string[] = [];
        this.props.customsInstances.forEach(instance => {
            const instObj = this.props.objects[`system.adapter.${instance}`];
            if (instObj && instObj.common && instObj.common.getHistory) {
                const listObj = { id: instance, alive: false };
                list.push(listObj);
                ids.push(`system.adapter.${instance}.alive`);
            }
        });

        if (ids.length) {
            return this.props.socket.getForeignStates(ids)
                .then((alives: Record<string, any>) => {
                    Object.keys(alives).forEach(id => {
                        const item = list.find(it => id.endsWith(`${it.id}.alive`));
                        if (item) {
                            item.alive = alives[id] && alives[id].val;
                        }
                    });
                    return list;
                });
        }
        return Promise.resolve(list);
    }

    readHistory(start?: number, end?: number) {
        start = start || this.state.start;
        end   = end   || this.state.end;

        if (!this.state.historyInstance) {
            return null;
        }

        this.setState({ loading: true });

        return this.props.socket.getHistory(this.props.obj._id, {
            instance:  this.state.historyInstance,
            start,
            end,
            from:      true,
            ack:       true,
            q:         true,
            addID:     false,
            aggregate: 'none',
            returnNewestEntries: true,
        })
            .then((values: ioBroker.GetHistoryResult) => {
                // merge range and chart
                const chart       = [];
                const range       = this.rangeValues;
                let lcVisible   = false;
                // let qVisible    = false;
                let ackVisible  = false;
                let fromVisible = false;
                // let cVisible    = false;

                // get the very first item
                if (range && range.length && (!values || !values.length || range[0].ts < values[0].ts)) {
                    chart.push(range[0]);
                    chart.push({ ts: range[0].ts + 1, e: true });
                    console.log(`add ${new Date(range[0].ts).toISOString()}: ${range[0].val}`);
                    // if (!qVisible && range[0].q !== undefined) {
                    //     qVisible = true;
                    // }
                    if (!ackVisible && range[0].ack !== undefined) {
                        ackVisible = true;
                    }
                    if (!fromVisible && range[0].from) {
                        fromVisible = true;
                    }
                    // if (!cVisible && range[0].c) {
                    //     cVisible = true;
                    // }
                }

                if (values?.length) {
                    for (let t = 0; t < values.length; t++) {
                        // if range and details are not equal
                        if (values[t] && (!chart.length || chart[chart.length - 1].ts < values[t].ts)) {
                            chart.push(values[t]);
                            if (values[t].from) {
                                if (values[t].from.startsWith('system.adapter.')) {
                                    values[t].from = values[t].from.substring(15);
                                } else if (values[t].from.startsWith('system.host.')) {
                                    values[t].from = values[t].from.substring(7);
                                }
                            }
                            if (!lcVisible && values[t].lc) {
                                lcVisible = true;
                            }
                            // if (!qVisible && values[t].q !== undefined) {
                            //     qVisible = true;
                            // }
                            if (!ackVisible && values[t].ack !== undefined) {
                                ackVisible = true;
                            }
                            if (!fromVisible && values[t].from) {
                                fromVisible = true;
                            }
                            // if (!cVisible && values[t].c) {
                            //     cVisible = true;
                            // }
                            console.log(`add value ${new Date(values[t].ts).toISOString()}: ${values[t].val}`);
                        } else if (chart[chart.length - 1].ts === values[t].ts && chart[chart.length - 1].val !== values[t].ts) {
                            console.error('Strange data!');
                        }
                    }
                } else {
                    chart.push({ noDataForPeriod: true });
                }

                if (!chart.length) {
                    chart.push({ noData: true });
                }

                this.setState({
                    loading: false,
                    values: chart,
                    lcVisible,
                    fromVisible,
                    // qVisible,
                    ackVisible,
                    // cVisible,
                });
            });
    }

    readHistoryRange() {
        const now = new Date();
        const oldest = new Date(2_000, 0, 1);

        this.setState({ loading: true });
        // this is a code that makes problems. It is no good idea doing this!
        return this.props.socket.getHistory(this.props.obj._id, {
            instance:  this.state.historyInstance,
            start:     oldest.getTime(),
            end:       now.getTime(),
            // step:      3600000 * 24 * 30, // monthly
            limit:     1, // is that a way to make it faster?
            from:      false,
            ack:       false,
            q:         false,
            addID:     false,
            aggregate: 'none',
        })
            .then((values: ioBroker.GetHistoryResult) => {
                if (values.length) {
                    // remove interpolated first value
                    if (values[0].val === null || values[0].ts === oldest.getTime()) {
                        values.shift();
                    }
                    // @ts-expect-error mark interpolated
                    values.forEach(it => it.i = true);
                    this.rangeValues = values;
                    this.setState({
                        loading: false,
                    });
                } else {
                    this.rangeValues = [];
                    this.setState({ loading: false });
                }
            });
    }

    onToggleSelect(e: React.KeyboardEvent | React.MouseEvent, ts: number, column: string) {
        let selected = [...this.state.selected];
        const pos = selected.indexOf(ts);
        if (e.shiftKey && this.state.lastSelected) {
            let pps = -1;
            let ppls = -1;
            selected = [];
            for (let i = 0; i < this.state.values.length; i++) {
                if (this.state.values[i].ts === ts) {
                    pps = i;
                    ppls !== pps && selected.push(this.state.values[i].ts);
                    if (pps !== -1 && ppls !== -1) {
                        break;
                    }
                }
                if (this.state.values[i].ts === this.state.lastSelected) {
                    ppls = i;
                    ppls !== pps && selected.push(this.state.values[i].ts);
                    if (pps !== -1 && ppls !== -1) {
                        break;
                    }
                }
                if (pps !== -1 || ppls !== -1) {
                    selected.push(this.state.values[i].ts);
                }
            }
        } else
            if (e.ctrlKey) {
                if (pos !== -1) {
                    selected.splice(pos, 1);
                } else {
                    selected.push(ts);
                }
                selected.sort();
            } else {
                selected = [ts];
            }

        ((window as any)._localStorage || window.localStorage).setItem('App.historyLastSelected', ts.toString());
        ((window as any)._localStorage || window.localStorage).setItem('App.historyLastSelectedColumn', column);
        ((window as any)._localStorage || window.localStorage).setItem('App.historySelected', JSON.stringify(selected));
        this.setState({ selected, lastSelected: ts, lastSelectedColumn: column });
    }

    getTableRows(classes: Record<string, any>) {
        const rows = [];
        for (let r = this.state.values.length - 1; r >= 0; r--) {
            const state = this.state.values[r];
            const ts = state.ts;
            if (state.e) {
                rows.push(<TableRow
                    className={Utils.clsx(classes.row, classes.updatedRow, classes.rowInterpolated)}
                    key={ts}
                    hover
                >
                    <TableCell />
                    <TableCell>...</TableCell>
                    {this.state.ackVisible ? <TableCell /> : null}
                    {this.state.fromVisible ? <TableCell /> : null}
                    {this.state.lcVisible ? <TableCell /> : null}
                </TableRow>);
            } else
                if (state.noData || state.noDataForPeriod) {
                    rows.push(<TableRow
                        className={Utils.clsx(classes.row, classes.updatedRow, classes.rowNoData)}
                        key={state.noData ? 'nodata' : ''}
                        hover
                    >
                        <TableCell />
                        <TableCell>{ state.noData ? this.props.t('No data in history') : this.props.t('No data in history for selected period')}</TableCell>
                        {this.state.ackVisible  ? <TableCell /> : null}
                        {this.state.fromVisible ? <TableCell /> : null}
                        {this.state.lcVisible  ? <TableCell /> : null}
                    </TableRow>);
                } else {
                    const interpolated = state.i;
                    const selected = this.state.lastSelected === ts;
                    let val = state.val;
                    if (this.props.isFloatComma && this.props.obj.common.type === 'number' && val) {
                        val = val.toString().replace('.', ',');
                    }
                    if (val === null) {
                        val = 'null';
                    }
                    if (val === undefined) {
                        val = '_';
                    }
                    const selectedClass = this.state.selected.includes(ts);

                    rows.push(<TableRow
                        className={Utils.clsx(
                            classes.row,
                            classes.updatedRow,
                            interpolated && classes.rowInterpolated,
                            selectedClass && classes.rowSelected,
                        )}
                        key={ts + (state.val || '')}
                    >
                        <TableCell onClick={e => !interpolated && this.onToggleSelect(e, ts, 'ts')}>
                            {`${this.formatTimestamp(state.ts)}`}
                            {selected && this.state.lastSelectedColumn === 'ts' ? <div className={classes.rowFocused} /> : ''}
                        </TableCell>
                        <TableCell onClick={e => !interpolated && this.onToggleSelect(e, ts, 'val')}>
                            {val + this.unit}
                            {selected && this.state.lastSelectedColumn === 'val' ? <div className={classes.rowFocused} /> : ''}
                        </TableCell>
                        {this.state.ackVisible ? <TableCell onClick={e => !interpolated && this.onToggleSelect(e, ts, 'ack')} className={state.ack ? classes.cellAckTrue : classes.cellAckFalse}>
                            {state.ack ? 'true' : 'false' }
                            {selected && this.state.lastSelectedColumn === 'ack' ? <div className={classes.rowFocused} /> : ''}
                        </TableCell> : null}
                        {this.state.fromVisible ? <TableCell onClick={e => !interpolated && this.onToggleSelect(e, ts, 'from')}>
                            {state.from || ''}
                            {selected && this.state.lastSelectedColumn === 'from' ? <div className={classes.rowFocused} /> : ''}
                        </TableCell> : null}
                        {this.state.lcVisible ? <TableCell onClick={e => !interpolated && this.onToggleSelect(e, ts, 'lc')}>
                            {state.lc ? `${new Date(state.lc).toLocaleDateString()} ${new Date(state.lc).toLocaleTimeString()}.${padding3(state.ts % 1000)}` : ''}
                            {selected && this.state.lastSelectedColumn === 'lc' ? <div className={classes.rowFocused} /> : ''}
                        </TableCell> : null}
                    </TableRow>);
                }
        }

        return rows;
    }

    shiftTime() {
        const now = new Date();
        const delay = 60000 - now.getSeconds() - (1000 - now.getMilliseconds());

        if (now.getMilliseconds()) {
            now.setMilliseconds(1000);
        }
        if (now.getSeconds()) {
            now.setSeconds(60);
        }

        const end = now.getTime();
        let start;
        let mins = this.state.relativeRange;

        if (mins === 'day') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            start = now.getTime();
        } else if (mins === 'week') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            // find week start
            const day = now.getDay() || 7;
            if (day !== 1) {
                now.setHours(-24 * (day - 1));
            }
            start = now.getTime();
        } else if (mins === '2weeks') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setDate(now.getDate() - 7); // 1 week earlier

            const day = now.getDay() || 7;
            if (day !== 1) {
                now.setHours(-24 * (day - 1));
            }
            start = now.getTime();
        } else if (mins === 'month') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setDate(1);
            start = now.getTime();
        } else if (mins === 'year') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setDate(1);
            now.setMonth(0);
            start = now.getTime();
        } else if (mins === '12months') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setFullYear(now.getFullYear() - 1);
            start = now.getTime();
        } else {
            mins = parseInt(mins, 10);
            start = end - mins * 60000;
        }

        this.setState({ start, end }, () => this.readHistory());

        this.timeTimer = setTimeout(() => {
            this.timeTimer = undefined;
            this.shiftTime();
        }, delay || 60_000);
    }

    setRelativeInterval(mins: string | number, dontSave?: boolean): void {
        if (!dontSave) {
            ((window as any)._localStorage || window.localStorage).setItem('App.relativeRange', mins);
            this.setState({ relativeRange: mins });
        }
        if (mins === 'absolute') {
            this.timeTimer && clearTimeout(this.timeTimer);
            this.timeTimer = undefined;
            return;
        }
        ((window as any)._localStorage || window.localStorage).removeItem('App.absoluteStart');
        ((window as any)._localStorage || window.localStorage).removeItem('App.absolute');

        const now = new Date();

        if (!this.timeTimer) {
            const delay = 60_000 - now.getSeconds() - (1_000 - now.getMilliseconds());
            this.timeTimer = setTimeout(() => {
                this.timeTimer = undefined;
                this.shiftTime();
            }, delay || 60_000);
        }

        if (now.getMilliseconds()) {
            now.setMilliseconds(1_000);
        }
        if (now.getSeconds()) {
            now.setSeconds(60);
        }

        const end = now.getTime();
        let start;

        if (mins === 'day') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            start = now.getTime();
        } else if (mins === 'week') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);

            const day = now.getDay() || 7;
            if (day !== 1) {
                now.setHours(-24 * (day - 1));
            }

            start = now.getTime();
        } else if (mins === '2weeks') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setDate(now.getDate() - 7); // 1 week earlier

            const day = now.getDay() || 7;
            if (day !== 1) {
                now.setHours(-24 * (day - 1));
            }

            start = now.getTime();
        } else if (mins === 'month') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setDate(1);
            start = now.getTime();
        } else if (mins === 'year') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setDate(1);
            now.setMonth(0);
            start = now.getTime();
        } else if (mins === '12months') {
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setFullYear(now.getFullYear() - 1);
            start = now.getTime();
        } else {
            mins = Number(mins);
            start = end - mins * 60_000;
        }

        this.setState({ start, end }, () =>
            this.readHistory());
    }

    renderTable() {
        if (this.state.values) {
            const { classes } = this.props;

            const initialWidths = [200, 'auto'];
            const minWidths = [190, 100];
            if (this.state.ackVisible) {
                initialWidths.push(50);
                minWidths.push(50);
            }
            if (this.state.fromVisible) {
                initialWidths.push(150);
                minWidths.push(150);
            }
            if (this.state.lcVisible) {
                initialWidths.push(200);
                minWidths.push(190);
            }

            return <TableContainer className={classes.container}>
                {/*
                // @ts-expect-error needs further checking */}
                <TableResize
                    stickyHeader
                    className={classes.table}
                    initialWidths={initialWidths}
                    minWidths={minWidths}
                    dblTitle={this.props.t('ra_Double click to reset table layout')}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.colTs}>
                                {this.props.t('Timestamp')}
                            </TableCell>
                            <TableCell className={classes.colValue}>
                                {this.props.t('Value')}
                            </TableCell>
                            {this.state.ackVisible  ? <TableCell className={classes.colAck}>
                                {this.props.t('Ack')}
                            </TableCell> : null}
                            {this.state.fromVisible ? <TableCell className={classes.colFrom}>
                                {this.props.t('From')}
                            </TableCell> : null}
                            {this.state.lcVisible   ? <TableCell className={classes.colLastChange}>
                                {this.props.t('lc')}
                            </TableCell> : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>{this.getTableRows(classes)}</TableBody>
                </TableResize>
            </TableContainer>;
        }
        return <LinearProgress />;
    }

    renderConfirmDialog() {
        return <Dialog
            open={!!this.state.areYouSure}
            onClose={() => this.setState({ areYouSure: false })}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >

            <DialogTitle id="alert-dialog-title">{ }</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    { this.props.t('Are you sure?') }
                </DialogContentText>
                <FormControlLabel
                    control={<Checkbox value={this.state.suppressMessage} onChange={() => this.setState({ suppressMessage: true })} />}
                    label={this.props.t('Suppress for 5 minutes')}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => this.setState({ areYouSure: false, suppressMessage: this.state.suppressMessage && Date.now() }, () => this.onDelete())}
                    color="primary"
                    autoFocus
                    startIcon={<IconDelete />}
                >
                    { this.props.t('Delete') }
                </Button>
                <Button variant="contained" onClick={() => this.setState({ areYouSure: false })} color="secondary" startIcon={<IconClose />}>{ this.props.t('Cancel') }</Button>
            </DialogActions>
        </Dialog>;
    }

    onDelete() {
        const tasks = this.state.selected.map(ts => ({ state: { ts }, id: this.props.obj._id }));
        this.props.socket.sendTo(this.state.historyInstance, 'delete', tasks)
            .then(() =>
                this.readHistory());
    }

    onUpdate() {
        let val = this.state.edit.val;

        if (this.props.obj.common) {
            if (this.props.obj.common.type === 'number') {
                if (typeof val !== 'number') {
                    val = parseFloat(val.replace(',', '.'));
                }
            } else if (this.props.obj.common.type === 'boolean') {
                val = val === 'true' || val === 'TRUE' || val === true || val === '1' || val === 1;
            }
        }

        const state: ioBroker.SettableState = {
            val,
            ack:  this.state.edit.ack,
            ts:   this.state.selected[0],
            from: `system.adapter.admin.${this.adminInstance}`,
            q:    this.state.edit.q,
        };

        for (const [attr, stateVal] of Object.entries(state)) {
            if (stateVal === undefined) {
                // @ts-expect-error can be fixed later
                delete state[attr];
            }
        }

        if (!this.state.lcVisible && state.lc) {
            delete state.lc;
        }
        this.props.socket.sendTo(this.state.historyInstance, 'update', [{ id: this.props.obj._id, state }])
            .then(() =>
                this.readHistory());
    }

    onInsert() {
        let val = this.state.edit.val;

        if (this.props.obj.common) {
            if (this.props.obj.common.type === 'number') {
                val = parseFloat(val.replace(',', '.'));
            } else if (this.props.obj.common.type === 'boolean') {
                val = val === 'true' || val === 'TRUE' || val === true || val === '1' || val === 1;
            }
        }

        const ts = this.state.edit.date;
        ts.setHours(this.state.edit.time.getHours());
        ts.setMinutes(this.state.edit.time.getMinutes());
        ts.setSeconds(this.state.edit.time.getSeconds());
        ts.setMilliseconds(parseInt(this.state.edit.ms, 10));

        const state: ioBroker.SettableState = {
            ts:   ts.getTime(),
            val,
            ack:  this.state.edit.ack,
            from: `system.adapter.admin.${this.adminInstance}`,
            q:    this.state.edit.q || 0,
        };

        if (!this.state.lcVisible && state.lc) {
            delete state.lc;
        }

        for (const [attr, stateVal] of Object.entries(state)) {
            if (stateVal === undefined) {
                // @ts-expect-error can be fixed later
                delete state[attr];
            }
        }

        this.props.socket.sendTo(this.state.historyInstance, 'insert', [{ id: this.props.obj._id, state }])
            .then(() =>
                this.readHistory());
    }

    updateEdit(name: string, value: any): void {
        const edit = JSON.parse(JSON.stringify(this.state.edit));
        edit.time = new Date(edit.time);
        edit.date = new Date(edit.date);
        edit[name] = value;

        this.setState({ edit });
    }

    renderEditDialog(): React.JSX.Element {
        return <Dialog
            open={this.state.updateOpened || this.state.insertOpened}
            onClose={() => this.setState({ updateOpened: false, insertOpened: false })}
            aria-labelledby="edit-dialog-title"
            aria-describedby="edit-dialog-description"
        >
            <DialogTitle id="edit-dialog-title">{ this.state.updateOpened ? this.props.t('Update entry') : this.props.t('Insert entry') }</DialogTitle>
            <DialogContent>
                <form className={this.props.classes.dialogForm} noValidate autoComplete="off">
                    {typeof this.state.edit.val === 'boolean' ?
                        <FormControlLabel
                            control={<Checkbox
                                checked={this.state.edit.val}
                                onChange={e => this.updateEdit('val', e.target.checked)}
                            />}
                            label={this.props.t('Value')}
                        />
                        :
                        <TextField
                            variant="standard"
                            label={this.props.t('Value')}
                            value={this.state.edit.val}
                            onChange={e => this.updateEdit('val', e.target.value)}
                        />}
                    <br />
                    <FormControlLabel
                        control={<Checkbox
                            checked={this.state.edit.ack}
                            onChange={e => this.updateEdit('ack', e.target.checked)}
                        />}
                        label={this.props.t('Acknowledged')}
                    />

                    {this.state.insertOpened ?
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeMap[this.props.lang]}>
                            <Grid container justifyContent="space-around">
                                <DatePicker
                                    className={this.props.classes.editorDatePicker}
                                    // @ts-expect-error does this really have an effect?
                                    margin="normal"
                                    label={this.props.t('Date')}
                                    // format="fullDate"
                                    inputFormat={this.state.dateFormat}
                                    value={this.state.edit.date}
                                    onChange={date =>
                                        this.updateEdit('date', date)}
                                    renderInput={(params: any) => <TextField className={this.props.classes.timeInput} variant="standard" {...params} />}
                                />
                                <TimePicker
                                    // @ts-expect-error does this really have an effect?
                                    margin="normal"
                                    views={['hours', 'minutes', 'seconds']}
                                    label={this.props.t('Time')}
                                    ampm={false}
                                    format="HH:mm:ss"
                                    className={this.props.classes.editorTimePicker}
                                    value={this.state.edit.time}
                                    onChange={time =>
                                        this.updateEdit('time', time)}
                                    renderInput={(params: any) => <TextField className={this.props.classes.timeInput} variant="standard" {...params} />}
                                />
                                <TextField
                                    variant="standard"
                                    classes={{ root: this.props.classes.msInput }}
                                    label={this.props.t('ms')}
                                    type="number"
                                    inputProps={{ max: 999, min: 0 }}
                                    value={this.state.edit.ms}
                                    onChange={e => this.updateEdit('ms', e.target.value)}
                                />
                            </Grid>
                        </LocalizationProvider> : null}
                </form>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => {
                        const isUpdate = this.state.updateOpened;
                        this.setState({ updateOpened: false, insertOpened: false }, () =>
                            (isUpdate ? this.onUpdate() : this.onInsert()));
                    }}
                    color="primary"
                    autoFocus
                >
                    {this.state.updateOpened ? this.props.t('Update') : this.props.t('Add')}
                </Button>
                {/*
                // @ts-expect-error this color works */}
                <Button variant="contained" onClick={() => this.setState({ updateOpened: false, insertOpened: false })} color="grey">{ this.props.t('Cancel') }</Button>
            </DialogActions>
        </Dialog>;
    }

    setStartDate(startDate: Date): void {
        const start = startDate.getTime();
        if (this.timeTimer) {
            clearTimeout(this.timeTimer);
            this.timeTimer = undefined;
        }
        ((window as any)._localStorage || window.localStorage).setItem('App.relativeRange', 'absolute');
        ((window as any)._localStorage || window.localStorage).setItem('App.absoluteStart', start);
        ((window as any)._localStorage || window.localStorage).setItem('App.absoluteEnd', this.state.end);
        this.setState({ start, relativeRange: 'absolute' }, () => this.readHistory());
    }

    setEndDate(endDate: Date): void {
        const end = endDate.getTime();
        ((window as any)._localStorage || window.localStorage).setItem('App.relativeRange', 'absolute');
        ((window as any)._localStorage || window.localStorage).setItem('App.absoluteStart', this.state.start);
        ((window as any)._localStorage || window.localStorage).setItem('App.absoluteEnd', end);
        if (this.timeTimer) {
            clearTimeout(this.timeTimer);
            this.timeTimer = undefined;
        }
        this.setState({ end, relativeRange: 'absolute'  }, () => this.readHistory());
    }

    renderToolbar() {
        const classes = this.props.classes;
        return <Toolbar>
            <FormControl variant="standard" className={classes.selectHistoryControl}>
                <InputLabel>{this.props.t('History instance')}</InputLabel>
                <Select
                    variant="standard"
                    value={this.state.historyInstance || ''}
                    onChange={e => {
                        const historyInstance = e.target.value;
                        ((window as any)._localStorage || window.localStorage).setItem('App.historyInstance', historyInstance);
                        this.readSupportedFeatures(historyInstance)
                            .then((supportedFeatures: string[]) =>
                                this.setState({ historyInstance, supportedFeatures }, () =>
                                    this.readHistory()));
                    }}
                >
                    {this.state.historyInstances?.map(it => <MenuItem key={it.id} value={it.id} className={Utils.clsx(!it.alive && classes.notAliveInstance)}>{ it.id }</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl variant="standard" className={classes.selectRelativeTime}>
                <InputLabel>{ this.props.t('Relative') }</InputLabel>
                <Select
                    variant="standard"
                    ref={this.rangeRef}
                    value={this.state.relativeRange}
                    onChange={e => this.setRelativeInterval(e.target.value)}
                >
                    <MenuItem key="custom" value="absolute" className={classes.customRange}>{ this.props.t('custom range') }</MenuItem>
                    <MenuItem key="1" value={10}>{ this.props.t('last 10 minutes') }</MenuItem>
                    <MenuItem key="2" value={30}>{ this.props.t('last 30 minutes') }</MenuItem>
                    <MenuItem key="3" value={60}>{ this.props.t('last hour') }</MenuItem>
                    <MenuItem key="4" value="day">{ this.props.t('this day') }</MenuItem>
                    <MenuItem key="5" value={24 * 60}>{ this.props.t('last 24 hours') }</MenuItem>
                    <MenuItem key="6" value="week">{ this.props.t('this week') }</MenuItem>
                    <MenuItem key="7" value={24 * 60 * 7}>{ this.props.t('last week') }</MenuItem>
                    <MenuItem key="8" value="2weeks">{ this.props.t('this 2 weeks') }</MenuItem>
                    <MenuItem key="9" value={24 * 60 * 14}>{ this.props.t('last 2 weeks') }</MenuItem>
                    <MenuItem key="10" value="month">{ this.props.t('this month') }</MenuItem>
                    <MenuItem key="11" value={30 * 24 * 60}>{ this.props.t('last 30 days') }</MenuItem>
                    <MenuItem key="12" value="year">{ this.props.t('this year') }</MenuItem>
                    <MenuItem key="13" value="12months">{ this.props.t('last 12 months') }</MenuItem>
                </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={localeMap[this.props.lang]}>
                <div className={classes.toolbarTimeGrid}>
                    <DatePicker
                        className={classes.toolbarDate}
                        disabled={this.state.relativeRange !== 'absolute'}
                        /*
                        // @ts-expect-error needs further checking */
                        disableToolbar
                        variant="inline"
                        margin="normal"
                        inputFormat={this.state.dateFormat}
                        label={this.props.t('Start date')}
                        value={new Date(this.state.start)}
                        onChange={date => this.setStartDate(date as Date)}
                        renderInput={(params: any) => <TextField className={this.props.classes.dateInput} variant="standard" {...params} />}
                    />
                    <TimePicker
                        disabled={this.state.relativeRange !== 'absolute'}
                        className={classes.toolbarTime}
                        /*
                        // @ts-expect-error needs further checking */
                        margin="normal"
                        ampm={false}
                        label={this.props.t('Start time')}
                        value={new Date(this.state.start)}
                        onChange={date => this.setStartDate(date as Date)}
                        renderInput={(params: any) => <TextField className={this.props.classes.timeInput} variant="standard" {...params} />}
                    />
                </div>
                <div className={classes.toolbarTimeGrid}>

                    <DatePicker
                        disabled={this.state.relativeRange !== 'absolute'}
                        className={classes.toolbarDate}
                        /*
                        // @ts-expect-error needs further checking */
                        disableToolbar
                        inputFormat={this.state.dateFormat}
                        variant="inline"
                        margin="normal"
                        label={this.props.t('End date')}
                        value={new Date(this.state.end)}
                        onChange={date => this.setEndDate(date as Date)}
                        renderInput={(params: any) => <TextField className={this.props.classes.dateInput} variant="standard" {...params} />}
                    />
                    <TimePicker
                        disabled={this.state.relativeRange !== 'absolute'}
                        className={classes.toolbarTime}
                        /*
                        // @ts-expect-error needs further checking */
                        margin="normal"
                        ampm={false}
                        label={this.props.t('End time')}
                        value={new Date(this.state.end)}
                        onChange={date => this.setEndDate(date as Date)}
                        renderInput={(params: any) => <TextField className={this.props.classes.timeInput} variant="standard" {...params} />}
                    />
                </div>
            </LocalizationProvider>
            <div className={classes.grow} />

            {this.state.values?.length ? <IconButton size="large" onClick={() => this.exportData()} title={this.props.t('Save data as csv')}>
                <ExportIcon />
            </IconButton> : null}

            {this.state.supportedFeatures.includes('insert') && this.props.expertMode ? <IconButton
                size="large"
                onClick={() => {
                    const time = new Date();

                    const edit = {
                        ack:  this.state.values[this.state.values.length - 1].ack,
                        val:  this.state.values[this.state.values.length - 1].val,
                        ts:   time,
                        date: new Date(time),
                        ms:   0,
                        time: new Date(time),
                        q:    0,
                    };

                    this.setState({
                        edit,
                        insertOpened: true,
                    });
                }}
            >
                <InsertIcon />
            </IconButton> : null}
            {this.state.supportedFeatures.includes('update') && this.props.expertMode ? <IconButton
                size="large"
                disabled={this.state.selected.length !== 1}
                onClick={() => {
                    const state = JSON.parse(JSON.stringify(this.state.values.find((it: any) => it.ts === this.state.lastSelected)));
                    const time = new Date(state.ts);
                    state.date = new Date(time);
                    state.time = new Date(time);

                    this.setState({
                        edit: state,
                        updateOpened: true,
                    });
                }}
            >
                <IconEdit />
            </IconButton> : null}
            {this.state.supportedFeatures.includes('delete') && this.props.expertMode ? <IconButton
                size="large"
                disabled={!this.state.selected.length}
                onClick={() => {
                    if (typeof this.state.suppressMessage === 'number' && Date.now() - this.state.suppressMessage < 300_000) {
                        this.onDelete();
                    } else {
                        this.setState({ areYouSure: true });
                    }
                }}
            >
                <IconDelete />
            </IconButton> : null}
        </Toolbar>;
    }

    exportData() {
        let element = window.document.getElementById('export-file');
        if (!element) {
            element = document.createElement('a');
            element.setAttribute('id', 'export-file');
            element.style.display = 'none';
            document.body.appendChild(element);
        }

        const lines = ['timestamp;value;acknowledged;from;'];

        this.state.values.forEach((state: any) => !state.i && !state.e &&
            lines.push([
                this.formatTimestamp(state.ts),
                state.val === null || state.val === undefined ? 'null' : state.val.toString(),
                state.ack ? 'true' : 'false',
                state.from || '',
            ].join(';')));

        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(lines.join('\n'))}`);
        // @ts-expect-error check it
        element.setAttribute('download', `${Utils.getObjectName({ [this.props.obj._id]: this.props.obj }, this.props.obj._id, { language: this.props.lang })}.csv`);

        element.click();

        document.body.removeChild(element);
    }

    render() {
        if (!this.state.historyInstances) {
            return <LinearProgress />;
        }

        return <Paper className={this.props.classes.paper}>
            {this.state.loading ? <LinearProgress /> : <div className={this.props.classes.noLoadingProgress} />}
            {this.renderToolbar()}
            <div className={this.props.classes.tableDiv}>
                {this.renderTable()}
            </div>
            {this.renderConfirmDialog()}
            {this.renderEditDialog()}
        </Paper>;
    }

    /**
     * Convert timestamp to human-readable date string
     *
     * @param ts the timestamp
     */
    formatTimestamp(ts: number): string {
        return `${new Date(ts).toLocaleDateString()} ${new Date(ts).toLocaleTimeString()}.${padding3(ts % 1_000)}`;
    }
}

export default withWidth()(withStyles(styles)(ObjectHistoryData));
