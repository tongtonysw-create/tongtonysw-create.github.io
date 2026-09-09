// ── 後台「中英翻譯」輔助：電商常用詞典 + 句型轉換 ────────────────
// 誠實說明：這是內建詞典式輔助翻譯，覆蓋本店常用文案；
// 無法翻譯的句子會保留原文並加標記，方便人手跟進。

const ZH_EN: Array<[string, string]> = [
  ['拼豆', 'fuse beads'],
  ['套裝', 'kit'],
  ['禮盒', 'gift box'],
  ['補充包', 'refill pack'],
  ['圖紙', 'pattern'],
  ['個人化', 'custom'],
  ['設計', 'design'],
  ['電子檔', 'digital file'],
  ['模板', 'pegboard'],
  ['燙斗', 'iron'],
  ['燙紙', 'ironing paper'],
  ['鑷子', 'tweezers'],
  ['分豆盤', 'sorting tray'],
  ['迷你', 'mini'],
  ['透明', 'clear'],
  ['精準', 'precision'],
  ['運費', 'shipping fee'],
  ['免運', 'free shipping'],
  ['免運費', 'free shipping'],
  ['現貨', 'in stock'],
  ['缺貨', 'out of stock'],
  ['訂單', 'order'],
  ['發貨', 'shipping'],
  ['工作天', 'working days'],
  ['香港', 'Hong Kong'],
  ['順豐', 'SF Express'],
  ['智能櫃', 'locker'],
  ['付款', 'payment'],
  ['退貨', 'return'],
  ['退款', 'refund'],
  ['退換', 'exchange'],
  ['顏色', 'colour'],
  ['色', '-colour'],
  ['粒', ' pcs'],
  ['新手', 'beginners'],
  ['相片', 'photo'],
  ['電郵', 'email'],
  ['滿', 'over'],
  ['首單', 'first order'],
  ['會員', 'member'],
  ['折', '% off'],
  ['原創', 'original'],
  ['療癒系', 'healing-style'],
  ['貓貓', 'cats'],
  ['小熊', 'bears'],
  ['蘑菇', 'mushrooms'],
  ['心心', 'hearts'],
  ['愛心', 'heart'],
  ['小花', 'flowers'],
  ['彩虹', 'rainbow'],
  ['雲朵', 'clouds'],
  ['春日', 'spring'],
  ['初戀', 'first love'],
  ['柔和', 'pastel'],
  ['清新', 'fresh'],
  ['浪漫', 'romantic'],
  ['店主', 'shop owner'],
  ['精選', 'curated'],
  ['一對一', '1-on-1'],
  ['調色', 'colour tuning'],
  ['色號清單', 'bead colour list'],
  ['即買即印', 'instant download'],
  ['送禮自用皆宜', 'great for gifting or yourself'],
  ['係', 'is'],
  ['嘅', "'s"],
  ['咗', ''],
  ['唔', 'not '],
  ['冇', 'no '],
  ['俾', 'to'],
  ['哋', 's'],
  ['喺', 'at'],
  ['嚟', ''],
  ['啲', 'some '],
]

/** 粗略中→英翻譯（詞典替換 + 標記未覆蓋中文） */
export function translateZhToEn(zh: string): string {
  if (!zh.trim()) return ''
  let out = zh
  // 長詞優先
  const sorted = [...ZH_EN].sort((a, b) => b[0].length - a[0].length)
  for (const [z, e] of sorted) {
    out = out.split(z).join(` ${e} `)
  }
  // 標點轉換
  out = out.replace(/，/g, ', ').replace(/。/g, '. ').replace(/！/g, '! ').replace(/？/g, '? ').replace(/：/g, ': ').replace(/（/g, ' (').replace(/）/g, ') ').replace(/、/g, ', ')
  out = out.replace(/\s+/g, ' ').trim()
  // 仍有中文 → 標記需人工跟進
  if (/[\u4e00-\u9fff]/.test(out)) {
    out = `[請人手核對 / needs review] ${out}`
  }
  return out.charAt(0).toUpperCase() + out.slice(1)
}

/** 粗略英→中（反向詞典） */
export function translateEnToZh(en: string): string {
  if (!en.trim()) return ''
  let out = en
  const sorted = [...ZH_EN].sort((a, b) => b[1].length - a[1].length)
  for (const [z, e] of sorted) {
    if (!e.trim()) continue
    out = out.replace(new RegExp(e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), z)
  }
  if (/[a-zA-Z]{4,}/.test(out)) {
    out = `[請人手核對] ${out}`
  }
  return out
}
