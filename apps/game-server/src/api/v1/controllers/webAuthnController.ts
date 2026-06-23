/**
 * WebAuthn Controller
 * Handles WebAuthn registration and authentication endpoints
 * Integrates with Grant OAuth platform
 */

import { Request, Response, NextFunction } from "express";
import { WebAuthnService } from "@/services/auth/webauthn/WebAuthnService.js";
import { RecoveryCodesService } from "@/services/auth/webauthn/RecoveryCodesService.js";
import {
  WebAuthnCredentialDAO,
  WebAuthnRecoveryCodeDAO,
} from "@/daos/postgres/webauthn.ts";
import { ApiResponse } from "../utils/response.ts";
import logger from "@/utils/logger.js";

/**
 * Extend Express Request to include user context from OAuth/JWT
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin?: boolean;
  };
}

export default class WebAuthnController {
  /**
   * POST /api/v1/webauthn/register/start
   * Initiate WebAuthn registration
   * User must be logged in (via Grant OAuth)
   */
  static async startRegistration(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      const result = await WebAuthnService.startRegistration(userId);

      res.json(
        ApiResponse.success(
          {
            options: result.options,
          },
          "Registration options generated"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.startRegistration]", { error });
      next(error);
    }
  }

  /**
   * POST /api/v1/webauthn/register/complete
   * Verify registration and store credential
   */
  static async completeRegistration(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      const { credentialName, response } = req.body;

      if (!response) {
        return res
          .status(400)
          .json(
            ApiResponse.error("Invalid payload", "Missing registration response")
          );
      }

      const result = await WebAuthnService.completeRegistration(userId, {
        credentialName,
        response,
      }, WebAuthnCredentialDAO);

      // If admin, generate recovery codes
      if (req.user?.isAdmin) {
        const recoveryCodes = await RecoveryCodesService.generateRecoveryCodes(
          userId,
          WebAuthnRecoveryCodeDAO
        );

        return res.json(
          ApiResponse.success(
            {
              credentialId: result.credentialId,
              recoveryCodes: recoveryCodes.displayCodes,
              message: recoveryCodes.message,
            },
            "Registration successful"
          )
        );
      }

      res.json(
        ApiResponse.success(
          {
            credentialId: result.credentialId,
          },
          "Registration successful"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.completeRegistration]", { error });
      next(error);
    }
  }

  /**
   * POST /api/v1/webauthn/authenticate/start
   * Initiate WebAuthn authentication
   * Used to verify user with existing credential
   */
  static async startAuthentication(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      // Check if user has WebAuthn enrolled
      const hasEnrolled = await WebAuthnCredentialDAO.hasEnrolled(userId);
      if (!hasEnrolled) {
        return res.status(400).json(
          ApiResponse.error(
            "No credentials",
            "User has not enrolled in WebAuthn"
          )
        );
      }

      const result = await WebAuthnService.startAuthentication(
        userId,
        WebAuthnCredentialDAO
      );

      res.json(
        ApiResponse.success(
          {
            options: result.options,
            requiresWebAuthn: result.requiresWebAuthn,
          },
          "Authentication challenge generated"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.startAuthentication]", { error });
      next(error);
    }
  }

  /**
   * POST /api/v1/webauthn/authenticate/complete
   * Verify authentication response
   */
  static async completeAuthentication(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      const { response } = req.body;
      if (!response) {
        return res
          .status(400)
          .json(
            ApiResponse.error("Invalid payload", "Missing authentication response")
          );
      }

      const result = await WebAuthnService.completeAuthentication(userId, {
        response,
      }, WebAuthnCredentialDAO);

      // Return success - client can now proceed with privileged operations
      res.json(
        ApiResponse.success(
          {
            credentialId: result.credentialId,
            verified: true,
          },
          "Authentication successful"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.completeAuthentication]", { error });
      next(error);
    }
  }

  /**
   * GET /api/v1/webauthn/credentials
   * List all WebAuthn credentials for current user
   */
  static async getCredentials(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      const credentials = await WebAuthnCredentialDAO.findByUserId(userId);

      // Don't expose sensitive data
      const safe = credentials.map((c) => ({
        id: c.id,
        credential_name: c.credential_name,
        is_resident_key: c.is_resident_key,
        is_user_verifying: c.is_user_verifying,
        created_at: c.created_at,
        last_used_at: c.last_used_at,
      }));

      res.json(
        ApiResponse.success(
          {
            credentials: safe,
            count: safe.length,
          },
          "Credentials retrieved"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.getCredentials]", { error });
      next(error);
    }
  }

  /**
   * DELETE /api/v1/webauthn/credentials/:credentialId
   * Remove a WebAuthn credential
   */
  static async deleteCredential(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      const { credentialId } = req.params;

      // Verify credential belongs to user
      const credential = await WebAuthnCredentialDAO.findById(credentialId);
      if (!credential || credential.user_id !== userId) {
        return res
          .status(404)
          .json(ApiResponse.error("Not found", "Credential not found"));
      }

      await WebAuthnCredentialDAO.delete(credentialId);

      logger.info(
        `[WebAuthnController] Credential deleted for userId: ${userId}`,
        { credentialId }
      );

      res.json(
        ApiResponse.success(
          { credentialId },
          "Credential deleted successfully"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.deleteCredential]", { error });
      next(error);
    }
  }

  /**
   * POST /api/v1/webauthn/recovery-codes/generate
   * Generate new recovery codes (admin only)
   */
  static async generateRecoveryCodes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId || !req.user?.isAdmin) {
        return res
          .status(403)
          .json(
            ApiResponse.error("Forbidden", "Admin status required")
          );
      }

      // Delete old codes
      await WebAuthnRecoveryCodeDAO.deleteByUserId(userId);

      // Generate new codes
      const result = await RecoveryCodesService.generateRecoveryCodes(
        userId,
        WebAuthnRecoveryCodeDAO
      );

      res.json(
        ApiResponse.success(
          {
            codes: result.displayCodes,
            message: result.message,
          },
          "Recovery codes generated"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.generateRecoveryCodes]", { error });
      next(error);
    }
  }

  /**
   * POST /api/v1/webauthn/recovery/verify
   * Verify a recovery code
   * Used when user lost their WebAuthn device
   */
  static async verifyRecoveryCode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json(ApiResponse.error("Unauthorized", "User not authenticated"));
      }

      const { code } = req.body;
      if (!code) {
        return res
          .status(400)
          .json(ApiResponse.error("Invalid payload", "Missing recovery code"));
      }

      const result = await RecoveryCodesService.validateAndUseRecoveryCode(
        userId,
        code,
        WebAuthnRecoveryCodeDAO
      );

      const statusCode = result.valid ? 200 : 400;
      res.status(statusCode).json(
        ApiResponse.success(
          {
            valid: result.valid,
            message: result.message,
            codesRemaining: result.codesRemaining,
          },
          result.message
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.verifyRecoveryCode]", { error });
      next(error);
    }
  }

  /**
   * GET /api/v1/webauthn/recovery/count
   * Get number of remaining recovery codes
   */
  static async getRecoveryCodeCount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;
      if (!userId || !req.user?.isAdmin) {
        return res
          .status(403)
          .json(
            ApiResponse.error("Forbidden", "Admin status required")
          );
      }

      const count = await RecoveryCodesService.getRemainingCodesCount(
        userId,
        WebAuthnRecoveryCodeDAO
      );

      res.json(
        ApiResponse.success(
          { remaining: count },
          "Recovery code count retrieved"
        )
      );
    } catch (error) {
      logger.error("[WebAuthnController.getRecoveryCodeCount]", { error });
      next(error);
    }
  }
}
