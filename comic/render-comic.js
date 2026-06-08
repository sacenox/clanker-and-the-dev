#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DEV_POSES = new Set([
  'neutral',
  'curious',
  'thinking',
  'excited',
  'overwhelmed',
  'typing',
  'resurrected-typing',
  'collapsed',
  'dead',
  'caffeinated',
]);

const CLANKER_POSES = new Set([
  'neutral',
  'helpful',
  'confident',
  'watching',
  'thinking',
  'overclocked',
  'concerned',
  'error',
  'celebratory',
  'sleeping',
]);

const FX = new Set([
  'small-glow',
  'screen-glow',
  'sparks',
  'terminal-cursor',
  'smoke',
  'sweat',
  'speed-lines',
  'boot',
]);

const LAYOUTS = new Set([
  'auto',
  'one-panel',
  'two-panel-row',
  'three-panel-row',
  'four-panel-grid',
  'five-panel-final-wide',
  'six-panel-grid',
]);

const GREEN = '#22c55e';
const GREEN_DIM = '#166534';
const GREEN_BRIGHT = '#86efac';
const BLACK = '#020617';
const PANEL_BG = '#030712';

const specPath = process.argv[2];
const explicitOutPath = process.argv[3];

if (!specPath) {
  console.error('Usage: node comic/render-comic.js comic/specs/my-strip.json [_posts/YYYY-MM-DD-my-strip.md]');
  process.exit(1);
}

const today = () => new Date().toISOString().slice(0, 10);

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const slugify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled-strip';

const stripCaptionMarkdown = (value) =>
  String(value ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

function wrapText(text, maxChars) {
  const words = stripCaptionMarkdown(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function validateSpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('Spec must be a JSON object.');
  if (!spec.title || typeof spec.title !== 'string') throw new Error('Spec requires string field: title');
  if (!Array.isArray(spec.panels) || spec.panels.length < 1 || spec.panels.length > 6) {
    throw new Error('Spec requires 1 to 6 panels.');
  }

  const layout = spec.layout || 'auto';
  if (!LAYOUTS.has(layout)) throw new Error(`Unknown layout: ${layout}`);

  const layoutPanelCounts = {
    'one-panel': 1,
    'two-panel-row': 2,
    'three-panel-row': 3,
    'four-panel-grid': 4,
    'five-panel-final-wide': 5,
    'six-panel-grid': 6,
  };
  if (layout !== 'auto' && layoutPanelCounts[layout] !== spec.panels.length) {
    throw new Error(`Layout ${layout} requires ${layoutPanelCounts[layout]} panels, got ${spec.panels.length}.`);
  }

  spec.panels.forEach((panel, index) => {
    const label = `Panel ${index + 1}`;
    if (!panel || typeof panel !== 'object') throw new Error(`${label} must be an object.`);
    if (!panel.caption || typeof panel.caption !== 'string') throw new Error(`${label} requires caption.`);
    if (!DEV_POSES.has(panel.devPose)) throw new Error(`${label} has unknown devPose: ${panel.devPose}`);
    if (!CLANKER_POSES.has(panel.clankerPose)) throw new Error(`${label} has unknown clankerPose: ${panel.clankerPose}`);
    if (panel.fx !== undefined) {
      if (!Array.isArray(panel.fx)) throw new Error(`${label} fx must be an array.`);
      for (const item of panel.fx) {
        if (!FX.has(item)) throw new Error(`${label} has unknown fx: ${item}`);
      }
    }
    if (panel.tokenCounter !== undefined && typeof panel.tokenCounter !== 'string') {
      throw new Error(`${label} tokenCounter must be a string.`);
    }
    if (panel.terminalLines !== undefined) {
      if (!Array.isArray(panel.terminalLines)) throw new Error(`${label} terminalLines must be an array.`);
      if (panel.terminalLines.length > 3) throw new Error(`${label} terminalLines supports at most 3 lines.`);
      for (const item of panel.terminalLines) {
        if (typeof item !== 'string') throw new Error(`${label} terminalLines entries must be strings.`);
      }
    }
  });
}

function layoutPanels(layout, count) {
  const pageW = 1200;
  const margin = 24;
  const gap = 18;
  const top = 96;
  const innerW = pageW - margin * 2;
  const col2 = (innerW - gap) / 2;
  const col3 = (innerW - gap * 2) / 3;

  const chosen = layout === 'auto' ? autoLayout(count) : layout;

  if (chosen === 'one-panel') {
    return { width: pageW, height: 650, panels: [{ x: margin, y: top, w: innerW, h: 510 }] };
  }

  if (chosen === 'two-panel-row') {
    return {
      width: pageW,
      height: 610,
      panels: [0, 1].map((i) => ({ x: margin + i * (col2 + gap), y: top, w: col2, h: 470 })),
    };
  }

  if (chosen === 'three-panel-row') {
    return {
      width: pageW,
      height: 570,
      panels: [0, 1, 2].map((i) => ({ x: margin + i * (col3 + gap), y: top, w: col3, h: 430 })),
    };
  }

  if (chosen === 'four-panel-grid') {
    const h = 305;
    return {
      width: pageW,
      height: top + h * 2 + gap + margin,
      panels: [0, 1, 2, 3].map((i) => ({
        x: margin + (i % 2) * (col2 + gap),
        y: top + Math.floor(i / 2) * (h + gap),
        w: col2,
        h,
      })),
    };
  }

  if (chosen === 'five-panel-final-wide') {
    const h = 270;
    const finalH = 315;
    return {
      width: pageW,
      height: top + h * 2 + gap * 2 + finalH + margin,
      panels: [
        ...[0, 1, 2, 3].map((i) => ({
          x: margin + (i % 2) * (col2 + gap),
          y: top + Math.floor(i / 2) * (h + gap),
          w: col2,
          h,
        })),
        { x: margin, y: top + h * 2 + gap * 2, w: innerW, h: finalH },
      ],
    };
  }

  if (chosen === 'six-panel-grid') {
    const h = 250;
    return {
      width: pageW,
      height: top + h * 3 + gap * 2 + margin,
      panels: [0, 1, 2, 3, 4, 5].map((i) => ({
        x: margin + (i % 2) * (col2 + gap),
        y: top + Math.floor(i / 2) * (h + gap),
        w: col2,
        h,
      })),
    };
  }

  throw new Error(`Unsupported layout for renderer: ${chosen}`);
}

function autoLayout(count) {
  if (count === 1) return 'one-panel';
  if (count === 2) return 'two-panel-row';
  if (count === 3) return 'three-panel-row';
  if (count === 4) return 'four-panel-grid';
  if (count === 5) return 'five-panel-final-wide';
  return 'six-panel-grid';
}

function line(x1, y1, x2, y2, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra} />`;
}

function circle(cx, cy, r, extra = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${extra} />`;
}

function rect(x, y, w, h, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra} />`;
}

function renderTitle(title, width) {
  return `
    <text x="${width / 2}" y="58" text-anchor="middle" class="title">${escapeHtml(title)}</text>
    <line x1="24" y1="78" x2="${width - 24}" y2="78" class="terminal-line" />`;
}

function renderCaption(panel, box) {
  const maxChars = Math.max(12, Math.floor((box.w - 44) / 17));
  const lines = wrapText(panel.caption, maxChars).slice(0, 3);
  const bold = /\*\*|__/.test(panel.caption);
  const fontSize = box.w > 800 ? 36 : box.w < 400 ? 28 : 32;

  return `
    ${rect(box.x + 12, box.y + 12, box.w - 24, 34 + lines.length * 30, 'class="caption-bg"')}
    <text x="${box.x + 28}" y="${box.y + 48}" class="caption ${bold ? 'caption-bold' : ''}" style="font-size:${fontSize}px">
      ${lines.map((lineText, i) => `<tspan x="${box.x + 28}" dy="${i === 0 ? 0 : 30}">${escapeHtml(lineText)}</tspan>`).join('')}
    </text>`;
}

function renderDev(pose, x, footY, s) {
  if (pose === 'collapsed' || pose === 'dead') return renderDevCollapsed(pose, x, footY, s);
  if (pose === 'typing' || pose === 'resurrected-typing') return renderDevTyping(pose, x, footY, s);

  const headY = footY - 130 * s;
  const neckY = footY - 108 * s;
  const hipY = footY - 50 * s;
  const leftFootX = x - 25 * s;
  const rightFootX = x + 27 * s;
  const armY = footY - 88 * s;
  const jitter = pose === 'caffeinated' ? `stroke-dasharray="5 5"` : '';
  const glassesY = headY;

  let arms;
  if (pose === 'excited' || pose === 'overwhelmed' || pose === 'caffeinated') {
    arms = `
      ${line(x, armY, x - 45 * s, armY - 42 * s)}
      ${line(x, armY, x + 45 * s, armY - 42 * s)}`;
  } else if (pose === 'thinking') {
    arms = `
      ${line(x, armY, x - 32 * s, armY - 2 * s)}
      ${line(x, armY, x + 20 * s, headY + 20 * s)}`;
  } else if (pose === 'curious') {
    arms = `
      ${line(x, armY, x - 35 * s, armY + 18 * s)}
      ${line(x, armY, x + 42 * s, armY - 10 * s)}`;
  } else {
    arms = `
      ${line(x, armY, x - 38 * s, armY + 18 * s)}
      ${line(x, armY, x + 38 * s, armY + 18 * s)}`;
  }

  const extra = pose === 'overwhelmed' ? `
      <path d="M ${x - 58 * s} ${headY - 33 * s} l ${10 * s} ${-18 * s} l ${10 * s} ${18 * s}" class="dev-line" />
      <path d="M ${x + 42 * s} ${headY - 38 * s} l ${16 * s} ${-10 * s} l ${-6 * s} ${22 * s}" class="dev-line" />` : '';

  return `<g class="dev" ${jitter}>
    ${circle(x, headY, 24 * s, 'class="dev-fill dev-line"')}
    ${rect(x - 18 * s, glassesY - 7 * s, 14 * s, 10 * s, 'class="dev-fill dev-line"')}
    ${rect(x + 4 * s, glassesY - 7 * s, 14 * s, 10 * s, 'class="dev-fill dev-line"')}
    ${line(x - 4 * s, glassesY - 2 * s, x + 4 * s, glassesY - 2 * s)}
    ${line(x, neckY, x, hipY)}
    ${arms}
    ${line(x, hipY, leftFootX, footY)}
    ${line(x, hipY, rightFootX, footY)}
    ${extra}
  </g>`;
}

function renderDevTyping(pose, x, footY, s) {
  const headY = footY - 120 * s;
  const tableY = footY - 55 * s;
  const glow = pose === 'resurrected-typing' ? `
    <path d="M ${x - 72 * s} ${headY + 30 * s} q ${-28 * s} ${-44 * s} ${8 * s} ${-80 * s}" class="fx-line" />
    <path d="M ${x + 72 * s} ${headY + 30 * s} q ${28 * s} ${-44 * s} ${-8 * s} ${-80 * s}" class="fx-line" />` : '';

  return `<g class="dev">
    ${glow}
    ${circle(x - 20 * s, headY, 23 * s, 'class="dev-fill dev-line"')}
    ${rect(x - 38 * s, headY - 7 * s, 14 * s, 10 * s, 'class="dev-fill dev-line"')}
    ${rect(x - 16 * s, headY - 7 * s, 14 * s, 10 * s, 'class="dev-fill dev-line"')}
    ${line(x - 22 * s, headY + 24 * s, x + 8 * s, footY - 70 * s)}
    ${line(x + 4 * s, footY - 78 * s, x + 42 * s, tableY - 8 * s)}
    ${line(x - 5 * s, footY - 74 * s, x + 25 * s, tableY - 6 * s)}
    ${line(x + 5 * s, footY - 70 * s, x - 20 * s, footY)}
    ${line(x + 8 * s, footY - 70 * s, x + 48 * s, footY)}
    ${rect(x + 24 * s, tableY - 32 * s, 70 * s, 34 * s, 'class="terminal-fill terminal-line"')}
    ${line(x + 24 * s, tableY + 4 * s, x + 105 * s, tableY + 4 * s, 'class="terminal-line"')}
  </g>`;
}

function renderDevCollapsed(pose, x, groundY, s) {
  const y = groundY - 18 * s;
  const xEye = pose === 'dead' ? `
    ${line(x - 52 * s, y - 11 * s, x - 44 * s, y - 3 * s)}
    ${line(x - 44 * s, y - 11 * s, x - 52 * s, y - 3 * s)}
    ${line(x - 30 * s, y - 11 * s, x - 22 * s, y - 3 * s)}
    ${line(x - 22 * s, y - 11 * s, x - 30 * s, y - 3 * s)}` : '';

  return `<g class="dev">
    ${circle(x - 38 * s, y - 8 * s, 22 * s, 'class="dev-fill dev-line"')}
    ${xEye || `${rect(x - 53 * s, y - 13 * s, 13 * s, 9 * s, 'class="dev-fill dev-line"')}${rect(x - 32 * s, y - 13 * s, 13 * s, 9 * s, 'class="dev-fill dev-line"')}`}
    ${line(x - 15 * s, y, x + 85 * s, y + 2 * s)}
    ${line(x + 14 * s, y, x + 2 * s, y - 30 * s)}
    ${line(x + 38 * s, y + 1 * s, x + 28 * s, y + 30 * s)}
    ${line(x + 82 * s, y + 2 * s, x + 126 * s, y - 14 * s)}
    ${line(x + 84 * s, y + 2 * s, x + 124 * s, y + 16 * s)}
  </g>`;
}

function renderClanker(pose, x, footY, s) {
  const headW = 72 * s;
  const headH = 54 * s;
  const headX = x - headW / 2;
  const headY = footY - 150 * s;
  const torsoX = x - 34 * s;
  const torsoY = footY - 90 * s;
  const body = `
    ${line(x, headY, x, headY - 26 * s, 'class="bot-line"')}
    ${circle(x, headY - 31 * s, 5 * s, 'class="bot-fill bot-line"')}
    ${rect(headX, headY, headW, headH, 'rx="8" class="bot-fill bot-line"')}
    ${renderRobotEyes(pose, x, headY, s)}
    ${rect(torsoX, torsoY, 68 * s, 55 * s, 'rx="6" class="bot-fill bot-line"')}
    ${line(x - 18 * s, torsoY + 18 * s, x + 18 * s, torsoY + 18 * s, 'class="bot-line"')}
    ${line(x - 18 * s, torsoY + 34 * s, x + 18 * s, torsoY + 34 * s, 'class="bot-line"')}
    ${line(x - 20 * s, torsoY + 55 * s, x - 28 * s, footY, 'class="bot-line"')}
    ${line(x + 20 * s, torsoY + 55 * s, x + 28 * s, footY, 'class="bot-line"')}`;

  const arms = renderRobotArms(pose, x, torsoY, s);
  const extra = pose === 'overclocked' ? `
    <path d="M ${x - 52 * s} ${headY - 16 * s} l ${14 * s} ${-22 * s} l ${10 * s} ${18 * s} l ${15 * s} ${-25 * s}" class="fx-line" />
    <path d="M ${x + 50 * s} ${headY - 8 * s} l ${20 * s} ${-18 * s} l ${-2 * s} ${26 * s}" class="fx-line" />` : '';

  return `<g class="clanker">${body}${arms}${extra}</g>`;
}

function renderRobotEyes(pose, x, headY, s) {
  if (pose === 'sleeping') {
    return `${line(x - 22 * s, headY + 24 * s, x - 6 * s, headY + 24 * s, 'class="bot-line"')}${line(x + 6 * s, headY + 24 * s, x + 22 * s, headY + 24 * s, 'class="bot-line"')}`;
  }
  if (pose === 'concerned') {
    return `${line(x - 24 * s, headY + 20 * s, x - 8 * s, headY + 28 * s, 'class="bot-line"')}${line(x + 8 * s, headY + 28 * s, x + 24 * s, headY + 20 * s, 'class="bot-line"')}`;
  }
  if (pose === 'error') {
    return `<text x="${x}" y="${headY + 34 * s}" text-anchor="middle" class="bot-error" style="font-size:${28 * s}px">ERR</text>`;
  }
  const eyeClass = pose === 'overclocked' || pose === 'confident' ? 'bot-eye hot' : 'bot-eye';
  return `${rect(x - 25 * s, headY + 18 * s, 16 * s, 12 * s, `class="${eyeClass}"`)}${rect(x + 9 * s, headY + 18 * s, 16 * s, 12 * s, `class="${eyeClass}"`)}`;
}

function renderRobotArms(pose, x, torsoY, s) {
  const shoulderY = torsoY + 22 * s;
  if (pose === 'helpful' || pose === 'celebratory') {
    return `
      ${line(x - 34 * s, shoulderY, x - 70 * s, shoulderY - 38 * s, 'class="bot-line"')}
      ${line(x + 34 * s, shoulderY, x + 70 * s, shoulderY - 38 * s, 'class="bot-line"')}
      ${renderClaw(x - 76 * s, shoulderY - 43 * s, s)}
      ${renderClaw(x + 76 * s, shoulderY - 43 * s, s)}`;
  }
  if (pose === 'concerned' || pose === 'watching') {
    return `
      ${line(x - 34 * s, shoulderY, x - 62 * s, shoulderY + 24 * s, 'class="bot-line"')}
      ${line(x + 34 * s, shoulderY, x + 62 * s, shoulderY + 24 * s, 'class="bot-line"')}
      ${renderClaw(x - 66 * s, shoulderY + 28 * s, s)}
      ${renderClaw(x + 66 * s, shoulderY + 28 * s, s)}`;
  }
  if (pose === 'thinking') {
    return `
      ${line(x - 34 * s, shoulderY, x - 66 * s, shoulderY + 18 * s, 'class="bot-line"')}
      ${line(x + 34 * s, shoulderY, x + 46 * s, torsoY - 8 * s, 'class="bot-line"')}
      ${renderClaw(x - 70 * s, shoulderY + 23 * s, s)}
      ${renderClaw(x + 48 * s, torsoY - 12 * s, s)}`;
  }
  return `
    ${line(x - 34 * s, shoulderY, x - 70 * s, shoulderY + 4 * s, 'class="bot-line"')}
    ${line(x + 34 * s, shoulderY, x + 70 * s, shoulderY + 4 * s, 'class="bot-line"')}
    ${renderClaw(x - 76 * s, shoulderY + 6 * s, s)}
    ${renderClaw(x + 76 * s, shoulderY + 6 * s, s)}`;
}

function renderClaw(x, y, s) {
  return `<path d="M ${x} ${y} l ${-10 * s} ${-8 * s} M ${x} ${y} l ${10 * s} ${-8 * s}" class="bot-line" />`;
}

function renderTokenCounter(panel, box) {
  if (!panel.tokenCounter) return '';
  const text = panel.tokenCounter.toUpperCase();
  const w = Math.min(250, Math.max(170, text.length * 13));
  const x = box.x + box.w - w - 22;
  const y = box.y + 90;
  return `<g class="token-counter">
    ${rect(x, y, w, 36, 'class="meter-bg"')}
    <text x="${x + 14}" y="${y + 25}" class="meter-text">${escapeHtml(text)}</text>
  </g>`;
}

function renderTerminalLines(panel, box) {
  const lines = (panel.terminalLines || []).slice(0, 3);
  if (!lines.length) return '';
  const terminalW = Math.min(box.w - 40, Math.max(320, box.w * 0.58));
  const terminalH = 30 + lines.length * 24;
  const x = box.x + 20;
  const y = box.y + box.h - terminalH - 54;
  return `<g class="mini-terminal">
    ${rect(x, y, terminalW, terminalH, 'class="mini-terminal-bg"')}
    ${lines.map((lineText, index) => `<text x="${x + 14}" y="${y + 28 + index * 24}" class="mini-terminal-text">${escapeHtml(lineText)}</text>`).join('')}
  </g>`;
}

function renderPanelFx(fxItems, box, devX, botX, groundY) {
  const items = fxItems || [];
  const out = [];

  if (items.includes('small-glow')) {
    out.push(circle(botX, groundY - 130, 72, 'class="glow"'));
  }
  if (items.includes('screen-glow')) {
    out.push(circle(botX, groundY - 124, 95, 'class="glow strong"'));
  }
  if (items.includes('sparks')) {
    out.push(`<path d="M ${botX + 62} ${groundY - 180} l 18 -28 l 8 24 l 22 -20" class="fx-line" />`);
    out.push(`<path d="M ${botX - 72} ${groundY - 165} l -20 -18 l 5 25" class="fx-line" />`);
  }
  if (items.includes('terminal-cursor')) {
    out.push(`<text x="${box.x + box.w - 86}" y="${box.y + box.h - 36}" class="terminal-cursor">█</text>`);
  }
  if (items.includes('smoke')) {
    out.push(`<path d="M ${devX + 30} ${groundY - 185} q 26 -22 0 -44 q -20 -20 10 -43" class="fx-line dim" />`);
  }
  if (items.includes('sweat')) {
    out.push(`<path d="M ${devX + 52} ${groundY - 160} q 10 16 -4 27 q -14 -12 4 -27" class="fx-fill" />`);
  }
  if (items.includes('speed-lines')) {
    out.push(line(box.x + 36, groundY - 170, box.x + 120, groundY - 190, 'class="fx-line dim"'));
    out.push(line(box.x + 42, groundY - 126, box.x + 150, groundY - 132, 'class="fx-line dim"'));
    out.push(line(box.x + 48, groundY - 88, box.x + 125, groundY - 70, 'class="fx-line dim"'));
  }
  if (items.includes('boot')) {
    out.push(`<text x="${box.x + 34}" y="${box.y + box.h - 34}" class="boot-text">&gt; booting...</text>`);
  }

  return out.join('\n');
}

function renderPanel(panel, box, index) {
  const groundY = box.y + box.h - 38;
  const s = Math.max(0.72, Math.min(1.18, Math.min(box.w / 560, box.h / 360)));
  const devX = box.x + box.w * 0.32;
  const botX = box.x + box.w * 0.72;

  return `<g class="panel" aria-label="Panel ${index + 1}">
    ${rect(box.x, box.y, box.w, box.h, 'rx="8" class="panel-bg"')}
    ${line(box.x + 18, groundY, box.x + box.w - 18, groundY, 'class="ground"')}
    ${renderPanelFx(panel.fx, box, devX, botX, groundY)}
    ${renderTerminalLines(panel, box)}
    ${renderDev(panel.devPose, devX, groundY, s)}
    ${renderClanker(panel.clankerPose, botX, groundY, s)}
    ${renderCaption(panel, box)}
    ${renderTokenCounter(panel, box)}
    <text x="${box.x + box.w - 22}" y="${box.y + box.h - 16}" text-anchor="end" class="panel-num">${index + 1}</text>
  </g>`;
}

function renderSvg(spec) {
  const layout = layoutPanels(spec.layout || 'auto', spec.panels.length);

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="comic-title" viewBox="0 0 ${layout.width} ${layout.height}" width="100%">
  <title id="comic-title">${escapeHtml(spec.title)}</title>
  <style>
    svg { background: #000; }
    .title { fill: ${GREEN_BRIGHT}; font: 52px 'VT323', 'Courier New', monospace; letter-spacing: 2px; }
    .terminal-line, .ground { stroke: ${GREEN_DIM}; stroke-width: 3; }
    .panel-bg { fill: ${PANEL_BG}; stroke: ${GREEN}; stroke-width: 3; }
    .caption-bg { fill: rgba(0, 0, 0, 0.74); stroke: ${GREEN_DIM}; stroke-width: 2; }
    .caption { fill: ${GREEN_BRIGHT}; font-family: 'VT323', 'Courier New', monospace; }
    .caption-bold { font-weight: 700; letter-spacing: 1px; }
    .panel-num, .boot-text { fill: ${GREEN_DIM}; font: 22px 'VT323', 'Courier New', monospace; }
    .meter-bg, .mini-terminal-bg { fill: rgba(0, 0, 0, 0.82); stroke: ${GREEN_DIM}; stroke-width: 2; }
    .meter-text { fill: ${GREEN_BRIGHT}; font: 24px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .mini-terminal-text { fill: ${GREEN_BRIGHT}; font: 22px 'VT323', 'Courier New', monospace; }
    .dev-line, .dev line, .dev circle, .dev rect { stroke: ${GREEN_BRIGHT}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .dev-fill { fill: ${BLACK}; }
    .bot-line, .clanker line, .clanker path, .clanker rect, .clanker circle { stroke: ${GREEN}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .bot-fill { fill: ${BLACK}; }
    .bot-eye { fill: ${GREEN_BRIGHT}; stroke: ${GREEN_BRIGHT}; }
    .bot-eye.hot { filter: drop-shadow(0 0 8px ${GREEN_BRIGHT}); }
    .bot-error { fill: ${GREEN_BRIGHT}; font-family: 'VT323', 'Courier New', monospace; }
    .fx-line { fill: none; stroke: ${GREEN_BRIGHT}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .fx-line.dim { stroke: ${GREEN_DIM}; }
    .fx-fill { fill: ${GREEN_BRIGHT}; stroke: ${GREEN_BRIGHT}; }
    .glow { fill: ${GREEN}; opacity: 0.06; }
    .glow.strong { opacity: 0.1; }
    .terminal-fill { fill: ${BLACK}; }
    .terminal-cursor { fill: ${GREEN_BRIGHT}; font: 38px 'VT323', 'Courier New', monospace; }
  </style>
  ${renderTitle(spec.title, layout.width)}
  ${spec.panels.map((panel, index) => renderPanel(panel, layout.panels[index], index)).join('\n')}
</svg>`;
}

function normalizeSvgForMarkdown(svg) {
  // Marked ends raw HTML blocks at blank lines. If an indented SVG line appears
  // after that, markdown may render it as a code block instead of SVG markup.
  // Keep the SVG multiline for readability, but remove whitespace-only lines.
  return svg
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .join('\n');
}

function renderPost(spec, svg) {
  const credit = spec.credit ? `\n\nCredit: ${spec.credit}\n` : '';

  return `---
layout: post
title: ${spec.title}
---

${normalizeSvgForMarkdown(svg)}
${credit}`;
}

const spec = JSON.parse(await readFile(specPath, 'utf8'));
validateSpec(spec);

spec.slug = slugify(spec.slug || spec.title);
spec.timestamp = spec.timestamp || today();

const svg = renderSvg(spec);
const markdown = renderPost(spec, svg);
const outPath = explicitOutPath || path.join('_posts', `${spec.timestamp}-${spec.slug}.md`);

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, markdown, 'utf8');
console.log(`Wrote ${outPath}`);
