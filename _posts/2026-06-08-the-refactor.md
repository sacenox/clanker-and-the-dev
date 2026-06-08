---
layout: post
title: The Refactor
---

<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="comic-title" viewBox="0 0 1200 610" width="100%">
  <title id="comic-title">The Refactor</title>
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
    <text x="42" y="58" class="title" style="font-size:48px">&gt; THE REFACTOR_</text>
    <text x="770" y="34" class="meta-text">PROJECT : CLANKER AND THE DEV</text>
    <text x="770" y="58" class="meta-text">THEME   : CODE. COFFEE. CHAOS.</text>
    <line x1="24" y1="78" x2="1176" y2="78" class="terminal-line" />
  <g class="panel" aria-label="Panel 1">
    <rect x="24" y="96" width="567" height="470" rx="9" class="panel-bg" />
    <line x1="36" y1="154" x2="579" y2="154" class="scanline" /><line x1="36" y1="221.14285714285714" x2="579" y2="221.14285714285714" class="scanline" /><line x1="36" y1="288.2857142857143" x2="579" y2="288.2857142857143" class="scanline" /><line x1="36" y1="355.42857142857144" x2="579" y2="355.42857142857144" class="scanline" /><line x1="36" y1="422.57142857142856" x2="579" y2="422.57142857142856" class="scanline" />
    <text x="42" y="124" class="panel-heading">01.</text>
    <line x1="82" y1="118" x2="573" y2="118" class="panel-heading-line" />
    <path d="M 34 130 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 581 532 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="42" y1="528" x2="573" y2="528" class="ground" />
    <circle cx="432.24" cy="402" r="106" class="glow strong" />
<circle cx="432.24" cy="402" r="62" class="glow core" />
<text x="503" y="533" class="terminal-cursor">█</text>
    <g class="mini-terminal">
    <rect x="44" y="422" width="351.54" height="90" rx="7" class="mini-terminal-bg" />
    <line x1="44" y1="450" x2="395.54" y2="450" class="terminal-line" />
    <text x="58" y="442" class="terminal-title">$ terminal</text>
    <rect x="341.54" y="431" width="9" height="9" class="terminal-button" />
    <rect x="359.54" y="431" width="9" height="9" class="terminal-button" />
    <rect x="377.54" y="431" width="9" height="9" class="terminal-button" />
    <text x="58" y="477" class="mini-terminal-text">$ git status</text><text x="58" y="501" class="mini-terminal-text">legacy code: haunted</text>
  </g>
    <g class="dev typing-dev">
    <rect x="108.24000000000001" y="477.375" width="212.625" height="8.1" rx="2" class="prop-fill prop-line" />
    <line x1="126.465" y1="484.4625" x2="126.465" y2="528" class="prop-line" />
    <line x1="300.615" y1="484.4625" x2="300.615" y2="528" class="prop-line" />
    <path d="M 118.365 509.775 L 85.965 509.775 L 85.965 444.975 q 18.224999999999998 -16.2 44.55 0" class="prop-line dim" />
    <circle cx="175.065" cy="402.45" r="24.3" class="dev-fill dev-line" />
    <line x1="150.765" y1="403.42199999999997" x2="199.365" y2="403.42199999999997" class="dev-line dim" />
    <rect x="153.68099999999998" y="396.618" width="17.496" height="11.664" rx="1" class="dev-glass dev-line" />
    <rect x="177.981" y="396.618" width="17.496" height="11.664" rx="1" class="dev-glass dev-line" />
    <line x1="171.177" y1="402.45" x2="178.953" y2="402.45" class="dev-line" />
    <circle cx="162.429" cy="402.45" r="2.4299999999999997" class="dev-eye" /><circle cx="187.701" cy="402.45" r="2.4299999999999997" class="dev-eye" /><line x1="169.233" y1="417.03" x2="182.841" y2="417.03" class="dev-line" />
    <path d="M 175.065 427.7625 q 18.224999999999998 20.25 10.125 76.95" class="dev-line" />
    <line x1="187.215" y1="444.975" x2="227.715" y2="474.3375" class="dev-line" />
    <line x1="168.99" y1="447" x2="207.465" y2="475.34999999999997" class="dev-line" />
    <circle cx="227.715" cy="474.3375" r="4.05" class="dev-hand" />
    <circle cx="207.465" cy="475.34999999999997" r="4.05" class="dev-hand" />
    <line x1="179.115" y1="473.325" x2="183.165" y2="528" class="dev-line" />
    <line x1="193.29" y1="473.325" x2="249.99" y2="528" class="dev-line" />
    <g class="prop laptop">
    <rect x="223.665" y="416.625" width="76.95" height="46.574999999999996" rx="4" class="prop-fill prop-line" />
    <rect x="231.665" y="424.625" width="60.95" height="30.574999999999996" class="screen-fill prop-line" />
    <text x="262.14" y="445.5015" text-anchor="middle" class="prop-code" style="font-size:20px">&lt;/&gt;</text>
    <path d="M 205.665 465.2 L 318.615 465.2 L 336.615 481.2 L 187.665 481.2 Z" class="prop-fill prop-line" />
    <line x1="250.5975" y1="473.2" x2="273.6825" y2="473.2" class="prop-line dim" />
  </g>
  </g>
    <g class="clanker" transform="rotate(0 432.24 449.025)">
    <line x1="432.24" y1="372.07500000000005" x2="432.24" y2="343.725" class="bot-line" />
    <circle cx="432.24" cy="337.65000000000003" r="5.56875" class="bot-eye bot-line" />
    <rect x="380.6025" y="388.27500000000003" width="11.1375" height="28.349999999999998" rx="3" class="bot-fill bot-line" />
    <rect x="472.74" y="388.27500000000003" width="11.1375" height="28.349999999999998" rx="3" class="bot-fill bot-line" />
    <rect x="390.7275" y="372.07500000000005" width="83.02499999999999" height="58.724999999999994" rx="10" class="bot-fill bot-line" />
    <path d="M 405.915 403.46250000000003 q 8.1 -13.1625 18.224999999999998 0" class="bot-line hot" /><path d="M 440.34000000000003 403.46250000000003 q 8.1 -13.1625 18.224999999999998 0" class="bot-line hot" />
    <line x1="414.015" y1="430.80000000000007" x2="414.015" y2="436.875" class="bot-line" />
    <line x1="450.46500000000003" y1="430.80000000000007" x2="450.46500000000003" y2="436.875" class="bot-line" />
    <rect x="395.79" y="436.875" width="72.89999999999999" height="60.75" rx="7" class="bot-fill bot-line" />
    <rect x="415.02750000000003" y="457.125" width="34.425" height="20.25" rx="2" class="bot-fill bot-line" />
    <line x1="422.115" y1="464.2125" x2="442.365" y2="464.2125" class="bot-line" />
    <line x1="422.115" y1="471.3" x2="439.3275" y2="471.3" class="bot-line" />
    <line x1="395.79" y1="461.175" x2="359.34000000000003" y2="418.65000000000003" class="bot-line bot-segmented" /><line x1="468.69" y1="461.175" x2="503.115" y2="465.225" class="bot-line bot-segmented" /><path d="M 353.265 413.58750000000003 q -10.125 -4.05 -13.1625 -15.1875 M 353.265 413.58750000000003 q 10.125 -4.05 13.1625 -15.1875" class="bot-line" /><path d="M 509.19 468.2625 q -10.125 -4.05 -13.1625 -15.1875 M 509.19 468.2625 q 10.125 -4.05 13.1625 -15.1875" class="bot-line" /><path d="M 338.0775 406.2975 L 340.355625 411.30937500000005 L 345.3675 413.58750000000003 L 340.355625 415.865625 L 338.0775 420.87750000000005 L 335.799375 415.865625 L 330.78749999999997 413.58750000000003 L 335.799375 411.30937500000005 Z" class="fx-line" />
    <line x1="409.96500000000003" y1="497.625" x2="401.865" y2="519.9" class="bot-line bot-segmented" />
    <line x1="454.515" y1="497.625" x2="462.615" y2="519.9" class="bot-line bot-segmented" />
    <rect x="389.71500000000003" y="519.9" width="25.3125" height="12.149999999999999" rx="2" class="bot-fill bot-line" />
    <rect x="449.4525" y="519.9" width="25.3125" height="12.149999999999999" rx="2" class="bot-fill bot-line" />
    <path d="M 376.5525 532.05 q 55.6875 12.149999999999999 111.375 0" class="bot-line dim" />
  </g>
    <path d="M 185.44 228 Q 205.44 252 205.44 410 Q 219.44 248 225.44 228 Z" class="caption-tail" />
    <rect x="41.01000000000002" y="142" width="328.85999999999996" height="88" rx="14" class="caption-bg speech" />
    <text x="57.01000000000002" y="178" class="caption " style="font-size:32px">
      <tspan x="57.01000000000002" dy="0">Can you refactor</tspan><tspan x="57.01000000000002" dy="29">this?</tspan>
    </text>
    <path d="M 412.24 297 Q 432.24 321 432.24 410 Q 446.24 317 452.24 297 Z" class="caption-tail" />
    <rect x="250.14000000000004" y="240" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="266.14000000000004" y="276" class="caption " style="font-size:32px">
      <tspan x="266.14000000000004" dy="0">Absolutely.</tspan>
    </text>
    <text x="569" y="550" text-anchor="end" class="panel-num">// 1</text>
  </g>
<g class="panel" aria-label="Panel 2">
    <rect x="609" y="96" width="567" height="470" rx="9" class="panel-bg" />
    <line x1="621" y1="154" x2="1164" y2="154" class="scanline" /><line x1="621" y1="221.14285714285714" x2="1164" y2="221.14285714285714" class="scanline" /><line x1="621" y1="288.2857142857143" x2="1164" y2="288.2857142857143" class="scanline" /><line x1="621" y1="355.42857142857144" x2="1164" y2="355.42857142857144" class="scanline" /><line x1="621" y1="422.57142857142856" x2="1164" y2="422.57142857142856" class="scanline" />
    <text x="627" y="124" class="panel-heading">02.</text>
    <line x1="667" y1="118" x2="1158" y2="118" class="panel-heading-line" />
    <path d="M 619 130 v -16 q 0 -8 8 -8 h 16" class="corner-accent" />
    <path d="M 1166 532 v 16 q 0 8 -8 8 h -16" class="corner-accent" />
    <line x1="627" y1="528" x2="1158" y2="528" class="ground" />
    <path d="M 1079.24 344 l 20 -30 l 8 26 l 26 -24" class="fx-line" />
<path d="M 945.24 360 l -24 -18 l 7 27" class="fx-line" />
<path d="M 1109.24 389.2 L 1111.99 395.25 L 1118.04 398 L 1111.99 400.75 L 1109.24 406.8 L 1106.49 400.75 L 1100.44 398 L 1106.49 395.25 Z" class="fx-line" />
<path d="M 919.24 314.8 L 921.49 319.75 L 926.44 322 L 921.49 324.25 L 919.24 329.2 L 916.99 324.25 L 912.04 322 L 916.99 319.75 Z" class="fx-line" />
    <g class="mini-terminal">
    <rect x="629" y="398" width="351.54" height="114" rx="7" class="mini-terminal-bg" />
    <line x1="629" y1="426" x2="980.54" y2="426" class="terminal-line" />
    <text x="643" y="418" class="terminal-title">$ terminal</text>
    <rect x="926.54" y="407" width="9" height="9" class="terminal-button" />
    <rect x="944.54" y="407" width="9" height="9" class="terminal-button" />
    <rect x="962.54" y="407" width="9" height="9" class="terminal-button" />
    <text x="643" y="453" class="mini-terminal-text">$ rm -rf ./src</text><text x="643" y="477" class="mini-terminal-text">tests: skipped</text><text x="643" y="501" class="mini-terminal-text">complexity: 0</text>
  </g>
    <g class="dev" >
    <circle cx="790.44" cy="396.375" r="25.3125" class="dev-fill dev-line" />
    <line x1="765.1275" y1="397.3875" x2="815.7525" y2="397.3875" class="dev-line dim" />
    <rect x="768.1650000000001" y="390.3" width="18.224999999999998" height="12.149999999999999" rx="1" class="dev-glass dev-line" />
    <rect x="793.4775000000001" y="390.3" width="18.224999999999998" height="12.149999999999999" rx="1" class="dev-glass dev-line" />
    <line x1="786.3900000000001" y1="396.375" x2="794.49" y2="396.375" class="dev-line" />
    <circle cx="777.2775" cy="396.375" r="2.53125" class="dev-eye" /><circle cx="803.6025000000001" cy="396.375" r="2.53125" class="dev-eye" /><line x1="771.2025000000001" y1="381.1875" x2="782.34" y2="387.2625" class="dev-line" /><line x1="798.5400000000001" y1="387.2625" x2="809.6775" y2="381.1875" class="dev-line" /><rect x="782.34" y="406.5" width="16.2" height="13.1625" rx="4" class="dev-mouth-open dev-line" /><text x="826.8900000000001" y="382.2" class="accent-text" style="font-size:34.425px">!</text>
    <path d="M 790.44 422.7 C 783.3525000000001 440.925 797.5275 457.125 790.44 477.375" class="dev-line" />
    <line x1="790.44" y1="438.9" x2="741.84" y2="394.34999999999997" class="dev-line" /><line x1="790.44" y1="438.9" x2="839.0400000000001" y2="394.34999999999997" class="dev-line" /><circle cx="741.84" cy="394.34999999999997" r="4.05" class="dev-hand" /><circle cx="839.0400000000001" cy="394.34999999999997" r="4.05" class="dev-hand" />
    <line x1="790.44" y1="477.375" x2="765.1275" y2="528" class="dev-line" />
    <line x1="790.44" y1="477.375" x2="817.7775" y2="528" class="dev-line" />
    <path d="M 755.0025 529.0125 q 10.125 5.0625 24.299999999999997 0" class="dev-line dim" />
    <path d="M 806.6400000000001 529.0125 q 10.125 5.0625 24.299999999999997 0" class="dev-line dim" />
      <rect x="703.365" y="422.7" width="42.525" height="28.349999999999998" rx="3" class="prop-fill prop-line dim" />
      <line x1="711.465" y1="433.8375" x2="735.7650000000001" y2="433.8375" class="prop-line dim" />
      <rect x="839.0400000000001" y="431.8125" width="48.599999999999994" height="32.4" rx="3" class="prop-fill prop-line dim" />
      <line x1="848.1525" y1="443.9625" x2="875.49" y2="443.9625" class="prop-line dim" />
  </g>
    <g class="clanker" transform="rotate(0 1017.24 449.025)">
    <line x1="1017.24" y1="372.07500000000005" x2="1017.24" y2="343.725" class="bot-line" />
    <circle cx="1017.24" cy="337.65000000000003" r="5.56875" class="bot-eye bot-line" />
    <rect x="965.6025" y="388.27500000000003" width="11.1375" height="28.349999999999998" rx="3" class="bot-fill bot-line" />
    <rect x="1057.74" y="388.27500000000003" width="11.1375" height="28.349999999999998" rx="3" class="bot-fill bot-line" />
    <rect x="975.7275" y="372.07500000000005" width="83.02499999999999" height="58.724999999999994" rx="10" class="bot-fill bot-line" />
    <path d="M 990.915 403.46250000000003 q 8.1 -13.1625 18.224999999999998 0" class="bot-line hot" /><path d="M 1025.34 403.46250000000003 q 8.1 -13.1625 18.224999999999998 0" class="bot-line hot" />
    <line x1="999.015" y1="430.80000000000007" x2="999.015" y2="436.875" class="bot-line" />
    <line x1="1035.465" y1="430.80000000000007" x2="1035.465" y2="436.875" class="bot-line" />
    <rect x="980.79" y="436.875" width="72.89999999999999" height="60.75" rx="7" class="bot-fill bot-line" />
    <rect x="1000.0275" y="457.125" width="34.425" height="20.25" rx="2" class="bot-fill bot-line" />
    <line x1="1007.115" y1="464.2125" x2="1027.365" y2="464.2125" class="bot-line" />
    <line x1="1007.115" y1="471.3" x2="1024.3275" y2="471.3" class="bot-line" />
    <line x1="980.79" y1="461.175" x2="946.365" y2="467.25" class="bot-line bot-segmented" /><line x1="1053.69" y1="461.175" x2="1088.115" y2="467.25" class="bot-line bot-segmented" /><path d="M 940.29 470.2875 q -10.125 -4.05 -13.1625 -15.1875 M 940.29 470.2875 q 10.125 -4.05 13.1625 -15.1875" class="bot-line" /><path d="M 1094.19 470.2875 q -10.125 -4.05 -13.1625 -15.1875 M 1094.19 470.2875 q 10.125 -4.05 13.1625 -15.1875" class="bot-line" />
    <line x1="994.965" y1="497.625" x2="986.865" y2="519.9" class="bot-line bot-segmented" />
    <line x1="1039.515" y1="497.625" x2="1047.615" y2="519.9" class="bot-line bot-segmented" />
    <rect x="974.715" y="519.9" width="25.3125" height="12.149999999999999" rx="2" class="bot-fill bot-line" />
    <rect x="1034.4525" y="519.9" width="25.3125" height="12.149999999999999" rx="2" class="bot-fill bot-line" />
    <path d="M 961.5525 532.05 q 55.6875 12.149999999999999 111.375 0" class="bot-line dim" />
  </g>
    <path d="M 997.24 199 Q 1017.24 223 1017.24 410 Q 1031.24 219 1037.24 199 Z" class="caption-tail" />
    <rect x="835.1400000000001" y="142" width="328.85999999999996" height="59" rx="14" class="caption-bg speech" />
    <text x="851.1400000000001" y="178" class="caption " style="font-size:32px">
      <tspan x="851.1400000000001" dy="0">I deleted it.</tspan>
    </text>
    <text x="1154" y="550" text-anchor="end" class="panel-num">// 2</text>
  </g>
</svg>


Credit: dev and clanker
