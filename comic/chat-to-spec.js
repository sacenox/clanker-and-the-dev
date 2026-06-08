#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEV_POSES = new Set([
  'neutral', 'curious', 'thinking', 'excited', 'overwhelmed', 'typing',
  'resurrected-typing', 'collapsed', 'dead', 'caffeinated',
]);

const CLANKER_POSES = new Set([
  'neutral', 'helpful', 'confident', 'watching', 'thinking', 'overclocked',
  'concerned', 'error', 'celebratory', 'sleeping',
]);

const FX = new Set([
  'small-glow', 'screen-glow', 'sparks', 'terminal-cursor', 'smoke',
  'sweat', 'speed-lines', 'boot',
]);

const SPEAKERS = new Set(['dev', 'clanker', 'narrator']);
const today = () => new Date().toISOString().slice(0, 10);
const slugify = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'untitled-strip';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node comic/chat-to-spec.js comic/inbox/my-script.chat comic/specs/my-script.json');
  process.exit(1);
}

function parseLine(rawLine) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) return null;

  const match = line.match(/^(dev|clanker|narrator)(?:->(dev|clanker))?\s*[:*]\s*(.*)$/i);
  if (!match) return null;

  const speaker = match[1].toLowerCase();
  const to = match[2]?.toLowerCase();
  let rest = match[3].trim();
  let fx = [];
  let devPose;
  let clankerPose;

  const fxMatch = rest.match(/\s+\[([^\]]+)\]\s*$/);
  if (fxMatch) {
    fx = fxMatch[1].split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
    rest = rest.slice(0, fxMatch.index).trim();
  }

  const poseMatch = rest.match(/\s+\(([^)]+)\)\s*$/);
  if (poseMatch) {
    const [left, right] = poseMatch[1].split('/').map((item) => item?.trim()).filter(Boolean);
    if (left) devPose = left;
    if (right) clankerPose = right;
    rest = rest.slice(0, poseMatch.index).trim();
  }

  return {
    speaker,
    to,
    text: rest,
    devPose,
    clankerPose,
    fx,
  };
}

function intensity(text) {
  const stripped = text.replace(/[^A-Za-z]/g, '');
  const upperRatio = stripped ? stripped.replace(/[^A-Z]/g, '').length / stripped.length : 0;
  if (/\b(ERR|ERROR|PANIC|FAIL|DEAD|HOLY|SHIT)\b/i.test(text)) return 'panic';
  if ((text.match(/!/g) || []).length >= 2 || upperRatio > 0.65) return 'high';
  if (/[?!]/.test(text)) return 'active';
  return 'plain';
}

function deriveDevPose(bit) {
  if (bit.devPose) return bit.devPose;
  const level = intensity(bit.text);
  if (bit.speaker === 'dev') {
    if (level === 'panic') return 'overwhelmed';
    if (level === 'high') return 'excited';
    if (level === 'active') return 'curious';
    return 'typing';
  }
  if (bit.speaker === 'clanker') {
    if (/dead|burned|crash/i.test(bit.text)) return 'collapsed';
    if (level === 'panic') return 'overwhelmed';
    return 'curious';
  }
  return 'neutral';
}

function deriveClankerPose(bit) {
  if (bit.clankerPose) return bit.clankerPose;
  const level = intensity(bit.text);
  if (bit.speaker === 'clanker') {
    if (level === 'panic') return 'error';
    if (level === 'high') return 'overclocked';
    if (level === 'active') return 'helpful';
    return 'confident';
  }
  if (bit.speaker === 'dev') {
    if (level === 'panic') return 'concerned';
    if (level === 'high') return 'overclocked';
    return 'watching';
  }
  return 'watching';
}

function mergeFx(bits) {
  const merged = [];
  for (const bit of bits) {
    for (const item of bit.fx || []) {
      if (FX.has(item) && !merged.includes(item)) merged.push(item);
    }
  }
  return merged;
}

function chooseDominantBit(bits) {
  return bits.find((bit) => bit.speaker !== 'narrator') || bits[0];
}

function lastExplicit(bits, field) {
  for (let i = bits.length - 1; i >= 0; i -= 1) {
    if (bits[i][field]) return bits[i][field];
  }
  return undefined;
}

function buildPanel(bits) {
  const dominant = chooseDominantBit(bits);
  const dialogue = bits.map((bit) => ({ speaker: bit.speaker, text: bit.text }));
  const panel = {
    dialogue,
    devPose: lastExplicit(bits, 'devPose') || deriveDevPose(dominant),
    clankerPose: lastExplicit(bits, 'clankerPose') || deriveClankerPose(dominant),
  };

  const fx = mergeFx(bits);
  if (fx.length) panel.fx = fx;

  if (!DEV_POSES.has(panel.devPose)) throw new Error(`Unknown dev pose: ${panel.devPose}`);
  if (!CLANKER_POSES.has(panel.clankerPose)) throw new Error(`Unknown clanker pose: ${panel.clankerPose}`);
  for (const line of dialogue) {
    if (!SPEAKERS.has(line.speaker)) throw new Error(`Unknown speaker: ${line.speaker}`);
  }
  return panel;
}

function compileChat(content) {
  const meta = {};
  const bits = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const metaMatch = line.match(/^(title|slug|timestamp|credit|layout)\s*:\s*(.+)$/i);
    if (metaMatch) {
      meta[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      continue;
    }

    const bit = parseLine(line);
    if (bit) bits.push(bit);
  }

  if (!bits.length) throw new Error('No chat lines found.');

  const panels = [];
  let current = [];
  let speakersInPanel = new Set();

  for (const bit of bits) {
    // Spittoon rule: a character cannot appear twice in a panel, so repeat
    // speakers naturally start a new panel. Narration also starts cleanly.
    if (current.length && (bit.speaker === 'narrator' || speakersInPanel.has(bit.speaker) || current.length >= 3)) {
      panels.push(buildPanel(current));
      current = [];
      speakersInPanel = new Set();
    }

    current.push(bit);
    if (bit.speaker !== 'narrator') speakersInPanel.add(bit.speaker);
  }

  if (current.length) panels.push(buildPanel(current));
  if (panels.length > 6) throw new Error(`Compiled ${panels.length} panels; renderer supports at most 6.`);

  const title = meta.title || path.basename(inputPath, path.extname(inputPath)).replace(/[-_]+/g, ' ');
  return {
    title,
    slug: slugify(meta.slug || title),
    timestamp: meta.timestamp || today(),
    ...(meta.credit ? { credit: meta.credit } : {}),
    layout: meta.layout || 'auto',
    panels,
  };
}

const spec = compileChat(await readFile(inputPath, 'utf8'));
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outputPath}`);
