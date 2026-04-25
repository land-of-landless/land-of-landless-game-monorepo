// lint-staged.config.js
import path from 'path'

// Map each workspace to its package.json location and the script to run
const workspaces = {
  'apps/docs': { script: 'lint:fix', cwd: 'apps/docs' },
  'apps/game-server': { script: 'lint:fix', cwd: 'apps/game-server' },
  'packages/ui': { script: 'lint', cwd: 'packages/ui' },
  'apps/game-web-client': { script: 'lint', cwd: 'apps/game-web-client' }
  // add others
}

export default (stagedFiles) => {
  const commands = []

  for (const [workspacePath, { script, cwd }] of Object.entries(workspaces)) {
    const filesInWorkspace = stagedFiles.filter(file =>
      file.startsWith(workspacePath)
    )
    if (filesInWorkspace.length) {
      // pnpm --filter <workspace> run <script>
      commands.push(`pnpm --filter "./${workspacePath}" run ${script}`)
    }
  }
  return commands
}
