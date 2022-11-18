/// <reference types="node" />
import * as http from 'node:http';
declare const uiemit: (action: any) => void;
declare const getServer: (dispatcher: any, onConnect: any) => http.Server;
export { getServer, uiemit };
