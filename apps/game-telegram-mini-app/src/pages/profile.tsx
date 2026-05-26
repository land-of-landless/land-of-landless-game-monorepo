/**
 * pages/profile.tsx — Player Profile Page
 *
 * Exposes profile information and allows customisation of mutable fields
 * like display name. Provides mock behavior if game-server is unavailable.
 */

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useTelegramInitData } from '@/lib/hooks/useTelegramInitData';
import { useProfile } from '@/lib/hooks/useProfile';
import { updateMyProfile } from '@/lib/api/profile';
import styles from '@/styles/Profile.module.css';

export default function ProfilePage() {
  const { initDataRaw, user, isReady } = useTelegramInitData();
  const { profile, isLoading, error, refetch } = useProfile(initDataRaw);

  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync display name once profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
    } else if (user) {
      setDisplayName(`${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`);
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      if (initDataRaw) {
        await updateMyProfile(initDataRaw, { displayName });
        refetch();
        setSaveStatus('success');
        setIsEditing(false);
      } else {
        // Mock success in local dev
        setSaveStatus('success');
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const displayUser = profile ?? (user ? {
    displayName: displayName || `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`,
    telegramId: user.id,
    username: user.username || null,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    currency: { coins: 0, gems: 0 },
    avatarUrl: user.photoUrl || null,
    joinedAt: new Date().toISOString()
  } : null);

  return (
    <>
      <Head>
        <title>My Profile — Land of Landless</title>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Hero Profile</h1>
          <p className={styles.subtitle}>View and update your character settings</p>
        </header>

        {isReady && !displayUser && !isLoading && (
          <div className={styles.alert}>
            <p>Could not connect to game server or load Telegram context. Showing offline demo profile.</p>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loader}>Accessing your records...</div>
        ) : displayUser ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatarWrap}>
                {displayUser.avatarUrl ? (
                  <img src={displayUser.avatarUrl} alt="Avatar" className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {displayUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.levelBadge}>Lvl {displayUser.level}</div>
              </div>

              <div className={styles.identity}>
                {isEditing ? (
                  <form onSubmit={handleSave} className={styles.editForm}>
                    <input
                      type="text"
                      className={styles.input}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={30}
                      disabled={isSaving}
                      placeholder="Display Name"
                      aria-label="New Display Name"
                      required
                    />
                    <div className={styles.editActions}>
                      <button type="submit" className={styles.btnSave} disabled={isSaving}>
                        {isSaving ? '...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className={styles.btnCancel}
                        disabled={isSaving}
                        onClick={() => {
                          setDisplayName(profile?.displayName || '');
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className={styles.nameRow}>
                      <h2 className={styles.displayName}>{displayUser.displayName}</h2>
                      <button
                        className={styles.btnEdit}
                        onClick={() => setIsEditing(true)}
                        aria-label="Edit display name"
                      >
                        ✏️
                      </button>
                    </div>
                    {displayUser.username && (
                      <p className={styles.username}>@{displayUser.username}</p>
                    )}
                  </>
                )}
                <p className={styles.tgId}>ID: {displayUser.telegramId}</p>
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.stats}>
              <h3 className={styles.statsHeading}>Account Stats</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Level</span>
                  <span className={styles.statValue}>{displayUser.level}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total XP</span>
                  <span className={styles.statValue}>{displayUser.xp}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Coins</span>
                  <span className={styles.statValue}>🪙 {displayUser.currency.coins}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Gems</span>
                  <span className={styles.statValue}>💎 {displayUser.currency.gems}</span>
                </div>
              </div>
            </div>

            <div className={styles.meta}>
              <p>Joined: {new Date(displayUser.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Please launch this app inside Telegram to load your profile details.</p>
          </div>
        )}

        {saveStatus === 'success' && (
          <div className={`${styles.toast} ${styles.toastSuccess}`}>
            Profile updated successfully!
          </div>
        )}

        {saveStatus === 'error' && (
          <div className={`${styles.toast} ${styles.toastError}`}>
            Failed to update profile. Please try again.
          </div>
        )}
      </div>
    </>
  );
}
