const http = require('http');
const httpProxy = require('http-proxy');

// تنظیمات سرور مقصد شما
const TARGET_SERVER = 'http://94.130.78.75:443';

const proxy = httpProxy.createProxyServer({
    target: TARGET_SERVER,
    ws: true, // برای حمایت از WebSocket در صورت نیاز
    changeOrigin: true,
    secure: false // چون احتمالا روی IP مستقیم SSL نداری این رو false گذاشتم
});

const server = http.createServer((req, res) => {
    // هدایت ترافیک xHTTP (که در واقع همان درخواست‌های HTTP است)
    proxy.web(req, res);
});

// برای حمایت از آپگرید پروتکل (مهم برای پایداری xHTTP)
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

// مانیتور کردن خطاها برای جلوگیری از داون شدن سرویس ورسل
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err);
    if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('Something went wrong.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Vercel Bridge is running for ${TARGET_SERVER}`);
});
