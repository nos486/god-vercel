const http = require('http');
const httpProxy = require('http-proxy');

const TARGET_SERVER = 'https://94.130.78.75:443';

const proxy = httpProxy.createProxyServer({
    target: TARGET_SERVER,
    changeOrigin: true,
    secure: false,
    ws: true
});

proxy.on('error', function (err, req, res) {
    console.error('Proxy Error:', err.message);
    if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end('Bad Gateway: Unable to reach the backend server.');
});

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Vercel xHTTP Proxy is running on port ${PORT}`);
});
