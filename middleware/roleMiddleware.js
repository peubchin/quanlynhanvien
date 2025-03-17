const roleMiddleware = (roles) => {
return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        req.flash('error', 'Không có quyền truy cập');
        return res.redirect('/list'); // Chuyển hướng về trang chủ hoặc trang khác
    }
    next();
};
};
module.exports = roleMiddleware;