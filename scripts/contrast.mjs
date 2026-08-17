// WCAG 2.1 contrast audit for every text pairing the design system uses.
// Real math (relative luminance per WCAG definition), not eyeballing.
// Exit code 1 if any pairing fails its required ratio.

const colors = {
  ink: '#0B0E12',
  surface: '#16131F',
  raised: '#201B2E',
  royal: '#6B3FA0',
  royalLight: '#9E82D4',
  sodium: '#FFB74A',
  danger: '#E5484D',
  dangerText: '#FF7B7E',
  text: '#ECEFF3',
  muted: '#9AA4B2',
  buttonLabel: '#F7F5F0',
  white: '#FFFFFF',
};

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (fg, bg) => {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
};

// Alpha-composite a foreground at given opacity over a background,
// for the one place the design uses opacity on text (deal-section label).
const composite = (fgHex, bgHex, alpha) => {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const mix = fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));
  return '#' + mix.map((c) => c.toString(16).padStart(2, '0')).join('');
};

// [label, fg, bg, required ratio, where it is used]
const pairings = [
  ['text on ink', colors.text, colors.ink, 4.5, 'body copy, headings'],
  ['text on surface', colors.text, colors.surface, 4.5, 'card titles'],
  ['text on raised', colors.text, colors.raised, 4.5, 'hovered cards'],
  ['muted on ink', colors.muted, colors.ink, 4.5, 'captions, metadata'],
  ['muted on surface', colors.muted, colors.surface, 4.5, 'card captions'],
  ['muted on raised', colors.muted, colors.raised, 4.5, 'hovered card captions'],
  ['royal-light on ink', colors.royalLight, colors.ink, 4.5, 'links, purple text'],
  ['royal-light on surface', colors.royalLight, colors.surface, 4.5, 'links on cards'],
  ['button label on royal', colors.buttonLabel, colors.royal, 4.5, 'primary buttons, deal section'],
  [
    'deal label (80% opacity) on royal',
    composite(colors.buttonLabel, colors.royal, 0.8),
    colors.royal,
    3.0,
    'deal-section eyebrow (18px+ bold-equivalent label)',
  ],
  ['white on royal', colors.white, colors.royal, 3.0, 'logo GAMES line (decorative-large)'],
  ['sodium on ink', colors.sodium, colors.ink, 4.5, 'warm accent if ever used as text'],
  ['danger-text on ink', colors.dangerText, colors.ink, 4.5, 'error copy'],
  ['danger-text on surface', colors.dangerText, colors.surface, 4.5, 'error copy on cards'],
  ['focus ring (royal-light) vs ink', colors.royalLight, colors.ink, 3.0, 'focus indicator (UI component)'],
  ['hairline-equivalent border vs surface', '#211E28', colors.surface, 1.0, 'decorative hairline (not a control boundary)'],
  // Documented failure — the reason --royal is fill-only:
  ['royal as text on ink (FORBIDDEN)', colors.royal, colors.ink, 0, 'never used; documented failure'],
];

let failed = false;
console.log('WCAG 2.1 contrast audit\n');
for (const [label, fg, bg, required, use] of pairings) {
  const r = ratio(fg, bg);
  const pass = required === 0 ? true : r >= required;
  const verdict =
    required === 0
      ? `${r.toFixed(2)}:1  (fails AA by design — fill only)`
      : `${r.toFixed(2)}:1  needs ${required}:1  ${pass ? 'PASS' : 'FAIL'}`;
  if (!pass) failed = true;
  console.log(`${pass ? ' ' : '!'} ${label.padEnd(42)} ${verdict}`);
  console.log(`    ${use}`);
}
process.exit(failed ? 1 : 0);
