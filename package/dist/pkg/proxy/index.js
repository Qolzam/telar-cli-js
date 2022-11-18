"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxy = void 0;
const http_1 = require("http");
const http_proxy_1 = require("http-proxy");
const proxyServer = (0, http_proxy_1.createProxyServer)({});
const proxy = async (port, target) => {
    (0, http_1.createServer)(function (req, res) {
        proxyServer.web(req, res, { target });
    }).listen(port, () => {
        console.log("Proxy is running on port " + port);
    });
};
exports.proxy = proxy;
