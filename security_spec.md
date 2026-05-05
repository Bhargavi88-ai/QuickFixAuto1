# Quick Fix Auto - Security Specification

## Data Invariants
1. A booking must always have a valid `userId` that matches the authenticated user.
2. A booking must have a valid `serviceId` from the allowed services.
3. The `status` can only be changed by an admin from `pending` to `confirmed` or `completed`.
4. Users can only cancel their own bookings if they are in `pending` or `confirmed` status.
5. User profiles (`users` collection) can only be read/written by the owner.
6. Admins have full read access to all collections for dashboarding.

## The Dirty Dozen Payloads (Targeting Firestore)
1. **Identity Spoofing**: Attempt to create a booking with `userId: "malicious_user_id"`.
2. **State Shortcutting**: Attempt to create a booking with `status: "confirmed"`.
3. **Admin Escalation**: Attempt to update own user profile with `isAdmin: true`.
4. **Shadow Field Injection**: Attempt to create a booking with an extra `isVerified: true` field.
5. **PII Blanket Read**: Attempt to read all documents in the `users` collection.
6. **Orphaned Write**: Create a booking for a `serviceId` that does not exist.
7. **Resource Poisoning**: Send a 1MB string in the `notes` field.
8. **Unauthorized Deletion**: Attempt to delete a booking owned by another user.
9. **Query Scraping**: Attempt to list all bookings without a `where` filter for `userId`.
10. **Timestamp Fraud**: Send a client-side `createdAt` timestamp from 2010.
11. **Negative Price**: Attempt to update a booking with a `price: -100`.
12. **Status Lock Break**: Attempt to change the date of a `completed` booking.

## Test Runner (Draft)
The `firestore.rules.test.ts` will verify these payloads are rejected.
- `it('rejects identity spoofing', ...)`
- `it('rejects self-made admins', ...)`
- `it('rejects status skipping', ...)`
