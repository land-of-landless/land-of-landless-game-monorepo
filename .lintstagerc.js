// .lintstagedrc.js (root)
export default {
  // For any file under apps/web, run the web's lint script
  'apps/game-web-client/**/*.{js,ts,jsx,tsx}': () => 'pnpm --filter "./apps/game-web-client" lint:fix',
  'apps/game-server/**/*.{js,ts}': () => 'pnpm --filter "./apps/game-server" lint:fix',
  'packages/ui/**/*.{ts,tsx}': () => 'pnpm --filter "./packages/ui" lint',
}
