# Security Specification - Tadawul Plus

## Data Invariants
1. A user can only read and write their own profile (except for `is_admin` and `balance` which are restricted during update).
2. Users cannot change their own `is_admin` status.
3. Users cannot change their own `balance` directly (must go through transactions/deposits).
4. Deposits/Withdrawals can only be created by the owner with 'pending' status.
5. Only admins can update the `status` of a Deposit or Withdrawal.
6. Transactions are system-generated (immutable after creation).
7. Jackpot attempts are created by users but verified against their balance (atomicity).

## The Dirty Dozen Payloads (Failures)
1. **Identity Spoofing**: `update user { balance: 1000000 }` as a regular user. (Must DENY)
2. **Privilege Escalation**: `update user { is_admin: true }`. (Must DENY)
3. **Orphaned Deposit**: `create deposit { userId: 'victim_uid' }`. (Must DENY)
4. **State Jumping**: `create deposit { status: 'approved' }`. (Must DENY)
5. **Withdrawal Scraping**: `list withdrawals` as regular user (Must only see own).
6. **Balance Poisoning**: `update user { balance: 'invalid_type' }`. (Must DENY)
7. **Referral Hijack**: `update user { referral_code: 'ADMIN' }`. (Must DENY)
8. **Junk ID Injection**: `create user/long_junk_id_1.5kb`. (Must DENY via isValidId)
9. **Negative Withdrawal**: `create withdrawal { amount: -100 }`. (Must DENY)
10. **Admin Identity Spoof**: `create deposit { username: 'AdminOverride' }`. (Must verify against auth).
11. **Shadow Update**: `update deposit { status: 'approved', extra_field: 'junk' }`. (Must DENY via hasOnly).
12. **Unverified Registration**: `create user` without verified email (if strictly required, though Google Auth usually verifies).

## Verification Strategy
- Use `isValidId` for all document IDs.
- Use `hasOnly` in all update blocks.
- Use relational guards for sub-resources.
