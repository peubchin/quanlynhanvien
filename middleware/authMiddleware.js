const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.flash('error', 'Vui lòng đăng nhập');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        // res.status(401).json({ message: 'Token is not valid' });
        req.flash('error', 'Vui lòng đăng nhập');
        res.redirect('/login');
    }
};

module.exports = authMiddleware;