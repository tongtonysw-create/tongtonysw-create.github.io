// ── AI 客服引擎：雙語意圖識別 + 即時讀取庫存 / 問答庫 / 訂單 ──
import type { Lang, Order, Product, QA } from './types'
import { fmtPrice, HKD_TO_CNY } from './store'
import { FREE_SHIPPING_HKD, SHIPPING_FEE_HKD } from './seed'

export interface ChatReply {
  text: string
  suggestions?: string[]
}

function detectLang(input: string): Lang {
  return /[\u4e00-\u9fff]/.test(input) ? 'zh' : 'en'
}

function statusText(o: Order, lang: Lang): string {
  const map: Record<Order['status'], { zh: string; en: string }> = {
    pending: { zh: '待付款', en: 'Pending payment' },
    paid: { zh: '已付款，準備出貨中', en: 'Paid — being prepared' },
    shipped: { zh: '已發貨 📦', en: 'Shipped 📦' },
    completed: { zh: '已完成 ✅', en: 'Completed ✅' },
    cancelled: { zh: '已取消', en: 'Cancelled' },
  }
  return map[o.status][lang]
}

function stockLine(p: Product, lang: Lang): string {
  const name = p.name[lang]
  if (p.stock <= 0) return lang === 'zh' ? `「${name}」暫時缺貨 😢 到貨會第一時間通知你。` : `"${name}" is out of stock 😢 We'll let you know once it's back.`
  if (p.stock <= 10)
    return lang === 'zh'
      ? `「${name}」得返 ${p.stock} 件，售價 ${fmtPrice(p.priceHKD, 'HKD')}，想買要快啦！`
      : `Only ${p.stock} left of "${name}" at ${fmtPrice(p.priceHKD, 'HKD')} — grab it soon!`
  return lang === 'zh'
    ? `「${name}」有現貨 ${p.stock} 件，售價 ${fmtPrice(p.priceHKD, 'HKD')}。`
    : `"${name}" is in stock (${p.stock} pcs) at ${fmtPrice(p.priceHKD, 'HKD')}.`
}

function scoreQA(qa: QA, input: string): number {
  const lower = input.toLowerCase()
  let score = 0
  for (const kw of qa.keywords) {
    if (kw && lower.includes(kw.toLowerCase())) score += kw.length
  }
  // 問題本身字詞重疊
  for (const w of qa.question.zh.split(/[\s，。？！?,!]/)) {
    if (w.length >= 2 && input.includes(w)) score += 1
  }
  for (const w of qa.question.en.toLowerCase().split(/[\s?,!]+/)) {
    if (w.length >= 3 && lower.includes(w)) score += 1
  }
  return score
}

export function getChatReply(
  input: string,
  ctx: { products: Product[]; qas: QA[]; orders: Order[]; currency: 'HKD' | 'CNY' },
): ChatReply {
  const lang = detectLang(input)
  const lower = input.toLowerCase().trim()

  // 打招呼
  if (/^(hi|hello|hey|你好|哈囉|喂|早晨|嗨)/.test(lower)) {
    return {
      text:
        lang === 'zh'
          ? '你好呀 🌸 我係小豆子，可以幫你查庫存、運費、訂單狀態，或者介紹商品同訂製圖紙。有咩可以幫到你？'
          : "Hi there 🌸 I'm Beady! I can check stock, shipping, order status, or tell you about our kits & custom patterns. How can I help?",
      suggestions: lang === 'zh' ? ['運費點計？', '有咩熱賣？', '查訂單 BD-'] : ['Shipping cost?', "What's popular?", 'Track order BD-'],
    }
  }

  // 訂單查詢
  const orderMatch = input.match(/BD-?\s*(\d{4,6})/i)
  if (orderMatch) {
    const id = `BD-${orderMatch[1]}`
    const order = ctx.orders.find((o) => o.id === id)
    if (!order) {
      return {
        text:
          lang === 'zh'
            ? `搵唔到訂單 ${id} 😅 請確認編號，或者話我知你落單用嘅電郵，我幫你再查。`
            : `I couldn't find order ${id} 😅 Please double-check the number, or tell me the email used at checkout.`,
      }
    }
    const items = order.items.map((i) => `${i.name[lang]} × ${i.qty}`).join(lang === 'zh' ? '、' : ', ')
    return {
      text:
        lang === 'zh'
          ? `訂單 ${order.id} 狀態：${statusText(order, lang)}\n商品：${items}\n合計：${fmtPrice(order.totalHKD, ctx.currency)}\n落單時間：${new Date(order.createdAt).toLocaleString('zh-HK')}`
          : `Order ${order.id}: ${statusText(order, lang)}\nItems: ${items}\nTotal: ${fmtPrice(order.totalHKD, ctx.currency)}\nPlaced: ${new Date(order.createdAt).toLocaleString('en-HK')}`,
    }
  }
  if (/(訂單|單號|order).*(查|狀態|track|status)|(查|track).*(訂單|order)/.test(lower)) {
    return {
      text:
        lang === 'zh'
          ? '請提供訂單編號（格式 BD-XXXXXX），我即刻幫你查！落單後嘅確認電郵入面有編號㗎。'
          : 'Please share your order number (format BD-XXXXXX) — it is in your confirmation email.',
    }
  }

  // 庫存 / 價錢查詢：匹配商品（完整名稱 + 雙字重疊評分）
  const bigramHits = (name: string): number => {
    let hits = 0
    for (let i = 0; i < name.length - 1; i++) {
      const bg = name.slice(i, i + 2)
      if (!/[\s（）()·+]/.test(bg) && input.includes(bg)) hits++
    }
    return hits
  }
  const matched = ctx.products.filter((p) => {
    if (lower.includes(p.name.zh.toLowerCase()) || lower.includes(p.name.en.toLowerCase())) return true
    if (bigramHits(p.name.zh) >= 2) return true
    return p.name.en.toLowerCase().split(' ').some((w) => w.length >= 4 && lower.includes(w))
  })
  const asksStock = /(有冇|有無|貨|庫存|stock|available|買到|剩)/.test(lower)
  const asksPrice = /(幾錢|價錢|價格|price|how much|多少錢|貴)/.test(lower)
  if (matched.length > 0 && (asksStock || asksPrice)) {
    return { text: matched.slice(0, 3).map((p) => stockLine(p, lang)).join('\n') }
  }

  // 熱賣推薦
  if (/(熱賣|推薦|推介|受歡迎|popular|recommend|best ?seller|有咩好)/.test(lower)) {
    const feats = ctx.products.filter((p) => p.featured && p.stock > 0).slice(0, 3)
    const list = feats.map((p) => `• ${p.name[lang]} — ${fmtPrice(p.priceHKD, ctx.currency)}`).join('\n')
    return {
      text:
        (lang === 'zh' ? '店主精選推介俾你 🌷\n' : "Here are our editor's picks 🌷\n") + list,
    }
  }

  // 運費捷徑（即使問答庫有都優先用即時數字）
  if (/(運費|免運|郵費|shipping|delivery|送貨|幾耐|how long)/.test(lower)) {
    return {
      text:
        lang === 'zh'
          ? `全單滿 HK$${FREE_SHIPPING_HKD}（約 ¥${Math.round(FREE_SHIPPING_HKD * HKD_TO_CNY)}）免運費；未滿劃一 HK$${SHIPPING_FEE_HKD}。香港 2-4 個工作天送到，內地約 5-8 個工作天。`
          : `Free shipping over HK$${FREE_SHIPPING_HKD} (≈ ¥${Math.round(FREE_SHIPPING_HKD * HKD_TO_CNY)}); otherwise a flat HK$${SHIPPING_FEE_HKD}. 2–4 working days in HK, 5–8 to the mainland.`,
    }
  }

  // 問答庫匹配（後台可增刪改）
  let best: QA | null = null
  let bestScore = 0
  for (const qa of ctx.qas) {
    const s = scoreQA(qa, input)
    if (s > bestScore) {
      bestScore = s
      best = qa
    }
  }
  if (best && bestScore >= 2) {
    return { text: best.answer[lang] }
  }

  // 商品大類查詢
  if (/(拼豆|bead|珠)/.test(lower)) {
    const beads = ctx.products.filter((p) => p.category === 'beads')
    const list = beads.map((p) => `• ${p.name[lang]} — ${fmtPrice(p.priceHKD, ctx.currency)}（${p.stock > 0 ? (lang === 'zh' ? '有現貨' : 'in stock') : (lang === 'zh' ? '缺貨' : 'out of stock')}）`).join('\n')
    return { text: (lang === 'zh' ? '我哋嘅拼豆系列 🎨\n' : 'Our bead collections 🎨\n') + list }
  }
  if (/(工具|設備|燙斗|模板|鑷子|tool|iron|pegboard)/.test(lower)) {
    const tools = ctx.products.filter((p) => p.category === 'tools')
    const list = tools.map((p) => `• ${p.name[lang]} — ${fmtPrice(p.priceHKD, ctx.currency)}`).join('\n')
    return { text: (lang === 'zh' ? '工具設備一覽 🛠️\n' : 'Tools & equipment 🛠️\n') + list }
  }

  // fallback
  return {
    text:
      lang === 'zh'
        ? '呢個問題我要請教店主先 🙈 你可以問我運費、庫存、訂單狀態（提供 BD- 編號）、付款方式或者訂製圖紙，呢啲我即刻答到你！'
        : "I'll need to check with the owner on that one 🙈 But I can instantly answer questions about shipping, stock, order status (give me a BD- number), payment, or custom patterns!",
    suggestions: lang === 'zh' ? ['運費點計？', '有冇心心套裝？', '查訂單'] : ['Shipping cost?', 'Heart kit in stock?', 'Track order'],
  }
}
