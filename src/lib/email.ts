// ── 電郵通知：EmailJS 真實發送（已設定時）+ 發件日誌 ─────────────
import type { EmailLog, EmailSettings, Lang, Order } from './types'
import { fmtPrice } from './store'

type LogFn = (e: Omit<EmailLog, 'id' | 'createdAt'>) => void

async function sendViaEmailJS(settings: EmailSettings, to: string, subject: string, body: string): Promise<boolean> {
  if (!settings.enabled || !settings.emailjsServiceId || !settings.emailjsTemplateId || !settings.emailjsPublicKey) {
    return false
  }
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: settings.emailjsServiceId,
        template_id: settings.emailjsTemplateId,
        user_id: settings.emailjsPublicKey,
        template_params: { to_email: to, subject, message: body },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

async function dispatch(
  settings: EmailSettings,
  log: LogFn,
  kind: EmailLog['kind'],
  to: string,
  subject: string,
  body: string,
) {
  const canSend = settings.enabled && settings.emailjsServiceId && settings.emailjsTemplateId && settings.emailjsPublicKey
  let status: EmailLog['status'] = 'simulated'
  if (canSend) {
    status = (await sendViaEmailJS(settings, to, subject, body)) ? 'sent' : 'failed'
  }
  log({ kind, to, subject, body, status })
}

function orderLines(o: Order, lang: Lang): string {
  return o.items
    .map((i) => `  - ${i.name[lang]} × ${i.qty} = ${fmtPrice(i.priceHKD * i.qty, o.currency)}`)
    .join('\n')
}

/** 下單後：客人確認信 + 店主新訂單通知 */
export async function sendOrderEmails(settings: EmailSettings, log: LogFn, o: Order) {
  const zhBody =
    `親愛的 ${o.customer.name}：\n\n多謝你嘅訂單！以下係訂單詳情：\n\n訂單編號：${o.id}\n${orderLines(o, 'zh')}\n\n小計：${fmtPrice(o.subtotalHKD, o.currency)}\n運費：${o.shippingHKD === 0 ? '免費' : fmtPrice(o.shippingHKD, o.currency)}\n合計：${fmtPrice(o.totalHKD, o.currency)}\n付款方式：${o.payment}\n送貨地址：${o.customer.address}\n\n我哋會盡快為你準備，發貨時會再電郵通知你。\n\nBeadoria 拼豆物語 🌸`
  await dispatch(settings, log, 'order_confirmation', o.customer.email, `[Beadoria] 訂單確認 Order Confirmation ${o.id}`, zhBody)

  const adminBody =
    `新訂單通知 🎉\n\n訂單編號：${o.id}\n客人：${o.customer.name}（${o.customer.email} / ${o.customer.phone}）\n${orderLines(o, 'zh')}\n合計：${fmtPrice(o.totalHKD, o.currency)}\n付款方式：${o.payment}\n地址：${o.customer.address}\n備註：${o.note || '—'}\n時間：${new Date(o.createdAt).toLocaleString('zh-HK')}\n\n請到後台「訂單管理」跟進。`
  await dispatch(settings, log, 'admin_alert', settings.notifyEmail, `[Beadoria 後台] 新訂單 ${o.id} — ${fmtPrice(o.totalHKD, o.currency)}`, adminBody)
}

/** 發貨時：客人發貨通知 */
export async function sendShippingEmail(settings: EmailSettings, log: LogFn, o: Order) {
  const body =
    `親愛的 ${o.customer.name}：\n\n好消息！你嘅訂單 ${o.id} 已經發貨 📦\n\n${orderLines(o, 'zh')}\n\n香港訂單一般 2-4 個工作天送到，請留意順豐通知。\n多謝支持 Beadoria 拼豆物語 🌸`
  await dispatch(settings, log, 'shipping', o.customer.email, `[Beadoria] 訂單已發貨 Order Shipped ${o.id}`, body)
}
