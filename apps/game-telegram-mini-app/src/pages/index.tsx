/**
 * pages/index.tsx — Home / Dashboard
 *
 * Quick-access hub: greets the player, shows a currency summary, and links
 * to Profile and Lootboxes.
 */

import Head from 'next/head';
import Link from 'next/link';
import { useTelegramInitData } from '@/lib/hooks/useTelegramInitData';
import { useProfile } from '@/lib/hooks/useProfile';
import styles from '@/styles/Home.module.css';

export default function HomePage() {
  const { initDataRaw, user, isReady } = useTelegramInitData();
  const { profile, isLoading } = useProfile(initDataRaw);

  const displayName =
    profile?.displayName ??
    (user ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : null) ??
    'Adventurer';

  return (
    <>
      <Head>
        <title>Home — Land of Landless</title>
      </Head>

      <div className={styles.page}>
        {/* ── Hero greeting ── */}
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <p className={styles.heroEyebrow}>Land of Landless</p>
          <h1 className={styles.heroTitle}>
            {isReady && !isLoading ? (
              <>Welcome back, <span className={styles.heroName}>{displayName}</span></>
            ) : (
              'Loading your realm…'
            )}
          </h1>
          {profile && (
            <p className={styles.heroSubtitle}>
              Level {profile.level} · {profile.xp.toLocaleString()} XP
            </p>
          )}
        </header>

        {/* ── Currency cards ── */}
        {profile && (
          <section className={styles.currencyRow} aria-label="Currency">
            <div className={styles.currencyCard}>
              <span className={styles.currencyIcon} aria-hidden="true">🪙</span>
              <div>
                <p className={styles.currencyValue}>{profile.currency.coins.toLocaleString()}</p>
                <p className={styles.currencyLabel}>Coins</p>
              </div>
            </div>
            <div className={styles.currencyCard}>
              <span className={styles.currencyIcon} aria-hidden="true">💎</span>
              <div>
                <p className={styles.currencyValue}>{profile.currency.gems.toLocaleString()}</p>
                <p className={styles.currencyLabel}>Gems</p>
              </div>
            </div>
          </section>
        )}

        {/* ── Quick actions ── */}
        <section className={styles.actions} aria-label="Quick actions">
          <Link href="/profile" className={styles.actionCard} id="home-action-profile">
            <span className={styles.actionIcon} aria-hidden="true">⚔️</span>
            <div>
              <p className={styles.actionTitle}>My Profile</p>
              <p className={styles.actionDesc}>Stats, level &amp; account info</p>
            </div>
            <span className={styles.actionChevron} aria-hidden="true">›</span>
          </Link>

          <Link href="/lootboxes" className={styles.actionCard} id="home-action-lootboxes">
            <span className={styles.actionIcon} aria-hidden="true">📦</span>
            <div>
              <p className={styles.actionTitle}>Lootboxes</p>
              <p className={styles.actionDesc}>Open boxes &amp; claim daily rewards</p>
            </div>
            <span className={styles.actionChevron} aria-hidden="true">›</span>
          </Link>
        </section>

        {/* ── XP progress bar ── */}
        {profile && (
          <section className={styles.xpSection} aria-label="Experience progress">
            <div className={styles.xpHeader}>
              <span>XP Progress</span>
              <span>{profile.xp} / {profile.xpToNextLevel}</span>
            </div>
            <div className={styles.xpBar} role="progressbar"
              aria-valuenow={profile.xp}
              aria-valuemin={0}
              aria-valuemax={profile.xpToNextLevel}
            >
              <div
                className={styles.xpFill}
                style={{ width: `${Math.min(100, (profile.xp / profile.xpToNextLevel) * 100)}%` }}
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
