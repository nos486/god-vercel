const http = require('http');
const httpProxy = require('http-proxy');

// آدرس و پورت سرور شما در اینجا تنظیم شده است
const TARGET_SERVER = 'http://94.130.78.75:443';

// ساخت سرور پروکسی
const proxy = httpProxy.createProxyServer({
    target: TARGET_SERVER,
    changeOrigin: true,
    secure: false, // چون ترافیک مستقیم به IP می‌رود و SSL دامنه ندارد
    ws: true       // فعال‌سازی پشتیبانی از سوکت‌ها
});

// مدیریت خطاها برای اینکه Vercel در صورت قطعی سرور شما، کرش نکند
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

// مدیریت ارتقاء پروتکل (Upgrade) برای پایداری بیشتر ارتباطات
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

// گوش دادن به پورتی که Vercel اختصاص می‌دهد
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Vercel xHTTP Proxy is running on port ${PORT}`);
    console.log(`Forwarding traffic to ${TARGET_SERVER}`);
});
