export interface StackFile {
    provider: Provider;
    functions: Record<string, StackFunction>;
}
export interface Provider {
    name: string;
}
export interface StackFunction {
    bootstrap: string;
    environment: Record<string, string>;
    environment_file: string[];
    secret_file: string[];
}
export interface SyncStackFile {
    provider: Provider;
    functions: Record<string, SyncStackFunction>;
}
export interface SyncStackFunction {
    bootstrap: string;
    environment: Record<string, string>;
    secret: Record<string, string>;
}
export declare type ServiceStatus = 'inactive' | 'active';
export declare type ServiceMeta = Array<{
    type: 'link' | 'text';
    label: string;
    value: string;
}>;
export declare type Log = 'info' | 'warn' | 'error';
export declare type Logger = (type: Log, title: string, message: string) => void;
