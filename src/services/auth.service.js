import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/user.dao.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/env.config.js';

export class AuthService {
  static generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      roles: user.roles
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn
    });

    return { accessToken, refreshToken };
  }

  static async register({ name, email, password }) {
    const existingUser = await UserDAO.findByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await UserDAO.create({
      name,
      email,
      passwordHash: password,
      roles: ['buyer']
    });

    const tokens = this.generateTokens(user);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return { user: userObj, tokens };
  }

  static async login({ email, password }) {
    const user = await UserDAO.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = this.generateTokens(user);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return { user: userObj, tokens };
  }
}
