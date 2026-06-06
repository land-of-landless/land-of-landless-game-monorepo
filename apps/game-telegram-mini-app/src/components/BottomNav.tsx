/**
 * BottomNav — persistent tab bar for the Mini App.
 */

import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./BottomNav.module.css";

const NAV_ITEMS = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/profile", label: "Profile", icon: "⚔️" },
    { href: "/lootboxes", label: "Loot", icon: "📦" },
    { href: "/leaderboard", label: "Ranks", icon: "🏆" },
];

export function BottomNav() {
    const { pathname } = useRouter();

    return (
        <nav className={styles.nav} aria-label="Main navigation">
            {NAV_ITEMS.map(({ href, label, icon }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.item} ${isActive ? styles.active : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span className={styles.icon} aria-hidden="true">
                            {icon}
                        </span>
                        <span className={styles.label}>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
