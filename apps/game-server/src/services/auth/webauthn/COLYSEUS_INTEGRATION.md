# WebAuthn + Colyseus Integration Guide

Guide for integrating WebAuthn with Colyseus's opinionated auth system.

## The Question

Given Colyseus's opinionated auth, how should we handle the flow?
- User logs in via OAuth → gets JWT
- User optionally adds WebAuthn
- For admin operations, user needs WebAuthn verification
- Should we issue a NEW JWT that says "both OAuth + WebAuthn verified"?

**Answer: No, use session flags instead.** Here's why:

---

## Architecture Recommendation

### ❌ What NOT to Do

```
OAuth Login → JWT with oauth_verified: true
WebAuthn Verify → Issue NEW JWT with oauth_verified + webauthn_verified: true
```

**Problems:**
- JWT is stateless, can't be revoked
- Creates multiple JWT issuance points (harder to manage)
- Colyseus expects one auth token per connection
- Admin can disconnect and reconnect to bypass WebAuthn check

### ✅ What TO Do Instead

```
OAuth Login → JWT issued (contains user.id, isAdmin)
             ↓
User connects to Colyseus room with JWT
             ↓
Colyseus validates JWT in onAuth hook
             ↓
Room is joined successfully
             ↓
For admin operations:
  ├─ Check req.session.webAuthnVerified flag
  └─ If false, return 403 with "requiresWebAuthn: true"
     User calls /webauthn/authenticate/start → /complete
     Flag set in session
     Retry admin operation
```

**Benefits:**
- JWT issued once (simpler)
- WebAuthn verification is session-based (can timeout)
- Colyseus doesn't need to know about WebAuthn
- Clean separation of concerns

---

## Implementation

### Step 1: JWT Structure (No Changes Needed)

Your existing JWT from Grant:

```typescript
// From Grant OAuth
{
  sub: "user_123",
  email: "user@example.com",
  username: "player_name",
  isAdmin: false,  // or true
  iat: 1234567890,
  exp: 1234571490
}
```

**No need to add WebAuthn fields here.** It's session-based.

---

### Step 2: Session Tracking

After successful WebAuthn verification, set session flags:

```typescript
// In webAuthnController.ts - completeAuthentication
static async completeAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id;
    // ... verification logic ...

    // ✅ Mark as verified in session (not JWT)
    if (req.session) {
      req.session.webAuthnVerified = true;
      req.session.webAuthnVerifiedAt = new Date();
      req.session.webAuthnCredentialId = result.credentialId;
    }

    res.json(
      ApiResponse.success(
        {
          credentialId: result.credentialId,
          verified: true,
          sessionMarked: true,
        },
        "WebAuthn verified. Session updated."
      )
    );
  } catch (error) {
    // ...
  }
}
```

---

### Step 3: Check WebAuthn in Colyseus Room

For admin operations that require WebAuthn, check the session:

```typescript
// In your Colyseus room
export class GameRoom extends Room {
  onAuth(client: Client, credentials: any) {
    // Colyseus validates JWT here
    // Returns decoded JWT if valid
    return credentials;
  }

  // Admin action that requires WebAuthn verification
  onMessage(client: Client, message: { type: string }) {
    if (message.type === "ban_user") {
      // Check 1: Is user admin?
      if (!client.auth.isAdmin) {
        client.send("error", { error: "Admin only" });
        return;
      }

      // Check 2: Is WebAuthn verified?
      if (!client.session?.webAuthnVerified) {
        client.send("error", {
          error: "WebAuthn verification required",
          requiresWebAuthn: true,
          message:
            "Must verify with fingerprint first. Call /api/v1/webauthn/authenticate/start",
        });
        return;
      }

      // ✅ User is admin AND WebAuthn verified
      this.banUser(message.userId);
    }
  }
}
```

---

### Step 4: Flow Diagram

```
┌─────────────────────────────────────┐
│ 1. User Logs in via Discord        │
│    (Grant OAuth)                     │
└────────┬────────────────────────────┘
         │
         v
    JWT Issued
  {sub: user_123, isAdmin: false}
         │
         v
┌─────────────────────────────────────┐
│ 2. Client Connects to Colyseus      │
│    with JWT token                   │
└────────┬────────────────────────────┘
         │
         v
    Room.onAuth(credentials)
    └─→ Validates JWT
    └─→ Returns decoded JWT
         │
         v
    ✅ Joined room
  (client.auth = decoded JWT)
         │
         v
┌─────────────────────────────────────┐
│ 3. User Tries Admin Action          │
│    (e.g., ban_user)                 │
└────────┬────────────────────────────┘
         │
         v
    Check: client.auth.isAdmin?
         │
      ┌──┴──┐
      │ NO  │ YES
      v     v
    ❌ Error ✓ Continue
              │
              v
         Check: client.session?.webAuthnVerified?
              │
           ┌──┴──┐
           │ NO  │ YES
           v     v
    ❌ Error ✓ Proceed
     (return  (execute
     requiresWebAuthn) action)
              │
              v
    ┌──────────────────────────────┐
    │ 4. If WebAuthn Required:     │
    │                              │
    │ Client calls:                │
    │ POST /webauthn/auth/start    │
    │ (browser prompts for bio)    │
    │                              │
    │ Then:                        │
    │ POST /webauthn/auth/complete │
    │ (session flag set)           │
    └──────────────────────────────┘
              │
              v
    ┌──────────────────────────────┐
    │ 5. Retry Admin Action        │
    │    client.session.webAuthn   │
    │    Verified = true           │
    │    ✅ Succeeds!              │
    └──────────────────────────────┘
```

---

## Code Examples

### A. Express Route Check (HTTP)

```typescript
// In your Express controller
app.post(
  "/api/admin/users/:userId/ban",
  requireAuth,
  requireAdmin,
  requireWebAuthnVerification,  // ← Uses middleware
  async (req, res) => {
    // ✅ Both checks passed
    const userId = req.params.userId;
    await banUser(userId);
    res.json({ success: true });
  }
);

// Middleware
const requireWebAuthnVerification = (req, res, next) => {
  if (!req.session?.webAuthnVerified) {
    return res.status(403).json({
      error: "WebAuthn required",
      requiresWebAuthn: true,
    });
  }
  next();
};
```

### B. Colyseus Room Check (WebSocket)

```typescript
export class GameRoom extends Room {
  onAuth(client: Client, credentials: any) {
    // Validate JWT with Grant/Auth library
    const decoded = validateJWT(credentials.token);
    client.auth = decoded; // ← Store auth info
    return decoded;
  }

  onJoin(client: Client, options?: any) {
    console.log(`${client.auth.username} joined`);
  }

  onMessage(client: Client, message: any) {
    // Admin action example
    if (message.type === "admin:ban_user") {
      // Check admin status (from JWT)
      if (!client.auth?.isAdmin) {
        return client.send("error", { message: "Not admin" });
      }

      // Check WebAuthn verification (from session)
      const isWebAuthnVerified = this.getSessionFlag(
        client.auth.id,
        "webAuthnVerified"
      );

      if (!isWebAuthnVerified) {
        return client.send("error", {
          message: "WebAuthn verification required",
          requiresWebAuthn: true,
          nextStep:
            "POST /api/v1/webauthn/authenticate/start in browser",
        });
      }

      // ✅ All checks passed
      this.banUser(message.userId);
      client.send("success", { message: "User banned" });
    }
  }

  private getSessionFlag(userId: string, flag: string) {
    // Look up from Redis/session store
    // Or pass from client in message: client.sessionId
    return sessionStore.get(`${userId}:${flag}`);
  }
}
```

### C. Full Admin Action Flow

```typescript
// Frontend: User clicks "Ban Player"
async function banPlayer(playerId: string) {
  // Step 1: Try the action
  let response = await fetch(`/api/admin/users/${playerId}/ban`, {
    method: "POST",
    credentials: "include", // Include cookies for session
  });

  // Step 2: Check if WebAuthn is needed
  if (response.status === 403) {
    const error = await response.json();

    if (error.requiresWebAuthn) {
      // Start WebAuthn challenge
      const authStart = await fetch("/api/v1/webauthn/authenticate/start", {
        method: "POST",
        credentials: "include",
      });
      const { options } = await authStart.json();

      // Get assertion from browser
      const assertion = await navigator.credentials.get(options);

      // Complete verification
      await fetch("/api/v1/webauthn/authenticate/complete", {
        method: "POST",
        body: JSON.stringify({ response: assertion }),
        credentials: "include",
      });

      // Retry the ban
      response = await fetch(`/api/admin/users/${playerId}/ban`, {
        method: "POST",
        credentials: "include",
      });
    }
  }

  // Step 3: Handle result
  if (response.ok) {
    console.log("User banned!");
  } else {
    console.error("Failed to ban user");
  }
}
```

---

## Session Storage Strategy

### Option A: Redis (Recommended)

```typescript
// When user verifies with WebAuthn
redis.set(`session:${sessionId}:webAuthnVerified`, "true", "EX", 900); // 15 min
redis.set(`session:${sessionId}:webAuthnVerifiedAt`, Date.now(), "EX", 900);
redis.set(
  `session:${sessionId}:webAuthnCredentialId`,
  credentialId,
  "EX",
  900
);

// Check in middleware
const verified = await redis.get(`session:${sessionId}:webAuthnVerified`);
if (!verified) return res.status(403).json({ error: "Not verified" });
```

### Option B: In-Memory (Simple, for single server)

```typescript
const sessionStore = new Map<string, any>();

// When user verifies
sessionStore.set(`${userId}:webAuthnVerified`, true);
sessionStore.set(`${userId}:webAuthnVerifiedAt`, Date.now());

// Check
const verified = sessionStore.get(`${userId}:webAuthnVerified`);
```

### Option C: Express Sessions (If using express-session)

```typescript
// req.session is already persistent
req.session.webAuthnVerified = true;
req.session.webAuthnVerifiedAt = new Date();
// Saved automatically when response sent
```

---

## Timeout & Re-Verification

Force re-verification after 15 minutes:

```typescript
const requireWebAuthnVerification = (req, res, next) => {
  if (!req.session?.webAuthnVerified) {
    return res.status(403).json({ error: "Not verified" });
  }

  // Check age
  const verifiedAt = req.session?.webAuthnVerifiedAt;
  const ageMs = Date.now() - verifiedAt.getTime();
  const maxAgeMs = 15 * 60 * 1000; // 15 minutes

  if (ageMs > maxAgeMs) {
    // Clear the flag
    delete req.session.webAuthnVerified;
    delete req.session.webAuthnVerifiedAt;

    return res.status(403).json({
      error: "Verification expired",
      requiresWebAuthn: true,
      message: "WebAuthn verification expired. Must re-verify.",
    });
  }

  next();
};
```

---

## Security Considerations

### ✅ Do This

1. **Check JWT first** (valid, not expired, correct issuer)
2. **Then check admin status** (from JWT)
3. **Then check WebAuthn verification** (from session)
4. **Track verification time** (force re-verify after X minutes)
5. **Log all admin actions** (audit trail with timestamp)

### ❌ Don't Do This

- ❌ Don't store WebAuthn state in JWT (can't revoke)
- ❌ Don't skip JWT validation
- ❌ Don't allow permanent WebAuthn flags (no timeout)
- ❌ Don't trust WebAuthn without checking enrolled status first

---

## Integration Checklist

- [ ] Register routes in main Express app:
  ```typescript
  import webauthnRoutes from "@/api/v1/routes/webauthn.js";
  app.use("/api/v1/webauthn", webauthnRoutes);
  ```

- [ ] Update your auth middleware to pass `user` to `req`:
  ```typescript
  req.user = { id, email, username, isAdmin };
  ```

- [ ] Choose session storage (Redis/express-session/in-memory)

- [ ] Add `requireWebAuthnVerification` middleware to admin routes

- [ ] Update Colyseus room to check `client.session?.webAuthnVerified`

- [ ] Test flow:
  1. Login via OAuth
  2. Try admin action → should fail with requiresWebAuthn
  3. Call `/webauthn/authenticate/start` → `/complete`
  4. Retry admin action → should succeed

- [ ] Add email notification when admin enrolls WebAuthn

- [ ] Add audit logging for all admin actions

---

## Example: Complete Admin Ban Flow

```typescript
// ==================== Backend ====================

// 1. Express route
app.post("/api/admin/users/:userId/ban", 
  requireAuth,
  requireAdmin,
  requireWebAuthnVerification,
  async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;

    // Log admin action
    await auditLog.create({
      admin_id: req.user.id,
      action: "user_ban",
      target_user_id: userId,
      reason,
      timestamp: new Date(),
    });

    // Perform ban
    await UserDAO.ban(userId);

    res.json({ success: true, message: `User ${userId} banned` });
  }
);

// 2. Colyseus room alternative
export class GameRoom extends Room {
  onMessage(client: Client, message: any) {
    if (message.type === "admin:ban") {
      // Get session
      const sessionData = sessionStore.get(client.sessionId);

      // Check permission + verification
      if (!client.auth?.isAdmin) {
        return client.send("error", { message: "Not admin" });
      }

      if (!sessionData?.webAuthnVerified) {
        return client.send("error", {
          type: "webauthn_required",
          message: "WebAuthn verification required",
        });
      }

      // Ban user
      const bannedUser = this.state.players.get(message.playerId);
      if (bannedUser) {
        bannedUser.banned = true;
        auditLog.log(client.auth.id, "ban", message.playerId);
      }
    }
  }
}

// ==================== Frontend ====================

// Client-side helper
async function performAdminAction(action, payload) {
  try {
    const response = await fetch(`/api/admin/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include", // Important for session/cookies
    });

    if (response.status === 403) {
      const error = await response.json();
      if (error.requiresWebAuthn) {
        await performWebAuthnVerification();
        // Retry
        return performAdminAction(action, payload);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Admin action failed:", error);
  }
}

async function performWebAuthnVerification() {
  // 1. Get challenge
  const startResponse = await fetch("/api/v1/webauthn/authenticate/start", {
    method: "POST",
    credentials: "include",
  });
  const { options } = await startResponse.json();

  // 2. User verifies
  const assertion = await navigator.credentials.get(options);

  // 3. Complete
  const completeResponse = await fetch(
    "/api/v1/webauthn/authenticate/complete",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: assertion }),
      credentials: "include",
    }
  );

  if (!completeResponse.ok) {
    throw new Error("WebAuthn verification failed");
  }

  return await completeResponse.json();
}

// Usage
document.getElementById("banButton").onclick = async () => {
  const result = await performAdminAction("users/player123/ban", {
    reason: "Inappropriate username",
  });
  console.log(result);
};
```

---

## Summary

### JWT (OAuth from Grant)
- ✅ Contains: `user.id`, `user.isAdmin`
- ✅ Issued once, reused for Colyseus connection
- ✅ Validates user identity
- ❌ Does NOT contain WebAuthn state

### Session (Server-side)
- ✅ Contains: `webAuthnVerified`, `webAuthnVerifiedAt`, `webAuthnCredentialId`
- ✅ Set after successful WebAuthn challenge
- ✅ Can timeout (15 minutes recommended)
- ✅ Checked for sensitive admin operations

### Admin Operations
- ✅ Check 1: Valid JWT?
- ✅ Check 2: User is admin?
- ✅ Check 3: WebAuthn verified in session?
- ✅ Check 4: Verification not expired?
- ✅ Action proceeds

This is the cleanest, most secure approach! 🔒
