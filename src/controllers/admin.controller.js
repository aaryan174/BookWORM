import { AdminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class AdminController {
  static getUsers = asyncHandler(async (req, res) => {
    const result = await AdminService.getUsers(req.query);
    return sendSuccess(res, 'Users fetched successfully', result);
  });

  static updateUserRoles = asyncHandler(async (req, res) => {
    const user = await AdminService.updateUserRoles(req.params.id, req.body.roles);
    return sendSuccess(res, 'User roles updated successfully', { user });
  });

  static getAnalytics = asyncHandler(async (req, res) => {
    const analytics = await AdminService.getPlatformAnalytics();
    return sendSuccess(res, 'Platform analytics fetched successfully', { analytics });
  });
}
