# ADR-005: Explicit Financial Accounting & Marketplace Settlement Model

## Status
Accepted

## Context
In a multi-vendor marketplace, a single customer order may combine items listed by multiple distinct sellers. The system cannot simply mark an order as paid and transfer the grand total to one seller. It must maintain explicit accounting of platform commission fees, taxes, shipping, and net seller earnings per line item.

## Decision
We decided to model financial breakdowns explicitly on every `Order` document at the item line level:
1. `unitPrice` and `quantity`
2. `platformCommissionRate` (default 10%)
3. `platformCommissionAmount` = `subtotal * commissionRate`
4. `sellerEarningsAmount` = `subtotal - platformCommissionAmount`

Orders preserve static immutable snapshot figures calculated at the exact moment of purchase.

## Alternatives Considered
1. **Dynamic Earnings Calculation on Query:** Calculating seller earnings dynamically when loading the seller dashboard by joining current seller commission settings. Rejected because historical commission rates or price changes would alter historical accounting metrics retroactively.
2. **Direct Instant Transfers via Payment Gateway:** Transferring funds directly to sellers during customer checkout. Rejected because refunds, cancellations, and delivery confirmation must be processed prior to final seller payout settlement.

## Consequences
### Benefits
- Absolute historical financial auditability.
- Transparent reporting for both platform administrators and independent sellers.
- Decouples customer payment capture from seller bank payout disbursement workflows.
### Costs & Trade-offs
- Requires explicit snapshot fields in `orderItemSchema`.
