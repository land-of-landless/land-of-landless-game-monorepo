/**
 * WebAuthn DAO
 * Data Access Object for WebAuthn credentials and recovery codes
 */

import { db } from "@/daos/postgres/connection.ts";
import {
  webAuthnCredentials,
  webAuthnRecoveryCodes,
} from "@/models/postgres/schema.js";
import { eq, and } from "drizzle-orm";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";
import type { WebAuthnCredential, WebAuthnRecoveryCode } from "@/services/auth/webauthn/types.js";

/**
 * WebAuthn Credential DAO
 */
export class WebAuthnCredentialDAO {
  /**
   * Create a new WebAuthn credential
   */
  static async create(
    credentialData: Omit<WebAuthnCredential, "id" | "created_at" | "updated_at">
  ): Promise<WebAuthnCredential> {
    try {
      const result = await db
        .insert(webAuthnCredentials)
        .values({
          ...credentialData,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return result[0];
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.create] Error for userId: ${credentialData.user_id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to create WebAuthn credential: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find credential by ID
   */
  static async findById(id: string): Promise<WebAuthnCredential | null> {
    try {
      const result = await db.query.webAuthnCredentials.findFirst({
        where: eq(webAuthnCredentials.id, id),
      });
      return result ?? null;
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.findById] Error for credential id: ${id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to fetch credential: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find credential by credential_id (base64)
   */
  static async findByCredentialId(
    credentialId: string
  ): Promise<WebAuthnCredential | null> {
    try {
      const result = await db.query.webAuthnCredentials.findFirst({
        where: eq(webAuthnCredentials.credential_id, credentialId),
      });
      return result ?? null;
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.findByCredentialId] Error for credential_id: ${credentialId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to fetch credential: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find all credentials for a user
   */
  static async findByUserId(userId: string): Promise<WebAuthnCredential[]> {
    try {
      return await db.query.webAuthnCredentials.findMany({
        where: eq(webAuthnCredentials.user_id, userId),
        orderBy: (creds) => creds.created_at,
      });
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.findByUserId] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to fetch credentials: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update counter (for clone detection)
   */
  static async updateCounter(id: string, newCounter: number): Promise<void> {
    try {
      await db
        .update(webAuthnCredentials)
        .set({
          counter: newCounter,
          updated_at: new Date(),
        })
        .where(eq(webAuthnCredentials.id, id));
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.updateCounter] Error for credential id: ${id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to update counter: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Update last_used_at timestamp
   */
  static async updateLastUsed(id: string): Promise<void> {
    try {
      await db
        .update(webAuthnCredentials)
        .set({
          last_used_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(webAuthnCredentials.id, id));
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.updateLastUsed] Error for credential id: ${id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to update last used: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Delete a credential
   */
  static async delete(id: string): Promise<void> {
    try {
      await db
        .delete(webAuthnCredentials)
        .where(eq(webAuthnCredentials.id, id));
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.delete] Error for credential id: ${id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to delete credential: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check if user has WebAuthn enrolled
   */
  static async hasEnrolled(userId: string): Promise<boolean> {
    try {
      const result = await db.query.webAuthnCredentials.findFirst({
        where: eq(webAuthnCredentials.user_id, userId),
      });
      return result !== undefined;
    } catch (error) {
      logger.error(
        `[WebAuthnCredentialDAO.hasEnrolled] Error for userId: ${userId}`,
        { error }
      );
      return false;
    }
  }
}

/**
 * WebAuthn Recovery Code DAO
 */
export class WebAuthnRecoveryCodeDAO {
  /**
   * Create a recovery code
   */
  static async create(
    codeData: Omit<WebAuthnRecoveryCode, "id" | "created_at">
  ): Promise<WebAuthnRecoveryCode> {
    try {
      const result = await db
        .insert(webAuthnRecoveryCodes)
        .values({
          ...codeData,
          created_at: new Date(),
        })
        .returning();

      return result[0];
    } catch (error) {
      logger.error(
        `[WebAuthnRecoveryCodeDAO.create] Error for userId: ${codeData.user_id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to create recovery code: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find all unused recovery codes for a user
   */
  static async findUnusedByUserId(
    userId: string
  ): Promise<WebAuthnRecoveryCode[]> {
    try {
      return await db.query.webAuthnRecoveryCodes.findMany({
        where: and(
          eq(webAuthnRecoveryCodes.user_id, userId),
          eq(webAuthnRecoveryCodes.used_at, null)
        ),
      });
    } catch (error) {
      logger.error(
        `[WebAuthnRecoveryCodeDAO.findUnusedByUserId] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to fetch recovery codes: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Mark a recovery code as used
   */
  static async markAsUsed(id: string): Promise<void> {
    try {
      await db
        .update(webAuthnRecoveryCodes)
        .set({ used_at: new Date() })
        .where(eq(webAuthnRecoveryCodes.id, id));
    } catch (error) {
      logger.error(
        `[WebAuthnRecoveryCodeDAO.markAsUsed] Error for code id: ${id}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to mark code as used: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get count of unused codes for a user
   */
  static async countUnused(userId: string): Promise<number> {
    try {
      const result = await db.query.webAuthnRecoveryCodes.findMany({
        where: and(
          eq(webAuthnRecoveryCodes.user_id, userId),
          eq(webAuthnRecoveryCodes.used_at, null)
        ),
      });
      return result.length;
    } catch (error) {
      logger.error(
        `[WebAuthnRecoveryCodeDAO.countUnused] Error for userId: ${userId}`,
        { error }
      );
      return 0;
    }
  }

  /**
   * Delete all recovery codes for a user (when regenerating)
   */
  static async deleteByUserId(userId: string): Promise<void> {
    try {
      await db
        .delete(webAuthnRecoveryCodes)
        .where(eq(webAuthnRecoveryCodes.user_id, userId));
    } catch (error) {
      logger.error(
        `[WebAuthnRecoveryCodeDAO.deleteByUserId] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to delete recovery codes: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default {
  WebAuthnCredentialDAO,
  WebAuthnRecoveryCodeDAO,
};
