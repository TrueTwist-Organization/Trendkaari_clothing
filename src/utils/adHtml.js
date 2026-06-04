/** Make GPT / display ad HTML safe for SPA remounts (unique div ids per slot). */

import { destroyGptSlotsBySuffix } from './googletag.js';

function slotSuffix(slotKey) {
  return String(slotKey || 'ad')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 48);
}

/** Collect GPT container ids and map each to a slot-unique id. */
function buildGptIdMap(html, suffix) {
  const map = new Map();
  const pattern = /div-gpt-ad-[a-zA-Z0-9_-]+/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const oldId = match[0];
    if (oldId.includes(`__${suffix}`)) continue;
    if (!map.has(oldId)) map.set(oldId, `${oldId}__${suffix}`);
  }
  return map;
}

function replaceIds(html, idMap) {
  let result = html;
  for (const [oldId, newId] of idMap) {
    result = result.split(oldId).join(newId);
  }
  return result;
}

/** Rewrite duplicate GPT div ids so each placement can mount independently. */
export function prepareAdHtmlForSlot(html, slotKey) {
  const text = String(html || '').trim();
  if (!text || !slotKey) return text;

  const suffix = slotSuffix(slotKey);
  const idMap = buildGptIdMap(text, suffix);
  if (!idMap.size) return text;

  return replaceIds(text, idMap);
}

export function destroyGptSlotsForKey(slotKey) {
  if (typeof window === 'undefined' || !slotKey) return;
  destroyGptSlotsBySuffix(slotSuffix(slotKey));
}
