"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiemit = exports.getServer = void 0;
const express = require("express");
const app = express();
const http = require("node:http");
const socket_io_1 = require("socket.io");
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    },
});
const uiemit = (action) => {
    io.sockets.emit('dispatch', action);
};
exports.uiemit = uiemit;
const getServer = (dispatcher, onConnect) => {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });
    io.on('connection', socket => {
        console.log('a user connected');
        onConnect();
        socket.on('dispatch', msg => {
            console.log('Action from UI: ' + JSON.stringify(msg));
            dispatcher(msg);
        });
    });
    return server;
};
exports.getServer = getServer;
