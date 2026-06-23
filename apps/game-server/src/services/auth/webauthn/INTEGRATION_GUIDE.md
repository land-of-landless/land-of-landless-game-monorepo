# WebAuthn + Grant OAuth Integration Guide

This guide shows how to integrate WebAuthn with your existing Grant OAuth setup.

## Architecture Overview

```
User Login Flow
├─ OAuth Login (via Grant)
│  └─ User authenticates with Discord/Google/GitHub
│  └─ JWT token issued
│  └─ User marked as "logged in"
│
├─ Optional: User adds WebAuthn
│  └─ User can enroll security key/fingerprint
│  └─ Multiple credentials supported
│
└─ Sensitive Operations
   └─ For admins: WebAuthn challenge required
   └─ For users: Optional 2FA with WebAuthn
   └─ Recovery codes available if key lost
```

## Step 1: Update Database Schema

Add to your `apps/game-server/src/models/postgres/schema.ts`:

```typescript
// Import the tables from webauthn-schema.ts
import {
  webAuthnCredentials,
  webAuthnRecoveryCodes,
  webAuthnCredentialsRelations,
  webAuthnRecoveryCodesRelations,
} from "@/models/postgres/webauthn-schema.js";

// Then in your export:
export {
  webAuthnCredentials,
  webAuthnRecoveryCodes,
};
```

Run migrations:
```bash
cd apps/game-server
npm run db:generate  # Drizzle migration
npm run db:migrate   # Apply migration
```

## Step 2: Set Environment Variables

Add to `.env` (game-server):

```env
# WebAuthn Configuration
WEBAUTHN_RP_ID=yourgame.com           # Your domain
WEBAUTHN_ORIGIN=https://yourgame.com  # Full origin URL
```

For local development:
```env
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:5173
```

## Step 3: Add Routes

Create `apps/game-server/src/api/v1/routes/webauthn.ts`:

```typescript
import { Router } from "express";
import WebAuthnController from "@/api/v1/controllers/webAuthnController.js";
import { authMiddleware } from "@/middlewares/auth.js"; // Your existing auth middleware

const router = Router();

// All routes require authentication (via Grant OAuth)
router.use(authMiddleware);

// Registration flow
router.post("/register/start", WebAuthnController.startRegistration);
router.post("/register/complete", WebAuthnController.completeRegistration);

// Authentication flow
router.post("/authenticate/start", WebAuthnController.startAuthentication);
router.post("/authenticate/complete", WebAuthnController.completeAuthentication);

// Credential management
router.get("/credentials", WebAuthnController.getCredentials);
router.delete("/credentials/:credentialId", WebAuthnController.deleteCredential);

// Recovery codes (admin only)
router.post("/recovery-codes/generate", WebAuthnController.generateRecoveryCodes);
router.post("/recovery/verify", WebAuthnController.verifyRecoveryCode);
router.get("/recovery/count", WebAuthnController.getRecoveryCodeCount);

export default router;
```

Register in your main routes file:

```typescript
// In apps/game-server/src/api/v1/routes/index.ts
import webauthnRoutes from "./webauthn.js";

app.use("/api/v1/webauthn", webauthnRoutes);
```

## Step 4: Enforce WebAuthn for Admins

Create middleware in `apps/game-server/src/middlewares/webAuthnRequired.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { WebAuthnCredentialDAO } from "@/daos/postgres/webauthn.ts";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Middleware to enforce WebAuthn verification for admin operations
 */
export const requireWebAuthnForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as any;

  // Skip if not an admin
  if (!user?.isAdmin) {
    return next();
  }

  // Check if user has WebAuthn enrolled
  const hasEnrolled = await WebAuthnCredentialDAO.hasEnrolled(user.id);
  if (!hasEnrolled) {
    return res.status(403).json(
      ERRORS.FORBIDDEN("WebAuthn enrollment required for admins")
    );
  }

  // Check if user has verified with WebAuthn in this session
  // You can store this in session after successful verification
  const webAuthnVerified = req.session?.webAuthnVerified === true;

  if (!webAuthnVerified) {
    return res.status(403).json(
      ERRORS.FORBIDDEN(
        "WebAuthn verification required for admin operations. Call /api/v1/webauthn/authenticate/start"
      )
    );
  }

  next();
};

// Usage in admin routes:
app.post(
  "/api/admin/users/:userId/ban",
  authMiddleware,
  requireWebAuthnForAdmin,
  AdminController.banUser
);
```

## Step 5: Store WebAuthn Verification in Session

Update your authentication controller to set a flag after WebAuthn verification:

```typescript
// In webAuthnController.ts
static async completeAuthentication(...) {
  // ... verification code ...

  // Mark as WebAuthn verified in session
  if (req.session) {
    req.session.webAuthnVerified = true;
    req.session.webAuthnVerifiedAt = new Date();
  }

  res.json(
    ApiResponse.success(
      { credentialId: result.credentialId, verified: true },
      "Authentication successful"
    )
  );
}
```

## Step 6: Frontend Integration

### Registration

```typescript
// User initiates enrollment
const startResponse = await fetch("/api/v1/webauthn/register/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});

const { options } = await startResponse.json();

// Browser handles biometric/security key
const credential = await navigator.credentials.create(options);

// Complete registration
const completeResponse = await fetch("/api/v1/webauthn/register/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    credentialName: "My Security Key",
    response: credential,
  }),
});

const result = await completeResponse.json();

if (result.recoveryCodes) {
  // Admin: Show recovery codes to save
  console.log("Save these codes:", result.recoveryCodes);
}
```

### Authentication (for admin operations)

```typescript
// User needs to verify before admin action
const startResponse = await fetch("/api/v1/webauthn/authenticate/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});

const { options } = await startResponse.json();

// Browser prompts for biometric/key
const assertion = await navigator.credentials.get(options);

// Verify
const completeResponse = await fetch(
  "/api/v1/webauthn/authenticate/complete",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: assertion }),
  }
);

const result = await completeResponse.json();

if (result.verified) {
  // User is now verified, can proceed with admin action
  await performAdminAction();
}
```

### Recovery (Lost Security Key)

```typescript
// If user lost their security key
const response = await fetch("/api/v1/webauthn/recovery/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: "ABCD1234" }), // One of saved codes
});

const result = await response.json();

if (result.valid) {
  // User verified with recovery code
  // Redirect to delete old credential and enroll new one
}
```

## Step 7: Redis Integration (Challenges)

The current implementation has placeholder challenge storage. Upgrade to Redis:

```typescript
// In WebAuthnService.ts
import { redis } from "@/services/redis.js"; // Your Redis client

private static async storeChallenge(
  key: string,
  challenge: string
): Promise<void> {
  await redis.set(key, challenge, "EX", this.CHALLENGE_TIMEOUT);
}

private static async getChallenge(key: string): Promise<string | null> {
  return await redis.get(key);
}

private static async deleteChallenge(key: string): Promise<void> {
  await redis.del(key);
}
```

## Step 8: Testing

### Manual Test Flow

1. **Create test user via OAuth** (Discord/Google)
2. **Enroll WebAuthn**:
   - `POST /api/v1/webauthn/register/start`
   - Get challenge, use browser WebAuthn
   - `POST /api/v1/webauthn/register/complete`
3. **Verify credential**:
   - `GET /api/v1/webauthn/credentials`
   - Should see credential with name
4. **Test authentication**:
   - `POST /api/v1/webauthn/authenticate/start`
   - Use browser WebAuthn
   - `POST /api/v1/webauthn/authenticate/complete`
5. **For admins, test recovery codes**:
   - `POST /api/v1/webauthn/recovery-codes/generate`
   - Save codes
   - `POST /api/v1/webauthn/recovery/verify` with one code

### Unit Tests

```typescript
// apps/game-server/test/webauthn.test.ts
import { describe, it, expect } from "vitest";
import { WebAuthnService } from "@/services/auth/webauthn/WebAuthnService.js";

describe("WebAuthn", () => {
  it("should generate registration options", async () => {
    const result = await WebAuthnService.startRegistration("user123");
    expect(result.options).toBeDefined();
    expect(result.options.challenge).toBeDefined();
  });

  it("should validate recovery codes", async () => {
    const result = await RecoveryCodesService.validateAndUseRecoveryCode(
      "user123",
      "INVALIDCODE",
      mockDAO
    );
    expect(result.valid).toBe(false);
  });
});
```

## Flow Diagrams

### User Enrollment

```
┌─────────────────────────────────────────┐
│ User Logged In (via Grant OAuth)        │
│ Has JWT token in session                │
└────────────┬────────────────────────────┘
             │
             v
    ┌────────────────────┐
    │ Click "Add 2FA"     │
    └────────┬───────────┘
             │
             v
    POST /webauthn/register/start
             │
             v
    ┌────────────────────────────────────┐
    │ Browser: navigator.credentials.   │
    │ create(options)                     │
    │ Prompts: Fingerprint/Face/Key      │
    └────────┬───────────────────────────┘
             │
             v
    POST /webauthn/register/complete
             │
             v
    ┌────────────────────────────────────┐
    │ Server stores credential            │
    │ If Admin: generate recovery codes  │
    └────────┬───────────────────────────┘
             │
             v
    ✅ Enrollment complete
       (Admin: Show recovery codes)
```

### Admin Sensitive Operation

```
┌──────────────────────────────────────┐
│ Admin clicks "Ban User"               │
└────────────┬─────────────────────────┘
             │
             v
    Check: WebAuthn enrolled?
             │
      ┌──────┴──────┐
      │ NO          │ YES
      v             v
    ❌ Error   POST /webauthn/auth/start
                    │
                    v
             ┌─────────────────────────┐
             │ Browser: get() prompts  │
             │ Touch key/Fingerprint   │
             └────────┬────────────────┘
                      │
                      v
             POST /webauthn/auth/complete
                      │
                      v
             ✅ Verified in session
                      │
                      v
             Proceed with admin action
```

## Security Considerations

### Clone Detection
- Counter increments on each use
- Server rejects if counter decreases
- Indicates cloned authenticator

### Single Origin
- Challenges tied to exact origin
- Prevents phishing attacks

### User Verification
- Required for sensitive operations
- User must authenticate locally (biometric/PIN)

### Recovery Codes
- One-time use
- Bcrypt hashed in database
- Show once, never shown again

### Session Management
- WebAuthn verification timestamped
- Consider timeout for re-verification
- Clear flag on logout

## Troubleshooting

**"Registration challenge expired"**
- Ensure Redis is running (if using)
- Check `CHALLENGE_TIMEOUT` value
- Verify user completes ceremony within timeout

**"Credential not found"**
- Check `credential_id` encoding (should be base64)
- Verify user_id matches in database

**"Attestation verification failed"**
- Check `expectedOrigin` matches `window.location.origin`
- Verify `WEBAUTHN_RP_ID` and `WEBAUTHN_ORIGIN` in `.env`

**"User not verified locally"**
- Browser didn't complete local authentication
- User cancelled biometric prompt
- Retry with valid biometric/key

## Next Steps

1. ✅ Implement Redis challenge storage
2. ✅ Add session management for verification timestamp
3. ✅ Create admin dashboard showing enrolled users
4. ✅ Add front-end UI for credential management
5. ✅ Monitor failed verification attempts
6. ✅ Email user when new credential enrolled
