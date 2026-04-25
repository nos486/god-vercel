const http = require('http');
const httpProxy = require('http-proxy');

// تغییر مهم: http به https تبدیل شد
const TARGET_SERVER = 'https://94.130.78.75:443';

// ساخت سرور پروکسی
const proxy = httpProxy.createProxyServer({
    target: TARGET_SERVER,
    changeOrigin: true,
    secure: false, // این باید حتما false باشد تا ورسل به نداشتن گواهی SSL روی IP مستقیم گیر ندهد
    ws: true
});

// مدیریت خطاها
proxy.on('error', function (err, req, res) {
    console.error('Proxy Error:', err.message);
    if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end('Bad Gateway: Unable to reach the backend server.');
});

// ایجاد سرور وب
const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

// مدیریت ارتقاء پروتکل (Upgrade)
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Vercel xHTTP Proxy is running on port ${PORT}`);
});
