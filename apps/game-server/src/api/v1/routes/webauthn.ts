/**
 * WebAuthn Routes
 * All routes require authentication (via Grant OAuth + JWT)
 * Optional: Some routes require additional WebAuthn verification
 */

import { Router, Request, Response, NextFunction } from "express";
import WebAuthnController from "@/api/v1/controllers/webAuthnController.js";
import logger from "@/utils/logger.js";

/**
 * Extend Express Request to include user context
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username?: string;
    isAdmin?: boolean;
  };
  session?: any;
}

/**
 * Middleware: Verify user is authenticated (has valid JWT from OAuth)
 * Adjust this to match your existing auth middleware
 */
const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user?.id) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "User must be authenticated via OAuth first",
    });
  }

  next();
};

/**
 * Middleware: Verify user has WebAuthn verified in this session
 * Used for sensitive operations
 */
const requireWebAuthnVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Check if WebAuthn was verified recently
  if (!req.session?.webAuthnVerified) {
    return res.status(403).json({
      error: "WebAuthn verification required",
      message:
        "Must complete WebAuthn challenge first. Call /webauthn/authenticate/start",
      requiresWebAuthn: true,
    });
  }

  // Optional: Check timestamp to require re-verification after X minutes
  const verifiedAt = req.session?.webAuthnVerifiedAt;
  if (verifiedAt) {
    const ageMs = Date.now() - verifiedAt.getTime();
    const maxAgeMs = 15 * 60 * 1000; // 15 minutes

    if (ageMs > maxAgeMs) {
      return res.status(403).json({
        error: "WebAuthn verification expired",
        message: "WebAuthn verification expired. Must reverify.",
        requiresWebAuthn: true,
      });
    }
  }

  next();
};

/**
 * Middleware: Verify user is admin
 */
const adminOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Admin access required",
    });
  }

  next();
};

const router = Router();

// ==================== Public Routes (no auth required) ====================
// None - all WebAuthn routes require OAuth login first

// ==================== User Routes (auth required) ====================

/**
 * POST /api/v1/webauthn/register/start
 * Initiate WebAuthn enrollment
 * User must be logged in (via OAuth)
 *
 * Response:
 * {
 *   "options": { ... WebAuthn options ... },
 *   "message": "Registration options generated"
 * }
 */
router.post(
  "/register/start",
  authMiddleware,
  WebAuthnController.startRegistration
);

/**
 * POST /api/v1/webauthn/register/complete
 * Complete WebAuthn enrollment
 *
 * Body:
 * {
 *   "credentialName": "My Security Key",
 *   "response": { ... attestation response ... }
 * }
 *
 * Response:
 * {
 *   "credentialId": "...",
 *   "recoveryCodes": ["CODE1", "CODE2", ...],  // If admin
 *   "message": "Registration successful"
 * }
 */
router.post(
  "/register/complete",
  authMiddleware,
  WebAuthnController.completeRegistration
);

/**
 * POST /api/v1/webauthn/authenticate/start
 * Initiate WebAuthn verification challenge
 *
 * Response:
 * {
 *   "options": { ... WebAuthn challenge ... },
 *   "requiresWebAuthn": true
 * }
 */
router.post(
  "/authenticate/start",
  authMiddleware,
  WebAuthnController.startAuthentication
);

/**
 * POST /api/v1/webauthn/authenticate/complete
 * Complete WebAuthn verification challenge
 *
 * Body:
 * {
 *   "response": { ... assertion response ... }
 * }
 *
 * Response:
 * {
 *   "credentialId": "...",
 *   "verified": true,
 *   "message": "Authentication successful"
 * }
 *
 * Note: After this, req.session.webAuthnVerified will be set to true
 */
router.post(
  "/authenticate/complete",
  authMiddleware,
  WebAuthnController.completeAuthentication
);

/**
 * GET /api/v1/webauthn/credentials
 * List all WebAuthn credentials for current user
 *
 * Response:
 * {
 *   "credentials": [
 *     {
 *       "id": "...",
 *       "credential_name": "My MacBook",
 *       "is_resident_key": false,
 *       "created_at": "2026-06-23T...",
 *       "last_used_at": "2026-06-23T..."
 *     }
 *   ],
 *   "count": 1
 * }
 */
router.get("/credentials", authMiddleware, WebAuthnController.getCredentials);

/**
 * DELETE /api/v1/webauthn/credentials/:credentialId
 * Remove a WebAuthn credential
 *
 * Response:
 * {
 *   "credentialId": "...",
 *   "message": "Credential deleted successfully"
 * }
 */
router.delete(
  "/credentials/:credentialId",
  authMiddleware,
  WebAuthnController.deleteCredential
);

/**
 * POST /api/v1/webauthn/recovery/verify
 * Verify recovery code (fallback if lost security key)
 * No WebAuthn verification required (user doesn't have it anymore!)
 *
 * Body:
 * {
 *   "code": "ABCD1234"
 * }
 *
 * Response:
 * {
 *   "valid": true,
 *   "message": "Recovery code accepted. 9 codes remaining.",
 *   "codesRemaining": 9
 * }
 */
router.post(
  "/recovery/verify",
  authMiddleware,
  WebAuthnController.verifyRecoveryCode
);

// ==================== Admin Routes (auth + admin + optional WebAuthn required) ====================

/**
 * POST /api/v1/webauthn/recovery-codes/generate
 * Generate new recovery codes (admin only)
 * Requires: Admin status + WebAuthn verification (if enrolled)
 *
 * Response:
 * {
 *   "codes": ["CODE1", "CODE2", ...],
 *   "message": "Save these 10 recovery codes..."
 * }
 */
router.post(
  "/recovery-codes/generate",
  authMiddleware,
  adminOnly,
  requireWebAuthnVerification,
  WebAuthnController.generateRecoveryCodes
);

/**
 * GET /api/v1/webauthn/recovery/count
 * Get remaining recovery codes count (admin only)
 * Requires: Admin status
 *
 * Response:
 * {
 *   "remaining": 8
 * }
 */
router.get(
  "/recovery/count",
  authMiddleware,
  adminOnly,
  WebAuthnController.getRecoveryCodeCount
);

// ==================== Error Handler ====================

router.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("[WebAuthn Routes] Error", {
      path: req.path,
      method: req.method,
      error: err.message,
    });

    res.status(500).json({
      error: "Internal server error",
      message: err.message || "Something went wrong",
    });
  }
);

export default router;
