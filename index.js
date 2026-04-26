// به Vercel می‌گوییم که این کد را روی محیط سبک Edge اجرا کند نه Node.js
export const config = {
    runtime: 'edge',
};

// آدرس سرور آلمان شما
const TARGET_SERVER = 'https://94.130.78.75:443';

export default async function handler(req) {
    try {
        // خواندن مسیری که کلاینت درخواست داده
        const url = new URL(req.url);
        const targetUrl = new URL(url.pathname + url.search, TARGET_SERVER);

        // کپی کردن هدرهای کلاینت برای ارسال به سرور
        const headers = new Headers(req.headers);
        
        // پاک کردن هدرهایی که باعث اختلال در پراکسی می‌شوند
        headers.delete('host');
        headers.delete('x-forwarded-host');
        headers.delete('x-forwarded-proto');
        headers.delete('x-real-ip');

        // تنظیمات درخواست به سمت سرور هتزنر
        const requestOptions = {
            method: req.method,
            headers: headers,
            redirect: 'manual',
            // این خط طلایی است: به ورسل اجازه می‌دهد دیتا را بدون صبر کردن استریم کند
            duplex: 'half', 
        };

        // اگر درخواست دارای بدنه (Body) بود (مثل ترافیک xHTTP)، آن را اضافه کن
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            requestOptions.body = req.body;
        }

        // ارسال درخواست خام به سرور آلمان
        const response = await fetch(targetUrl, requestOptions);

        // برگرداندن پاسخ سرور به کلاینت (گوشی شما)
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });

    } catch (err) {
        console.error('Edge Proxy Error:', err);
        return new Response('Bad Gateway', { status: 502 });
    }
}
