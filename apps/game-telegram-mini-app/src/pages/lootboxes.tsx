/**
 * pages/lootboxes.tsx — Lootboxes & Daily Rewards Page
 *
 * Displays the player's lootbox inventory. Users can click to trigger a mock/real opening
 * sequence with high-end premium micro-animations and claim a daily free chest.
 */

import Head from 'next/head';
import { useState } from 'react';
import { useTelegramInitData } from '@/lib/hooks/useTelegramInitData';
import { useLootboxes } from '@/lib/hooks/useLootboxes';
import { type Lootbox, type LootboxReward } from '@/lib/api/lootboxes';
import styles from '@/styles/Lootboxes.module.css';

const MOCK_LOOTBOXES: Lootbox[] = [
  {
    id: 'box-common-1',
    name: 'Bronze Chest',
    rarity: 'common',
    imageUrl: null,
    availableAt: null,
    isOpenable: true,
    rewardPreview: 'Coins and Common Materials'
  },
  {
    id: 'box-rare-1',
    name: 'Mystic Core',
    rarity: 'rare',
    imageUrl: null,
    availableAt: null,
    isOpenable: true,
    rewardPreview: 'Gems, Coins, and Rare Blueprints'
  },
  {
    id: 'box-legendary-1',
    name: 'Ancient Relic',
    rarity: 'legendary',
    imageUrl: null,
    availableAt: null,
    isOpenable: true,
    rewardPreview: 'Legendary Items and massive Gems'
  }
];

export default function LootboxesPage() {
  const { initDataRaw, isReady } = useTelegramInitData();
  const { data, isLoading, open, claimDaily } = useLootboxes(initDataRaw);

  const [openingBox, setOpeningBox] = useState<Lootbox | null>(null);
  const [openingStage, setOpeningStage] = useState<'idle' | 'shaking' | 'revealed'>('idle');
  const [revealReward, setRevealReward] = useState<LootboxReward | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [dailyClaimedBox, setDailyClaimedBox] = useState<Lootbox | null>(null);

  // Use real data if loaded, otherwise fall back to mock data
  const lootboxes = data?.items && data.items.length > 0 ? data.items : MOCK_LOOTBOXES;

  const handleOpenBox = async (box: Lootbox) => {
    setOpeningBox(box);
    setOpeningStage('shaking');
    setRevealReward(null);

    // Dynamic delay for maximum gaming chest-shaking suspense!
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      let reward: LootboxReward | null = null;
      if (initDataRaw) {
        reward = await open(box.id);
      }

      // If no server/offline mode, produce a beautiful mock reward list matching rarity
      if (!reward) {
        const mockCoins = box.rarity === 'common' ? 250 : box.rarity === 'rare' ? 750 : 2500;
        const mockGems = box.rarity === 'common' ? 0 : box.rarity === 'rare' ? 15 : 120;
        const rewardsArray: LootboxReward['rewards'] = [
          { type: 'coins', amount: mockCoins }
        ];
        if (mockGems > 0) {
          rewardsArray.push({ type: 'gems', amount: mockGems });
        }
        if (box.rarity === 'legendary') {
          rewardsArray.push({ type: 'item', itemName: 'Skyrender Greatsword', itemRarity: 'legendary' });
        }
        reward = {
          lootboxId: box.id,
          rewards: rewardsArray,
          openedAt: new Date().toISOString()
        };
      }

      setRevealReward(reward);
      setOpeningStage('revealed');
    } catch (err) {
      console.error(err);
      setOpeningStage('idle');
      setOpeningBox(null);
    }
  };

  const handleClaimDaily = async () => {
    setIsClaiming(true);
    setDailyClaimedBox(null);

    // Add brief artificial delay to make the claim button feel highly premium
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      let box: Lootbox | null = null;
      if (initDataRaw) {
        box = await claimDaily();
      }
      if (!box) {
        // Mock daily claim
        box = {
          id: `box-daily-${Date.now()}`,
          name: 'Daily Vanguard Supply',
          rarity: 'rare',
          imageUrl: null,
          availableAt: null,
          isOpenable: true,
          rewardPreview: 'Coins and Gem shards'
        };
      }
      setDailyClaimedBox(box);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClaiming(false);
    }
  };

  const closeOverlay = () => {
    setOpeningStage('idle');
    setOpeningBox(null);
    setRevealReward(null);
  };

  return (
    <>
      <Head>
        <title>Lootboxes — Land of Landless</title>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Vanguard Vault</h1>
          <p className={styles.subtitle}>Open supply crates to claim rare weapons &amp; assets</p>
        </header>

        {/* Daily claim section */}
        <section className={styles.dailySection} aria-label="Daily supply drop">
          <div className={styles.dailyCard}>
            <div className={styles.dailyInfo}>
              <span className={styles.dailyEmoji} aria-hidden="true">🎁</span>
              <div>
                <h2 className={styles.dailyTitle}>Daily Supply Drop</h2>
                <p className={styles.dailyDesc}>Claim a free high-grade loot crate every 24 hours</p>
              </div>
            </div>

            {dailyClaimedBox ? (
              <div className={styles.claimSuccess}>
                <span className={styles.claimedBadge}>CLAIMED</span>
                <p className={styles.claimedText}>
                  You received: <strong>{dailyClaimedBox.name}</strong> ({dailyClaimedBox.rarity})
                </p>
                <button
                  className={styles.btnClaimReset}
                  onClick={() => setDailyClaimedBox(null)}
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <button
                className={styles.btnClaim}
                onClick={handleClaimDaily}
                disabled={isClaiming}
              >
                {isClaiming ? 'Claiming Supply...' : 'Request Drop'}
              </button>
            )}
          </div>
        </section>

        {/* Lootbox Inventory */}
        <section className={styles.inventorySection} aria-label="Lootboxes Inventory">
          <h2 className={styles.sectionHeading}>My Loot Crates</h2>

          {isLoading ? (
            <div className={styles.loader}>Searching secure vault...</div>
          ) : lootboxes.length > 0 ? (
            <div className={styles.grid}>
              {lootboxes.map((box) => (
                <div
                  key={box.id}
                  className={`${styles.boxCard} ${styles[`rarity-${box.rarity}`]}`}
                >
                  <div className={styles.boxVisual}>
                    <span className={styles.boxEmoji} aria-hidden="true">
                      {box.rarity === 'common' ? '📦' : box.rarity === 'rare' ? '💎' : '👑'}
                    </span>
                    <span className={styles.rarityLabel}>{box.rarity}</span>
                  </div>

                  <h3 className={styles.boxName}>{box.name}</h3>
                  <p className={styles.boxPreview}>{box.rewardPreview}</p>

                  <button
                    className={styles.btnOpen}
                    onClick={() => handleOpenBox(box)}
                    disabled={!box.isOpenable}
                  >
                    Open Crate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Your secure vault is empty. Request a Daily Supply Drop above to begin!</p>
            </div>
          )}
        </section>

        {/* Chest Opening Overlay / Premium Animation Suite */}
        {openingBox && (
          <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="opening-title">
            <div className={styles.overlayContent}>
              {openingStage === 'shaking' && (
                <div className={styles.shakingSequence}>
                  <div className={`${styles.animatedChest} ${styles.shaking}`} aria-hidden="true">
                    {openingBox.rarity === 'common' ? '📦' : openingBox.rarity === 'rare' ? '💎' : '👑'}
                  </div>
                  <h2 id="opening-title" className={styles.openingTitle}>Unlocking {openingBox.name}...</h2>
                  <p className={styles.openingSub}>Preparing cybernetic decryptions</p>
                </div>
              )}

              {openingStage === 'revealed' && revealReward && (
                <div className={styles.revealSequence}>
                  <div className={styles.revealSparkle} aria-hidden="true" />
                  <h2 id="opening-title" className={styles.rewardTitle}>Crate Unlocked!</h2>
                  <p className={styles.rewardSub}>You extracted the following assets:</p>

                  <div className={styles.rewardList}>
                    {revealReward.rewards.map((reward, i) => (
                      <div key={i} className={styles.rewardItem}>
                        {reward.type === 'coins' && (
                          <>
                            <span className={styles.rewardIcon} aria-hidden="true">🪙</span>
                            <div>
                              <p className={styles.rewardVal}>+{reward.amount?.toLocaleString()}</p>
                              <p className={styles.rewardLbl}>Gold Coins</p>
                            </div>
                          </>
                        )}
                        {reward.type === 'gems' && (
                          <>
                            <span className={styles.rewardIcon} aria-hidden="true">💎</span>
                            <div>
                              <p className={styles.rewardVal}>+{reward.amount?.toLocaleString()}</p>
                              <p className={styles.rewardLbl}>Gems</p>
                            </div>
                          </>
                        )}
                        {reward.type === 'item' && (
                          <>
                            <span className={styles.rewardIcon} aria-hidden="true">⚔️</span>
                            <div>
                              <p className={styles.rewardVal}>{reward.itemName}</p>
                              <p className={styles.rewardLbl}>{reward.itemRarity} Weapon</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <button className={styles.btnFinish} onClick={closeOverlay}>
                    Transfer to Inventory
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
