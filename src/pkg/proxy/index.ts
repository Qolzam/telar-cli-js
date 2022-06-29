import { createServer } from "http";
import { createProxyServer } from "http-proxy";
const proxyServer = createProxyServer({});

export const proxy = async (port: string, target: string) => {
  createServer(function (req, res) {
    proxyServer.web(req, res, { target });
  }).listen(port, () => {
    console.log("Proxy is running on port " + port);
  });
};
