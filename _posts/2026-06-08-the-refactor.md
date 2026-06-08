---
layout: post
title: The Refactor
---

<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="comic-title" viewBox="0 0 1200 610" width="100%">
  <title id="comic-title">The Refactor</title>
  <style>
    svg { background: #000; }
    .title { fill: #86efac; font: 52px 'VT323', 'Courier New', monospace; letter-spacing: 2px; }
    .terminal-line, .ground { stroke: #166534; stroke-width: 3; }
    .panel-bg { fill: #030712; stroke: #22c55e; stroke-width: 3; }
    .caption-bg { fill: rgba(0, 0, 0, 0.74); stroke: #166534; stroke-width: 2; }
    .caption-bg.speech, .caption-tail { filter: drop-shadow(0 0 5px rgba(34, 197, 94, 0.25)); }
    .caption-tail { fill: rgba(0, 0, 0, 0.74); stroke: #166534; stroke-width: 2; stroke-linejoin: round; }
    .caption { fill: #86efac; font-family: 'VT323', 'Courier New', monospace; }
    .caption-bold { font-weight: 700; letter-spacing: 1px; }
    .panel-num, .boot-text { fill: #166534; font: 22px 'VT323', 'Courier New', monospace; }
    .meter-bg, .mini-terminal-bg { fill: rgba(0, 0, 0, 0.82); stroke: #166534; stroke-width: 2; }
    .meter-text { fill: #86efac; font: 24px 'VT323', 'Courier New', monospace; letter-spacing: 1px; }
    .mini-terminal-text { fill: #86efac; font: 22px 'VT323', 'Courier New', monospace; }
    .dev-line, .dev line, .dev circle, .dev rect { stroke: #86efac; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .dev-fill { fill: #020617; }
    .bot-line, .clanker line, .clanker path, .clanker rect, .clanker circle { stroke: #22c55e; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .bot-fill { fill: #020617; }
    .bot-eye { fill: #86efac; stroke: #86efac; }
    .bot-eye.hot { filter: drop-shadow(0 0 8px #86efac); }
    .bot-error { fill: #86efac; font-family: 'VT323', 'Courier New', monospace; }
    .fx-line { fill: none; stroke: #86efac; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
    .fx-line.dim { stroke: #166534; }
    .fx-fill { fill: #86efac; stroke: #86efac; }
    .glow { fill: #22c55e; opacity: 0.06; }
    .glow.strong { opacity: 0.1; }
    .terminal-fill { fill: #020617; }
    .terminal-cursor { fill: #86efac; font: 38px 'VT323', 'Courier New', monospace; }
  </style>
    <text x="600" y="58" text-anchor="middle" class="title">The Refactor</text>
    <line x1="24" y1="78" x2="1176" y2="78" class="terminal-line" />
  <g class="panel" aria-label="Panel 1">
    <rect x="24" y="96" width="567" height="470" rx="8" class="panel-bg" />
    <line x1="42" y1="528" x2="573" y2="528" class="ground" />
    <circle cx="432.24" cy="404" r="95" class="glow strong" />
<text x="505" y="530" class="terminal-cursor">█</text>
    <g class="mini-terminal">
    <rect x="44" y="434" width="328.85999999999996" height="78" class="mini-terminal-bg" />
    <text x="58" y="462" class="mini-terminal-text">$ git status</text><text x="58" y="486" class="mini-terminal-text">legacy code: haunted</text>
  </g>
    <g class="dev">
    <circle cx="185.19" cy="406.5" r="23.287499999999998" class="dev-fill dev-line" />
    <rect x="166.965" y="399.4125" width="14.174999999999999" height="10.125" class="dev-fill dev-line" />
    <rect x="189.24" y="399.4125" width="14.174999999999999" height="10.125" class="dev-fill dev-line" />
    <line x1="183.165" y1="430.8" x2="213.54" y2="457.125"  />
    <line x1="209.49" y1="449.025" x2="247.965" y2="464.2125"  />
    <line x1="200.3775" y1="453.075" x2="230.7525" y2="466.2375"  />
    <line x1="210.5025" y1="457.125" x2="185.19" y2="528"  />
    <line x1="213.54" y1="457.125" x2="254.04" y2="528"  />
    <rect x="229.74" y="439.9125" width="70.875" height="34.425" class="terminal-fill terminal-line" />
    <line x1="229.74" y1="476.3625" x2="311.7525" y2="476.3625" class="terminal-line" />
  </g>
    <g class="clanker">
    <line x1="432.24" y1="376.125" x2="432.24" y2="349.8" class="bot-line" />
    <circle cx="432.24" cy="344.7375" r="5.0625" class="bot-fill bot-line" />
    <rect x="395.79" y="376.125" width="72.89999999999999" height="54.675" rx="8" class="bot-fill bot-line" />
    <rect x="406.9275" y="394.35" width="16.2" height="12.149999999999999" class="bot-eye" /><rect x="441.3525" y="394.35" width="16.2" height="12.149999999999999" class="bot-eye" />
    <rect x="397.815" y="436.875" width="68.85" height="55.6875" rx="6" class="bot-fill bot-line" />
    <line x1="414.015" y1="455.1" x2="450.46500000000003" y2="455.1" class="bot-line" />
    <line x1="414.015" y1="471.3" x2="450.46500000000003" y2="471.3" class="bot-line" />
    <line x1="411.99" y1="492.5625" x2="403.89" y2="528" class="bot-line" />
    <line x1="452.49" y1="492.5625" x2="460.59000000000003" y2="528" class="bot-line" />
      <line x1="397.815" y1="459.15" x2="361.365" y2="420.67499999999995" class="bot-line" />
      <line x1="466.665" y1="459.15" x2="503.115" y2="420.67499999999995" class="bot-line" />
      <path d="M 355.29 415.61249999999995 l -10.125 -8.1 M 355.29 415.61249999999995 l 10.125 -8.1" class="bot-line" />
      <path d="M 509.19 415.61249999999995 l -10.125 -8.1 M 509.19 415.61249999999995 l 10.125 -8.1" class="bot-line" /></g>
    <path d="M 185.44 194 Q 205.44 218 205.44 410 Q 219.44 214 225.44 194 Z" class="caption-tail" />
    <rect x="41.01000000000002" y="108" width="328.85999999999996" height="88" rx="14" class="caption-bg speech" />
    <text x="57.01000000000002" y="144" class="caption " style="font-size:32px">
      <tspan x="57.01000000000002" dy="0">Can you refactor</tspan><tspan x="57.01000000000002" dy="29">this?</tspan>
    </text>
    <path d="M 412.24 263 Q 432.24 287 432.24 410 Q 446.24 283 452.24 263 Z" class="caption-tail" />
    <rect x="250.14000000000004" y="206" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="266.14000000000004" y="242" class="caption " style="font-size:32px">
      <tspan x="266.14000000000004" dy="0">Absolutely.</tspan>
    </text>
    <text x="569" y="550" text-anchor="end" class="panel-num">1</text>
  </g>
<g class="panel" aria-label="Panel 2">
    <rect x="609" y="96" width="567" height="470" rx="8" class="panel-bg" />
    <line x1="627" y1="528" x2="1158" y2="528" class="ground" />
    <path d="M 1079.24 348 l 18 -28 l 8 24 l 22 -20" class="fx-line" />
<path d="M 945.24 363 l -20 -18 l 5 25" class="fx-line" />
    <g class="mini-terminal">
    <rect x="629" y="410" width="328.85999999999996" height="102" class="mini-terminal-bg" />
    <text x="643" y="438" class="mini-terminal-text">$ rm -rf ./src</text><text x="643" y="462" class="mini-terminal-text">tests: skipped</text><text x="643" y="486" class="mini-terminal-text">complexity: 0</text>
  </g>
    <g class="dev" >
    <circle cx="790.44" cy="396.375" r="24.299999999999997" class="dev-fill dev-line" />
    <rect x="772.215" y="389.2875" width="14.174999999999999" height="10.125" class="dev-fill dev-line" />
    <rect x="794.49" y="389.2875" width="14.174999999999999" height="10.125" class="dev-fill dev-line" />
    <line x1="786.3900000000001" y1="394.35" x2="794.49" y2="394.35"  />
    <line x1="790.44" y1="418.65" x2="790.44" y2="477.375"  />
      <line x1="790.44" y1="438.9" x2="744.8775" y2="396.375"  />
      <line x1="790.44" y1="438.9" x2="836.0025" y2="396.375"  />
    <line x1="790.44" y1="477.375" x2="765.1275" y2="528"  />
    <line x1="790.44" y1="477.375" x2="817.7775" y2="528"  />
      <path d="M 731.715 362.9625 l 10.125 -18.224999999999998 l 10.125 18.224999999999998" class="dev-line" />
      <path d="M 832.965 357.9 l 16.2 -10.125 l -6.074999999999999 22.275" class="dev-line" />
  </g>
    <g class="clanker">
    <line x1="1017.24" y1="376.125" x2="1017.24" y2="349.8" class="bot-line" />
    <circle cx="1017.24" cy="344.7375" r="5.0625" class="bot-fill bot-line" />
    <rect x="980.79" y="376.125" width="72.89999999999999" height="54.675" rx="8" class="bot-fill bot-line" />
    <rect x="991.9275" y="394.35" width="16.2" height="12.149999999999999" class="bot-eye hot" /><rect x="1026.3525" y="394.35" width="16.2" height="12.149999999999999" class="bot-eye hot" />
    <rect x="982.815" y="436.875" width="68.85" height="55.6875" rx="6" class="bot-fill bot-line" />
    <line x1="999.015" y1="455.1" x2="1035.465" y2="455.1" class="bot-line" />
    <line x1="999.015" y1="471.3" x2="1035.465" y2="471.3" class="bot-line" />
    <line x1="996.99" y1="492.5625" x2="988.89" y2="528" class="bot-line" />
    <line x1="1037.49" y1="492.5625" x2="1045.59" y2="528" class="bot-line" />
    <line x1="982.815" y1="459.15" x2="946.365" y2="463.2" class="bot-line" />
    <line x1="1051.665" y1="459.15" x2="1088.115" y2="463.2" class="bot-line" />
    <path d="M 940.29 465.22499999999997 l -10.125 -8.1 M 940.29 465.22499999999997 l 10.125 -8.1" class="bot-line" />
    <path d="M 1094.19 465.22499999999997 l -10.125 -8.1 M 1094.19 465.22499999999997 l 10.125 -8.1" class="bot-line" /></g>
    <path d="M 997.24 165 Q 1017.24 189 1017.24 410 Q 1031.24 185 1037.24 165 Z" class="caption-tail" />
    <rect x="835.1400000000001" y="108" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="851.1400000000001" y="144" class="caption " style="font-size:32px">
      <tspan x="851.1400000000001" dy="0">I deleted it.</tspan>
    </text>
    <text x="1154" y="550" text-anchor="end" class="panel-num">2</text>
  </g>
</svg>


Credit: dev and clanker
