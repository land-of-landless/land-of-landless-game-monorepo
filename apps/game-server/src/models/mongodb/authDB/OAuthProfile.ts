/**
 * OAuth Profile Interface
 *
 * Represents the common profile data structure returned by OAuth providers
 * (Google, Discord, X/Twitter). This interface provides type safety for
 * OAuth authentication data stored in the User model.
 */
export interface OAuthProfile {
    /**
     * Unique identifier from the OAuth provider.
     * This is the 'sub' (subject) claim from the OAuth token.
     */
    sub: string;

    /**
     * User's display name from the OAuth provider.
     */
    name: string;

    /**
     * URL to the user's profile picture from the OAuth provider.
     */
    picture: string;
}
