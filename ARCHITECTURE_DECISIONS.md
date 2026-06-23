# 🏗️ Architecture & Design Decisions

This document covers admin routes, WebAuthn integration, and authentication strategy.

---

## 📋 Table of Contents

1. [Admin Panel Routes](#admin-panel-routes)
2. [WebAuthn Implementation](#webauthn-implementation)
3. [Authentication Architecture](#authentication-architecture)
4. [Session vs JWT Strategy](#session-vs-jwt-strategy)
5. [Colyseus Integration](#colyseus-integration)

---

## Admin Panel Routes

### ✅ **Should You Have Separate Admin Routes?**

**YES.** Separate admin routes are better because:

1. **Security via obscurity** — `/api/v1/admin/*` is distinct from user routes
2. **Middleware isolation** — Admin checks don't bloat user endpoints
3. **Audit logging** — Easy to track admin actions separately
4. **Rate limiting** — Different limits for admin vs user operations
5. **Permissions model** — Clear separation of concerns

### 📍 **Recommended Admin Route Structure**

```typescript
// File: src/api/v1/routes/admin.ts

import express from "express";
import AdminController from "@/api/v1/controllers/admin.js";
import { requireAuth } from "@/middlewares/auth.js";
import { requireAdmin } from "@/middlewares/requireAdmin.js";
import { requireWebAuthn } from "@/middlewares/requireWebAuthn.js";

const router = express.Router();

// ============ User Management ============

// Ban/Unban user (requires WebAuthn for admins)
router.post(
  "/user/:userId/ban",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.banUser
);

router.post(
  "/user/:userId/unban",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.unbanUser
);

// Edit user name + apply cooldown
router.post(
  "/user/:userId/edit-name",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.editUserName
);

router.post(
  "/user/:userId/apply-name-cooldown",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.applyNameCooldown
);

// Partial bans (mute, chat ban, etc.)
router.post(
  "/user/:userId/partial-ban",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.applyPartialBan
);

router.post(
  "/user/:userId/remove-partial-ban",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.removePartialBan
);

// ============ Room Monitoring ============

// Get all active Colyseus rooms
router.get(
  "/rooms",
  requireAuth,
  requireAdmin,
  AdminController.getRooms
);

// Get detailed stats for a specific room
router.get(
  "/rooms/:roomId",
  requireAuth,
  requireAdmin,
  AdminController.getRoomDetails
);

// Kick player from room
router.post(
  "/rooms/:roomId/kick/:sessionId",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.kickFromRoom
);

// Broadcast message to room
router.post(
  "/rooms/:roomId/broadcast",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.broadcastToRoom
);

// ============ User Punishment ============

// Suspend user (temp ban, cannot log in)
router.post(
  "/user/:userId/suspend",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.suspendUser
);

router.post(
  "/user/:userId/unsuspend",
  requireAuth,
  requireAdmin,
  requireWebAuthn,
  AdminController.unsuspendUser
);

// ============ Audit Logs ============

// Get admin action logs
router.get(
  "/logs",
  requireAuth,
  requireAdmin,
  AdminController.getAdminLogs
);

router.get(
  "/logs/user/:userId",
  requireAuth,
  requireAdmin,
  AdminController.getUserLogs
);

export default router;
```

### 📋 **Admin Controller Methods**

```typescript
// File: src/api/v1/controllers/admin.ts

import { Request, Response } from "express";
import AdminService from "@/services/admin/AdminService.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class AdminController {
  // ============ User Management ============

  static async banUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { reason, duration } = req.body;
      const adminId = req.user!.id;

      const ban = await AdminService.banUser(userId, reason, duration, adminId);
      res.json({ success: true, ban });
    } catch (error) {
      logger.error("[AdminController.banUser]", error);
      return res.status(400).json(ERRORS.OPERATION_FAILED("Failed to ban user"));
    }
  }

  static async unbanUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const adminId = req.user!.id;

      await AdminService.unbanUser(userId, adminId);
      res.json({ success: true, message: "User unbanned" });
    } catch (error) {
      logger.error("[AdminController.unbanUser]", error);
      return res.status(400).json(ERRORS.OPERATION_FAILED("Failed to unban user"));
    }
  }

  static async editUserName(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { newName } = req.body;
      const adminId = req.user!.id;

      const user = await AdminService.editUserName(userId, newName, adminId);
      res.json({ success: true, user });
    } catch (error) {
      logger.error("[AdminController.editUserName]", error);
      return res.status(400).json(ERRORS.OPERATION_FAILED("Failed to edit user name"));
    }
  }

  static async applyNameCooldown(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { durationHours } = req.body;
      const adminId = req.user!.id;

      const cooldown = await AdminService.applyNameCooldown(
        userId,
        durationHours,
        adminId
      );
      res.json({ success: true, cooldown });
    } catch (error) {
      logger.error("[AdminController.applyNameCooldown]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to apply name cooldown"));
    }
  }

  static async applyPartialBan(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { banType, duration, reason } = req.body;
      const adminId = req.user!.id;

      // banType: "CHAT_MUTE" | "ROOM_KICK" | "TRADE_BAN" etc.
      const ban = await AdminService.applyPartialBan(
        userId,
        banType,
        duration,
        reason,
        adminId
      );
      res.json({ success: true, ban });
    } catch (error) {
      logger.error("[AdminController.applyPartialBan]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to apply partial ban"));
    }
  }

  static async removePartialBan(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { banType } = req.body;
      const adminId = req.user!.id;

      await AdminService.removePartialBan(userId, banType, adminId);
      res.json({ success: true, message: "Partial ban removed" });
    } catch (error) {
      logger.error("[AdminController.removePartialBan]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to remove partial ban"));
    }
  }

  // ============ Room Monitoring ============

  static async getRooms(req: Request, res: Response) {
    try {
      const rooms = await AdminService.getAllRooms();
      res.json({ success: true, rooms });
    } catch (error) {
      logger.error("[AdminController.getRooms]", error);
      return res.status(400).json(ERRORS.OPERATION_FAILED("Failed to fetch rooms"));
    }
  }

  static async getRoomDetails(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const details = await AdminService.getRoomDetails(roomId);
      res.json({ success: true, details });
    } catch (error) {
      logger.error("[AdminController.getRoomDetails]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to fetch room details"));
    }
  }

  static async kickFromRoom(req: Request, res: Response) {
    try {
      const { roomId, sessionId } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.id;

      await AdminService.kickFromRoom(roomId, sessionId, reason, adminId);
      res.json({ success: true, message: "Player kicked from room" });
    } catch (error) {
      logger.error("[AdminController.kickFromRoom]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to kick player"));
    }
  }

  static async broadcastToRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { message, messageType } = req.body;
      const adminId = req.user!.id;

      await AdminService.broadcastToRoom(roomId, message, messageType, adminId);
      res.json({ success: true, message: "Broadcast sent" });
    } catch (error) {
      logger.error("[AdminController.broadcastToRoom]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to broadcast"));
    }
  }

  // ============ User Suspension ============

  static async suspendUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { reason, durationHours } = req.body;
      const adminId = req.user!.id;

      const suspension = await AdminService.suspendUser(
        userId,
        reason,
        durationHours,
        adminId
      );
      res.json({ success: true, suspension });
    } catch (error) {
      logger.error("[AdminController.suspendUser]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to suspend user"));
    }
  }

  static async unsuspendUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const adminId = req.user!.id;

      await AdminService.unsuspendUser(userId, adminId);
      res.json({ success: true, message: "User unsuspended" });
    } catch (error) {
      logger.error("[AdminController.unsuspendUser]", error);
      return res
        .status(400)
        .json(ERRORS.OPERATION_FAILED("Failed to unsuspend user"));
    }
  }

  // ============ Audit Logs ============

  static async getAdminLogs(req: Request, res: Response) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const logs = await AdminService.getAdminLogs(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json({ success: true, logs });
    } catch (error) {
      logger.error("[AdminController.getAdminLogs]", error);
      return res.status(400).json(ERRORS.OPERATION_FAILED("Failed to fetch logs"));
    }
  }

  static async getUserLogs(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const logs = await AdminService.getUserLogs(userId);
      res.json({ success: true, logs });
    } catch (error) {
      logger.error("[AdminController.getUserLogs]", error);
      return res.status(400).json(ERRORS.OPERATION_FAILED("Failed to fetch user logs"));
    }
  }
}
```

### 📊 **Required Database Schema for Admin Features**

```sql
-- User bans (permanent or temporary)
CREATE TABLE user_bans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id) ON DELETE CASCADE,
  banned_by VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id),
  reason TEXT NOT NULL,
  ban_type VARCHAR(50) NOT NULL, -- "PERMANENT" | "TEMPORARY"
  banned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- NULL for permanent
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id) -- Only one active ban per user
);

-- Name change cooldowns
CREATE TABLE name_cooldowns (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id) ON DELETE CASCADE,
  applied_by VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id),
  reason TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Partial bans (mute, trade ban, room kick, etc.)
CREATE TABLE partial_bans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id) ON DELETE CASCADE,
  banned_by VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id),
  ban_type VARCHAR(50) NOT NULL, -- "CHAT_MUTE" | "TRADE_BAN" | "ROOM_KICK"
  reason TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User suspensions (cannot log in)
CREATE TABLE user_suspensions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id) ON DELETE CASCADE,
  suspended_by VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id),
  reason TEXT NOT NULL,
  suspended_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- NULL for permanent
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Admin action logs
CREATE TABLE admin_action_logs (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL REFERENCES main_profiles(user_id),
  action_type VARCHAR(100) NOT NULL, -- "USER_BAN" | "NAME_CHANGE" | "ROOM_KICK" etc.
  target_user_id VARCHAR(255),
  target_room_id VARCHAR(255),
  details JSONB,
  action_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(admin_id),
  INDEX(target_user_id)
);
```

---

## WebAuthn Implementation

### ✅ **WebAuthn with Grant OAuth (Is It Possible?)**

**YES, they can coexist!** Here's the architecture:

1. **Grant OAuth** (primary auth)
   - User logs in via Google/GitHub
   - Grant provides session/JWT
   - This is stateless and fast

2. **WebAuthn** (optional for users, mandatory for admins)
   - Registered separately after OAuth login
   - Stored in your database
   - Used for sensitive operations (admin actions, high-stakes gameplay)

3. **Flow**: OAuth → Session → Optional WebAuthn Registration → Admin WebAuthn Verification

### 📍 **Recommended Implementation**

#### Step 1: Keep Grant OAuth as Primary Auth

```typescript
// File: src/api/v1/routes/auth.ts

// OAuth endpoint (already exists)
router.get("/oauth/:provider/callback", async (req, res) => {
  // Grant handles this
  const user = req.user; // Provided by Grant
  
  // Issue JWT or session
  const token = jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username,
    isAdmin: user.isAdmin,
    webAuthnVerified: false, // Initially false
  }, process.env.JWT_SECRET);
  
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/dashboard");
});
```

#### Step 2: WebAuthn Registration (Optional for Users)

```typescript
// File: src/api/v1/routes/webauthn.ts (already exists)

// User can register WebAuthn after OAuth login
router.post("/register/options", requireAuth, async (req, res) => {
  const { userId } = req.body;
  
  // Generate registration challenge
  const options = await WebAuthnService.generateRegistrationOptions(userId);
  
  // Store challenge in Redis (expires in 5 minutes)
  await redis.setex(
    `webauthn:challenge:${userId}`,
    300,
    JSON.stringify(options.challenge)
  );
  
  res.json({ options });
});

router.post("/register/verify", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { credential } = req.body;
  
  // Verify credential
  const verified = await WebAuthnService.verifyRegistration(
    userId,
    credential
  );
  
  if (verified) {
    // Update user record: webAuthnRegistered = true
    await MainProfileDAO.updateWebAuthnStatus(userId, true);
    
    res.json({ success: true, message: "WebAuthn registered" });
  }
});
```

#### Step 3: WebAuthn Auth for Admins (Mandatory)

```typescript
// File: src/middlewares/requireWebAuthn.ts

export async function requireWebAuthn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json(ERRORS.UNAUTHORIZED());
  
  // Check if user is admin
  const user = await MainProfileDAO.findById(userId);
  if (!user?.isAdmin) {
    return res.status(403).json(ERRORS.FORBIDDEN("Not an admin"));
  }
  
  // Check if WebAuthn verified recently (within 15 minutes)
  const sessionKey = `webauthn:verified:${userId}`;
  const verified = await redis.get(sessionKey);
  
  if (!verified) {
    return res.status(403).json({
      error: "WEBAUTHN_VERIFICATION_REQUIRED",
      message: "Please verify with WebAuthn to perform admin actions",
    });
  }
  
  next();
}
```

#### Step 4: WebAuthn Authentication Flow

```typescript
// File: src/api/v1/routes/webauthn.ts

// Admin initiates authentication
router.post("/authenticate/options", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  
  // Get user's registered credentials
  const credentials = await WebAuthnDAO.getCredentials(userId);
  if (!credentials || credentials.length === 0) {
    return res.status(400).json({ error: "No WebAuthn credentials registered" });
  }
  
  // Generate auth challenge
  const options = await WebAuthnService.generateAuthenticationOptions(
    userId,
    credentials
  );
  
  // Store challenge in Redis (5 minutes)
  await redis.setex(
    `webauthn:auth:${userId}`,
    300,
    JSON.stringify(options.challenge)
  );
  
  res.json({ options });
});

// Admin verifies authentication
router.post("/authenticate/verify", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { credential } = req.body;
  
  // Verify the credential
  const verified = await WebAuthnService.verifyAuthentication(
    userId,
    credential
  );
  
  if (verified) {
    // Set Redis flag: valid for 15 minutes
    await redis.setex(`webauthn:verified:${userId}`, 900, "true");
    
    res.json({
      success: true,
      message: "WebAuthn verified, proceed with admin actions",
    });
  } else {
    res.status(400).json({ error: "WebAuthn verification failed" });
  }
});
```

### 🔑 **Key Points for WebAuthn + Grant Integration**

| Aspect | Grant OAuth | WebAuthn |
|--------|-------------|----------|
| **Purpose** | Primary authentication | 2FA / sensitive ops |
| **Mandatory** | Yes (for all users) | Yes (admins only) |
| **Refresh** | Session/JWT expires | 15 min re-verification |
| **Storage** | Not needed | PostgreSQL + Redis |
| **User Experience** | Fast, federated login | Seamless 2FA for admins |

---

## Authentication Architecture

### 📍 **Current Recommended Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                       User Login                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼────────┐
                    │ Grant OAuth   │
                    │ (Google/GH)   │
                    └──────┬────────┘
                           │
                    ┌──────▼──────────────┐
                    │ OAuth Callback      │
                    │ Issue JWT + Session │
                    └──────┬──────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
    Regular User                         Admin User
         │                                   │
         │ (Optional)                        │ (Mandatory)
         ▼                                   ▼
    WebAuthn Register               Requires WebAuthn Auth
         │                                   │
         │ (for sensitive ops)               │
         ▼                                   ▼
    WebAuthn Auth (re-verify)      WebAuthn Auth (15min)
         │                                   │
         ▼                                   ▼
    Proceed                          Proceed with Admin Actions
```

### 🔐 **JWT Payload Structure (Recommended)**

```typescript
interface DecodedJWT {
  id: string;                    // user_id
  email: string;
  username: string;
  isAdmin: boolean;
  authMethod: "oauth";           // Could be "oauth" | "custom" later
  issuedAt: number;              // iat
  expiresAt: number;             // exp
  // NOTE: Do NOT include webAuthnVerified here (sessions expire faster)
}

// WebAuthn verification state stored separately in Redis:
// Key: `webauthn:verified:${userId}`
// Value: "true"
// TTL: 15 minutes (refreshes on re-auth)
```

### ✅ **Why NOT Modify JWT for WebAuthn?**

```
❌ WRONG:
  JWT: { ..., webAuthnVerified: true, exp: 1hr }
  Problem: If admin's WebAuthn session expires after 15 min,
           but JWT still valid for 1hr, they could continue
           using admin actions without re-verifying.

✅ RIGHT:
  JWT: { ..., exp: 1hr }
  Redis: { webauthn:verified:${userId}: "true", TTL: 15min }
  Problem solved: Admin must re-verify WebAuthn every 15 min
                  regardless of JWT expiration.
```

---

## Session vs JWT Strategy

### 📊 **Current Recommendation: Hybrid**

| Feature | Approach |
|---------|----------|
| **Primary Auth** | JWT (Grant OAuth) — stateless, fast |
| **WebAuthn State** | Redis Sessions — short-lived, fast revocation |
| **Colyseus Messages** | JWT auth + Redis check for admin ops |
| **Database Sessions** | No — Redis is enough for our needs |

### ✅ **Why NOT Full Session-Based (Passport-like)?**

```
❌ Session DB (Passport style):
  - Every message: db.sessions.find() → slow
  - Cascading queries for large player counts
  - Overkill for a game that uses Redis already
  - Extra latency in Colyseus room operations

✅ JWT + Redis Hybrid:
  - Primary auth: JWT (decode locally, no DB/Redis hit)
  - Sensitive ops: Redis check (very fast, 1-2ms)
  - Can support 10,000+ concurrent users easily
  - Scales well with game growth
```

### 🔄 **Implementation Pattern**

```typescript
// File: src/middlewares/auth.ts

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  
  if (!token) return res.status(401).json(ERRORS.UNAUTHORIZED());
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as DecodedJWT;
    next();
  } catch (error) {
    return res.status(401).json(ERRORS.UNAUTHORIZED());
  }
}

// File: src/middlewares/requireAdmin.ts

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.isAdmin) {
    return res.status(403).json(ERRORS.FORBIDDEN("Admin access required"));
  }
  next();
}

// File: src/middlewares/requireWebAuthn.ts

export async function requireWebAuthn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json(ERRORS.UNAUTHORIZED());
  
  // Quick Redis check (O(1))
  const verified = await redis.get(`webauthn:verified:${userId}`);
  
  if (!verified) {
    return res.status(403).json({
      error: "WEBAUTHN_VERIFICATION_REQUIRED",
      message: "Please complete WebAuthn verification",
    });
  }
  
  next();
}
```

---

## Colyseus Integration

### 📍 **Checking WebAuthn in Colyseus Rooms**

```typescript
// File: src/rooms/GameRoom.ts

import { Room, Client } from "colyseus";
import { redis } from "@/config/redis.js";
import jwt from "jsonwebtoken";

export class GameRoom extends Room {
  async onAuth(client: Client, options: any) {
    // Extract JWT from auth options
    const token = options.token;
    
    if (!token) {
      throw new Error("Unauthorized");
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Store user info on client
      client.userData = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        isAdmin: decoded.isAdmin,
      };
      
      return true;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  
  onJoin(client: Client, options: any) {
    console.log(`${client.userData.username} joined`);
  }
  
  // For admin-only actions
  async onMessage(client: Client, message: any) {
    if (message.type === "ADMIN_ACTION") {
      // Check if admin
      if (!client.userData.isAdmin) {
        return client.send("error", { message: "Not admin" });
      }
      
      // Check WebAuthn verification (O(1) Redis check)
      const verified = await redis.get(
        `webauthn:verified:${client.userData.id}`
      );
      
      if (!verified) {
        return client.send("error", {
          error: "WEBAUTHN_VERIFICATION_REQUIRED",
          message: "Re-verify WebAuthn to perform admin actions",
        });
      }
      
      // Proceed with admin action
      this.handleAdminAction(client, message);
    }
  }
  
  private handleAdminAction(client: Client, message: any) {
    // Your admin logic here
  }
}
```

### 🚀 **Client-Side Flow (Frontend)**

```typescript
// Frontend: OAuth → Game Login → Admin WebAuthn (if needed)

async function login() {
  // 1. Grant OAuth redirect (handled by backend)
  window.location.href = "/auth/oauth/google";
}

async function connectToGame(token: string) {
  // 2. Connect to Colyseus with JWT
  const client = new Client("ws://localhost:2567");
  const room = await client.joinOrCreate("game", { token });
  
  // Ready to play
}

async function performAdminAction(action: string) {
  // 3. Check if WebAuthn needed
  const response = await fetch("/api/v1/admin/user/123/ban", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify(action),
  });
  
  if (response.status === 403 && 
      response.json().error === "WEBAUTHN_VERIFICATION_REQUIRED") {
    // 4. Prompt WebAuthn verification
    await verifyWithWebAuthn();
    
    // 5. Retry admin action
    return performAdminAction(action);
  }
}

async function verifyWithWebAuthn() {
  // 1. Get authentication options
  const optionsResponse = await fetch(
    "/api/v1/webauthn/authenticate/options",
    { method: "POST" }
  );
  const { options } = await optionsResponse.json();
  
  // 2. Use browser WebAuthn API
  const credential = await navigator.credentials.get(options);
  
  // 3. Verify with backend
  const verifyResponse = await fetch(
    "/api/v1/webauthn/authenticate/verify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    }
  );
  
  if (verifyResponse.ok) {
    // WebAuthn verified, Redis flag set, can now do admin actions
    return true;
  }
}
```

---

## Summary Table

| Component | Technology | When | Notes |
|-----------|-----------|------|-------|
| **Primary Auth** | Grant OAuth + JWT | Login | Stateless, fast |
| **Admin Verification** | WebAuthn | Before admin action | Mandatory, 15min re-verify |
| **Session State** | Redis | Temporary flags | Fast, short-lived |
| **Database Queries** | PostgreSQL | Game data | Not auth-critical path |
| **Colyseus Auth** | JWT from cookie | Room join | Check isAdmin for actions |

---

## Implementation Checklist

- [ ] Create `src/api/v1/routes/admin.ts` with routes above
- [ ] Create `src/api/v1/controllers/admin.ts` with methods above
- [ ] Create `src/services/admin/AdminService.ts` with business logic
- [ ] Create `src/daos/postgres/admin.ts` for DB operations
- [ ] Add admin-related tables to database schema
- [ ] Create `src/middlewares/requireAdmin.ts`
- [ ] Update `src/middlewares/requireWebAuthn.ts` (already exists)
- [ ] Register admin routes in `src/index.ts`
- [ ] Update Colyseus room to check WebAuthn for admin messages
- [ ] Test OAuth → WebAuthn → Admin Action flow
- [ ] Load test admin operations under concurrent users

---

**Next Steps:**

1. **Review & Curate** — Read through all three documents (UPGRADE_RECOMMENDATIONS, this one, and existing UPGRADE_SYSTEM_GUIDE)
2. **Pick & Choose** — Select which upgrades you like, which admin features you want
3. **Implement Incrementally** — Start with 1-2 admin features, then add upgrades
4. **Test Thoroughly** — Especially auth flows and permission checks

Let me know which direction you want to go first! 🚀
