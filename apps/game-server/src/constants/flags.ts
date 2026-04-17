import { iso31661 } from "iso-3166";

// Get all ISO 3166-1 alpha-2 codes
const ISO_FLAGS = iso31661.map((country) => country.alpha2);

// Exceptions and ISO 3166-2 codes for UK nations
export const EXCEPTION_FLAGS = [
    "GB-ENG", // England
    "GB-SCT", // Scotland
    "GB-WLS", // Wales
    "GB-NIR", // Northern Ireland
    "XK", // Kosovo (User-assigned)
];

// Custom flags
export const CUSTOM_FLAGS = [
    // Add custom flags here, e.g., "PIRATE", "COMPANY_X"
];

// Combine all allowed flags
export const ALLOWED_FLAGS = [
    ...ISO_FLAGS,
    ...EXCEPTION_FLAGS,
    ...CUSTOM_FLAGS,
];
