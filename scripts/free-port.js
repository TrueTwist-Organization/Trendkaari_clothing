#!/usr/bin/env node
/** Free a TCP port before starting dev (avoids EADDRINUSE on 3001). */
import { execSync } from 'child_process';

const port = process.argv[2] || '3001';

try {
  const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  if (pids.length) {
    execSync(`kill -9 ${pids.join(' ')}`);
    console.log(`[free-port] Freed port ${port} (pids: ${pids.join(', ')})`);
  }
} catch {
  // port already free
}
