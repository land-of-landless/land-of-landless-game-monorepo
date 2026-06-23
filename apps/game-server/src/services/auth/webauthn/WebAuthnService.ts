/**
 * WebAuthn Service
 * Handles registration and authentication for WebAuthn credentials.
 * Works in conjunction with Grant OAuth platform.
 *
 * Flow:
 * 1. User authenticates via OAuth (Grant) → JWT token
 * 2. User optionally adds WebAuthn credential
 * 3. On sensitive operations (admin panel), WebAuthn challenge is required
 * 4. For admins, WebAuthn enrollment is mandatory
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";
import type { WebAuthnCredentialWithTransports } from "./types.js";

export interface RegistrationStartResponse {
  challenge: string;
  options: any;
}

export interface RegistrationCompletePayload {
  credentialName?: string;
  response: RegistrationResponseJSON;
}

export interface AuthenticationStartResponse {
  challenge: string;
  options: any;
  requiresWebAuthn: boolean;
}

export interface AuthenticationCompletePayload {
  response: AuthenticationResponseJSON;
}

export class WebAuthnService {
  private static readonly RP_ID = process.env.WEBAUTHN_RP_ID || "yourgame.com";
  private static readonly RP_NAME = "Land of Landless";
  private static readonly ORIGIN =
    process.env.WEBAUTHN_ORIGIN ||
    `https://${process.env.WEBAUTHN_RP_ID || "yourgame.com"}`;
  private static readonly CHALLENGE_TIMEOUT = 300; // 5 minutes

  /**
   * Step 1: Generate registration options for a user
   * Called when user initiates WebAuthn enrollment
   */
  static async startRegistration(
    userId: string
  ): Promise<RegistrationStartResponse> {
    try {
      const options = await generateRegistrationOptions({
        rpID: this.RP_ID,
        rpName: this.RP_NAME,
        userID: isoBase64URL.toBuffer(userId),
        userName: userId, // or fetch from DB
        userDisplayName: userId,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "cross-platform", // Security keys, cross-device
          residentKey: "preferred", // Passkeys
          userVerification: "preferred",
        },
        timeout: 60000, // 60 seconds for user interaction
        supportedAlgorithmIDs: [-7, -257], // ES256, RS256
      });

      // Store challenge in cache (Redis recommended for production)
      // For now, we'll pass it back and expect it in verification
      const challengeKey = `webauthn:reg:${userId}`;
      await this.storeChallenge(challengeKey, options.challenge);

      return {
        challenge: options.challenge,
        options,
      };
    } catch (error) {
      logger.error(
        `[WebAuthnService.startRegistration] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to generate registration options: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Step 2: Verify registration response and store credential
   * Called after user completes WebAuthn ceremony
   */
  static async completeRegistration(
    userId: string,
    payload: RegistrationCompletePayload,
    webAuthnDAO: any
  ): Promise<{ success: boolean; credentialId: string }> {
    try {
      const challengeKey = `webauthn:reg:${userId}`;
      const storedChallenge = await this.getChallenge(challengeKey);

      if (!storedChallenge) {
        throw new Error("Registration challenge expired or not found");
      }

      const verification = await verifyRegistrationResponse({
        response: payload.response,
        expectedChallenge: storedChallenge,
        expectedOrigin: this.ORIGIN,
        expectedRPID: this.RP_ID,
        supportedAlgorithmIDs: [-7, -257],
      });

      if (!verification.verified) {
        throw new Error("Registration verification failed");
      }

      const registrationInfo = verification.registrationInfo;
      if (!registrationInfo) {
        throw new Error("No registration info returned");
      }

      // Store credential in database
      const credentialId = isoBase64URL.fromBuffer(
        registrationInfo.credentialID
      );
      const publicKey = isoBase64URL.fromBuffer(
        registrationInfo.credentialPublicKey
      );

      const credential = await webAuthnDAO.create({
        user_id: userId,
        credential_id: credentialId,
        public_key: publicKey,
        counter: registrationInfo.counter,
        transports: payload.response.response.transports || [],
        is_resident_key:
          registrationInfo.credentialDeviceType === "multidevice",
        is_user_verifying: registrationInfo.userVerified,
        backup_eligible: registrationInfo.credentialBackedUp,
        backup_state: registrationInfo.credentialBackedUp,
        credential_name: payload.credentialName || "Security Key",
      });

      // Clean up challenge
      await this.deleteChallenge(challengeKey);

      logger.info(`[WebAuthnService] Credential registered for userId: ${userId}`, {
        credentialId,
        isResidentKey: registrationInfo.credentialDeviceType === "multidevice",
      });

      return {
        success: true,
        credentialId: credential.id,
      };
    } catch (error) {
      logger.error(
        `[WebAuthnService.completeRegistration] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to complete registration: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Step 3: Generate authentication challenge
   * Called when user needs to verify with WebAuthn
   */
  static async startAuthentication(
    userId: string,
    webAuthnDAO: any
  ): Promise<AuthenticationStartResponse> {
    try {
      const credentials = await webAuthnDAO.findByUserId(userId);

      if (!credentials || credentials.length === 0) {
        throw new Error("No WebAuthn credentials found for user");
      }

      const options = await generateAuthenticationOptions({
        rpID: this.RP_ID,
        allowCredentials: credentials.map(
          (c: WebAuthnCredentialWithTransports) => ({
            id: isoBase64URL.toBuffer(c.credential_id),
            type: "public-key" as const,
            transports: c.transports as AuthenticatorTransport[],
          })
        ),
        userVerification: "preferred",
        timeout: 60000,
      });

      const challengeKey = `webauthn:auth:${userId}`;
      await this.storeChallenge(challengeKey, options.challenge);

      logger.info(
        `[WebAuthnService] Authentication challenge created for userId: ${userId}`
      );

      return {
        challenge: options.challenge,
        options,
        requiresWebAuthn: true,
      };
    } catch (error) {
      logger.error(
        `[WebAuthnService.startAuthentication] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to generate authentication options: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Step 4: Verify authentication response
   * Called after user completes WebAuthn verification challenge
   */
  static async completeAuthentication(
    userId: string,
    payload: AuthenticationCompletePayload,
    webAuthnDAO: any
  ): Promise<{ success: boolean; credentialId: string }> {
    try {
      const challengeKey = `webauthn:auth:${userId}`;
      const storedChallenge = await this.getChallenge(challengeKey);

      if (!storedChallenge) {
        throw new Error("Authentication challenge expired");
      }

      // Find the credential that was used
      const credentialId = payload.response.id;
      const credential = await webAuthnDAO.findByCredentialId(credentialId);

      if (!credential) {
        throw new Error("Credential not found");
      }

      // Verify the authentication response
      const verification = await verifyAuthenticationResponse({
        response: payload.response,
        expectedChallenge: storedChallenge,
        expectedOrigin: this.ORIGIN,
        expectedRPID: this.RP_ID,
        credential: {
          id: isoBase64URL.toBuffer(credential.credential_id),
          publicKey: isoBase64URL.toBuffer(credential.public_key),
          counter: credential.counter,
          transports: credential.transports,
        },
      });

      if (!verification.verified) {
        throw new Error("Authentication verification failed");
      }

      // Update counter to prevent cloned authenticators
      const authInfo = verification.authenticationInfo;
      await webAuthnDAO.updateCounter(credential.id, authInfo.newCounter);

      // Update last used timestamp
      await webAuthnDAO.updateLastUsed(credential.id);

      await this.deleteChallenge(challengeKey);

      logger.info(
        `[WebAuthnService] Authentication verified for userId: ${userId}`,
        { credentialId: credential.id }
      );

      return {
        success: true,
        credentialId: credential.id,
      };
    } catch (error) {
      logger.error(
        `[WebAuthnService.completeAuthentication] Error for userId: ${userId}`,
        { error }
      );
      throw ERRORS.DB_ERROR(
        `Failed to complete authentication: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Helper: Store challenge in cache (use Redis in production)
   */
  private static async storeChallenge(
    key: string,
    challenge: string
  ): Promise<void> {
    // TODO: Implement with Redis
    // await redis.set(key, challenge, "EX", this.CHALLENGE_TIMEOUT);
    // For now, this is a placeholder
  }

  /**
   * Helper: Retrieve challenge from cache
   */
  private static async getChallenge(key: string): Promise<string | null> {
    // TODO: Implement with Redis
    // return await redis.get(key);
    return null;
  }

  /**
   * Helper: Delete challenge from cache
   */
  private static async deleteChallenge(key: string): Promise<void> {
    // TODO: Implement with Redis
    // await redis.del(key);
  }
}
