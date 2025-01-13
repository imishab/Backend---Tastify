const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User'); // Import the User model

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try to find the user as an Admin or a regular User
            const admin = await Admin.findById(decoded.id).select('-password');
            const user = await User.findById(decoded.id).select('-password');

            if (admin) {
                req.admin = admin; // Attach the admin details to req
            } else if (user) {
                req.user = user; // Attach the user details to req
            } else {
                return res.status(401).json({ message: 'Not authorized, invalid user' });
            }

            next();
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
