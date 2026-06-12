export default function requestLogger(req, res, next) {
    const t = new Date().toISOString().slice(11, 19);
    res.on('finish', () => {
        // eslint-disable-next-line no-console
        console.log(`[${t}] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    });
    next();
}
