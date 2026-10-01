# ADR-001: Selection of MongoDB with Mongoose ODM for Database Storage

## Status
Accepted

## Context
The BookWORM marketplace requires flexible schema modeling for book metadata (which includes varying formats, editions, genres, and catalog attributes) alongside strong indexing for full-text search, high write throughput for cart operations, and strict document snapshots for financial order history.

## Decision
We decided to use **MongoDB** with **Mongoose ODM**. Mongoose schemas will enforce field constraints, defaults, schema indexes, and reference relationships while allowing canonical book documents and order snapshots to be modeled cleanly.

## Alternatives Considered
1. **PostgreSQL:** Excellent for relational data and strict FK constraints, but requires extra schema migrations for evolving book metadata attributes and separate full-text search engine integration at early stages.
2. **DynamoDB:** Highly scalable key-value/document store, but complex aggregation pipeline building for seller revenue analytics and multi-field faceted searching.

## Consequences
### Benefits
- Flexible document modeling allowing canonical book catalogs and multi-seller listings.
- Built-in MongoDB aggregation pipelines for calculating average ratings, sales analytics, and faceted search.
- Native JSON handling matching Express.js and React stack seamlessly.
### Costs & Trade-offs
- Concurrency and stock reservation require explicit conditional atomic updates (`$inc: { stockQuantity: -quantity }` with `{ stockQuantity: { $gte: quantity } }`).
- Manual reference management for cross-collection relationships (e.g. `listing.bookId`).
