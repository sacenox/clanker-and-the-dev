---
layout: post
title: The Cycle of AI Coding Burnout
---

<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="comic-title" viewBox="0 0 1200 1011" width="100%">
  <title id="comic-title">The Cycle of AI Coding Burnout</title>
  <style>
    svg { background: #000; }
    .title { fill: #7cff8a; font: 48px 'VT323', 'Courier New', monospace; letter-spacing: 2px; }
    .meta-text { fill: #00ff66; font: 22px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .terminal-line, .ground { stroke: #128a3a; stroke-width: 3; }
    .panel-bg { fill: #020806; stroke: #00ff66; stroke-width: 2.5; }
    .panel-heading, .panel-num, .boot-text { fill: #00ff66; font: 24px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .panel-heading-line, .scanline { stroke: #128a3a; stroke-width: 1.5; opacity: 0.35; stroke-dasharray: 4 8; }
    .corner-accent { fill: none; stroke: #7cff8a; stroke-width: 2.5; stroke-linecap: round; }
    .caption-bg { fill: rgba(0, 0, 0, 0.78); stroke: #00ff66; stroke-width: 2; }
    .caption-bg.speech, .caption-tail { filter: drop-shadow(0 0 6px rgba(0, 255, 102, 0.35)); }
    .caption-tail { fill: rgba(0, 0, 0, 0.78); stroke: #00ff66; stroke-width: 2; stroke-linejoin: round; }
    .caption { fill: #7cff8a; font-family: 'VT323', 'Courier New', monospace; }
    .caption-bold { font-weight: 700; letter-spacing: 1px; }
    .meter-bg, .mini-terminal-bg { fill: rgba(0, 0, 0, 0.86); stroke: #00ff66; stroke-width: 2; filter: drop-shadow(0 0 5px rgba(0, 255, 102, 0.2)); }
    .meter-label, .terminal-title { fill: #00ff66; font: 16px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .meter-text { fill: #7cff8a; font: 19px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .meter-segment { fill: transparent; stroke: #128a3a; stroke-width: 1.5; }
    .meter-segment.filled { fill: #7cff8a; stroke: #7cff8a; }
    .mini-terminal-text { fill: #7cff8a; font: 22px 'VT323', 'Courier New', monospace; }
    .terminal-button { fill: none; stroke: #00ff66; stroke-width: 1.5; }
    .dev-line, .dev line, .dev circle, .dev rect { stroke: #7cff8a; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .dev-fill, .dev-glass { fill: #020617; }
    .dev-eye, .dev-symbol { fill: #7cff8a; stroke: #7cff8a; }
    .dev-eye.hollow { fill: #020617; }
    .dev-hand { fill: #020617; stroke: #7cff8a; }
    .dev-mouth-open { fill: #020617; }
    .dim, .dev-line.dim { opacity: 0.62; }
    .bot-line, .clanker line, .clanker path, .clanker rect, .clanker circle, .tiny-bot { stroke: #00ff66; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .bot-fill { fill: #020617; }
    .bot-eye { fill: #7cff8a; stroke: #7cff8a; }
    .bot-eye.hot, .hot { filter: drop-shadow(0 0 8px #7cff8a); }
    .clanker .hot { stroke: #7cff8a; }
    .clanker .dark-cut { stroke: #020617; stroke-width: 3; }
    .bot-segmented { stroke-dasharray: 5 7; }
    .prop .prop-line, .dev .prop-line, .prop-line { fill: none; stroke: #00ff66; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .prop-fill, .screen-fill { fill: #020617; }
    .screen-fill { filter: drop-shadow(0 0 5px rgba(0, 255, 102, 0.28)); }
    .prop-code { fill: #7cff8a; font-family: 'VT323', 'Courier New', monospace; font-weight: 700; }
    .callout-mini, .clanker .callout-mini { fill: rgba(0, 0, 0, 0.84); stroke: #00ff66; stroke-width: 2; }
    .callout-text { fill: #7cff8a; font-family: 'VT323', 'Courier New', monospace; }
    .accent-text, .dev-symbol { fill: #7cff8a; font-family: 'VT323', 'Courier New', monospace; }
    .accent-text.dim { fill: #00ff66; opacity: 0.72; }
    .fx-line { fill: none; stroke: #7cff8a; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .fx-line.dim { stroke: #128a3a; }
    .fx-line.speed { stroke: #00ff66; opacity: 0.72; }
    .fx-fill { fill: #7cff8a; stroke: #7cff8a; }
    .smoke-puff { fill: #020617; stroke: #128a3a; stroke-width: 3; opacity: 0.78; }
    .glow { fill: #00ff66; opacity: 0.08; filter: drop-shadow(0 0 12px #00ff66); }
    .glow.strong { opacity: 0.12; }
    .glow.core { opacity: 0.18; }
    .terminal-fill { fill: #020617; }
    .terminal-cursor { fill: #7cff8a; font: 38px 'VT323', 'Courier New', monospace; filter: drop-shadow(0 0 6px #7cff8a); }
  </style>
    <text x="42" y="58" class="title" style="font-size:38px">&gt; THE CYCLE OF AI CODING BURNOUT_</text>
    <line x1="24" y1="78" x2="1176" y2="78" class="terminal-line" />
  <g class="panel" aria-label="Panel 1">
    <rect x="24" y="96" width="567" height="270" rx="9" class="panel-bg" />
    <line x1="36" y1="154" x2="579" y2="154" class="scanline" /><line x1="36" y1="192.57142857142856" x2="579" y2="192.57142857142856" class="scanline" /><line x1="36" y1="231.14285714285714" x2="579" y2="231.14285714285714" class="scanline" /><line x1="36" y1="269.7142857142857" x2="579" y2="269.7142857142857" class="scanline" /><line x1="36" y1="308.2857142857143" x2="579" y2="308.2857142857143" class="scanline" />
    <text x="42" y="124" class="panel-heading">01.</text>
    <line x1="82" y1="118" x2="573" y2="118" class="panel-heading-line" />
    <path d="M 34 130 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 581 332 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="42" y1="328" x2="573" y2="328" class="ground" />
    <circle cx="432.24" cy="198" r="76" class="glow" />
<path d="M 508.24 138.8 L 511.74 146.5 L 519.44 150 L 511.74 153.5 L 508.24 161.2 L 504.74 153.5 L 497.04 150 L 504.74 146.5 Z" class="fx-line" />
    <g class="dev" >
    <circle cx="205.44" cy="230.5" r="18.75" class="dev-fill dev-line" />
    <line x1="186.69" y1="231.25" x2="224.19" y2="231.25" class="dev-line dim" />
    <rect x="188.94" y="226" width="13.5" height="9" rx="1" class="dev-glass dev-line" />
    <rect x="207.69" y="226" width="13.5" height="9" rx="1" class="dev-glass dev-line" />
    <line x1="202.44" y1="230.5" x2="208.44" y2="230.5" class="dev-line" />
    <circle cx="195.69" cy="230.5" r="1.875" class="dev-eye" /><circle cx="215.19" cy="230.5" r="1.875" class="dev-eye" /><path d="M 191.19 221.5 q 6 -4.5 12 0" class="dev-line" /><line x1="210.69" y1="221.5" x2="221.94" y2="223" class="dev-line" /><path d="M 202.44 241 q 6 3.75 11.25 0" class="dev-line" /><text x="230.94" y="212.5" class="accent-text" style="font-size:25.5px">?</text>
    <path d="M 205.44 250 C 200.19 263.5 210.69 275.5 205.44 290.5" class="dev-line" />
    <line x1="197.94" y1="262" x2="175.44" y2="280" class="dev-line" /><line x1="197.94" y1="262" x2="233.94" y2="257.5" class="dev-line" /><circle cx="175.44" cy="280" r="3" class="dev-hand" /><circle cx="233.94" cy="257.5" r="3" class="dev-hand" />
    <line x1="205.44" y1="290.5" x2="186.69" y2="328" class="dev-line" />
    <line x1="205.44" y1="290.5" x2="225.69" y2="328" class="dev-line" />
    <path d="M 179.19 328.75 q 7.5 3.75 18 0" class="dev-line dim" />
    <path d="M 217.44 328.75 q 7.5 3.75 18 0" class="dev-line dim" />
  </g>
    <g class="clanker" transform="rotate(0 432.24 269.5)">
    <line x1="432.24" y1="212.5" x2="432.24" y2="191.5" class="bot-line" />
    <circle cx="432.24" cy="187" r="4.125" class="bot-eye bot-line" />
    <rect x="393.99" y="224.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="462.24" y="224.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="401.49" y="212.5" width="61.5" height="43.5" rx="10" class="bot-fill bot-line" />
    <path d="M 412.74 235.75 q 6 -9.75 13.5 0" class="bot-line hot" /><path d="M 438.24 235.75 q 6 -9.75 13.5 0" class="bot-line hot" />
    <line x1="418.74" y1="256" x2="418.74" y2="260.5" class="bot-line" />
    <line x1="445.74" y1="256" x2="445.74" y2="260.5" class="bot-line" />
    <rect x="405.24" y="260.5" width="54" height="45" rx="7" class="bot-fill bot-line" />
    <rect x="419.49" y="275.5" width="25.5" height="15" rx="2" class="bot-fill bot-line" />
    <line x1="424.74" y1="280.75" x2="439.74" y2="280.75" class="bot-line" />
    <line x1="424.74" y1="286" x2="437.49" y2="286" class="bot-line" />
    <line x1="405.24" y1="278.5" x2="378.24" y2="247" class="bot-line bot-segmented" /><line x1="459.24" y1="278.5" x2="484.74" y2="281.5" class="bot-line bot-segmented" /><path d="M 373.74 243.25 q -7.5 -3 -9.75 -11.25 M 373.74 243.25 q 7.5 -3 9.75 -11.25" class="bot-line" /><path d="M 489.24 283.75 q -7.5 -3 -9.75 -11.25 M 489.24 283.75 q 7.5 -3 9.75 -11.25" class="bot-line" /><path d="M 362.49 237.85 L 364.1775 241.5625 L 367.89 243.25 L 364.1775 244.9375 L 362.49 248.65 L 360.8025 244.9375 L 357.09000000000003 243.25 L 360.8025 241.5625 Z" class="fx-line" />
    <line x1="415.74" y1="305.5" x2="409.74" y2="322" class="bot-line bot-segmented" />
    <line x1="448.74" y1="305.5" x2="454.74" y2="322" class="bot-line bot-segmented" />
    <rect x="400.74" y="322" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <rect x="444.99" y="322" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <path d="M 390.99 331 q 41.25 9 82.5 0" class="bot-line dim" />
  </g>
    <path d="M 185.44 199 Q 205.44 223 205.44 227 Q 219.44 219 225.44 199 Z" class="caption-tail" />
    <rect x="41.01000000000002" y="142" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="57.01000000000002" y="178" class="caption " style="font-size:32px">
      <tspan x="57.01000000000002" dy="0">wow</tspan>
    </text>
    <text x="569" y="350" text-anchor="end" class="panel-num">// 1</text>
  </g>
<g class="panel" aria-label="Panel 2">
    <rect x="609" y="96" width="567" height="270" rx="9" class="panel-bg" />
    <line x1="621" y1="154" x2="1164" y2="154" class="scanline" /><line x1="621" y1="192.57142857142856" x2="1164" y2="192.57142857142856" class="scanline" /><line x1="621" y1="231.14285714285714" x2="1164" y2="231.14285714285714" class="scanline" /><line x1="621" y1="269.7142857142857" x2="1164" y2="269.7142857142857" class="scanline" /><line x1="621" y1="308.2857142857143" x2="1164" y2="308.2857142857143" class="scanline" />
    <text x="627" y="124" class="panel-heading">02.</text>
    <line x1="667" y1="118" x2="1158" y2="118" class="panel-heading-line" />
    <path d="M 619 130 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 1166 332 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="627" y1="328" x2="1158" y2="328" class="ground" />
    <circle cx="1017.24" cy="202" r="106" class="glow strong" />
<circle cx="1017.24" cy="202" r="62" class="glow core" />
    <g class="dev" >
    <circle cx="790.44" cy="230.5" r="18.75" class="dev-fill dev-line" />
    <line x1="771.69" y1="231.25" x2="809.19" y2="231.25" class="dev-line dim" />
    <rect x="773.94" y="226" width="13.5" height="9" rx="1" class="dev-glass dev-line" />
    <rect x="792.69" y="226" width="13.5" height="9" rx="1" class="dev-glass dev-line" />
    <line x1="787.44" y1="230.5" x2="793.44" y2="230.5" class="dev-line" />
    <text x="779.94" y="235" text-anchor="middle" class="dev-symbol" style="font-size:13.5px">★</text><text x="800.94" y="235" text-anchor="middle" class="dev-symbol" style="font-size:13.5px">★</text><circle cx="790.44" cy="241.75" r="5.25" class="dev-mouth-open dev-line" /><path d="M 758.94 217.9 L 761.0025 222.4375 L 765.5400000000001 224.5 L 761.0025 226.5625 L 758.94 231.1 L 756.8775 226.5625 L 752.34 224.5 L 756.8775 222.4375 Z" class="fx-line" /><path d="M 821.94 217.9 L 824.0025 222.4375 L 828.5400000000001 224.5 L 824.0025 226.5625 L 821.94 231.1 L 819.8775 226.5625 L 815.34 224.5 L 819.8775 222.4375 Z" class="fx-line" />
    <path d="M 790.44 250 C 785.19 263.5 795.69 275.5 790.44 290.5" class="dev-line" />
    <line x1="790.44" y1="262" x2="754.44" y2="229" class="dev-line" /><line x1="790.44" y1="262" x2="826.44" y2="229" class="dev-line" /><circle cx="754.44" cy="229" r="3" class="dev-hand" /><circle cx="826.44" cy="229" r="3" class="dev-hand" />
    <line x1="790.44" y1="290.5" x2="771.69" y2="328" class="dev-line" />
    <line x1="790.44" y1="290.5" x2="810.69" y2="328" class="dev-line" />
    <path d="M 764.19 328.75 q 7.5 3.75 18 0" class="dev-line dim" />
    <path d="M 802.44 328.75 q 7.5 3.75 18 0" class="dev-line dim" />
  </g>
    <g class="clanker" transform="rotate(0 1017.24 269.5)">
    <line x1="1017.24" y1="212.5" x2="1017.24" y2="191.5" class="bot-line" />
    <circle cx="1017.24" cy="187" r="4.125" class="bot-eye bot-line" />
    <rect x="978.99" y="224.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="1047.24" y="224.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="986.49" y="212.5" width="61.5" height="43.5" rx="10" class="bot-fill bot-line" />
    <path d="M 997.74 235.75 q 6 -9.75 13.5 0" class="bot-line hot" /><path d="M 1023.24 235.75 q 6 -9.75 13.5 0" class="bot-line hot" />
    <line x1="1003.74" y1="256" x2="1003.74" y2="260.5" class="bot-line" />
    <line x1="1030.74" y1="256" x2="1030.74" y2="260.5" class="bot-line" />
    <rect x="990.24" y="260.5" width="54" height="45" rx="7" class="bot-fill bot-line" />
    <rect x="1004.49" y="275.5" width="25.5" height="15" rx="2" class="bot-fill bot-line" />
    <line x1="1009.74" y1="280.75" x2="1024.74" y2="280.75" class="bot-line" />
    <line x1="1009.74" y1="286" x2="1022.49" y2="286" class="bot-line" />
    <line x1="990.24" y1="278.5" x2="964.74" y2="283" class="bot-line bot-segmented" /><line x1="1044.24" y1="278.5" x2="1069.74" y2="283" class="bot-line bot-segmented" /><path d="M 960.24 285.25 q -7.5 -3 -9.75 -11.25 M 960.24 285.25 q 7.5 -3 9.75 -11.25" class="bot-line" /><path d="M 1074.24 285.25 q -7.5 -3 -9.75 -11.25 M 1074.24 285.25 q 7.5 -3 9.75 -11.25" class="bot-line" />
    <line x1="1000.74" y1="305.5" x2="994.74" y2="322" class="bot-line bot-segmented" />
    <line x1="1033.74" y1="305.5" x2="1039.74" y2="322" class="bot-line bot-segmented" />
    <rect x="985.74" y="322" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <rect x="1029.99" y="322" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <path d="M 975.99 331 q 41.25 9 82.5 0" class="bot-line dim" />
  </g>
    <path d="M 770.44 199 Q 790.44 223 790.44 227 Q 804.44 219 810.44 199 Z" class="caption-tail" />
    <rect x="626.0100000000001" y="142" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="642.0100000000001" y="178" class="caption " style="font-size:32px">
      <tspan x="642.0100000000001" dy="0">WOW</tspan>
    </text>
    <text x="1154" y="350" text-anchor="end" class="panel-num">// 2</text>
  </g>
<g class="panel" aria-label="Panel 3">
    <rect x="24" y="384" width="567" height="270" rx="9" class="panel-bg" />
    <line x1="36" y1="442" x2="579" y2="442" class="scanline" /><line x1="36" y1="480.57142857142856" x2="579" y2="480.57142857142856" class="scanline" /><line x1="36" y1="519.1428571428571" x2="579" y2="519.1428571428571" class="scanline" /><line x1="36" y1="557.7142857142857" x2="579" y2="557.7142857142857" class="scanline" /><line x1="36" y1="596.2857142857142" x2="579" y2="596.2857142857142" class="scanline" />
    <text x="42" y="412" class="panel-heading">03.</text>
    <line x1="82" y1="406" x2="573" y2="406" class="panel-heading-line" />
    <path d="M 34 418 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 581 620 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="42" y1="616" x2="573" y2="616" class="ground" />
    <path d="M 494.24 432 l 20 -30 l 8 26 l 26 -24" class="fx-line" />
<path d="M 360.24 448 l -24 -18 l 7 27" class="fx-line" />
<path d="M 524.24 477.2 L 526.99 483.25 L 533.04 486 L 526.99 488.75 L 524.24 494.8 L 521.49 488.75 L 515.44 486 L 521.49 483.25 Z" class="fx-line" />
<path d="M 334.24 402.8 L 336.49 407.75 L 341.44 410 L 336.49 412.25 L 334.24 417.2 L 331.99 412.25 L 327.04 410 L 331.99 407.75 Z" class="fx-line" />
<path d="M 257.44 452 q 10 16 -4 28 q -15 -12 4 -28" class="fx-fill" />
<path d="M 149.44 440 q 8 13 -3 23 q -12 -10 3 -23" class="fx-fill" />
    <g class="dev" >
    <circle cx="205.44" cy="518.5" r="18.75" class="dev-fill dev-line" />
    <line x1="186.69" y1="519.25" x2="224.19" y2="519.25" class="dev-line dim" />
    <rect x="188.94" y="514" width="13.5" height="9" rx="1" class="dev-glass dev-line" />
    <rect x="207.69" y="514" width="13.5" height="9" rx="1" class="dev-glass dev-line" />
    <line x1="202.44" y1="518.5" x2="208.44" y2="518.5" class="dev-line" />
    <circle cx="195.69" cy="518.5" r="1.875" class="dev-eye" /><circle cx="215.19" cy="518.5" r="1.875" class="dev-eye" /><line x1="191.19" y1="507.25" x2="199.44" y2="511.75" class="dev-line" /><line x1="211.44" y1="511.75" x2="219.69" y2="507.25" class="dev-line" /><rect x="199.44" y="526" width="12" height="9.75" rx="4" class="dev-mouth-open dev-line" /><text x="232.44" y="508" class="accent-text" style="font-size:25.5px">!</text>
    <path d="M 205.44 538 C 200.19 551.5 210.69 563.5 205.44 578.5" class="dev-line" />
    <line x1="205.44" y1="550" x2="169.44" y2="517" class="dev-line" /><line x1="205.44" y1="550" x2="241.44" y2="517" class="dev-line" /><circle cx="169.44" cy="517" r="3" class="dev-hand" /><circle cx="241.44" cy="517" r="3" class="dev-hand" />
    <line x1="205.44" y1="578.5" x2="186.69" y2="616" class="dev-line" />
    <line x1="205.44" y1="578.5" x2="225.69" y2="616" class="dev-line" />
    <path d="M 179.19 616.75 q 7.5 3.75 18 0" class="dev-line dim" />
    <path d="M 217.44 616.75 q 7.5 3.75 18 0" class="dev-line dim" />
      <rect x="140.94" y="538" width="31.5" height="21" rx="3" class="prop-fill prop-line dim" />
      <line x1="146.94" y1="546.25" x2="164.94" y2="546.25" class="prop-line dim" />
      <rect x="241.44" y="544.75" width="36" height="24" rx="3" class="prop-fill prop-line dim" />
      <line x1="248.19" y1="553.75" x2="268.44" y2="553.75" class="prop-line dim" />
  </g>
    <g class="clanker" transform="rotate(0 432.24 557.5)">
    <line x1="432.24" y1="500.5" x2="432.24" y2="479.5" class="bot-line" />
    <circle cx="432.24" cy="475" r="4.125" class="bot-eye bot-line" />
    <rect x="393.99" y="512.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="462.24" y="512.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="401.49" y="500.5" width="61.5" height="43.5" rx="10" class="bot-fill bot-line" />
    <circle cx="419.49" cy="520.75" r="7.5" class="bot-eye hot" /><circle cx="444.99" cy="520.75" r="7.5" class="bot-eye hot" /><path d="M 415.74 520.75 q 4.5 -6 9 0 q -4.5 6 -9 0" class="bot-line dark-cut" /><path d="M 441.24 520.75 q 4.5 -6 9 0 q -4.5 6 -9 0" class="bot-line dark-cut" />
    <line x1="418.74" y1="544" x2="418.74" y2="548.5" class="bot-line" />
    <line x1="445.74" y1="544" x2="445.74" y2="548.5" class="bot-line" />
    <rect x="405.24" y="548.5" width="54" height="45" rx="7" class="bot-fill bot-line" />
    <rect x="419.49" y="563.5" width="25.5" height="15" rx="2" class="bot-fill bot-line" />
    <line x1="424.74" y1="568.75" x2="439.74" y2="568.75" class="bot-line" />
    <line x1="424.74" y1="574" x2="437.49" y2="574" class="bot-line" />
    <line x1="405.24" y1="566.5" x2="378.24" y2="565" class="bot-line bot-segmented" /><line x1="459.24" y1="566.5" x2="486.24" y2="565" class="bot-line bot-segmented" /><path d="M 373.74 563.5 q -7.5 -3 -9.75 -11.25 M 373.74 563.5 q 7.5 -3 9.75 -11.25" class="bot-line" /><path d="M 490.74 563.5 q -7.5 -3 -9.75 -11.25 M 490.74 563.5 q 7.5 -3 9.75 -11.25" class="bot-line" />
    <line x1="415.74" y1="593.5" x2="409.74" y2="610" class="bot-line bot-segmented" />
    <line x1="448.74" y1="593.5" x2="454.74" y2="610" class="bot-line bot-segmented" />
    <rect x="400.74" y="610" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <rect x="444.99" y="610" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <path d="M 390.99 619 q 41.25 9 82.5 0" class="bot-line dim" />
    <path d="M 388.74 487 l 13.5 -18.75 l 6 18 l 15 -22.5" class="fx-line" />
    <path d="M 472.74 491.5 l 18.75 -15 l -1.5 22.5" class="fx-line" />
    <circle cx="432.24" cy="574" r="11.25" class="bot-eye hot" />
  </g>
    <path d="M 185.44 487 Q 205.44 511 205.44 515 Q 219.44 507 225.44 487 Z" class="caption-tail" />
    <rect x="41.01000000000002" y="430" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="57.01000000000002" y="466" class="caption " style="font-size:32px">
      <tspan x="57.01000000000002" dy="0">HOLY SHIT!</tspan>
    </text>
    <text x="569" y="638" text-anchor="end" class="panel-num">// 3</text>
  </g>
<g class="panel" aria-label="Panel 4">
    <rect x="609" y="384" width="567" height="270" rx="9" class="panel-bg" />
    <line x1="621" y1="442" x2="1164" y2="442" class="scanline" /><line x1="621" y1="480.57142857142856" x2="1164" y2="480.57142857142856" class="scanline" /><line x1="621" y1="519.1428571428571" x2="1164" y2="519.1428571428571" class="scanline" /><line x1="621" y1="557.7142857142857" x2="1164" y2="557.7142857142857" class="scanline" /><line x1="621" y1="596.2857142857142" x2="1164" y2="596.2857142857142" class="scanline" />
    <text x="627" y="412" class="panel-heading">04.</text>
    <line x1="667" y1="406" x2="1158" y2="406" class="panel-heading-line" />
    <path d="M 619 418 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 1166 620 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="627" y1="616" x2="1158" y2="616" class="ground" />
    <circle cx="814.44" cy="431" r="18" class="smoke-puff" />
<circle cx="840.44" cy="411" r="23" class="smoke-puff" />
<circle cx="868.44" cy="432" r="18" class="smoke-puff" />
    <g class="dev collapsed-dev">
    <g class="ghost-dev"><path d="M 784.44 551.5 q 10.5 -22.5 25.5 0 v 33 q -9 -6 -16.5 0 q -7.5 -6 -16.5 0 Z" class="dev-line dev-fill" /><line x1="794.94" y1="562" x2="800.94" y2="568" class="dev-line" /><line x1="800.94" y1="562" x2="794.94" y2="568" class="dev-line" /></g>
    <circle cx="761.94" cy="595" r="16.5" class="dev-fill dev-line" />
    <line x1="749.19" y1="592" x2="756.69" y2="599.5" class="dev-line" />
    <line x1="756.69" y1="592" x2="749.19" y2="599.5" class="dev-line" />
    <line x1="767.19" y1="592" x2="774.69" y2="599.5" class="dev-line" />
    <line x1="774.69" y1="592" x2="767.19" y2="599.5" class="dev-line" />
    <line x1="779.19" y1="601" x2="854.94" y2="602.5" class="dev-line" />
    <line x1="800.94" y1="601" x2="791.94" y2="578.5" class="dev-line" />
    <line x1="818.94" y1="601.75" x2="811.44" y2="623.5" class="dev-line" />
    <line x1="851.94" y1="602.5" x2="884.94" y2="590.5" class="dev-line" />
    <line x1="853.44" y1="602.5" x2="883.44" y2="613" class="dev-line" />
    <g class="prop coffee">
    <rect x="878.94" y="602.5" width="19.529999999999998" height="16.74" rx="7" class="prop-fill prop-line" />
    <path d="M 898.47 607.15 q 9.299999999999999 0.9299999999999999 4.185 10.229999999999999 q -3.255 3.7199999999999998 -6.51 0.9299999999999999" class="prop-line" />
    <path d="M 884.5200000000001 598.78 q -3.7199999999999998 -6.51 2.3249999999999997 -11.625" class="fx-line dim" />
    <path d="M 889.6350000000001 598.78 q -3.7199999999999998 -6.51 2.3249999999999997 -11.625" class="fx-line dim" />
    <text x="883.59" y="614.125" class="prop-code" style="font-size:10.229999999999999px">&lt;/&gt;</text>
  </g>
    <path d="M 788.94 565 q -6 -7.5 3.75 -15" class="fx-line dim" />
  </g>
    <g class="clanker" transform="rotate(8 1017.24 557.5)">
    <line x1="1017.24" y1="500.5" x2="1017.24" y2="479.5" class="bot-line" />
    <circle cx="1017.24" cy="475" r="4.125" class="bot-eye bot-line" />
    <rect x="978.99" y="512.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="1047.24" y="512.5" width="8.25" height="21" rx="3" class="bot-fill bot-line" />
    <rect x="986.49" y="500.5" width="61.5" height="43.5" rx="10" class="bot-fill bot-line" />
    <path d="M 998.49 518.5 q 6 7.5 12.75 0" class="bot-line" /><path d="M 1023.24 518.5 q 6 7.5 12.75 0" class="bot-line" />
    <line x1="1003.74" y1="544" x2="1003.74" y2="548.5" class="bot-line" />
    <line x1="1030.74" y1="544" x2="1030.74" y2="548.5" class="bot-line" />
    <rect x="990.24" y="548.5" width="54" height="45" rx="7" class="bot-fill bot-line" />
    <rect x="1004.49" y="563.5" width="25.5" height="15" rx="2" class="bot-fill bot-line" />
    <line x1="1009.74" y1="568.75" x2="1024.74" y2="568.75" class="bot-line" />
    <line x1="1009.74" y1="574" x2="1022.49" y2="574" class="bot-line" />
    <line x1="990.24" y1="566.5" x2="970.74" y2="587.5" class="bot-line bot-segmented" /><line x1="1044.24" y1="566.5" x2="1063.74" y2="587.5" class="bot-line bot-segmented" /><path d="M 966.99 590.5 q -7.5 -3 -9.75 -11.25 M 966.99 590.5 q 7.5 -3 9.75 -11.25" class="bot-line" /><path d="M 1067.49 590.5 q -7.5 -3 -9.75 -11.25 M 1067.49 590.5 q 7.5 -3 9.75 -11.25" class="bot-line" />
    <line x1="1000.74" y1="593.5" x2="994.74" y2="610" class="bot-line bot-segmented" />
    <line x1="1033.74" y1="593.5" x2="1039.74" y2="610" class="bot-line bot-segmented" />
    <rect x="985.74" y="610" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <rect x="1029.99" y="610" width="18.75" height="9" rx="2" class="bot-fill bot-line" />
    <path d="M 975.99 619 q 41.25 9 82.5 0" class="bot-line dim" />
  </g>
    <rect x="621" y="430" width="543" height="59" rx="6" class="caption-bg narrator" />
    <text x="637" y="466" class="caption caption-bold" style="font-size:32px">
      <tspan x="637" dy="0">dead</tspan>
    </text>
    <text x="1154" y="638" text-anchor="end" class="panel-num">// 4</text>
  </g>
<g class="panel" aria-label="Panel 5">
    <rect x="24" y="672" width="1152" height="315" rx="9" class="panel-bg" />
    <line x1="36" y1="730" x2="1164" y2="730" class="scanline" /><line x1="36" y1="775" x2="1164" y2="775" class="scanline" /><line x1="36" y1="820" x2="1164" y2="820" class="scanline" /><line x1="36" y1="865" x2="1164" y2="865" class="scanline" /><line x1="36" y1="910" x2="1164" y2="910" class="scanline" />
    <text x="42" y="700" class="panel-heading">05.</text>
    <line x1="82" y1="694" x2="1158" y2="694" class="panel-heading-line" />
    <path d="M 34 706 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 1166 953 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="42" y1="949" x2="1158" y2="949" class="ground" />
    <text x="1088" y="954" class="terminal-cursor">█</text>
<text x="58" y="955" class="boot-text">&gt; booting...</text>
<line x1="58" y1="965" x2="184" y2="965" class="fx-line dim" />
    <g class="dev typing-dev">
    <path d="M 320.89 872 q -26.25 -42 8.75 -75.25" class="fx-line" />
    <path d="M 453.89 870.25 q 26.25 -42 -8.75 -75.25" class="fx-line" />
    <rect x="308.64" y="905.25" width="183.75" height="7" rx="2" class="prop-fill prop-line" />
    <line x1="324.39" y1="911.375" x2="324.39" y2="949" class="prop-line" />
    <line x1="474.89" y1="911.375" x2="474.89" y2="949" class="prop-line" />
    <path d="M 317.39 933.25 L 289.39 933.25 L 289.39 877.25 q 15.75 -14 38.5 0" class="prop-line dim" />
    <circle cx="366.39" cy="840.5" r="21" class="dev-fill dev-line" />
    <line x1="345.39" y1="841.34" x2="387.39" y2="841.34" class="dev-line dim" />
    <rect x="347.90999999999997" y="835.46" width="15.12" height="10.08" rx="1" class="dev-glass dev-line" />
    <rect x="368.90999999999997" y="835.46" width="15.12" height="10.08" rx="1" class="dev-glass dev-line" />
    <line x1="363.03" y1="840.5" x2="369.75" y2="840.5" class="dev-line" />
    <circle cx="355.46999999999997" cy="840.5" r="4.2" class="dev-eye hollow" /><circle cx="377.31" cy="840.5" r="4.2" class="dev-eye hollow" /><path d="M 356.31 852.26 q 10.08 8.4 20.16 0" class="dev-line" /><path d="M 334.46999999999997 837.14 q -6.72 7.56 0 15.12" class="fx-line dim" /><path d="M 398.31 833.78 q 6.72 7.56 0 15.12" class="fx-line dim" />
    <path d="M 366.39 862.375 q 15.75 17.5 8.75 66.5" class="dev-line" />
    <line x1="376.89" y1="877.25" x2="411.89" y2="902.625" class="dev-line" />
    <line x1="361.14" y1="879" x2="394.39" y2="903.5" class="dev-line" />
    <circle cx="411.89" cy="902.625" r="3.5" class="dev-hand" />
    <circle cx="394.39" cy="903.5" r="3.5" class="dev-hand" />
    <line x1="369.89" y1="901.75" x2="373.39" y2="949" class="dev-line" />
    <line x1="382.14" y1="901.75" x2="431.14" y2="949" class="dev-line" />
    <g class="prop laptop">
    <rect x="408.39" y="852.75" width="66.5" height="40.25" rx="4" class="prop-fill prop-line" />
    <rect x="416.39" y="860.75" width="50.5" height="24.25" class="screen-fill prop-line" />
    <text x="441.64" y="877.705" text-anchor="middle" class="prop-code" style="font-size:20px">&lt;/&gt;</text>
    <path d="M 390.39 895 L 492.89 895 L 510.89 911 L 372.39 911 Z" class="prop-fill prop-line" />
    <line x1="431.66499999999996" y1="903" x2="451.615" y2="903" class="prop-line dim" />
  </g>
  </g>
    <g class="clanker" transform="rotate(-5 853.4399999999999 880.75)">
    <line x1="853.4399999999999" y1="814.25" x2="853.4399999999999" y2="789.75" class="bot-line" />
    <circle cx="853.4399999999999" cy="784.5" r="4.8125" class="bot-eye bot-line" />
    <rect x="808.8149999999999" y="828.25" width="9.625" height="24.5" rx="3" class="bot-fill bot-line" />
    <rect x="888.4399999999999" y="828.25" width="9.625" height="24.5" rx="3" class="bot-fill bot-line" />
    <rect x="817.5649999999999" y="814.25" width="71.75" height="50.75" rx="10" class="bot-fill bot-line" />
    <rect x="831.5649999999999" y="831.75" width="12.25" height="10.5" rx="3" class="bot-eye" /><rect x="863.0649999999999" y="831.75" width="12.25" height="10.5" rx="3" class="bot-eye" /><path d="M 815.8149999999999 824.75 h -7.875 v 7.875 M 891.0649999999999 824.75 h 7.875 v 7.875" class="fx-line dim" />
    <line x1="837.6899999999999" y1="865" x2="837.6899999999999" y2="870.25" class="bot-line" />
    <line x1="869.1899999999999" y1="865" x2="869.1899999999999" y2="870.25" class="bot-line" />
    <rect x="821.9399999999999" y="870.25" width="63" height="52.5" rx="7" class="bot-fill bot-line" />
    <rect x="838.5649999999999" y="887.75" width="29.75" height="17.5" rx="2" class="bot-fill bot-line" />
    <line x1="844.6899999999999" y1="893.875" x2="862.1899999999999" y2="893.875" class="bot-line" />
    <line x1="844.6899999999999" y1="900" x2="859.5649999999999" y2="900" class="bot-line" />
    <line x1="821.9399999999999" y1="891.25" x2="799.1899999999999" y2="915.75" class="bot-line bot-segmented" /><line x1="884.9399999999999" y1="891.25" x2="907.6899999999999" y2="915.75" class="bot-line bot-segmented" /><path d="M 794.8149999999999 919.25 q -8.75 -3.5 -11.375 -13.125 M 794.8149999999999 919.25 q 8.75 -3.5 11.375 -13.125" class="bot-line" /><path d="M 912.0649999999999 919.25 q -8.75 -3.5 -11.375 -13.125 M 912.0649999999999 919.25 q 8.75 -3.5 11.375 -13.125" class="bot-line" />
    <line x1="834.1899999999999" y1="922.75" x2="827.1899999999999" y2="942" class="bot-line bot-segmented" />
    <line x1="872.6899999999999" y1="922.75" x2="879.6899999999999" y2="942" class="bot-line bot-segmented" />
    <rect x="816.6899999999999" y="942" width="21.875" height="10.5" rx="2" class="bot-fill bot-line" />
    <rect x="868.3149999999999" y="942" width="21.875" height="10.5" rx="2" class="bot-fill bot-line" />
    <path d="M 805.3149999999999 952.5 q 48.125 10.5 96.25 0" class="bot-line dim" />
  </g>
    <path d="M 372.64 778 Q 392.64 802 392.64 831 Q 406.64 798 412.64 778 Z" class="caption-tail" />
    <rect x="58.56" y="718" width="668.16" height="62" rx="14" class="caption-bg speech" />
    <text x="74.56" y="754" class="caption " style="font-size:36px">
      <tspan x="74.56" dy="0">Let's open nvim...</tspan>
    </text>
    <text x="1154" y="971" text-anchor="end" class="panel-num">// 5</text>
  </g>
</svg>


Credit: Ian for the original joke
