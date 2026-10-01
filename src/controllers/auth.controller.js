import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

const setAuthCookies = (res, tokens) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const { user, tokens } = await AuthService.register(req.body);
    setAuthCookies(res, tokens);
    return sendSuccess(res, 'User registered successfully', { user, token: tokens.accessToken }, 201);
  });

  static login = asyncHandler(async (req, res) => {
    const { user, tokens } = await AuthService.login(req.body);
    setAuthCookies(res, tokens);
    return sendSuccess(res, 'Logged in successfully', { user, token: tokens.accessToken });
  });

  static logout = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return sendSuccess(res, 'Logged out successfully');
  });

  static getMe = asyncHandler(async (req, res) => {
    return sendSuccess(res, 'User session fetched', { user: req.user });
  });
}
