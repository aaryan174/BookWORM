# ADR-004: Abstracted Object Storage Service for Image Assets

## Status
Accepted

## Context
Book canonical catalog covers and seller listing photos must be uploaded, stored, and served via performant CDN URLs. Binary images should not be stored inside MongoDB documents due to 16MB document size limits and performance degradation.

## Decision
We decided to implement a pluggable `StorageService` interface abstracting image uploads (ImageKit / S3 / Cloudinary) with local disk storage fallback for offline development.

## Alternatives Considered
1. **Storing Base64 Images in MongoDB:** Storing images as Base64 strings directly inside Mongoose models. Rejected due to DB size bloating and inefficient database memory utilization.
2. **Hardcoding S3 SDK directly in Controllers:** Binding controller code directly to AWS S3 SDK. Rejected to preserve provider flexibility.

## Consequences
### Benefits
- Controllers and services remain agnostic of the underlying cloud storage provider.
- Automatic image transformations, resizing, and CDN optimization provided by ImageKit / S3.
- Storage provider can be switched seamlessly via `.env` configuration.
### Costs & Trade-offs
- External storage API dependency during image upload workflows.
