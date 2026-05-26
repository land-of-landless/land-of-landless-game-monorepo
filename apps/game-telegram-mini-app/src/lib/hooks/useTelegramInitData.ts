/**
 * game-telegram-mini-app / src/lib/hooks/useTelegramInitData.ts
 *
 * Safely retrieves `initDataRaw` and the parsed Telegram user from the SDK.
 * Falls back gracefully when running outside of Telegram (e.g. during dev).
 */
'use client';

import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

interface UseTelegramInitDataResult {
  initDataRaw: string | null;
  user: TelegramUser | null;
  isReady: boolean;
}

export function useTelegramInitData(): UseTelegramInitDataResult {
  const [state, setState] = useState<UseTelegramInitDataResult>({
    initDataRaw: null,
    user: null,
    isReady: false,
  });

  useEffect(() => {
    // The SDK is browser-only, so dynamic import is needed
    import('@tma.js/sdk-react')
      .then(({ initData, useSignal }) => {
        // initData is a signal — read it synchronously inside the effect
        const raw = initData.raw();
        const parsedUser = initData.user();

        setState({
          initDataRaw: raw ?? null,
          user: parsedUser
            ? {
                id: parsedUser.id,
                firstName: (parsedUser as any).firstName || (parsedUser as any).first_name || '',
                lastName: (parsedUser as any).lastName || (parsedUser as any).last_name,
                username: parsedUser.username,
                photoUrl: (parsedUser as any).photoUrl || (parsedUser as any).photo_url,
                languageCode: (parsedUser as any).languageCode || (parsedUser as any).language_code,
              }
            : null,
          isReady: true,
        });
      })
      .catch(() => {
        // Not inside Telegram — mark as ready with empty data so dev mode works
        setState({ initDataRaw: null, user: null, isReady: true });
      });
  }, []);

  return state;
}
