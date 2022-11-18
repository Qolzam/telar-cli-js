import { Log } from './pkg/common/types';
export declare const info: (title: string, message: string) => string;
export declare const error: (title: string, message: string) => string;
export declare const warn: (title: string, message: string) => string;
export declare const logger: (type: Log, title: string, message: string) => void;
