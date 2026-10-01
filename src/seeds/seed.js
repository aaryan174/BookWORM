import mongoose from 'mongoose';
import { config } from '../config/env.config.js';
import { User } from '../models/user.model.js';
import { Book } from '../models/book.model.js';
import { SellerProfile } from '../models/sellerProfile.model.js';
import { Listing } from '../models/listing.model.js';
import { Address } from '../models/address.model.js';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(config.mongoUri);

    console.log('[Seed] Clearing existing collection data...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      SellerProfile.deleteMany({}),
      Listing.deleteMany({}),
      Address.deleteMany({})
    ]);

    console.log('[Seed] Seeding initial Users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@bookworm.com',
      passwordHash: 'Admin@123456',
      roles: ['buyer', 'seller', 'admin'],
      phone: '+91 9876543210'
    });

    const sellerUser = await User.create({
      name: 'Classic Books India',
      email: 'classicbooks@gmail.com',
      passwordHash: 'Seller@123456',
      roles: ['buyer', 'seller'],
      phone: '+91 9123456789'
    });

    const buyerUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@gmail.com',
      passwordHash: 'Buyer@123456',
      roles: ['buyer'],
      phone: '+91 9988776655'
    });

    console.log('[Seed] Creating Seller Profiles...');
    await SellerProfile.create({
      userId: sellerUser._id,
      storeName: 'Classic Book Bazaar',
      description: 'Purveyors of rare, vintage, and new classical literature.',
      gstin: '07AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      rating: 4.8,
      isVerified: true,
      status: 'ACTIVE'
    });

    await SellerProfile.create({
      userId: adminUser._id,
      storeName: 'Official BookWORM Direct',
      description: 'Official platform publisher direct store.',
      rating: 5.0,
      isVerified: true,
      status: 'ACTIVE'
    });

    console.log('[Seed] Creating Delivery Addresses...');
    await Address.create({
      userId: buyerUser._id,
      fullName: 'Aarav Sharma',
      streetAddress: 'Flat 402, Lotus Apartments, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      phone: '+91 9988776655',
      isDefault: true
    });

    console.log('[Seed] Creating Canonical Book Catalog...');
    const booksData = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        subtitle: 'Refactoring, Patterns, and Practices',
        authors: ['Robert C. Martin'],
        isbn10: '0132350882',
        isbn13: '9780132350884',
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
        category: 'Technology',
        genre: 'Software Engineering',
        publisher: 'Prentice Hall',
        publicationDate: new Date('2008-08-11'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
        averageRating: 4.7,
        reviewCount: 15
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        authors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
        isbn10: '0201633612',
        isbn13: '9780201633610',
        description: 'Capturing a wealth of experience about the design of object-oriented software by four top-caliber designers.',
        category: 'Technology',
        genre: 'Software Architecture',
        publisher: 'Addison-Wesley Professional',
        publicationDate: new Date('1994-11-10'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        averageRating: 4.9,
        reviewCount: 28
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        subtitle: '20th Anniversary Edition',
        authors: ['David Thomas', 'Andrew Hunt'],
        isbn10: '0135957052',
        isbn13: '9780135957059',
        description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development.',
        category: 'Technology',
        genre: 'Software Engineering',
        publisher: 'Addison-Wesley Professional',
        publicationDate: new Date('2019-09-13'),
        edition: '2nd Edition',
        language: 'English',
        coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
        averageRating: 4.8,
        reviewCount: 42
      },
      {
        title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
        authors: ['James Clear'],
        isbn10: '0735211299',
        isbn13: '9780735211292',
        description: 'Tiny Changes, Remarkable Results. No matter your goals, Atomic Habits offers a proven framework for improving every day.',
        category: 'Self-Help',
        genre: 'Personal Growth',
        publisher: 'Avery',
        publicationDate: new Date('2018-10-16'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
        averageRating: 4.9,
        reviewCount: 150
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        authors: ['Yuval Noah Harari'],
        isbn10: '0062316095',
        isbn13: '9780062316097',
        description: '100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens.',
        category: 'History',
        genre: 'Non-fiction',
        publisher: 'Harper',
        publicationDate: new Date('2015-02-10'),
        edition: 'Reprint',
        language: 'English',
        coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
        averageRating: 4.6,
        reviewCount: 95
      }
    ];

    const insertedBooks = await Book.insertMany(booksData);

    console.log('[Seed] Creating Multi-Seller Book Listings...');
    const listingsData = [
      {
        bookId: insertedBooks[0]._id, // Clean Code
        sellerId: sellerUser._id,
        condition: 'NEW',
        format: 'PAPERBACK',
        price: 699,
        stockQuantity: 10,
        descriptionNotes: 'Brand new pristine copy direct from distributor.',
        status: 'ACTIVE'
      },
      {
        bookId: insertedBooks[0]._id, // Clean Code (Second seller listing!)
        sellerId: adminUser._id,
        condition: 'LIKE_NEW',
        format: 'PAPERBACK',
        price: 599,
        stockQuantity: 3,
        descriptionNotes: 'Gently read once, no highlighting or markups.',
        status: 'ACTIVE'
      },
      {
        bookId: insertedBooks[1]._id, // Design Patterns
        sellerId: sellerUser._id,
        condition: 'NEW',
        format: 'HARDCOVER',
        price: 899,
        stockQuantity: 8,
        descriptionNotes: 'Hardcover collector edition.',
        status: 'ACTIVE'
      },
      {
        bookId: insertedBooks[2]._id, // Pragmatic Programmer
        sellerId: sellerUser._id,
        condition: 'VERY_GOOD',
        format: 'PAPERBACK',
        price: 749,
        stockQuantity: 5,
        descriptionNotes: 'Great condition 20th Anniversary edition.',
        status: 'ACTIVE'
      },
      {
        bookId: insertedBooks[3]._id, // Atomic Habits
        sellerId: adminUser._id,
        condition: 'NEW',
        format: 'PAPERBACK',
        price: 499,
        stockQuantity: 25,
        descriptionNotes: 'Best-seller fresh stock.',
        status: 'ACTIVE'
      },
      {
        bookId: insertedBooks[4]._id, // Sapiens
        sellerId: sellerUser._id,
        condition: 'GOOD',
        format: 'PAPERBACK',
        price: 399,
        stockQuantity: 7,
        descriptionNotes: 'Minor shelf wear on spine, clean pages.',
        status: 'ACTIVE'
      }
    ];

    await Listing.insertMany(listingsData);

    console.log('=======================================================');
    console.log('✅ Database seeded successfully!');
    console.log('-------------------------------------------------------');
    console.log('Credentials:');
    console.log('👤 Admin Account:  admin@bookworm.com / Admin@123456');
    console.log('🏪 Seller Account: classicbooks@gmail.com / Seller@123456');
    console.log('🛒 Buyer Account:  aarav@gmail.com / Buyer@123456');
    console.log('=======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedData();
