import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';
import { AppError } from '../utils/AppError.js';
import { UserDAO } from '../dao/user.dao.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await UserDAO.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError('The user belonging to this token no longer exists or is deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new AppError('Unauthorized access', 401));
    }

    const hasPermission = allowedRoles.some(role => req.user.roles.includes(role));
    if (!hasPermission) {
      return next(new AppError(`Forbidden: Requires one of [${allowedRoles.join(', ')}] roles`, 403));
    }

    next();
  };
};
