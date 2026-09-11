// ── WhatsApp 通知：CallMeBot 免費 API 發訊俾店主 + wa.me 客人確認連結 ──
// CallMeBot 只可以發訊去「已啟動 APIKEY 嘅號碼」（即店主自己），唔可以發俾客人。
import type { NotifySettings, Order } from './types'

/** 將訂單整理做 WhatsApp 訊息（俾店主嘅通知 / 客人確認用同一份） */
export function orderMessage(o: Order): string {
  const lines = [
    `🌸 Beadoria 新訂單 ${o.id}`,
    ``,
    `👤 客人：${o.customer.name}`,
    `📞 電話：${o.customer.phone}`,
    `📧 電郵：${o.customer.email}`,
    `🏠 地址：${o.customer.address}`,
    ``,
    `🛒 商品：`,
    ...o.items.map((i) => `・${i.name.zh} ×${i.qty} — HK$${i.priceHKD * i.qty}`),
    ``,
    `小計 HK$${o.subtotalHKD}｜運費 ${o.shippingHKD === 0 ? '免費' : `HK$${o.shippingHKD}`}`,
    `💰 合計：HK$${o.totalHKD}（${o.payment}）`,
  ]
  if (o.note) lines.push(`📝 備註：${o.note}`)
  lines.push(``, `🕐 ${new Date(o.createdAt).toLocaleString('zh-HK')}`)
  return lines.join('\n')
}

/** 落單後自動 WhatsApp 通知店主（CallMeBot；no-cors 防火牆式，失敗唔影響落單） */
export async function sendWhatsAppNotify(n: NotifySettings, o: Order): Promise<boolean> {
  if (!n.enabled || !n.waPhone || !n.waApiKey) return false
  try {
    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(n.waPhone)}` +
      `&apikey=${encodeURIComponent(n.waApiKey)}&text=${encodeURIComponent(orderMessage(o))}`
    await fetch(url, { mode: 'no-cors' }) // CallMeBot 無 CORS header；no-cors 照樣會送出請求
    return true
  } catch (e) {
    console.warn('[whatsapp] notify failed:', e)
    return false
  }
}

/** 後台測試用：發一則測試訊息確認 APIKEY 有效 */
export async function sendWhatsAppTest(n: NotifySettings): Promise<boolean> {
  if (!n.waPhone || !n.waApiKey) return false
  try {
    const text = `🌸 Beadoria 測試訊息：WhatsApp 新訂單通知已接通！（${new Date().toLocaleString('zh-HK')}）`
    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(n.waPhone)}` +
      `&apikey=${encodeURIComponent(n.waApiKey)}&text=${encodeURIComponent(text)}`
    await fetch(url, { mode: 'no-cors' })
    return true
  } catch (e) {
    console.warn('[whatsapp] test failed:', e)
    return false
  }
}

/** 客人確認用 wa.me 連結（撳開 WhatsApp 直接帶埋訂單內容俾店主） */
export function waMeOrderLink(n: NotifySettings, o: Order): string {
  const phone = n.waPhone.replace(/[^0-9]/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(orderMessage(o))}`
}
