#!/usr/bin/env node
/**
 * Copies trendkaari logo into public/logo.png
 * Run from project root: npm run sync-logo
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dest = path.join(root, 'public', 'logo.png');
const destAlt = path.join(root, 'public', 'trendkaari-logo.png');

const SOURCE_NAMES = [
  'logo_final.png',
  'trendkaari-logo-source.png',
  'WhatsApp Image 2026-05-20 at 5.30.56 PM Background Removed.png',
];

/** Prefer files inside the project — macOS may block reads from ~/Downloads in IDE terminals */
const SOURCE_DIRS = [
  path.join(root, 'public'),
  root,
  path.join(process.env.HOME || '', 'Downloads'),
  path.join(process.env.HOME || '', 'Desktop'),
];

function findSource() {
  for (const dir of SOURCE_DIRS) {
    for (const name of SOURCE_NAMES) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

const src = findSource();
if (!src) {
  console.error(
    'Logo file not found.\n' +
      '1) Drag your PNG into: public/trendkaari-logo-source.png\n' +
      '   (or project root with the same name)\n' +
      '2) Run: npm run sync-logo\n' +
      'Or in Mac Terminal: cp "~/Downloads/WhatsApp Image 2026-05-20 at 5.30.56 PM Background Removed.png" public/logo.png',
  );
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
fs.copyFileSync(src, destAlt);
console.log(`Logo synced from:\n  ${src}\n→ public/logo.png`);
