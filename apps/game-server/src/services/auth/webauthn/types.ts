/**
 * WebAuthn Type Definitions
 */

export interface WebAuthnCredential {
  id: string;
  user_id: string;
  credential_id: string; // Base64 encoded
  public_key: string; // Base64 encoded
  counter: number;
  transports: string[];
  is_resident_key: boolean;
  is_user_verifying: boolean;
  backup_eligible: boolean;
  backup_state: boolean;
  credential_name: string;
  created_at: Date;
  last_used_at: Date | null;
  updated_at: Date;
}

export interface WebAuthnCredentialWithTransports extends WebAuthnCredential {
  transports: AuthenticatorTransport[];
}

export type AuthenticatorTransport =
  | "usb"
  | "nfc"
  | "ble"
  | "smart-card"
  | "hybrid"
  | "internal";

export interface WebAuthnRecoveryCode {
  id: string;
  user_id: string;
  code_hash: string; // Bcrypt hashed
  used_at: Date | null;
  created_at: Date;
}

export interface AdminWebAuthnEnforcement {
  user_id: string;
  is_admin: boolean;
  webauthn_required: boolean;
  webauthn_enrolled: boolean;
  enrolled_at: Date | null;
  recovery_codes_generated: boolean;
}
