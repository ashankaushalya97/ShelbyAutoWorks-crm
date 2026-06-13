const requireRole = (roles) => (req, res, next) => {
  const userRole = req.admin?.role;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Access denied. Insufficient permissions.',
    });
  }
  next();
};

module.exports = requireRole;
