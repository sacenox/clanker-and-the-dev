---
layout: post
title: The Cycle of AI Coding Burnout
---

<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="comic-title" viewBox="0 0 1200 1011" width="100%">
  <title id="comic-title">The Cycle of AI Coding Burnout</title>
  <style>
    svg { background: #000; }
    .title { fill: #86efac; font: 52px 'VT323', 'Courier New', monospace; letter-spacing: 2px; }
    .terminal-line, .ground { stroke: #166534; stroke-width: 3; }
    .panel-bg { fill: #030712; stroke: #22c55e; stroke-width: 3; }
    .caption-bg { fill: rgba(0, 0, 0, 0.74); stroke: #166534; stroke-width: 2; }
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
    <text x="600" y="58" text-anchor="middle" class="title">The Cycle of AI Coding Burnout</text>
    <line x1="24" y1="78" x2="1176" y2="78" class="terminal-line" />
  <g class="panel" aria-label="Panel 1">
    <rect x="24" y="96" width="567" height="270" rx="8" class="panel-bg" />
    <line x1="42" y1="328" x2="573" y2="328" class="ground" />
    <circle cx="432.24" cy="198" r="72" class="glow" />
    <g class="dev" >
    <circle cx="205.44" cy="230.5" r="18" class="dev-fill dev-line" />
    <rect x="191.94" y="225.25" width="10.5" height="7.5" class="dev-fill dev-line" />
    <rect x="208.44" y="225.25" width="10.5" height="7.5" class="dev-fill dev-line" />
    <line x1="202.44" y1="229" x2="208.44" y2="229"  />
    <line x1="205.44" y1="247" x2="205.44" y2="290.5"  />
      <line x1="205.44" y1="262" x2="179.19" y2="275.5"  />
      <line x1="205.44" y1="262" x2="236.94" y2="254.5"  />
    <line x1="205.44" y1="290.5" x2="186.69" y2="328"  />
    <line x1="205.44" y1="290.5" x2="225.69" y2="328"  />
  </g>
    <g class="clanker">
    <line x1="432.24" y1="215.5" x2="432.24" y2="196" class="bot-line" />
    <circle cx="432.24" cy="192.25" r="3.75" class="bot-fill bot-line" />
    <rect x="405.24" y="215.5" width="54" height="40.5" rx="8" class="bot-fill bot-line" />
    <rect x="413.49" y="229" width="12" height="9" class="bot-eye" /><rect x="438.99" y="229" width="12" height="9" class="bot-eye" />
    <rect x="406.74" y="260.5" width="51" height="41.25" rx="6" class="bot-fill bot-line" />
    <line x1="418.74" y1="274" x2="445.74" y2="274" class="bot-line" />
    <line x1="418.74" y1="286" x2="445.74" y2="286" class="bot-line" />
    <line x1="417.24" y1="301.75" x2="411.24" y2="328" class="bot-line" />
    <line x1="447.24" y1="301.75" x2="453.24" y2="328" class="bot-line" />
      <line x1="406.74" y1="277" x2="379.74" y2="248.5" class="bot-line" />
      <line x1="457.74" y1="277" x2="484.74" y2="248.5" class="bot-line" />
      <path d="M 375.24 244.75 l -7.5 -6 M 375.24 244.75 l 7.5 -6" class="bot-line" />
      <path d="M 489.24 244.75 l -7.5 -6 M 489.24 244.75 l 7.5 -6" class="bot-line" /></g>
    <rect x="36" y="108" width="543" height="64" class="caption-bg" />
    <text x="52" y="144" class="caption " style="font-size:32px">
      <tspan x="52" dy="0">wow</tspan>
    </text>
    <text x="569" y="350" text-anchor="end" class="panel-num">1</text>
  </g>
<g class="panel" aria-label="Panel 2">
    <rect x="609" y="96" width="567" height="270" rx="8" class="panel-bg" />
    <line x1="627" y1="328" x2="1158" y2="328" class="ground" />
    <circle cx="1017.24" cy="204" r="95" class="glow strong" />
    <g class="dev" >
    <circle cx="790.44" cy="230.5" r="18" class="dev-fill dev-line" />
    <rect x="776.94" y="225.25" width="10.5" height="7.5" class="dev-fill dev-line" />
    <rect x="793.44" y="225.25" width="10.5" height="7.5" class="dev-fill dev-line" />
    <line x1="787.44" y1="229" x2="793.44" y2="229"  />
    <line x1="790.44" y1="247" x2="790.44" y2="290.5"  />
      <line x1="790.44" y1="262" x2="756.69" y2="230.5"  />
      <line x1="790.44" y1="262" x2="824.19" y2="230.5"  />
    <line x1="790.44" y1="290.5" x2="771.69" y2="328"  />
    <line x1="790.44" y1="290.5" x2="810.69" y2="328"  />
  </g>
    <g class="clanker">
    <line x1="1017.24" y1="215.5" x2="1017.24" y2="196" class="bot-line" />
    <circle cx="1017.24" cy="192.25" r="3.75" class="bot-fill bot-line" />
    <rect x="990.24" y="215.5" width="54" height="40.5" rx="8" class="bot-fill bot-line" />
    <rect x="998.49" y="229" width="12" height="9" class="bot-eye hot" /><rect x="1023.99" y="229" width="12" height="9" class="bot-eye hot" />
    <rect x="991.74" y="260.5" width="51" height="41.25" rx="6" class="bot-fill bot-line" />
    <line x1="1003.74" y1="274" x2="1030.74" y2="274" class="bot-line" />
    <line x1="1003.74" y1="286" x2="1030.74" y2="286" class="bot-line" />
    <line x1="1002.24" y1="301.75" x2="996.24" y2="328" class="bot-line" />
    <line x1="1032.24" y1="301.75" x2="1038.24" y2="328" class="bot-line" />
    <line x1="991.74" y1="277" x2="964.74" y2="280" class="bot-line" />
    <line x1="1042.74" y1="277" x2="1069.74" y2="280" class="bot-line" />
    <path d="M 960.24 281.5 l -7.5 -6 M 960.24 281.5 l 7.5 -6" class="bot-line" />
    <path d="M 1074.24 281.5 l -7.5 -6 M 1074.24 281.5 l 7.5 -6" class="bot-line" /></g>
    <rect x="621" y="108" width="543" height="64" class="caption-bg" />
    <text x="637" y="144" class="caption " style="font-size:32px">
      <tspan x="637" dy="0">WOW</tspan>
    </text>
    <text x="1154" y="350" text-anchor="end" class="panel-num">2</text>
  </g>
<g class="panel" aria-label="Panel 3">
    <rect x="24" y="384" width="567" height="270" rx="8" class="panel-bg" />
    <line x1="42" y1="616" x2="573" y2="616" class="ground" />
    <path d="M 494.24 436 l 18 -28 l 8 24 l 22 -20" class="fx-line" />
<path d="M 360.24 451 l -20 -18 l 5 25" class="fx-line" />
<path d="M 257.44 456 q 10 16 -4 27 q -14 -12 4 -27" class="fx-fill" />
    <g class="dev" >
    <circle cx="205.44" cy="518.5" r="18" class="dev-fill dev-line" />
    <rect x="191.94" y="513.25" width="10.5" height="7.5" class="dev-fill dev-line" />
    <rect x="208.44" y="513.25" width="10.5" height="7.5" class="dev-fill dev-line" />
    <line x1="202.44" y1="517" x2="208.44" y2="517"  />
    <line x1="205.44" y1="535" x2="205.44" y2="578.5"  />
      <line x1="205.44" y1="550" x2="171.69" y2="518.5"  />
      <line x1="205.44" y1="550" x2="239.19" y2="518.5"  />
    <line x1="205.44" y1="578.5" x2="186.69" y2="616"  />
    <line x1="205.44" y1="578.5" x2="225.69" y2="616"  />
      <path d="M 161.94 493.75 l 7.5 -13.5 l 7.5 13.5" class="dev-line" />
      <path d="M 236.94 490 l 12 -7.5 l -4.5 16.5" class="dev-line" />
  </g>
    <g class="clanker">
    <line x1="432.24" y1="503.5" x2="432.24" y2="484" class="bot-line" />
    <circle cx="432.24" cy="480.25" r="3.75" class="bot-fill bot-line" />
    <rect x="405.24" y="503.5" width="54" height="40.5" rx="8" class="bot-fill bot-line" />
    <rect x="413.49" y="517" width="12" height="9" class="bot-eye hot" /><rect x="438.99" y="517" width="12" height="9" class="bot-eye hot" />
    <rect x="406.74" y="548.5" width="51" height="41.25" rx="6" class="bot-fill bot-line" />
    <line x1="418.74" y1="562" x2="445.74" y2="562" class="bot-line" />
    <line x1="418.74" y1="574" x2="445.74" y2="574" class="bot-line" />
    <line x1="417.24" y1="589.75" x2="411.24" y2="616" class="bot-line" />
    <line x1="447.24" y1="589.75" x2="453.24" y2="616" class="bot-line" />
    <line x1="406.74" y1="565" x2="379.74" y2="568" class="bot-line" />
    <line x1="457.74" y1="565" x2="484.74" y2="568" class="bot-line" />
    <path d="M 375.24 569.5 l -7.5 -6 M 375.24 569.5 l 7.5 -6" class="bot-line" />
    <path d="M 489.24 569.5 l -7.5 -6 M 489.24 569.5 l 7.5 -6" class="bot-line" />
    <path d="M 393.24 491.5 l 10.5 -16.5 l 7.5 13.5 l 11.25 -18.75" class="fx-line" />
    <path d="M 469.74 497.5 l 15 -13.5 l -1.5 19.5" class="fx-line" /></g>
    <rect x="36" y="396" width="543" height="64" class="caption-bg" />
    <text x="52" y="432" class="caption " style="font-size:32px">
      <tspan x="52" dy="0">HOLY SHIT!</tspan>
    </text>
    <text x="569" y="638" text-anchor="end" class="panel-num">3</text>
  </g>
<g class="panel" aria-label="Panel 4">
    <rect x="609" y="384" width="567" height="270" rx="8" class="panel-bg" />
    <line x1="627" y1="616" x2="1158" y2="616" class="ground" />
    <path d="M 820.44 431 q 26 -22 0 -44 q -20 -20 10 -43" class="fx-line dim" />
    <g class="dev">
    <circle cx="761.94" cy="596.5" r="16.5" class="dev-fill dev-line" />
    <line x1="751.44" y1="594.25" x2="757.44" y2="600.25"  />
    <line x1="757.44" y1="594.25" x2="751.44" y2="600.25"  />
    <line x1="767.94" y1="594.25" x2="773.94" y2="600.25"  />
    <line x1="773.94" y1="594.25" x2="767.94" y2="600.25"  />
    <line x1="779.19" y1="602.5" x2="854.19" y2="604"  />
    <line x1="800.94" y1="602.5" x2="791.94" y2="580"  />
    <line x1="818.94" y1="603.25" x2="811.44" y2="625"  />
    <line x1="851.94" y1="604" x2="884.94" y2="592"  />
    <line x1="853.44" y1="604" x2="883.44" y2="614.5"  />
  </g>
    <g class="clanker">
    <line x1="1017.24" y1="503.5" x2="1017.24" y2="484" class="bot-line" />
    <circle cx="1017.24" cy="480.25" r="3.75" class="bot-fill bot-line" />
    <rect x="990.24" y="503.5" width="54" height="40.5" rx="8" class="bot-fill bot-line" />
    <line x1="999.24" y1="518.5" x2="1011.24" y2="524.5" class="bot-line" /><line x1="1023.24" y1="524.5" x2="1035.24" y2="518.5" class="bot-line" />
    <rect x="991.74" y="548.5" width="51" height="41.25" rx="6" class="bot-fill bot-line" />
    <line x1="1003.74" y1="562" x2="1030.74" y2="562" class="bot-line" />
    <line x1="1003.74" y1="574" x2="1030.74" y2="574" class="bot-line" />
    <line x1="1002.24" y1="589.75" x2="996.24" y2="616" class="bot-line" />
    <line x1="1032.24" y1="589.75" x2="1038.24" y2="616" class="bot-line" />
      <line x1="991.74" y1="565" x2="970.74" y2="583" class="bot-line" />
      <line x1="1042.74" y1="565" x2="1063.74" y2="583" class="bot-line" />
      <path d="M 967.74 586 l -7.5 -6 M 967.74 586 l 7.5 -6" class="bot-line" />
      <path d="M 1066.74 586 l -7.5 -6 M 1066.74 586 l 7.5 -6" class="bot-line" /></g>
    <rect x="621" y="396" width="543" height="64" class="caption-bg" />
    <text x="637" y="432" class="caption caption-bold" style="font-size:32px">
      <tspan x="637" dy="0">dead</tspan>
    </text>
    <text x="1154" y="638" text-anchor="end" class="panel-num">4</text>
  </g>
<g class="panel" aria-label="Panel 5">
    <rect x="24" y="672" width="1152" height="315" rx="8" class="panel-bg" />
    <line x1="42" y1="949" x2="1158" y2="949" class="ground" />
    <text x="1090" y="951" class="terminal-cursor">█</text>
<text x="58" y="953" class="boot-text">&gt; booting...</text>
    <g class="dev">
    <path d="M 329.64 870.25 q -24.5 -38.5 7 -70" class="fx-line" />
    <path d="M 455.64 870.25 q 24.5 -38.5 -7 -70" class="fx-line" />
    <circle cx="375.14" cy="844" r="20.125" class="dev-fill dev-line" />
    <rect x="359.39" y="837.875" width="12.25" height="8.75" class="dev-fill dev-line" />
    <rect x="378.64" y="837.875" width="12.25" height="8.75" class="dev-fill dev-line" />
    <line x1="373.39" y1="865" x2="399.64" y2="887.75"  />
    <line x1="396.14" y1="880.75" x2="429.39" y2="893.875"  />
    <line x1="388.265" y1="884.25" x2="414.515" y2="895.625"  />
    <line x1="397.015" y1="887.75" x2="375.14" y2="949"  />
    <line x1="399.64" y1="887.75" x2="434.64" y2="949"  />
    <rect x="413.64" y="872.875" width="61.25" height="29.75" class="terminal-fill terminal-line" />
    <line x1="413.64" y1="904.375" x2="484.515" y2="904.375" class="terminal-line" />
  </g>
    <g class="clanker">
    <line x1="853.4399999999999" y1="817.75" x2="853.4399999999999" y2="795" class="bot-line" />
    <circle cx="853.4399999999999" cy="790.625" r="4.375" class="bot-fill bot-line" />
    <rect x="821.9399999999999" y="817.75" width="63" height="47.25" rx="8" class="bot-fill bot-line" />
    <rect x="831.5649999999999" y="833.5" width="14" height="10.5" class="bot-eye" /><rect x="861.3149999999999" y="833.5" width="14" height="10.5" class="bot-eye" />
    <rect x="823.6899999999999" y="870.25" width="59.5" height="48.125" rx="6" class="bot-fill bot-line" />
    <line x1="837.6899999999999" y1="886" x2="869.1899999999999" y2="886" class="bot-line" />
    <line x1="837.6899999999999" y1="900" x2="869.1899999999999" y2="900" class="bot-line" />
    <line x1="835.9399999999999" y1="918.375" x2="828.9399999999999" y2="949" class="bot-line" />
    <line x1="870.9399999999999" y1="918.375" x2="877.9399999999999" y2="949" class="bot-line" />
      <line x1="823.6899999999999" y1="889.5" x2="799.1899999999999" y2="910.5" class="bot-line" />
      <line x1="883.1899999999999" y1="889.5" x2="907.6899999999999" y2="910.5" class="bot-line" />
      <path d="M 795.6899999999999 914 l -8.75 -7 M 795.6899999999999 914 l 8.75 -7" class="bot-line" />
      <path d="M 911.1899999999999 914 l -8.75 -7 M 911.1899999999999 914 l 8.75 -7" class="bot-line" /></g>
    <rect x="36" y="684" width="1128" height="64" class="caption-bg" />
    <text x="52" y="720" class="caption " style="font-size:36px">
      <tspan x="52" dy="0">Let's open nvim...</tspan>
    </text>
    <text x="1154" y="971" text-anchor="end" class="panel-num">5</text>
  </g>
</svg>


Credit: Ian for the original joke
