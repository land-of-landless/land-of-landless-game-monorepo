/**
 * AppLayout — wraps every page with the bottom nav and a scrollable content area.
 */

import type { PropsWithChildren } from 'react';
import { BottomNav } from '@/components/BottomNav';
import styles from './AppLayout.module.css';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>{children}</main>
      <BottomNav />
    </div>
  );
}
