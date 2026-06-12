export default function errorHandler(err, _req, res, _next) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
}
