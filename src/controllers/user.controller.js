import { UserService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class UserController {
  static getProfile = asyncHandler(async (req, res) => {
    return sendSuccess(res, 'Profile fetched successfully', { user: req.user });
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await UserService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, 'Profile updated successfully', { user: updatedUser });
  });

  static getAddresses = asyncHandler(async (req, res) => {
    const addresses = await UserService.getAddresses(req.user._id);
    return sendSuccess(res, 'Addresses fetched successfully', { addresses });
  });

  static addAddress = asyncHandler(async (req, res) => {
    const address = await UserService.addAddress(req.user._id, req.body);
    return sendSuccess(res, 'Address created successfully', { address }, 201);
  });

  static deleteAddress = asyncHandler(async (req, res) => {
    await UserService.deleteAddress(req.params.id, req.user._id);
    return sendSuccess(res, 'Address deleted successfully');
  });
}
