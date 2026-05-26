/**
 * game-telegram-mini-app / src/lib/api/client.ts
 *
 * Base HTTP client for communicating with the game-server.
 *
 * Auth strategy:
 *   The Telegram Mini App provides a signed `initDataRaw` string that the
 *   game-server can verify against the bot secret. We forward it as a
 *   Bearer token on every authenticated request.
 *
 * Usage:
 *   import { apiClient } from '@/lib/api/client';
 *   const data = await apiClient.get<Profile>('/profile/me');
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/**
 * Base URL of the game-server.
 * Set NEXT_PUBLIC_GAME_SERVER_URL in your .env.local to override.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? 'http://localhost:3001/api/v1';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

type RequestOptions = {
  /** Telegram initDataRaw to use as Bearer token */
  initDataRaw?: string | null;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Request body (will be JSON-serialised) */
  body?: unknown;
};

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { initDataRaw, headers = {}, body } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (initDataRaw) {
    requestHeaders['Authorization'] = `tma ${initDataRaw}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // 204 No Content — nothing to parse
  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.code ?? 'UNKNOWN_ERROR',
      json?.message ?? `Request failed with status ${response.status}`,
    );
  }

  return json as T;
}

// ---------------------------------------------------------------------------
// Exported client object
// ---------------------------------------------------------------------------

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>('GET', path, opts),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),
};
