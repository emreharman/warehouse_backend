// middlewares/role.middleware.js

// Roller: ['admin', 'editor', 'viewer']
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ message: 'Bu işlemi yapmaya yetkiniz yok' });
      }
      next();
    };
  };
  
  module.exports = { authorizeRoles };
  