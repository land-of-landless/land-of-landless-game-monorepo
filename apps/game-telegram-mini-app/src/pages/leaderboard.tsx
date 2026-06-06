/**
 * pages/leaderboard.tsx — Global Leaderboard
 *
 * Ranks players by total XP. Highlights the current user's row when their
 * Telegram ID matches an entry. Falls back to mock data when offline.
 */

import Head from "next/head";
import { useTelegramInitData } from "@/lib/hooks/useTelegramInitData";
import { useProfile } from "@/lib/hooks/useProfile";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import styles from "@/styles/Leaderboard.module.css";

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
    const { initDataRaw, user } = useTelegramInitData();
    const { profile } = useProfile(initDataRaw);
    const { leaderboard, isLoading, isMock, refetch } =
        useLeaderboard(initDataRaw);

    // Determine the current user's telegramId for row highlighting
    const myTelegramId = profile?.telegramId ?? user?.id ?? null;

    return (
        <>
            <Head>
                <title>Leaderboard — Land of Landless</title>
            </Head>

            <div className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Hall of Heroes</h1>
                    <p className={styles.subtitle}>
                        Top warriors ranked by total XP earned
                    </p>
                </header>

                {isMock && (
                    <div className={styles.offlineBanner} role="status">
                        <span aria-hidden="true">📡</span> Showing sample data —
                        connect to a server for live rankings
                    </div>
                )}

                {isLoading ? (
                    <div className={styles.loader}>
                        Retrieving battle records…
                    </div>
                ) : leaderboard && leaderboard.entries.length > 0 ? (
                    <>
                        <ol className={styles.list} aria-label="Leaderboard">
                            {leaderboard.entries.map(entry => {
                                const isMe =
                                    myTelegramId !== null &&
                                    entry.telegramId === myTelegramId;
                                const medal = RANK_MEDALS[entry.rank];

                                return (
                                    <li
                                        key={entry.telegramId}
                                        className={`${styles.row} ${isMe ? styles.rowMe : ""}`}
                                        aria-label={`Rank ${entry.rank}: ${entry.displayName}`}
                                    >
                                        {/* Rank */}
                                        <span
                                            className={styles.rank}
                                            aria-hidden="true"
                                        >
                                            {medal ?? (
                                                <span
                                                    className={styles.rankNum}
                                                >
                                                    {entry.rank}
                                                </span>
                                            )}
                                        </span>

                                        {/* Avatar placeholder */}
                                        <div
                                            className={styles.avatar}
                                            aria-hidden="true"
                                        >
                                            {entry.avatarUrl ? (
                                                <img
                                                    src={entry.avatarUrl}
                                                    alt=""
                                                    className={styles.avatarImg}
                                                />
                                            ) : (
                                                <span
                                                    className={
                                                        styles.avatarInitial
                                                    }
                                                >
                                                    {entry.displayName
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Identity */}
                                        <div className={styles.identity}>
                                            <p className={styles.displayName}>
                                                {entry.displayName}
                                                {isMe && (
                                                    <span
                                                        className={
                                                            styles.youBadge
                                                        }
                                                    >
                                                        YOU
                                                    </span>
                                                )}
                                            </p>
                                            {entry.username && (
                                                <p className={styles.username}>
                                                    @{entry.username}
                                                </p>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className={styles.stats}>
                                            <p className={styles.level}>
                                                Lvl {entry.level}
                                            </p>
                                            <p className={styles.xp}>
                                                {entry.xp.toLocaleString()} XP
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <p className={styles.updatedAt}>
                            Last updated:{" "}
                            {new Date(leaderboard.updatedAt).toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                            <button
                                className={styles.refreshBtn}
                                onClick={refetch}
                                aria-label="Refresh leaderboard"
                            >
                                ↻
                            </button>
                        </p>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        No rankings available yet. Be the first hero on the
                        board!
                    </div>
                )}
            </div>
        </>
    );
}
