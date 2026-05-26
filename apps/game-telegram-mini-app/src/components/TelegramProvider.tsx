/**
 * TelegramProvider
 *
 * Initialises the Telegram Mini Apps SDK and wraps the app in the
 * AppRoot UI provider. Handles the "not running inside Telegram" case
 * gracefully so local dev keeps working.
 */

import { type PropsWithChildren, useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface TelegramProviderProps extends PropsWithChildren {
    /** Rendered while the SDK is initialising */
    loadingFallback?: React.ReactNode;
}

function TelegramSDKInner({ children }: PropsWithChildren) {
    const [ready, setReady] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [SDKComponents, setSDKComponents] = useState<{
        AppRoot: React.ComponentType<
            React.PropsWithChildren<{ appearance?: "light" | "dark"; platform?: string }>
        >;
    } | null>(null);

    useEffect(() => {
        // Dynamically import SDK so it only runs in the browser
        Promise.all([
            import("@tma.js/sdk-react"),
            import("@telegram-apps/telegram-ui"),
        ])
            .then(([sdkReact, tgUI]) => {
                const { miniApp, init } = sdkReact;

                // Attempt to initialise the SDK
                try {
                    init();
                    const dark = typeof miniApp.isDark === 'function' ? miniApp.isDark() : (miniApp.isDark || false);
                    setIsDark(dark);
                } catch {
                    // Not inside Telegram — continue in dev mode
                }

                setSDKComponents({
                    AppRoot: tgUI.AppRoot as React.ComponentType<
                        React.PropsWithChildren<{ appearance?: "light" | "dark"; platform?: string }>
                    >,
                });
                setReady(true);
            })
            .catch(() => {
                setReady(true); // fail-open for dev
            });
    }, []);

    if (!ready || !SDKComponents) {
        return null;
    }

    return (
        <SDKComponents.AppRoot
            appearance={isDark ? "dark" : "light"}
            platform="base"
        >
            {children}
        </SDKComponents.AppRoot>
    );
}

export function TelegramProvider({
    children,
    loadingFallback = null,
}: TelegramProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <>{loadingFallback}</>;

    return (
        <ErrorBoundary>
            <TelegramSDKInner>{children}</TelegramSDKInner>
        </ErrorBoundary>
    );
}
