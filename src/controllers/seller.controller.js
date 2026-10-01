import { SellerService } from '../services/seller.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class SellerController {
  static onboard = asyncHandler(async (req, res) => {
    const profile = await SellerService.onboardSeller(req.user._id, req.body);
    return sendSuccess(res, 'Seller onboarded successfully', { profile }, 201);
  });

  static getProfile = asyncHandler(async (req, res) => {
    const profile = await SellerService.getSellerProfile(req.user._id);
    return sendSuccess(res, 'Seller profile fetched', { profile });
  });

  static createListing = asyncHandler(async (req, res) => {
    const listing = await SellerService.createListing(req.user._id, req.body);
    return sendSuccess(res, 'Listing created successfully', { listing }, 201);
  });

  static getListings = asyncHandler(async (req, res) => {
    const result = await SellerService.getSellerListings(req.user._id, req.query);
    return sendSuccess(res, 'Seller listings fetched', result);
  });

  static updateListing = asyncHandler(async (req, res) => {
    const listing = await SellerService.updateListing(req.user._id, req.params.id, req.body);
    return sendSuccess(res, 'Listing updated successfully', { listing });
  });

  static deleteListing = asyncHandler(async (req, res) => {
    await SellerService.deleteListing(req.user._id, req.params.id);
    return sendSuccess(res, 'Listing deactivated successfully');
  });

  static getSales = asyncHandler(async (req, res) => {
    const result = await SellerService.getSellerSales(req.user._id, req.query);
    return sendSuccess(res, 'Seller sales fetched successfully', result);
  });
}
