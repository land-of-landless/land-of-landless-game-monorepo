/**
 * WebAuthn Module Exports
 * Central export point for all WebAuthn services
 */

export { WebAuthnService } from "./WebAuthnService.js";
export { RecoveryCodesService } from "./RecoveryCodesService.js";
export type {
  RegistrationStartResponse,
  RegistrationCompletePayload,
  AuthenticationStartResponse,
  AuthenticationCompletePayload,
} from "./WebAuthnService.js";
export type {
  GeneratedRecoveryCodes,
  RecoveryCodeValidation,
} from "./RecoveryCodesService.js";
export type {
  WebAuthnCredential,
  WebAuthnCredentialWithTransports,
  AuthenticatorTransport,
  WebAuthnRecoveryCode,
  AdminWebAuthnEnforcement,
} from "./types.js";
