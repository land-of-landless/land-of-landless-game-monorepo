/**
 * WebAuthn Recovery Codes Service
 * Handles generation and validation of recovery codes for WebAuthn
 * Primarily used for admins to regain access if their security key is lost
 *
 * Best practices:
 * 1. Generate 10 codes when user enrolls in WebAuthn
 * 2. Show codes once and tell user to save them
 * 3. Store hashed versions in database
 * 4. Allow one-time use per code
 * 5. Mark as used after successful authentication fallback
 */

import crypto from "crypto";
import bcrypt from "bcrypt";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

export interface GeneratedRecoveryCodes {
  codes: string[];
  hashedCodes: string[];
}

export interface RecoveryCodeValidation {
  valid: boolean;
  message: string;
  codesRemaining?: number;
}

export class RecoveryCodesService {
  private static readonly CODE_LENGTH = 8; // 8 hex characters (4 bytes)
  private static readonly CODES_PER_GENERATION = 10;
  private static readonly BCRYPT_ROUNDS = 10;

  /**
   * Generate recovery codes for a user
   * Returns both plain and hashed versions
   * Plain codes should be shown to user once
   * Hashed codes are stored in database
   */
  static async generateRecoveryCodes(
    userId: string,
    recoveryCodeDAO: any
  ): Promise<{ displayCodes: string[]; message: string }> {
    try {
      // Generate 10 unique codes
      const codes = new Set<string>();
      while (codes.size < this.CODES_PER_GENERATION) {
        const code = crypto
          .randomBytes(this.CODE_LENGTH)
          .toString("hex")
          .toUpperCase();
        codes.add(code);
      }

      const codeArray = Array.from(codes);

      // Hash each code
      const hashedCodes = await Promise.all(
        codeArray.map((code) => this.hashCode(code))
      );

      // Store in database
      for (const hashedCode of hashedCodes) {
        await recoveryCodeDAO.create({
          user_id: userId,
          code_hash: hashedCode,
        });
      }

      logger.info(`[RecoveryCodesService] Generated recovery codes for userId: ${userId}`, {
        codeCount: codeArray.length,
      });

      return {
        displayCodes: codeArray,
        message: `Save these ${this.CODES_PER_GENERATION} recovery codes in a safe place. You can use each code once to regain access if you lose your security key.`,
      };
    } catch (error) {
      logger.error(
        `[RecoveryCodesService.generateRecoveryCodes] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to generate recovery codes: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Validate a recovery code for a user
   * Returns success only if code matches and hasn't been used
   */
  static async validateAndUseRecoveryCode(
    userId: string,
    code: string,
    recoveryCodeDAO: any
  ): Promise<RecoveryCodeValidation> {
    try {
      // Find all unused codes for this user
      const unusedCodes = await recoveryCodeDAO.findUnusedByUserId(userId);

      if (!unusedCodes || unusedCodes.length === 0) {
        return {
          valid: false,
          message: "No recovery codes available. Contact administrator.",
          codesRemaining: 0,
        };
      }

      // Check if provided code matches any stored code
      let matchingCode = null;
      for (const storedCode of unusedCodes) {
        const matches = await this.compareCode(code, storedCode.code_hash);
        if (matches) {
          matchingCode = storedCode;
          break;
        }
      }

      if (!matchingCode) {
        logger.warn(
          `[RecoveryCodesService] Invalid recovery code attempt for userId: ${userId}`
        );
        return {
          valid: false,
          message: "Invalid recovery code.",
          codesRemaining: unusedCodes.length,
        };
      }

      // Mark code as used
      await recoveryCodeDAO.markAsUsed(matchingCode.id);

      const codesRemaining = unusedCodes.length - 1;

      logger.info(
        `[RecoveryCodesService] Recovery code used for userId: ${userId}`,
        { codesRemaining }
      );

      return {
        valid: true,
        message: `Recovery code accepted. ${codesRemaining} code(s) remaining.`,
        codesRemaining,
      };
    } catch (error) {
      logger.error(
        `[RecoveryCodesService.validateAndUseRecoveryCode] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to validate recovery code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get count of remaining recovery codes for a user
   */
  static async getRemainingCodesCount(
    userId: string,
    recoveryCodeDAO: any
  ): Promise<number> {
    try {
      const unusedCodes = await recoveryCodeDAO.findUnusedByUserId(userId);
      return unusedCodes?.length ?? 0;
    } catch (error) {
      logger.error(
        `[RecoveryCodesService.getRemainingCodesCount] Error for userId: ${userId}`,
        { error }
      );
      return 0;
    }
  }

  /**
   * Helper: Hash a code using bcrypt
   */
  private static async hashCode(code: string): Promise<string> {
    return bcrypt.hash(code, this.BCRYPT_ROUNDS);
  }

  /**
   * Helper: Compare a plain code with its hash
   */
  private static async compareCode(
    plainCode: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(plainCode, hash);
  }
}
