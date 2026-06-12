import userModel from '../models/user.js';

export function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    userModel.findUserById(req.session.userId)
        .then((user) => {
            if (!user) {
                req.session.destroy(() => {});
                return res.status(401).json({ error: 'Session invalid. Please log in again.' });
            }
            req.user = user;
            next();
        })
        .catch(next);
}

export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: `This action requires a ${role} account.` });
        }
        next();
    };
}
