# Security Specification & Adversarial Test Outline
For: Laziz Chicken Corner Ordering Platform

## 1. Data Invariants

1. **Relation Constraint**: An Order must have a `userId` that strictly matches the authenticated client's `uid` at checkout time to prevent order injection attacks.
2. **Terminal State Lockdown**: An Order, once completed, cannot undergo unsolicited updates or state corruptions from client SDKs.
3. **Role Integrity**: No client can elevate their privileges to `isAdmin` or inject administrative credentials manually. Admin elevation requires server-side entries or explicit whitelists.
4. **Temporal Integrity**: Creation and modify timestamps (`createdAt`/`updatedAt`) are strictly anchored to `request.time`. Client-supplied client times are rejected.

## 2. Adversarial "Dirty Dozen" Test Payloads

These payloads represent 12 malicious write permutations designed to violate constraints and confirm they correctly trigger `PERMISSION_DENIED`:

### Test Case 1: Client spoofing `userId` (Identity Hijack)
An authenticated user `userA` attempts to place an order under `userB`'s `userId`.
* **Payload**: `{ "customerName": "Alice", "phone": "1234567890", "items": [], "totalPrice": 100, "orderStatus": "pending", "pickupTime": "18:00", "notes": "", "createdAt": request.time, "updatedAt": request.time, "userId": "userB_hacker" }`
* **Expected**: `PERMISSION_DENIED`

### Test Case 2: Untrusted client-side timestamps
An attacker sends a future date-time to mock longevity.
* **Payload**: `{ ..., "createdAt": "2030-01-01T00:00:00Z" }` (not equal to `request.time`)
* **Expected**: `PERMISSION_DENIED`

### Test Case 3: Admin identity self-elevation
An ordinary user attempts to insert themselves into `/admins` collection.
* **Payload**: `{ "email": "ordinary_attacker@gmail.com" }` placed inside `/admins/attacker_uid`.
* **Expected**: `PERMISSION_DENIED`

### Test Case 4: Menu tampering (Price Reduction)
An unauthenticated user or basic customer attempts to update a burger's pricing from ₹150 to ₹1.
* **Payload**: `{ "name": "Laziz Special Burger", "price": 1, "category": "Burgers", "description": "Crispy chicken burger", "image": "...", "isAvailable": true, "isFeatured": true }`
* **Expected**: `PERMISSION_DENIED`

### Test Case 5: Bypassing required schema keys (Incomplete Schema)
Creating a menu item while omitting the mandatory `isAvailable` key to produce inconsistent states.
* **Payload**: `{ "name": "Nuggets", "price": 120, "category": "Nuggets", "description": "Crispy", "image": "...", "isFeatured": false }`
* **Expected**: `PERMISSION_DENIED`

### Test Case 6: Extra unexpected keys (Ghost Field Pollution)
Attempting to save extra fields like `bonusPoints` to exploit non-whitelist checks.
* **Payload**: `{ ..., "bonusPoints": 1000 }`
* **Expected**: `PERMISSION_DENIED`

### Test Case 7: Negative menu item price
Adding a negative menu item to verify range boundary gate validation.
* **Payload**: `{ ..., "price": -50 }`
* **Expected**: `PERMISSION_DENIED`

### Test Case 8: Excessive string size injection (Denial of Wallet)
Injecting a name exceeding maximum length (100+ characters) in order model.
* **Payload**: `{ "customerName": "A".repeat(1000), ... }`
* **Expected**: `PERMISSION_DENIED`

### Test Case 9: Altering an order that isn't yours
A customer attempts to edit an order of another consumer.
* **Expected**: `PERMISSION_DENIED`

### Test Case 10: State transition bypass (Marking accepted without admin)
A consumer attempts to transition their order state from `pending` to `accepted` or `ready`.
* **Expected**: `PERMISSION_DENIED`

### Test Case 11: Modifying historic records
Attempting to edit parts of a completed order.
* **Expected**: `PERMISSION_DENIED`

### Test Case 12: Anonymous order scraping
A non-logged-in user attempting to read the `/orders` collection.
* **Expected**: `PERMISSION_DENIED`
