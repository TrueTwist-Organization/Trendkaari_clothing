/** Make GPT / display ad HTML safe for SPA remounts (unique div ids per slot). */

import { destroyGptSlotsBySuffix } from './googletag.js';

const PLACEHOLDER_TEXT_RE = /\bput[\s_-]*pixel[\s_-]*code[\s_-]*here\b/gi;

function stripPlaceholderLines(text = '') {
  return String(text || '')
    .split('\n')
    .filter((line) => !PLACEHOLDER_TEXT_RE.test(line))
    .join('\n');
}

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

/** Strip document shells / admin placeholders before injecting into a page slot. */
export function sanitizeAdHtmlForEmbed(html = '') {
  let text = String(html || '').trim();
  if (!text) return '';

  text = text.replace(/<!DOCTYPE[^>]*>/gi, '');
  text = text.replace(/<\/?html[^>]*>/gi, '');
  text = text.replace(/<\/?head[^>]*>/gi, '');
  text = text.replace(/<\/?body[^>]*>/gi, '');
  text = text.replace(/<!--\s*example[\s\S]*$/gi, '');
  text = text.replace(PLACEHOLDER_TEXT_RE, '');
  text = stripPlaceholderLines(text);
  text = text.replace(/^\s+$/gm, '').trim();

  return text;
}

/** Remove placeholder text nodes after HTML injection. */
export function scrubPlaceholderDom(root) {
  if (!root) return;
  root.querySelectorAll('*').forEach((el) => {
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && PLACEHOLDER_TEXT_RE.test(node.textContent || '')) {
        node.remove();
      }
    });
  });
}

/** True when slot HTML includes a visible ad unit (not tracking scripts only). */
export function hasVisibleAdMarkup(html = '') {
  const cleaned = sanitizeAdHtmlForEmbed(html);
  const withoutScripts = cleaned
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(PLACEHOLDER_TEXT_RE, '')
    .trim();
  if (!withoutScripts) return false;
  return /<(iframe|ins|img|div|a)[\s>]|div-gpt-ad|adsbygoogle/i.test(withoutScripts);
}
