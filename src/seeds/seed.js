import dns from 'dns';
import mongoose from 'mongoose';
import { config } from '../config/env.config.js';
import { User } from '../models/user.model.js';
import { Book } from '../models/book.model.js';
import { SellerProfile } from '../models/sellerProfile.model.js';
import { Listing } from '../models/listing.model.js';
import { Address } from '../models/address.model.js';

// Avoid querySrv ECONNREFUSED on Windows / router DNS resolvers with MongoDB Atlas SRV URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[Database] Failed to override DNS servers:', e.message);
}

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB database...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected successfully.');

    // 1. Ensure or find Admin User
    let adminUser = await User.findOne({ email: 'admin@bookworm.com' });
    if (!adminUser) {
      console.log('[Seed] Creating admin user (admin@bookworm.com)...');
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@bookworm.com',
        passwordHash: 'Admin@123456',
        roles: ['buyer', 'seller', 'admin'],
        phone: '+91 9876543210'
      });
    }

    // 2. Ensure or find Primary Seller User
    let sellerUser = await User.findOne({ email: 'classicbooks@gmail.com' });
    if (!sellerUser) {
      console.log('[Seed] Creating seller user (classicbooks@gmail.com)...');
      sellerUser = await User.create({
        name: 'Classic Books India',
        email: 'classicbooks@gmail.com',
        passwordHash: 'Seller@123456',
        roles: ['buyer', 'seller'],
        phone: '+91 9123456789'
      });
    }

    // 3. Ensure or find Primary Buyer User
    let buyerUser = await User.findOne({ email: 'aarav@gmail.com' });
    if (!buyerUser) {
      console.log('[Seed] Creating buyer user (aarav@gmail.com)...');
      buyerUser = await User.create({
        name: 'Aarav Sharma',
        email: 'aarav@gmail.com',
        passwordHash: 'Buyer@123456',
        roles: ['buyer'],
        phone: '+91 9988776655'
      });
    }

    // 4. Find existing user Aryan (if exists) so we can populate their seller store
    const userAryan = await User.findOne({ email: 'aryan007lko@gmail.com' });
    if (userAryan) {
      console.log('[Seed] Found active developer/seller user: aryan007lko@gmail.com');
      if (!userAryan.roles.includes('seller')) {
        userAryan.roles.push('seller');
        await userAryan.save();
      }
    }

    // 5. Ensure Seller Profiles
    await SellerProfile.findOneAndUpdate(
      { userId: sellerUser._id },
      {
        storeName: 'Classic Book Bazaar',
        description: 'Purveyors of rare, vintage, and new classical literature and engineering treatises.',
        gstin: '07AAAAA0000A1Z5',
        panNumber: 'ABCDE1234F',
        rating: 4.8,
        isVerified: true,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    await SellerProfile.findOneAndUpdate(
      { userId: adminUser._id },
      {
        storeName: 'Official BookWORM Direct',
        description: 'Official platform publisher direct store with guaranteed archival imprints.',
        rating: 5.0,
        isVerified: true,
        status: 'ACTIVE'
      },
      { upsert: true, new: true }
    );

    if (userAryan) {
      await SellerProfile.findOneAndUpdate(
        { userId: userAryan._id },
        {
          storeName: 'Punk Hazard',
          description: 'Curated premium books and collector editions direct from certified stock.',
          gstin: '23AAAAA1234A1Z1',
          panNumber: 'ASDF2345E',
          rating: 4.9,
          isVerified: true,
          status: 'ACTIVE'
        },
        { upsert: true, new: true }
      );
    }

    // 6. Ensure default address for testing checkout
    await Address.findOneAndUpdate(
      { userId: buyerUser._id },
      {
        fullName: 'Aarav Sharma',
        streetAddress: 'Flat 402, Lotus Apartments, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        phone: '+91 9988776655',
        isDefault: true
      },
      { upsert: true, new: true }
    );

    if (userAryan) {
      const aryanAddr = await Address.findOne({ userId: userAryan._id });
      if (!aryanAddr) {
        await Address.create({
          userId: userAryan._id,
          fullName: userAryan.name || 'Aryan',
          streetAddress: '12 Heritage Boulevard, Gomti Nagar',
          city: 'Lucknow',
          state: 'Uttar Pradesh',
          postalCode: '226010',
          country: 'India',
          phone: '+91 9876543210',
          isDefault: true
        });
      }
    }

    // 7. Remove obsolete placeholder test book
    const testBook = await Book.findOne({ title: 'test', isbn13: '2345678765431' });
    if (testBook) {
      await Listing.deleteMany({ bookId: testBook._id });
      await Book.deleteOne({ _id: testBook._id });
      console.log('[Seed] Removed obsolete placeholder test book.');
    }

    // 8. Canonical Books Catalog (18 books across Technology, Self-Help, Fiction, History, Science, Business)
    const booksCatalog = [
      // === TECHNOLOGY ===
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        subtitle: 'Refactoring, Patterns, and Practices',
        authors: ['Robert C. Martin'],
        isbn10: '0132350882',
        isbn13: '9780132350884',
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. This book offers pragmatic advice on writing clean, readable, and maintainable software.',
        category: 'Technology',
        genre: 'Software Engineering',
        publisher: 'Prentice Hall',
        publicationDate: new Date('2008-08-11'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
        averageRating: 4.7,
        reviewCount: 38
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        subtitle: '20th Anniversary Edition',
        authors: ['David Thomas', 'Andrew Hunt'],
        isbn10: '0135957052',
        isbn13: '9780135957059',
        description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process of transforming requirements into maintainable software.',
        category: 'Technology',
        genre: 'Software Engineering',
        publisher: 'Addison-Wesley Professional',
        publicationDate: new Date('2019-09-13'),
        edition: '2nd Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
        averageRating: 4.9,
        reviewCount: 52
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        authors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
        isbn10: '0201633612',
        isbn13: '9780201633610',
        description: 'Capturing a wealth of experience about the design of object-oriented software by four top-caliber designers. Presents 23 fundamental patterns of system design.',
        category: 'Technology',
        genre: 'Software Architecture',
        publisher: 'Addison-Wesley Professional',
        publicationDate: new Date('1994-11-10'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
        averageRating: 4.8,
        reviewCount: 44
      },
      {
        title: 'Designing Data-Intensive Applications',
        subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
        authors: ['Martin Kleppmann'],
        isbn10: '1449373321',
        isbn13: '9781449373320',
        description: 'Data is at the center of many challenges in system design today. Martin Kleppmann helps navigate the diverse landscape of databases, stream processing, and distributed consistency.',
        category: 'Technology',
        genre: 'Distributed Systems',
        publisher: 'O\'Reilly Media',
        publicationDate: new Date('2017-04-02'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg',
        averageRating: 4.9,
        reviewCount: 67
      },

      // === SELF-HELP ===
      {
        title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
        authors: ['James Clear'],
        isbn10: '0735211299',
        isbn13: '9780735211292',
        description: 'Tiny Changes, Remarkable Results. No matter your goals, Atomic Habits offers a proven framework for improving every day from one of the world\'s leading experts on habit formation.',
        category: 'Self-Help',
        genre: 'Personal Growth',
        publisher: 'Avery',
        publicationDate: new Date('2018-10-16'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        averageRating: 4.9,
        reviewCount: 156
      },
      {
        title: 'Deep Work: Rules for Focused Success in a Distracted World',
        authors: ['Cal Newport'],
        isbn10: '1455586692',
        isbn13: '9781455586691',
        description: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It empowers you to master complicated skills rapidly and produce extraordinary results.',
        category: 'Self-Help',
        genre: 'Productivity',
        publisher: 'Grand Central Publishing',
        publicationDate: new Date('2016-01-05'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
        averageRating: 4.7,
        reviewCount: 82
      },
      {
        title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
        authors: ['Morgan Housel'],
        isbn10: '0857197681',
        isbn13: '9780857197689',
        description: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. Morgan Housel shares 19 short stories exploring the strange ways people think about money.',
        category: 'Self-Help',
        genre: 'Finance & Psychology',
        publisher: 'Harriman House',
        publicationDate: new Date('2020-09-08'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
        averageRating: 4.8,
        reviewCount: 95
      },

      // === FICTION ===
      {
        title: '1984',
        authors: ['George Orwell'],
        isbn10: '0451524934',
        isbn13: '9780451524935',
        description: 'George Orwell\'s terrifying masterpiece depicts a totalitarian society where Winston Smith struggles against Big Brother, omnipresent surveillance, and historical revisionism.',
        category: 'Fiction',
        genre: 'Dystopian Classic',
        publisher: 'Signet Classic',
        publicationDate: new Date('1950-07-01'),
        edition: 'Collector Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        averageRating: 4.8,
        reviewCount: 120
      },
      {
        title: 'To Kill a Mockingbird',
        authors: ['Harper Lee'],
        isbn10: '0061120081',
        isbn13: '9780061120084',
        description: 'The unforgettable novel of childhood in a sleepy Southern town and the crisis of conscience that rocked it, exploring compassion, racial injustice, and courage.',
        category: 'Fiction',
        genre: 'Literary Drama',
        publisher: 'Harper Perennial Modern Classics',
        publicationDate: new Date('2006-05-23'),
        edition: '50th Anniversary Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
        averageRating: 4.9,
        reviewCount: 110
      },
      {
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        isbn10: '0743273567',
        isbn13: '9780743273565',
        description: 'The quintessential novel of the Jazz Age, telling the tragic story of Jay Gatsby and his obsessive love for Daisy Buchanan across decadent Long Island.',
        category: 'Fiction',
        genre: 'American Classic',
        publisher: 'Scribner',
        publicationDate: new Date('2004-09-30'),
        edition: 'Centennial Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
        averageRating: 4.6,
        reviewCount: 88
      },

      // === HISTORY ===
      {
        title: 'Sapiens: A Brief History of Humankind',
        authors: ['Yuval Noah Harari'],
        isbn10: '0062316095',
        isbn13: '9780062316097',
        description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution, exploring how biology and history have defined us.',
        category: 'History',
        genre: 'Anthropology & Non-fiction',
        publisher: 'Harper',
        publicationDate: new Date('2015-02-10'),
        edition: 'Trade Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
        averageRating: 4.7,
        reviewCount: 140
      },
      {
        title: 'Guns, Germs, and Steel: The Fates of Human Societies',
        authors: ['Jared Diamond'],
        isbn10: '0393317552',
        isbn13: '9780393317558',
        description: 'Jared Diamond convincingly argues that geographical and environmental factors, rather than racial differences, shaped the modern world and its civilizations.',
        category: 'History',
        genre: 'World History',
        publisher: 'W. W. Norton & Company',
        publicationDate: new Date('1999-04-17'),
        edition: 'Pulitzer Prize Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780393317558-L.jpg',
        averageRating: 4.6,
        reviewCount: 72
      },
      {
        title: 'The Silk Roads: A New History of the World',
        authors: ['Peter Frankopan'],
        isbn10: '1101912375',
        isbn13: '9781101912379',
        description: 'An illuminating new history that shifts our perspective eastwards, tracing the forces that connected the world along the great trade and cultural arteries of Central Asia.',
        category: 'History',
        genre: 'Global History',
        publisher: 'Vintage',
        publicationDate: new Date('2017-03-07'),
        edition: 'Illustrated Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781101912379-L.jpg',
        averageRating: 4.8,
        reviewCount: 65
      },

      // === SCIENCE ===
      {
        title: 'A Brief History of Time: From the Big Bang to Black Holes',
        authors: ['Stephen Hawking'],
        isbn10: '0553380168',
        isbn13: '9780553380163',
        description: 'A landmark volume in science writing by one of the greatest minds of our epoch, exploring profound questions about the universe, black holes, and the fabric of time.',
        category: 'Science',
        genre: 'Cosmology & Physics',
        publisher: 'Bantam',
        publicationDate: new Date('1998-09-01'),
        edition: 'Expanded Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg',
        averageRating: 4.8,
        reviewCount: 98
      },
      {
        title: 'Astrophysics for People in a Hurry',
        authors: ['Neil deGrasse Tyson'],
        isbn10: '0393609391',
        isbn13: '9780393609394',
        description: 'Neil deGrasse Tyson brings the mysteries of the cosmos down to Earth with sparkling wit and digestible chapters exploring quantum mechanics, dark matter, and galaxies.',
        category: 'Science',
        genre: 'Astrophysics',
        publisher: 'W. W. Norton & Company',
        publicationDate: new Date('2017-05-02'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780393609394-L.jpg',
        averageRating: 4.7,
        reviewCount: 84
      },
      {
        title: 'Cosmos',
        authors: ['Carl Sagan'],
        isbn10: '0345331354',
        isbn13: '9780345331359',
        description: 'Carl Sagan\'s iconic journey through science and civilization, revealing the interconnectedness of all life and the immense wonder of our cosmic oasis.',
        category: 'Science',
        genre: 'Astronomy & Philosophy',
        publisher: 'Ballantine Books',
        publicationDate: new Date('1985-05-12'),
        edition: 'Deluxe Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780345331359-L.jpg',
        averageRating: 4.9,
        reviewCount: 115
      },

      // === BUSINESS ===
      {
        title: 'The Lean Startup',
        subtitle: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses',
        authors: ['Eric Ries'],
        isbn10: '0307887898',
        isbn13: '9780307887894',
        description: 'A revolutionary approach to creating and managing startups, emphasizing rapid experimentation, validated learning, and agile product development cycles.',
        category: 'Business',
        genre: 'Entrepreneurship',
        publisher: 'Crown Business',
        publicationDate: new Date('2011-09-13'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
        averageRating: 4.7,
        reviewCount: 92
      },
      {
        title: 'Zero to One: Notes on Startups, or How to Build the Future',
        authors: ['Peter Thiel', 'Blake Masters'],
        isbn10: '0804139296',
        isbn13: '9780804139298',
        description: 'Peter Thiel shows that the next bill gates won\'t build an operating system. Doing what someone else already knows takes the world from 1 to n. Doing something new takes us from 0 to 1.',
        category: 'Business',
        genre: 'Strategy & Innovation',
        publisher: 'Crown Business',
        publicationDate: new Date('2014-09-16'),
        edition: '1st Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg',
        averageRating: 4.8,
        reviewCount: 108
      },
      {
        title: 'The Intelligent Investor: The Definitive Book on Value Investing',
        authors: ['Benjamin Graham'],
        isbn10: '0060555661',
        isbn13: '9780060555665',
        description: 'The greatest investment advisor of the twentieth century, Benjamin Graham taught and inspired people worldwide. His philosophy of value investing shields investors from substantial error.',
        category: 'Business',
        genre: 'Value Investing',
        publisher: 'Harper Business',
        publicationDate: new Date('2006-02-21'),
        edition: 'Revised Edition',
        language: 'English',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg',
        averageRating: 4.9,
        reviewCount: 135
      }
    ];

    console.log(`[Seed] Inserting / Updating ${booksCatalog.length} canonical books...`);
    const savedBooks = [];
    for (const bData of booksCatalog) {
      const book = await Book.findOneAndUpdate(
        { isbn13: bData.isbn13 },
        bData,
        { upsert: true, new: true, runValidators: true }
      );
      savedBooks.push(book);
    }
    console.log(`[Seed] All ${savedBooks.length} books registered in master catalog.`);

    // 9. Create Active Marketplace Listings with Real Stock
    console.log('[Seed] Setting up multi-seller inventory listings...');

    // Available sellers
    const primarySellerId = sellerUser._id;
    const adminSellerId = adminUser._id;
    const userSellerId = userAryan ? userAryan._id : primarySellerId;

    // Remove old listings for these books to ensure fresh inventory
    const bookIds = savedBooks.map(b => b._id);
    await Listing.deleteMany({ bookId: { $in: bookIds } });

    const newOfferListings = [];

    savedBooks.forEach((book, index) => {
      // Primary Seller Offer (Classic Book Bazaar)
      newOfferListings.push({
        bookId: book._id,
        sellerId: primarySellerId,
        condition: index % 2 === 0 ? 'NEW' : 'LIKE_NEW',
        format: index % 3 === 0 ? 'HARDCOVER' : 'PAPERBACK',
        price: 399 + ((index * 37) % 550),
        currency: 'INR',
        stockQuantity: 12 + (index % 10),
        descriptionNotes: 'Verified distributor copy in pristine unread condition. Dispatched in archival protective packaging.',
        status: 'ACTIVE'
      });

      // Platform Direct Store Offer (Official BookWORM Direct) for every other book
      if (index % 2 === 0) {
        newOfferListings.push({
          bookId: book._id,
          sellerId: adminSellerId,
          condition: 'NEW',
          format: 'PAPERBACK',
          price: 360 + ((index * 41) % 500),
          currency: 'INR',
          stockQuantity: 20 + (index % 15),
          descriptionNotes: 'Direct from publisher warehouse. Guild-inspected and certified trade edition.',
          status: 'ACTIVE'
        });
      }

      // User's own store ("Punk Hazard") for selected books (so the user can manage them in seller dashboard!)
      if (userAryan && (index % 3 === 0 || index % 5 === 0)) {
        newOfferListings.push({
          bookId: book._id,
          sellerId: userSellerId,
          condition: index % 2 === 0 ? 'VERY_GOOD' : 'GOOD',
          format: 'PAPERBACK',
          price: 320 + ((index * 29) % 450),
          currency: 'INR',
          stockQuantity: 8 + (index % 7),
          descriptionNotes: 'Carefully stored, collector-handled copy. Clean unmarked pages and tight binding.',
          status: 'ACTIVE'
        });
      }
    });

    await Listing.insertMany(newOfferListings);
    console.log(`[Seed] Created ${newOfferListings.length} active seller offers across books!`);

    console.log('=======================================================');
    console.log('✅ Database seeded successfully!');
    console.log(`📚 Total Books:     ${savedBooks.length}`);
    console.log(`🏷️ Total Listings:  ${newOfferListings.length}`);
    console.log('-------------------------------------------------------');
    console.log('Accounts available for testing:');
    console.log('👤 Admin:   admin@bookworm.com / Admin@123456');
    console.log('🏪 Seller:  classicbooks@gmail.com / Seller@123456');
    console.log('🛒 Buyer:   aarav@gmail.com / Buyer@123456');
    if (userAryan) {
      console.log(`👑 User:    aryan007lko@gmail.com (Store: Punk Hazard)`);
    }
    console.log('=======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedData();
