"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.warn = exports.error = exports.info = void 0;
const kleur = require("kleur");
const dayjs = require("dayjs");
const server_1 = require("./pkg/web-solutions/server");
const actions_1 = require("./pkg/web-solutions/actions");
const info = (title, message) => {
    return `[${dayjs().format('YYYY.MM.DDTHH:mm:ss')}]${kleur.yellow('[INFO]')}[${kleur.green(title)}] ${message}`;
};
exports.info = info;
const error = (title, message) => {
    return `[${dayjs().format('YYYY.MM.DDTHH:mm:ss')}]${kleur.red('[ERROR]')}[${kleur.green(title)}] ${message}`;
};
exports.error = error;
const warn = (title, message) => {
    return `[${dayjs().format('YYYY.MM.DDTHH:mm:ss')}]${kleur.bgYellow('[WARN]')}[${kleur.green(title)}] ${message}`;
};
exports.warn = warn;
// log for CLI and emit to UI
const logger = (type, title, message) => {
    switch (type) {
        case 'info':
            console.log((0, exports.info)(title, message));
            (0, server_1.uiemit)({
                type: actions_1.ADD_APP_LOG,
                payload: {
                    type,
                    title,
                    message,
                },
            });
            break;
        case 'error':
            console.log((0, exports.error)(title, message));
            (0, server_1.uiemit)({
                type: actions_1.ADD_APP_LOG,
                payload: {
                    type,
                    title,
                    message,
                },
            });
            break;
        case 'warn':
            console.log((0, exports.warn)(title, message));
            (0, server_1.uiemit)({
                type: actions_1.ADD_APP_LOG,
                payload: {
                    type,
                    title,
                    message,
                },
            });
            break;
        default:
            break;
    }
};
exports.logger = logger;
