import { createElement } from 'react'

type SvgChild = [string, Record<string, string | number>]

const ICONS = {
  trendingUp: [
    ['path', { d: 'M3 17l6-6 4 4 8-8' }],
    ['path', { d: 'M15 7h6v6' }],
  ],
  mail: [
    ['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }],
    ['path', { d: 'M3 7l9 6 9-6' }],
  ],
  lock: [
    ['rect', { x: 4, y: 10, width: 16, height: 10, rx: 2 }],
    ['path', { d: 'M8 10V7a4 4 0 0 1 8 0v3' }],
  ],
  user: [
    ['circle', { cx: 12, cy: 8, r: 4 }],
    ['path', { d: 'M4 21a8 8 0 0 1 16 0' }],
  ],
  users: [
    ['circle', { cx: 9, cy: 8, r: 3.5 }],
    ['path', { d: 'M2 21a7 7 0 0 1 14 0' }],
    ['path', { d: 'M16 4.5a3.5 3.5 0 0 1 0 7' }],
    ['path', { d: 'M17 21a7 7 0 0 0-3-5.7' }],
  ],
  eye: [
    ['path', { d: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z' }],
    ['circle', { cx: 12, cy: 12, r: 3 }],
  ],
  eyeOff: [
    ['path', { d: 'M3 3l18 18' }],
    ['path', { d: 'M10.6 6.2A9.6 9.6 0 0 1 12 6c6 0 10 6 10 6a18 18 0 0 1-3 3.4' }],
    ['path', { d: 'M6.6 6.6A17 17 0 0 0 2 12s4 6 10 6a9.5 9.5 0 0 0 4-.9' }],
  ],
  check: [['path', { d: 'M5 12l5 5L20 7' }]],
  checkCircle: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', { d: 'M8 12l3 3 5-5' }],
  ],
  alert: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', { d: 'M12 7v6' }],
    ['path', { d: 'M12 16h.01' }],
  ],
  sun: [
    ['circle', { cx: 12, cy: 12, r: 4 }],
    ['path', { d: 'M12 2v2' }],
    ['path', { d: 'M12 20v2' }],
    ['path', { d: 'M4 12H2' }],
    ['path', { d: 'M22 12h-2' }],
    ['path', { d: 'M5 5l1.5 1.5' }],
    ['path', { d: 'M17.5 17.5 19 19' }],
    ['path', { d: 'M19 5l-1.5 1.5' }],
    ['path', { d: 'M6.5 17.5 5 19' }],
  ],
  moon: [['path', { d: 'M20 13a8 8 0 1 1-9-9 6 6 0 0 0 9 9z' }]],
  grid: [
    ['rect', { x: 3, y: 3, width: 7, height: 7, rx: 1.5 }],
    ['rect', { x: 14, y: 3, width: 7, height: 7, rx: 1.5 }],
    ['rect', { x: 3, y: 14, width: 7, height: 7, rx: 1.5 }],
    ['rect', { x: 14, y: 14, width: 7, height: 7, rx: 1.5 }],
  ],
  list: [
    ['path', { d: 'M8 6h13' }],
    ['path', { d: 'M8 12h13' }],
    ['path', { d: 'M8 18h13' }],
    ['circle', { cx: 4, cy: 6, r: 1 }],
    ['circle', { cx: 4, cy: 12, r: 1 }],
    ['circle', { cx: 4, cy: 18, r: 1 }],
  ],
  barChart: [
    ['path', { d: 'M3 21h18' }],
    ['rect', { x: 5, y: 11, width: 3, height: 7, rx: 1 }],
    ['rect', { x: 10.5, y: 7, width: 3, height: 11, rx: 1 }],
    ['rect', { x: 16, y: 13, width: 3, height: 5, rx: 1 }],
  ],
  more: [
    ['path', { d: 'M4 6h16' }],
    ['path', { d: 'M4 12h16' }],
    ['path', { d: 'M4 18h16' }],
  ],
  plus: [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'M5 12h14' }],
  ],
  pencil: [
    ['path', { d: 'M4 20h4l10-10-4-4L4 16z' }],
    ['path', { d: 'M13.5 6.5l4 4' }],
  ],
  trash: [
    ['path', { d: 'M4 7h16' }],
    ['path', { d: 'M9 7V5h6v2' }],
    ['path', { d: 'M6 7l1 13h10l1-13' }],
  ],
  x: [
    ['path', { d: 'M6 6l12 12' }],
    ['path', { d: 'M18 6 6 18' }],
  ],
  search: [
    ['circle', { cx: 11, cy: 11, r: 6 }],
    ['path', { d: 'M20 20l-3.5-3.5' }],
  ],
  filter: [['path', { d: 'M3 5h18l-7 8v6l-4-2v-4z' }]],
  bell: [
    ['path', { d: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z' }],
    ['path', { d: 'M10 19a2 2 0 0 0 4 0' }],
  ],
  logOut: [
    ['path', { d: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4' }],
    ['path', { d: 'M16 17l5-5-5-5' }],
    ['path', { d: 'M21 12H9' }],
  ],
  shield: [['path', { d: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z' }]],
  globe: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', { d: 'M3 12h18' }],
    ['path', { d: 'M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18' }],
  ],
  chevronDown: [['path', { d: 'M6 9l6 6 6-6' }]],
  chevronLeft: [['path', { d: 'M15 6l-6 6 6 6' }]],
  chevronRight: [['path', { d: 'M9 6l6 6-6 6' }]],
  calendar: [
    ['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }],
    ['path', { d: 'M3 9h18' }],
    ['path', { d: 'M8 3v4' }],
    ['path', { d: 'M16 3v4' }],
  ],
  arrowUp: [
    ['path', { d: 'M12 19V5' }],
    ['path', { d: 'M6 11l6-6 6 6' }],
  ],
  arrowDown: [
    ['path', { d: 'M12 5v14' }],
    ['path', { d: 'M6 13l6 6 6-6' }],
  ],
  wallet2: [
    ['rect', { x: 3, y: 6, width: 18, height: 13, rx: 2 }],
    ['path', { d: 'M3 10h18' }],
  ],
  cart: [
    ['circle', { cx: 9, cy: 20, r: 1.4 }],
    ['circle', { cx: 18, cy: 20, r: 1.4 }],
    ['path', { d: 'M2 3h3l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6' }],
  ],
  home: [
    ['path', { d: 'M3 11l9-7 9 7' }],
    ['path', { d: 'M5 10v10h14V10' }],
    ['path', { d: 'M10 20v-6h4v6' }],
  ],
  car: [
    ['path', { d: 'M5 12l1.6-4.2A2 2 0 0 1 8.5 6.5h7a2 2 0 0 1 1.9 1.3L19 12' }],
    ['path', { d: 'M4 12h16v5H4z' }],
    ['circle', { cx: 7.5, cy: 17, r: 1.4 }],
    ['circle', { cx: 16.5, cy: 17, r: 1.4 }],
  ],
  utensils: [
    ['path', { d: 'M6 3v7a2 2 0 0 0 4 0V3' }],
    ['path', { d: 'M8 10v11' }],
    ['path', { d: 'M17 3c-1.6 0-2.8 1.8-2.8 5s1.2 4 2.8 4' }],
    ['path', { d: 'M17 3v18' }],
  ],
  heart: [
    ['path', { d: 'M12 20s-6.5-4.3-9-8C1.2 9.2 3 5.5 6.3 5.5c2 0 3.3 1.3 4.2 2.5 0 0 1.3-2.5 4.2-2.5C18 5.5 19.8 9.2 18 12c-2.5 3.7-6 8-6 8z' }],
  ],
  cap: [
    ['path', { d: 'M12 4 2 9l10 5 10-5z' }],
    ['path', { d: 'M6 11v4c0 1.5 3 3 6 3s6-1.5 6-3v-4' }],
  ],
  film: [
    ['rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }],
    ['path', { d: 'M3 10h18' }],
    ['path', { d: 'M3 14h18' }],
    ['path', { d: 'M8 5v14' }],
    ['path', { d: 'M16 5v14' }],
  ],
  zap: [['path', { d: 'M13 2 4 14h6l-1 8 9-12h-6z' }]],
  wallet: [
    ['path', { d: 'M3 7a2 2 0 0 1 2-2h12v4' }],
    ['path', { d: 'M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3' }],
    ['path', { d: 'M21 11v4h-4a2 2 0 0 1 0-4z' }],
  ],
  laptop: [
    ['rect', { x: 4, y: 5, width: 16, height: 11, rx: 1 }],
    ['path', { d: 'M2 20h20' }],
  ],
  tag: [
    ['path', { d: 'M3 12 12 3h8v8l-9 9z' }],
    ['circle', { cx: 16, cy: 8, r: 1.2 }],
  ],
} satisfies Record<string, SvgChild[]>

export type IconName = keyof typeof ICONS

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 20, strokeWidth = 2, className }: IconProps) {
  const children = (ICONS[name] as SvgChild[]).map((child, index) =>
    createElement(child[0], { key: index, ...child[1] }),
  )
  return createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
    },
    children,
  )
}
