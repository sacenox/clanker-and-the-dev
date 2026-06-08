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

const CAPTION_SPEAKERS = new Set(['narrator', 'dev', 'clanker']);

const LAYOUTS = new Set([
  'auto',
  'one-panel',
  'two-panel-row',
  'three-panel-row',
  'four-panel-grid',
  'five-panel-final-wide',
  'six-panel-grid',
]);

const GREEN = '#00ff66';
const GREEN_DIM = '#128a3a';
const GREEN_BRIGHT = '#7cff8a';
const BLACK = '#020617';
const PANEL_BG = '#020806';

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
    const hasCaption = typeof panel.caption === 'string' && panel.caption.length > 0;
    const hasDialogue = Array.isArray(panel.dialogue) && panel.dialogue.length > 0;
    if (!hasCaption && !hasDialogue) throw new Error(`${label} requires caption or dialogue.`);
    if (panel.caption !== undefined && typeof panel.caption !== 'string') throw new Error(`${label} caption must be a string.`);
    if (!DEV_POSES.has(panel.devPose)) throw new Error(`${label} has unknown devPose: ${panel.devPose}`);
    if (!CLANKER_POSES.has(panel.clankerPose)) throw new Error(`${label} has unknown clankerPose: ${panel.clankerPose}`);
    if (panel.fx !== undefined) {
      if (!Array.isArray(panel.fx)) throw new Error(`${label} fx must be an array.`);
      for (const item of panel.fx) {
        if (!FX.has(item)) throw new Error(`${label} has unknown fx: ${item}`);
      }
    }
    if (panel.captionSpeaker !== undefined && !CAPTION_SPEAKERS.has(panel.captionSpeaker)) {
      throw new Error(`${label} captionSpeaker must be narrator, dev, or clanker.`);
    }
    if (panel.dialogue !== undefined) {
      if (!Array.isArray(panel.dialogue)) throw new Error(`${label} dialogue must be an array.`);
      if (panel.dialogue.length > 3) throw new Error(`${label} dialogue supports at most 3 lines.`);
      for (const [dialogueIndex, item] of panel.dialogue.entries()) {
        const dialogueLabel = `${label} dialogue ${dialogueIndex + 1}`;
        if (!item || typeof item !== 'object') throw new Error(`${dialogueLabel} must be an object.`);
        if (!CAPTION_SPEAKERS.has(item.speaker)) throw new Error(`${dialogueLabel} speaker must be narrator, dev, or clanker.`);
        if (!item.text || typeof item.text !== 'string') throw new Error(`${dialogueLabel} requires text.`);
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

function pathD(d, extra = '') {
  return `<path d="${d}" ${extra} />`;
}

function renderSparkle(x, y, s = 1, extraClass = 'fx-line') {
  return `<path d="M ${x} ${y - 16 * s} L ${x + 5 * s} ${y - 5 * s} L ${x + 16 * s} ${y} L ${x + 5 * s} ${y + 5 * s} L ${x} ${y + 16 * s} L ${x - 5 * s} ${y + 5 * s} L ${x - 16 * s} ${y} L ${x - 5 * s} ${y - 5 * s} Z" class="${extraClass}" />`;
}

function renderTitle(title, width) {
  const titleText = `> ${title.toUpperCase()}_`;
  const longTitle = titleText.length > 28;
  const titleSize = longTitle ? 38 : 48;
  const meta = longTitle ? '' : `
    <text x="${width - 430}" y="34" class="meta-text">PROJECT : CLANKER AND THE DEV</text>
    <text x="${width - 430}" y="58" class="meta-text">THEME   : CODE. COFFEE. CHAOS.</text>`;

  return `
    <text x="42" y="58" class="title" style="font-size:${titleSize}px">${escapeHtml(titleText)}</text>${meta}
    <line x1="24" y1="78" x2="${width - 24}" y2="78" class="terminal-line" />`;
}

function panelCaptions(panel) {
  if (Array.isArray(panel.dialogue) && panel.dialogue.length) {
    return panel.dialogue.map((item) => ({
      speaker: item.speaker || 'narrator',
      text: item.text,
    }));
  }

  return [{
    speaker: panel.captionSpeaker || 'narrator',
    text: panel.caption,
  }];
}

function renderCaptionBalloon(item, box, devX, botX, groundY, y) {
  const speaker = item.speaker || 'narrator';
  const text = item.text;
  const bold = /\*\*|__/.test(text);
  const fontSize = box.w > 800 ? 36 : box.w < 400 ? 28 : 32;
  const lineHeight = Math.round(fontSize * 0.9);
  const reservedRight = box.captionReserveRight || 0;
  const maxW = speaker === 'narrator'
    ? Math.max(220, box.w - 24 - reservedRight)
    : Math.min(box.w - 44 - reservedRight, Math.max(270, box.w * 0.58));
  const maxChars = Math.max(10, Math.floor((maxW - 34) / (fontSize * 0.55)));
  const lines = wrapText(text, maxChars).slice(0, 4);
  const balloonH = 30 + lines.length * lineHeight;
  const targetX = speaker === 'dev' ? devX : speaker === 'clanker' ? botX : null;
  const x = speaker === 'narrator'
    ? box.x + 12
    : Math.max(box.x + 12, Math.min(targetX - maxW / 2, box.x + box.w - maxW - 12 - reservedRight));
  const textX = x + 16;
  const textY = y + 36;

  if (speaker === 'narrator') {
    return {
      height: balloonH,
      svg: `
    ${rect(x, y, maxW, balloonH, 'rx="6" class="caption-bg narrator"')}
    <text x="${textX}" y="${textY}" class="caption ${bold ? 'caption-bold' : ''}" style="font-size:${fontSize}px">
      ${lines.map((lineText, i) => `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(lineText)}</tspan>`).join('')}
    </text>`,
    };
  }

  const tailBaseX = Math.max(x + 36, Math.min(targetX, x + maxW - 36));
  const tailTipY = Math.max(y + balloonH + 26, Math.min(groundY - 118, box.y + box.h - 72));

  return {
    height: balloonH,
    svg: `
    <path d="M ${tailBaseX - 20} ${y + balloonH - 2} Q ${tailBaseX} ${y + balloonH + 22} ${targetX} ${tailTipY} Q ${tailBaseX + 14} ${y + balloonH + 18} ${tailBaseX + 20} ${y + balloonH - 2} Z" class="caption-tail" />
    ${rect(x, y, maxW, balloonH, 'rx="14" class="caption-bg speech"')}
    <text x="${textX}" y="${textY}" class="caption ${bold ? 'caption-bold' : ''}" style="font-size:${fontSize}px">
      ${lines.map((lineText, i) => `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${escapeHtml(lineText)}</tspan>`).join('')}
    </text>`,
  };
}

function renderCaptions(panel, box, devX, botX, groundY) {
  let y = box.y + 46;
  const captionBox = { ...box, captionReserveRight: panel.tokenCounter ? 240 : 0 };
  return panelCaptions(panel).map((item) => {
    const rendered = renderCaptionBalloon(item, captionBox, devX, botX, groundY, y);
    y += rendered.height + 10;
    return rendered.svg;
  }).join('\n');
}

function renderCoffeeMug(x, y, s = 1) {
  return `<g class="prop coffee">
    ${rect(x, y, 42 * s, 36 * s, 'rx="7" class="prop-fill prop-line"')}
    ${pathD(`M ${x + 42 * s} ${y + 10 * s} q ${20 * s} ${2 * s} ${9 * s} ${22 * s} q ${-7 * s} ${8 * s} ${-14 * s} ${2 * s}`, 'class="prop-line"')}
    ${pathD(`M ${x + 12 * s} ${y - 8 * s} q ${-8 * s} ${-14 * s} ${5 * s} ${-25 * s}`, 'class="fx-line dim"')}
    ${pathD(`M ${x + 23 * s} ${y - 8 * s} q ${-8 * s} ${-14 * s} ${5 * s} ${-25 * s}`, 'class="fx-line dim"')}
    <text x="${x + 10 * s}" y="${y + 25 * s}" class="prop-code" style="font-size:${22 * s}px">&lt;/&gt;</text>
  </g>`;
}

function renderLaptop(x, y, w, h, label = '&lt;/&gt;') {
  return `<g class="prop laptop">
    ${rect(x, y, w, h, 'rx="4" class="prop-fill prop-line"')}
    ${rect(x + 8, y + 8, w - 16, h - 16, 'class="screen-fill prop-line"')}
    <text x="${x + w / 2}" y="${y + h * 0.62}" text-anchor="middle" class="prop-code" style="font-size:${Math.max(20, h * 0.38)}px">${label}</text>
    ${pathD(`M ${x - 18} ${y + h + 2} L ${x + w + 18} ${y + h + 2} L ${x + w + 36} ${y + h + 18} L ${x - 36} ${y + h + 18} Z`, 'class="prop-fill prop-line"')}
    ${line(x + w * 0.35, y + h + 10, x + w * 0.65, y + h + 10, 'class="prop-line dim"')}
  </g>`;
}

function renderDevFace(pose, x, headY, s) {
  const r = 25 * s;
  const glassesY = headY - 6 * s;
  const leftLensX = x - 22 * s;
  const rightLensX = x + 3 * s;
  const lensW = 18 * s;
  const lensH = 12 * s;
  let eyes = `${circle(x - 13 * s, headY, 2.5 * s, 'class="dev-eye"')}${circle(x + 13 * s, headY, 2.5 * s, 'class="dev-eye"')}`;
  let brows = '';
  let mouth = line(x - 6 * s, headY + 15 * s, x + 8 * s, headY + 15 * s, 'class="dev-line"');
  let accents = '';

  if (pose === 'curious') {
    brows = `${pathD(`M ${x - 19 * s} ${headY - 12 * s} q ${8 * s} ${-6 * s} ${16 * s} 0`, 'class="dev-line"')}${line(x + 7 * s, headY - 12 * s, x + 22 * s, headY - 10 * s, 'class="dev-line"')}`;
    mouth = pathD(`M ${x - 4 * s} ${headY + 14 * s} q ${8 * s} ${5 * s} ${15 * s} 0`, 'class="dev-line"');
    accents = `<text x="${x + 34 * s}" y="${headY - 24 * s}" class="accent-text" style="font-size:${34 * s}px">?</text>`;
  } else if (pose === 'thinking') {
    brows = pathD(`M ${x - 18 * s} ${headY - 13 * s} q ${9 * s} ${-7 * s} ${18 * s} 0`, 'class="dev-line"');
    mouth = pathD(`M ${x - 8 * s} ${headY + 15 * s} q ${9 * s} ${-4 * s} ${18 * s} 0`, 'class="dev-line"');
    accents = `<text x="${x + 33 * s}" y="${headY - 18 * s}" class="accent-text dim" style="font-size:${28 * s}px">...</text>`;
  } else if (pose === 'excited') {
    eyes = `<text x="${x - 14 * s}" y="${headY + 6 * s}" text-anchor="middle" class="dev-symbol" style="font-size:${18 * s}px">★</text><text x="${x + 14 * s}" y="${headY + 6 * s}" text-anchor="middle" class="dev-symbol" style="font-size:${18 * s}px">★</text>`;
    mouth = circle(x, headY + 15 * s, 7 * s, 'class="dev-mouth-open dev-line"');
    accents = `${renderSparkle(x - 42 * s, headY - 8 * s, 0.55 * s)}${renderSparkle(x + 42 * s, headY - 8 * s, 0.55 * s)}`;
  } else if (pose === 'overwhelmed') {
    brows = `${line(x - 19 * s, headY - 15 * s, x - 8 * s, headY - 9 * s, 'class="dev-line"')}${line(x + 8 * s, headY - 9 * s, x + 19 * s, headY - 15 * s, 'class="dev-line"')}`;
    mouth = rect(x - 8 * s, headY + 10 * s, 16 * s, 13 * s, 'rx="4" class="dev-mouth-open dev-line"');
    accents = `<text x="${x + 36 * s}" y="${headY - 14 * s}" class="accent-text" style="font-size:${34 * s}px">!</text>`;
  } else if (pose === 'caffeinated') {
    eyes = `${circle(x - 13 * s, headY, 5 * s, 'class="dev-eye hollow"')}${circle(x + 13 * s, headY, 5 * s, 'class="dev-eye hollow"')}`;
    mouth = pathD(`M ${x - 12 * s} ${headY + 14 * s} q ${12 * s} ${10 * s} ${24 * s} 0`, 'class="dev-line"');
    accents = `${pathD(`M ${x - 38 * s} ${headY - 4 * s} q ${-8 * s} ${9 * s} 0 ${18 * s}`, 'class="fx-line dim"')}${pathD(`M ${x + 38 * s} ${headY - 8 * s} q ${8 * s} ${9 * s} 0 ${18 * s}`, 'class="fx-line dim"')}`;
  }

  return `${circle(x, headY, r, 'class="dev-fill dev-line"')}
    ${line(x - r, headY + 1 * s, x + r, headY + 1 * s, 'class="dev-line dim"')}
    ${rect(leftLensX, glassesY, lensW, lensH, 'rx="1" class="dev-glass dev-line"')}
    ${rect(rightLensX, glassesY, lensW, lensH, 'rx="1" class="dev-glass dev-line"')}
    ${line(x - 4 * s, headY, x + 4 * s, headY, 'class="dev-line"')}
    ${eyes}${brows}${mouth}${accents}`;
}

function renderDev(pose, x, footY, s) {
  if (pose === 'collapsed' || pose === 'dead') return renderDevCollapsed(pose, x, footY, s);
  if (pose === 'typing' || pose === 'resurrected-typing') return renderDevTyping(pose, x, footY, s);

  const headY = footY - 130 * s;
  const neckY = footY - 104 * s;
  const hipY = footY - 50 * s;
  const shoulderY = footY - 88 * s;
  const jitter = pose === 'caffeinated' ? `style="filter: drop-shadow(0 0 6px rgba(0,255,102,.55))"` : '';

  let arms;
  let hands = '';
  if (pose === 'excited' || pose === 'overwhelmed' || pose === 'caffeinated') {
    const lh = { x: x - 48 * s, y: shoulderY - 44 * s };
    const rh = { x: x + 48 * s, y: shoulderY - 44 * s };
    arms = `${line(x, shoulderY, lh.x, lh.y, 'class="dev-line"')}${line(x, shoulderY, rh.x, rh.y, 'class="dev-line"')}`;
    hands = `${circle(lh.x, lh.y, 4 * s, 'class="dev-hand"')}${circle(rh.x, rh.y, 4 * s, 'class="dev-hand"')}`;
  } else if (pose === 'thinking') {
    const lh = { x: x - 34 * s, y: shoulderY + 15 * s };
    const rh = { x: x + 18 * s, y: headY + 22 * s };
    arms = `${line(x, shoulderY, lh.x, lh.y, 'class="dev-line"')}${pathD(`M ${x} ${shoulderY} q ${24 * s} ${8 * s} ${rh.x} ${rh.y}`, 'class="dev-line"')}`;
    hands = `${circle(lh.x, lh.y, 4 * s, 'class="dev-hand"')}${circle(rh.x, rh.y, 5 * s, 'class="dev-hand"')}`;
  } else if (pose === 'curious') {
    const lean = 10 * s;
    arms = `${line(x - lean, shoulderY, x - 40 * s, shoulderY + 24 * s, 'class="dev-line"')}${line(x - lean, shoulderY, x + 38 * s, shoulderY - 6 * s, 'class="dev-line"')}`;
    hands = `${circle(x - 40 * s, shoulderY + 24 * s, 4 * s, 'class="dev-hand"')}${circle(x + 38 * s, shoulderY - 6 * s, 4 * s, 'class="dev-hand"')}`;
  } else {
    arms = `${line(x, shoulderY, x - 38 * s, shoulderY + 18 * s, 'class="dev-line"')}${line(x, shoulderY, x + 38 * s, shoulderY + 18 * s, 'class="dev-line"')}`;
    hands = `${circle(x - 38 * s, shoulderY + 18 * s, 4 * s, 'class="dev-hand"')}${circle(x + 38 * s, shoulderY + 18 * s, 4 * s, 'class="dev-hand"')}`;
  }

  const stress = pose === 'overwhelmed' ? `
      ${rect(x - 86 * s, headY + 26 * s, 42 * s, 28 * s, 'rx="3" class="prop-fill prop-line dim"')}
      ${line(x - 78 * s, headY + 37 * s, x - 54 * s, headY + 37 * s, 'class="prop-line dim"')}
      ${rect(x + 48 * s, headY + 35 * s, 48 * s, 32 * s, 'rx="3" class="prop-fill prop-line dim"')}
      ${line(x + 57 * s, headY + 47 * s, x + 84 * s, headY + 47 * s, 'class="prop-line dim"')}` : '';

  const coffee = pose === 'caffeinated' ? renderCoffeeMug(x + 46 * s, footY - 118 * s, 0.72 * s) : '';

  return `<g class="dev" ${jitter}>
    ${renderDevFace(pose, x, headY, s)}
    ${pathD(`M ${x} ${neckY} C ${x - 7 * s} ${footY - 86 * s} ${x + 7 * s} ${footY - 70 * s} ${x} ${hipY}`, 'class="dev-line"')}
    ${arms}${hands}
    ${line(x, hipY, x - 25 * s, footY, 'class="dev-line"')}
    ${line(x, hipY, x + 27 * s, footY, 'class="dev-line"')}
    ${pathD(`M ${x - 35 * s} ${footY + 1 * s} q ${10 * s} ${5 * s} ${24 * s} 0`, 'class="dev-line dim"')}
    ${pathD(`M ${x + 16 * s} ${footY + 1 * s} q ${10 * s} ${5 * s} ${24 * s} 0`, 'class="dev-line dim"')}
    ${stress}${coffee}
  </g>`;
}

function renderDevTyping(pose, x, footY, s) {
  const headY = footY - 124 * s;
  const tableY = footY - 48 * s;
  const tableX = x - 30 * s;
  const resurrected = pose === 'resurrected-typing';
  const glow = resurrected ? `
    ${pathD(`M ${x - 82 * s} ${headY + 36 * s} q ${-30 * s} ${-48 * s} ${10 * s} ${-86 * s}`, 'class="fx-line"')}
    ${pathD(`M ${x + 70 * s} ${headY + 34 * s} q ${30 * s} ${-48 * s} ${-10 * s} ${-86 * s}`, 'class="fx-line"')}` : '';

  return `<g class="dev typing-dev">
    ${glow}
    ${rect(x - 96 * s, tableY - 2 * s, 210 * s, 8 * s, 'rx="2" class="prop-fill prop-line"')}
    ${line(x - 78 * s, tableY + 5 * s, x - 78 * s, footY, 'class="prop-line"')}
    ${line(x + 94 * s, tableY + 5 * s, x + 94 * s, footY, 'class="prop-line"')}
    ${pathD(`M ${x - 86 * s} ${footY - 18 * s} L ${x - 118 * s} ${footY - 18 * s} L ${x - 118 * s} ${footY - 82 * s} q ${18 * s} ${-16 * s} ${44 * s} 0`, 'class="prop-line dim"')}
    ${renderDevFace(resurrected ? 'caffeinated' : 'focused', x - 30 * s, headY, s * 0.96)}
    ${pathD(`M ${x - 30 * s} ${headY + 25 * s} q ${18 * s} ${20 * s} ${10 * s} ${76 * s}`, 'class="dev-line"')}
    ${line(x - 18 * s, footY - 82 * s, x + 22 * s, tableY - 5 * s, 'class="dev-line"')}
    ${line(x - 36 * s, footY - 80 * s, x + 2 * s, tableY - 4 * s, 'class="dev-line"')}
    ${circle(x + 22 * s, tableY - 5 * s, 4 * s, 'class="dev-hand"')}
    ${circle(x + 2 * s, tableY - 4 * s, 4 * s, 'class="dev-hand"')}
    ${line(x - 26 * s, footY - 54 * s, x - 22 * s, footY, 'class="dev-line"')}
    ${line(x - 12 * s, footY - 54 * s, x + 44 * s, footY, 'class="dev-line"')}
    ${renderLaptop(tableX + 48 * s, tableY - 62 * s, 76 * s, 46 * s)}
  </g>`;
}

function renderDevCollapsed(pose, x, groundY, s) {
  const y = groundY - 20 * s;
  const dead = pose === 'dead';
  const face = dead ? `
    ${line(x - 55 * s, y - 12 * s, x - 45 * s, y - 2 * s, 'class="dev-line"')}
    ${line(x - 45 * s, y - 12 * s, x - 55 * s, y - 2 * s, 'class="dev-line"')}
    ${line(x - 31 * s, y - 12 * s, x - 21 * s, y - 2 * s, 'class="dev-line"')}
    ${line(x - 21 * s, y - 12 * s, x - 31 * s, y - 2 * s, 'class="dev-line"')}` : `${rect(x - 55 * s, y - 14 * s, 15 * s, 10 * s, 'rx="1" class="dev-glass dev-line"')}${rect(x - 32 * s, y - 14 * s, 15 * s, 10 * s, 'rx="1" class="dev-glass dev-line"')}${pathD(`M ${x - 52 * s} ${y + 8 * s} q ${13 * s} ${-7 * s} ${26 * s} 0`, 'class="dev-line"')}`;
  const ghost = dead ? `<g class="ghost-dev">${pathD(`M ${x - 8 * s} ${y - 66 * s} q ${14 * s} ${-30 * s} ${34 * s} 0 v ${44 * s} q ${-12 * s} ${-8 * s} ${-22 * s} 0 q ${-10 * s} ${-8 * s} ${-22 * s} 0 Z`, 'class="dev-line dev-fill"')}${line(x + 6 * s, y - 52 * s, x + 14 * s, y - 44 * s, 'class="dev-line"')}${line(x + 14 * s, y - 52 * s, x + 6 * s, y - 44 * s, 'class="dev-line"')}</g>` : '';

  return `<g class="dev collapsed-dev">
    ${ghost}
    ${circle(x - 38 * s, y - 8 * s, 22 * s, 'class="dev-fill dev-line"')}
    ${face}
    ${line(x - 15 * s, y, x + 86 * s, y + 2 * s, 'class="dev-line"')}
    ${line(x + 14 * s, y, x + 2 * s, y - 30 * s, 'class="dev-line"')}
    ${line(x + 38 * s, y + 1 * s, x + 28 * s, y + 30 * s, 'class="dev-line"')}
    ${line(x + 82 * s, y + 2 * s, x + 126 * s, y - 14 * s, 'class="dev-line"')}
    ${line(x + 84 * s, y + 2 * s, x + 124 * s, y + 16 * s, 'class="dev-line"')}
    ${renderCoffeeMug(x + 118 * s, y + 2 * s, 0.62 * s)}
    ${pathD(`M ${x - 2 * s} ${y - 48 * s} q ${-8 * s} ${-10 * s} ${5 * s} ${-20 * s}`, 'class="fx-line dim"')}
  </g>`;
}

function renderClanker(pose, x, footY, s) {
  const headW = 82 * s;
  const headH = 58 * s;
  const headX = x - headW / 2;
  const headY = footY - 154 * s;
  const torsoW = 72 * s;
  const torsoH = 60 * s;
  const torsoX = x - torsoW / 2;
  const torsoY = footY - 90 * s;
  const angle = pose === 'concerned' ? 8 : pose === 'watching' ? -5 : pose === 'sleeping' ? 12 : pose === 'error' ? -3 : 0;

  const extra = pose === 'overclocked' ? `
    ${pathD(`M ${x - 58 * s} ${headY - 18 * s} l ${18 * s} ${-25 * s} l ${8 * s} ${24 * s} l ${20 * s} ${-30 * s}`, 'class="fx-line"')}
    ${pathD(`M ${x + 54 * s} ${headY - 12 * s} l ${25 * s} ${-20 * s} l ${-2 * s} ${30 * s}`, 'class="fx-line"')}
    ${circle(x, torsoY + 34 * s, 15 * s, 'class="bot-eye hot"')}` : '';
  const sleep = pose === 'sleeping' ? `<text x="${x + 44 * s}" y="${headY - 22 * s}" class="accent-text" style="font-size:${26 * s}px">Z z</text>` : '';

  return `<g class="clanker" transform="rotate(${angle} ${x} ${footY - 78 * s})">
    ${line(x, headY, x, headY - 28 * s, 'class="bot-line"')}
    ${circle(x, headY - 34 * s, 5.5 * s, 'class="bot-eye bot-line"')}
    ${rect(headX - 10 * s, headY + 16 * s, 11 * s, 28 * s, 'rx="3" class="bot-fill bot-line"')}
    ${rect(headX + headW - 1 * s, headY + 16 * s, 11 * s, 28 * s, 'rx="3" class="bot-fill bot-line"')}
    ${rect(headX, headY, headW, headH, 'rx="10" class="bot-fill bot-line"')}
    ${renderRobotEyes(pose, x, headY, s)}
    ${line(x - 18 * s, headY + headH, x - 18 * s, torsoY, 'class="bot-line"')}
    ${line(x + 18 * s, headY + headH, x + 18 * s, torsoY, 'class="bot-line"')}
    ${rect(torsoX, torsoY, torsoW, torsoH, 'rx="7" class="bot-fill bot-line"')}
    ${rect(x - 17 * s, torsoY + 20 * s, 34 * s, 20 * s, 'rx="2" class="bot-fill bot-line"')}
    ${line(x - 10 * s, torsoY + 27 * s, x + 10 * s, torsoY + 27 * s, 'class="bot-line"')}
    ${line(x - 10 * s, torsoY + 34 * s, x + 7 * s, torsoY + 34 * s, 'class="bot-line"')}
    ${renderRobotArms(pose, x, torsoY, s)}
    ${line(x - 22 * s, torsoY + torsoH, x - 30 * s, footY - 8 * s, 'class="bot-line bot-segmented"')}
    ${line(x + 22 * s, torsoY + torsoH, x + 30 * s, footY - 8 * s, 'class="bot-line bot-segmented"')}
    ${rect(x - 42 * s, footY - 8 * s, 25 * s, 12 * s, 'rx="2" class="bot-fill bot-line"')}
    ${rect(x + 17 * s, footY - 8 * s, 25 * s, 12 * s, 'rx="2" class="bot-fill bot-line"')}
    ${pathD(`M ${x - 55 * s} ${footY + 4 * s} q ${55 * s} ${12 * s} ${110 * s} 0`, 'class="bot-line dim"')}
    ${extra}${sleep}
  </g>`;
}

function renderRobotEyes(pose, x, headY, s) {
  if (pose === 'sleeping') {
    return `${line(x - 24 * s, headY + 29 * s, x - 7 * s, headY + 29 * s, 'class="bot-line"')}${line(x + 7 * s, headY + 29 * s, x + 24 * s, headY + 29 * s, 'class="bot-line"')}`;
  }
  if (pose === 'concerned') {
    return `${pathD(`M ${x - 25 * s} ${headY + 24 * s} q ${8 * s} ${10 * s} ${17 * s} 0`, 'class="bot-line"')}${pathD(`M ${x + 8 * s} ${headY + 24 * s} q ${8 * s} ${10 * s} ${17 * s} 0`, 'class="bot-line"')}`;
  }
  if (pose === 'error') {
    return `${line(x - 24 * s, headY + 20 * s, x - 10 * s, headY + 34 * s, 'class="bot-line"')}${line(x - 10 * s, headY + 20 * s, x - 24 * s, headY + 34 * s, 'class="bot-line"')}${line(x + 10 * s, headY + 20 * s, x + 24 * s, headY + 34 * s, 'class="bot-line"')}${line(x + 24 * s, headY + 20 * s, x + 10 * s, headY + 34 * s, 'class="bot-line"')}`;
  }
  if (pose === 'overclocked') {
    return `${circle(x - 17 * s, headY + 27 * s, 10 * s, 'class="bot-eye hot"')}${circle(x + 17 * s, headY + 27 * s, 10 * s, 'class="bot-eye hot"')}${pathD(`M ${x - 22 * s} ${headY + 27 * s} q ${6 * s} ${-8 * s} ${12 * s} 0 q ${-6 * s} ${8 * s} ${-12 * s} 0`, 'class="bot-line dark-cut"')}${pathD(`M ${x + 12 * s} ${headY + 27 * s} q ${6 * s} ${-8 * s} ${12 * s} 0 q ${-6 * s} ${8 * s} ${-12 * s} 0`, 'class="bot-line dark-cut"')}`;
  }
  if (pose === 'thinking') {
    return `${rect(x - 26 * s, headY + 21 * s, 15 * s, 12 * s, 'rx="3" class="bot-eye"')}${line(x + 8 * s, headY + 28 * s, x + 25 * s, headY + 28 * s, 'class="bot-line"')}<text x="${x + 34 * s}" y="${headY + 12 * s}" class="accent-text dim" style="font-size:${21 * s}px">...</text>`;
  }
  if (pose === 'confident' || pose === 'helpful' || pose === 'celebratory') {
    return `${pathD(`M ${x - 26 * s} ${headY + 31 * s} q ${8 * s} ${-13 * s} ${18 * s} 0`, 'class="bot-line hot"')}${pathD(`M ${x + 8 * s} ${headY + 31 * s} q ${8 * s} ${-13 * s} ${18 * s} 0`, 'class="bot-line hot"')}`;
  }
  if (pose === 'watching') {
    return `${rect(x - 25 * s, headY + 20 * s, 14 * s, 12 * s, 'rx="3" class="bot-eye"')}${rect(x + 11 * s, headY + 20 * s, 14 * s, 12 * s, 'rx="3" class="bot-eye"')}${pathD(`M ${x - 43 * s} ${headY + 12 * s} h ${-9 * s} v ${9 * s} M ${x + 43 * s} ${headY + 12 * s} h ${9 * s} v ${9 * s}`, 'class="fx-line dim"')}`;
  }
  return `${rect(x - 25 * s, headY + 20 * s, 15 * s, 13 * s, 'rx="3" class="bot-eye"')}${rect(x + 10 * s, headY + 20 * s, 15 * s, 13 * s, 'rx="3" class="bot-eye"')}`;
}

function renderRobotArms(pose, x, torsoY, s) {
  const shoulderY = torsoY + 24 * s;
  if (pose === 'helpful') {
    return `${line(x - 36 * s, shoulderY, x - 72 * s, shoulderY - 42 * s, 'class="bot-line bot-segmented"')}${line(x + 36 * s, shoulderY, x + 70 * s, shoulderY + 4 * s, 'class="bot-line bot-segmented"')}${renderClaw(x - 78 * s, shoulderY - 47 * s, s)}${renderClaw(x + 76 * s, shoulderY + 7 * s, s)}${renderSparkle(x - 93 * s, shoulderY - 47 * s, 0.45 * s)}`;
  }
  if (pose === 'celebratory') {
    return `${line(x - 36 * s, shoulderY, x - 72 * s, shoulderY - 48 * s, 'class="bot-line bot-segmented"')}${line(x + 36 * s, shoulderY, x + 72 * s, shoulderY - 48 * s, 'class="bot-line bot-segmented"')}${renderClaw(x - 78 * s, shoulderY - 53 * s, s)}${renderClaw(x + 78 * s, shoulderY - 53 * s, s)}${renderSparkle(x - 92 * s, shoulderY - 60 * s, 0.45 * s)}${renderSparkle(x + 92 * s, shoulderY - 60 * s, 0.45 * s)}`;
  }
  if (pose === 'thinking') {
    return `${line(x - 36 * s, shoulderY, x - 66 * s, shoulderY + 20 * s, 'class="bot-line bot-segmented"')}${line(x + 36 * s, shoulderY, x + 48 * s, torsoY - 8 * s, 'class="bot-line bot-segmented"')}${renderClaw(x - 71 * s, shoulderY + 25 * s, s)}${renderClaw(x + 50 * s, torsoY - 12 * s, s)}`;
  }
  if (pose === 'concerned' || pose === 'watching' || pose === 'sleeping') {
    return `${line(x - 36 * s, shoulderY, x - 62 * s, shoulderY + 28 * s, 'class="bot-line bot-segmented"')}${line(x + 36 * s, shoulderY, x + 62 * s, shoulderY + 28 * s, 'class="bot-line bot-segmented"')}${renderClaw(x - 67 * s, shoulderY + 32 * s, s)}${renderClaw(x + 67 * s, shoulderY + 32 * s, s)}`;
  }
  if (pose === 'overclocked' || pose === 'error') {
    return `${line(x - 36 * s, shoulderY, x - 72 * s, shoulderY - 2 * s, 'class="bot-line bot-segmented"')}${line(x + 36 * s, shoulderY, x + 72 * s, shoulderY - 2 * s, 'class="bot-line bot-segmented"')}${renderClaw(x - 78 * s, shoulderY - 4 * s, s)}${renderClaw(x + 78 * s, shoulderY - 4 * s, s)}`;
  }
  return `${line(x - 36 * s, shoulderY, x - 70 * s, shoulderY + 6 * s, 'class="bot-line bot-segmented"')}${line(x + 36 * s, shoulderY, x + 70 * s, shoulderY + 6 * s, 'class="bot-line bot-segmented"')}${renderClaw(x - 76 * s, shoulderY + 9 * s, s)}${renderClaw(x + 76 * s, shoulderY + 9 * s, s)}`;
}

function renderClaw(x, y, s) {
  return `<path d="M ${x} ${y} q ${-10 * s} ${-4 * s} ${-13 * s} ${-15 * s} M ${x} ${y} q ${10 * s} ${-4 * s} ${13 * s} ${-15 * s}" class="bot-line" />`;
}

function renderTokenCounter(panel, box) {
  if (!panel.tokenCounter) return '';
  const text = panel.tokenCounter.toUpperCase();
  const w = Math.min(260, Math.max(220, text.length * 11 + 82));
  const x = box.x + box.w - w - 20;
  const y = box.y + 84;
  const bars = Array.from({ length: 10 }, (_, i) => {
    const filled = i < 7;
    return rect(x + 72 + i * 13, y + 44, 10, 11, `class="meter-segment ${filled ? 'filled' : ''}"`);
  }).join('');
  return `<g class="token-counter">
    ${rect(x, y, w, 62, 'rx="8" class="meter-bg"')}
    ${rect(x + 15, y + 18, 38, 30, 'rx="5" class="bot-fill bot-line tiny-bot"')}
    ${circle(x + 34, y + 11, 3, 'class="bot-eye"')}
    ${line(x + 34, y + 18, x + 34, y + 11, 'class="bot-line"')}
    ${rect(x + 24, y + 29, 5, 8, 'class="bot-eye"')}${rect(x + 39, y + 29, 5, 8, 'class="bot-eye"')}
    <text x="${x + 72}" y="${y + 20}" class="meter-label">TOKENS</text>
    <text x="${x + 72}" y="${y + 37}" class="meter-text">${escapeHtml(text)}</text>
    ${bars}
  </g>`;
}

function renderTerminalLines(panel, box) {
  const lines = (panel.terminalLines || []).slice(0, 3);
  if (!lines.length) return '';
  const terminalW = Math.min(box.w - 40, Math.max(330, box.w * 0.62));
  const terminalH = 42 + lines.length * 24;
  const x = box.x + 20;
  const y = box.y + box.h - terminalH - 54;
  return `<g class="mini-terminal">
    ${rect(x, y, terminalW, terminalH, 'rx="7" class="mini-terminal-bg"')}
    ${line(x, y + 28, x + terminalW, y + 28, 'class="terminal-line"')}
    <text x="${x + 14}" y="${y + 20}" class="terminal-title">$ terminal</text>
    ${rect(x + terminalW - 54, y + 9, 9, 9, 'class="terminal-button"')}
    ${rect(x + terminalW - 36, y + 9, 9, 9, 'class="terminal-button"')}
    ${rect(x + terminalW - 18, y + 9, 9, 9, 'class="terminal-button"')}
    ${lines.map((lineText, index) => `<text x="${x + 14}" y="${y + 55 + index * 24}" class="mini-terminal-text">${escapeHtml(lineText)}</text>`).join('')}
  </g>`;
}

function renderPanelFx(fxItems, box, devX, botX, groundY) {
  const items = fxItems || [];
  const out = [];

  if (items.includes('small-glow')) {
    out.push(circle(botX, groundY - 130, 76, 'class="glow"'));
    out.push(renderSparkle(botX + 76, groundY - 178, 0.7));
  }
  if (items.includes('screen-glow')) {
    out.push(circle(botX, groundY - 126, 106, 'class="glow strong"'));
    out.push(circle(botX, groundY - 126, 62, 'class="glow core"'));
  }
  if (items.includes('sparks')) {
    out.push(pathD(`M ${botX + 62} ${groundY - 184} l 20 -30 l 8 26 l 26 -24`, 'class="fx-line"'));
    out.push(pathD(`M ${botX - 72} ${groundY - 168} l -24 -18 l 7 27`, 'class="fx-line"'));
    out.push(renderSparkle(botX + 92, groundY - 130, 0.55));
    out.push(renderSparkle(botX - 98, groundY - 206, 0.45));
  }
  if (items.includes('terminal-cursor')) {
    out.push(`<text x="${box.x + box.w - 88}" y="${box.y + box.h - 33}" class="terminal-cursor">█</text>`);
  }
  if (items.includes('smoke')) {
    out.push(circle(devX + 24, groundY - 185, 18, 'class="smoke-puff"'));
    out.push(circle(devX + 50, groundY - 205, 23, 'class="smoke-puff"'));
    out.push(circle(devX + 78, groundY - 184, 18, 'class="smoke-puff"'));
  }
  if (items.includes('sweat')) {
    out.push(pathD(`M ${devX + 52} ${groundY - 164} q 10 16 -4 28 q -15 -12 4 -28`, 'class="fx-fill"'));
    out.push(pathD(`M ${devX - 56} ${groundY - 176} q 8 13 -3 23 q -12 -10 3 -23`, 'class="fx-fill"'));
  }
  if (items.includes('speed-lines')) {
    for (const [i, yOffset] of [178, 138, 98, 58].entries()) {
      out.push(line(box.x + 34, groundY - yOffset, box.x + 130 + i * 22, groundY - yOffset - 10 + i * 5, 'class="fx-line speed"'));
    }
  }
  if (items.includes('boot')) {
    out.push(`<text x="${box.x + 34}" y="${box.y + box.h - 32}" class="boot-text">&gt; booting...</text>`);
    out.push(line(box.x + 34, box.y + box.h - 22, box.x + 160, box.y + box.h - 22, 'class="fx-line dim"'));
  }

  return out.join('\n');
}

function renderPanelChrome(box, index) {
  const label = String(index + 1).padStart(2, '0');
  const scanlines = Array.from({ length: 5 }, (_, i) => {
    const y = box.y + 58 + i * Math.max(34, box.h / 7);
    return line(box.x + 12, y, box.x + box.w - 12, y, 'class="scanline"');
  }).join('');
  return `${scanlines}
    <text x="${box.x + 18}" y="${box.y + 28}" class="panel-heading">${label}.</text>
    ${line(box.x + 58, box.y + 22, box.x + box.w - 18, box.y + 22, 'class="panel-heading-line"')}
    ${pathD(`M ${box.x + 10} ${box.y + 34} v -16 q 0 -8 8 -8 h 16`, 'class="corner-accent"')}
    ${pathD(`M ${box.x + box.w - 10} ${box.y + box.h - 34} v 16 q 0 8 -8 8 h -16`, 'class="corner-accent"')}`;
}

function renderPanel(panel, box, index) {
  const groundY = box.y + box.h - 38;
  const s = Math.max(0.72, Math.min(1.18, Math.min(box.w / 560, box.h / 360)));
  const devX = box.x + box.w * 0.32;
  const botX = box.x + box.w * 0.72;

  return `<g class="panel" aria-label="Panel ${index + 1}">
    ${rect(box.x, box.y, box.w, box.h, 'rx="9" class="panel-bg"')}
    ${renderPanelChrome(box, index)}
    ${line(box.x + 18, groundY, box.x + box.w - 18, groundY, 'class="ground"')}
    ${renderPanelFx(panel.fx, box, devX, botX, groundY)}
    ${renderTerminalLines(panel, box)}
    ${renderDev(panel.devPose, devX, groundY, s)}
    ${renderClanker(panel.clankerPose, botX, groundY, s)}
    ${renderCaptions(panel, box, devX, botX, groundY)}
    ${renderTokenCounter(panel, box)}
    <text x="${box.x + box.w - 22}" y="${box.y + box.h - 16}" text-anchor="end" class="panel-num">// ${index + 1}</text>
  </g>`;
}

function renderSvg(spec) {
  const layout = layoutPanels(spec.layout || 'auto', spec.panels.length);

  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="comic-title" viewBox="0 0 ${layout.width} ${layout.height}" width="100%">
  <title id="comic-title">${escapeHtml(spec.title)}</title>
  <style>
    svg { background: #000; }
    .title { fill: ${GREEN_BRIGHT}; font: 48px 'VT323', 'Courier New', monospace; letter-spacing: 2px; }
    .meta-text { fill: ${GREEN}; font: 22px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .terminal-line, .ground { stroke: ${GREEN_DIM}; stroke-width: 3; }
    .panel-bg { fill: ${PANEL_BG}; stroke: ${GREEN}; stroke-width: 2.5; }
    .panel-heading, .panel-num, .boot-text { fill: ${GREEN}; font: 24px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .panel-heading-line, .scanline { stroke: ${GREEN_DIM}; stroke-width: 1.5; opacity: 0.35; stroke-dasharray: 4 8; }
    .corner-accent { fill: none; stroke: ${GREEN_BRIGHT}; stroke-width: 2.5; stroke-linecap: round; }
    .caption-bg { fill: rgba(0, 0, 0, 0.78); stroke: ${GREEN}; stroke-width: 2; }
    .caption-bg.speech, .caption-tail { filter: drop-shadow(0 0 6px rgba(0, 255, 102, 0.35)); }
    .caption-tail { fill: rgba(0, 0, 0, 0.78); stroke: ${GREEN}; stroke-width: 2; stroke-linejoin: round; }
    .caption { fill: ${GREEN_BRIGHT}; font-family: 'VT323', 'Courier New', monospace; }
    .caption-bold { font-weight: 700; letter-spacing: 1px; }
    .meter-bg, .mini-terminal-bg { fill: rgba(0, 0, 0, 0.86); stroke: ${GREEN}; stroke-width: 2; filter: drop-shadow(0 0 5px rgba(0, 255, 102, 0.2)); }
    .meter-label, .terminal-title { fill: ${GREEN}; font: 16px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .meter-text { fill: ${GREEN_BRIGHT}; font: 19px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .meter-segment { fill: transparent; stroke: ${GREEN_DIM}; stroke-width: 1.5; }
    .meter-segment.filled { fill: ${GREEN_BRIGHT}; stroke: ${GREEN_BRIGHT}; }
    .mini-terminal-text { fill: ${GREEN_BRIGHT}; font: 22px 'VT323', 'Courier New', monospace; }
    .terminal-button { fill: none; stroke: ${GREEN}; stroke-width: 1.5; }
    .dev-line, .dev line, .dev circle, .dev rect { stroke: ${GREEN_BRIGHT}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .dev-fill, .dev-glass { fill: ${BLACK}; }
    .dev-eye, .dev-symbol { fill: ${GREEN_BRIGHT}; stroke: ${GREEN_BRIGHT}; }
    .dev-eye.hollow { fill: ${BLACK}; }
    .dev-hand { fill: ${BLACK}; stroke: ${GREEN_BRIGHT}; }
    .dev-mouth-open { fill: ${BLACK}; }
    .dim, .dev-line.dim { opacity: 0.62; }
    .bot-line, .clanker line, .clanker path, .clanker rect, .clanker circle, .tiny-bot { stroke: ${GREEN}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .bot-fill { fill: ${BLACK}; }
    .bot-eye { fill: ${GREEN_BRIGHT}; stroke: ${GREEN_BRIGHT}; }
    .bot-eye.hot, .hot { filter: drop-shadow(0 0 8px ${GREEN_BRIGHT}); }
    .clanker .hot { stroke: ${GREEN_BRIGHT}; }
    .clanker .dark-cut { stroke: ${BLACK}; stroke-width: 3; }
    .bot-segmented { stroke-dasharray: 5 7; }
    .prop .prop-line, .dev .prop-line, .prop-line { fill: none; stroke: ${GREEN}; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .prop-fill, .screen-fill { fill: ${BLACK}; }
    .screen-fill { filter: drop-shadow(0 0 5px rgba(0, 255, 102, 0.28)); }
    .prop-code { fill: ${GREEN_BRIGHT}; font-family: 'VT323', 'Courier New', monospace; font-weight: 700; }
    .callout-mini, .clanker .callout-mini { fill: rgba(0, 0, 0, 0.84); stroke: ${GREEN}; stroke-width: 2; }
    .callout-text { fill: ${GREEN_BRIGHT}; font-family: 'VT323', 'Courier New', monospace; }
    .accent-text, .dev-symbol { fill: ${GREEN_BRIGHT}; font-family: 'VT323', 'Courier New', monospace; }
    .accent-text.dim { fill: ${GREEN}; opacity: 0.72; }
    .fx-line { fill: none; stroke: ${GREEN_BRIGHT}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .fx-line.dim { stroke: ${GREEN_DIM}; }
    .fx-line.speed { stroke: ${GREEN}; opacity: 0.72; }
    .fx-fill { fill: ${GREEN_BRIGHT}; stroke: ${GREEN_BRIGHT}; }
    .smoke-puff { fill: ${BLACK}; stroke: ${GREEN_DIM}; stroke-width: 3; opacity: 0.78; }
    .glow { fill: ${GREEN}; opacity: 0.08; filter: drop-shadow(0 0 12px ${GREEN}); }
    .glow.strong { opacity: 0.12; }
    .glow.core { opacity: 0.18; }
    .terminal-fill { fill: ${BLACK}; }
    .terminal-cursor { fill: ${GREEN_BRIGHT}; font: 38px 'VT323', 'Courier New', monospace; filter: drop-shadow(0 0 6px ${GREEN_BRIGHT}); }
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
