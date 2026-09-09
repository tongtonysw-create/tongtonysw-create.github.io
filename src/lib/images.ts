// ── 拼豆風格 SVG 圖片生成器（浪漫清新 pastel 配色）─────────────
// 以圓點矩陣模擬拼豆質感，生成 data-uri，無需外部圖床

type Palette = string[]

const PALETTES: Record<string, Palette> = {
  rose: ['#F8E1E7', '#F2C4D0', '#E8A0B4', '#D97B96', '#C05F7E'],
  lilac: ['#EEE7F7', '#DCCDEF', '#C3A8E0', '#A87FCB', '#8B5FBF'],
  sage: ['#E8F1EA', '#CDE3D3', '#A8CCB2', '#7FAE8D', '#5F9070'],
  peach: ['#FDEEE2', '#FADBC2', '#F5C09A', '#EBA071', '#D97F4E'],
  sky: ['#E6F0F7', '#C8DEEF', '#A0C6E3', '#77A9D1', '#5585B5'],
  cream: ['#FBF5EA', '#F5E9D2', '#EDD9B4', '#E0C48E', '#C9A763'],
}

// 簡單 seeded random
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export type Motif = 'heart' | 'flower' | 'star' | 'cat' | 'rainbow' | 'mushroom' | 'cherry' | 'bear'

const MOTIF_GRIDS: Record<Motif, string[]> = {
  heart: [
    '.XX.XX.',
    'XXXXXXX',
    'XXXXXXX',
    '.XXXXX.',
    '..XXX..',
    '...X...',
  ],
  flower: [
    '..X.X..',
    '.XXXXX.',
    'XXXXXXX',
    '.XXXXX.',
    '..X.X..',
    '...X...',
    '..XX...',
  ],
  star: [
    '...X...',
    '..XXX..',
    'XXXXXXX',
    '.XXXXX.',
    '..X.X..',
    '.X...X.',
  ],
  cat: [
    'X.....X',
    'XX...XX',
    'XXXXXXX',
    'X.X.X.X',
    'XXXXXXX',
    'X.XXX.X',
    '.XXXXX.',
  ],
  rainbow: [
    '..XXXXX..',
    '.XXXXXXX.',
    'XXXXXXXXX',
    'XX.....XX',
    'X.......X',
  ],
  mushroom: [
    '..XXXX..',
    '.XXXXXX.',
    'XXXXXXXX',
    'X.XX.XX.',
    '..XXXX..',
    '..X..X..',
    '..XXXX..',
  ],
  cherry: [
    '....X..',
    '...XX..',
    '..X.X..',
    '.X...X.',
    'XX...XX',
    'XX...XX',
    '.X...X.',
  ],
  bear: [
    'XX...XX',
    'XXXXXXX',
    'X.X.X.X',
    'XXXXXXX',
    'X.XXX.X',
    '.XXXXX.',
  ],
}

function svgUri(svg: string): string {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

/** 生成拼豆風格商品圖：淺色底 + 圓點圖案 */
export function beadArt(motif: Motif, paletteName: keyof typeof PALETTES, seed = 7): string {
  const palette = PALETTES[paletteName]
  const grid = MOTIF_GRIDS[motif]
  const rand = rng(seed * 131 + motif.length * 17)
  const cell = 60
  const rows = grid.length
  const cols = Math.max(...grid.map((r) => r.length))
  const w = cols * cell + 120
  const h = rows * cell + 120
  const bg = palette[0]
  let dots = ''
  const ox = 60
  const oy = 60
  grid.forEach((row, r) => {
    row.split('').forEach((ch, c) => {
      if (ch !== 'X') return
      const color = palette[1 + Math.floor(rand() * (palette.length - 1))]
      dots += `<circle cx="${ox + c * cell + cell / 2}" cy="${oy + r * cell + cell / 2}" r="${cell * 0.42}" fill="${color}"/>` +
        `<circle cx="${ox + c * cell + cell / 2 - 6}" cy="${oy + r * cell + cell / 2 - 6}" r="${cell * 0.12}" fill="rgba(255,255,255,0.55)"/>`
    })
  })
  // 背景散落小珠
  let sprinkles = ''
  for (let i = 0; i < 14; i++) {
    const x = rand() * w
    const y = rand() * h
    sprinkles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(4 + rand() * 6).toFixed(1)}" fill="${palette[2]}" opacity="0.35"/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="24" fill="${bg}"/>${sprinkles}${dots}</svg>`
  return svgUri(svg)
}

/** 生成柔和漸層情境圖（hero / banner / about 用） */
export function pastelScene(paletteName: keyof typeof PALETTES, seed = 3, label = ''): string {
  const palette = PALETTES[paletteName]
  const rand = rng(seed * 977 + 13)
  const w = 1200
  const h = 700
  let beads = ''
  for (let i = 0; i < 90; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 6 + rand() * 22
    const color = palette[1 + Math.floor(rand() * (palette.length - 1))]
    beads += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${color}" opacity="${(0.25 + rand() * 0.45).toFixed(2)}"/>` +
      `<circle cx="${(x - r * 0.25).toFixed(0)}" cy="${(y - r * 0.25).toFixed(0)}" r="${(r * 0.22).toFixed(1)}" fill="rgba(255,255,255,0.5)"/>`
  }
  const text = label
    ? `<text x="${w / 2}" y="${h / 2 + 20}" font-family="Georgia, serif" font-size="54" fill="#8a5a6b" text-anchor="middle" font-style="italic">${label}</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>${beads}${text}</svg>`
  return svgUri(svg)
}
