import { Listing } from '../models/listing.model.js';

export class ListingDAO {
  static async findById(id) {
    return await Listing.findById(id).populate('bookId').populate('sellerId', 'name email');
  }

  static async findActiveByBookId(bookId) {
    return await Listing.find({ bookId, status: 'ACTIVE', stockQuantity: { $gt: 0 } })
      .populate('sellerId', 'name email')
      .sort({ price: 1 });
  }

  static async findBySellerId(sellerId, { page = 1, limit = 20, status }) {
    const filter = { sellerId };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(filter).populate('bookId').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.countDocuments(filter)
    ]);

    return { listings, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async create(listingData) {
    return await Listing.create(listingData);
  }

  static async updateById(id, sellerId, updateData) {
    return await Listing.findOneAndUpdate({ _id: id, sellerId }, updateData, { new: true, runValidators: true });
  }

  static async deleteById(id, sellerId) {
    return await Listing.findOneAndUpdate({ _id: id, sellerId }, { status: 'INACTIVE' }, { new: true });
  }

  // Atomic stock reservation concurrency check
  static async reserveStock(listingId, quantity) {
    const listing = await Listing.findOneAndUpdate(
      { _id: listingId, stockQuantity: { $gte: quantity }, status: 'ACTIVE' },
      { $inc: { stockQuantity: -quantity } },
      { new: true }
    );

    if (listing && listing.stockQuantity === 0) {
      await Listing.findByIdAndUpdate(listingId, { status: 'SOLD_OUT' });
    }

    return listing;
  }

  // Stock release function for cancelled/failed payments
  static async releaseStock(listingId, quantity) {
    return await Listing.findByIdAndUpdate(
      listingId,
      {
        $inc: { stockQuantity: quantity },
        $set: { status: 'ACTIVE' }
      },
      { new: true }
    );
  }
}
