// ── 結帳彈窗：填資料 → 下單 → 自動寄確認信 + 店主通知 ────────────
import { useState } from 'react'
import { X, CheckCircle2, CreditCard, Smartphone, Wallet, MessageCircle } from 'lucide-react'
import { useStore, t, fmtPrice } from '@/lib/store'
import { useCartTotals } from './CartDrawer'
import { sendOrderEmails } from '@/lib/email'
import { waMeOrderLink } from '@/lib/whatsapp'
import type { Order } from '@/lib/types'

const PAYMENTS: { id: string | ((l: 'zh' | 'en') => string); icon: typeof CreditCard }[] = [
  { id: 'FPS 轉數快', icon: Smartphone },
  { id: 'PayMe', icon: Wallet },
  { id: 'AlipayHK / WeChat Pay', icon: Smartphone },
  { id: (l) => (l === 'zh' ? '信用卡 Credit Card' : 'Credit Card'), icon: CreditCard },
]

export default function CheckoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, currency, cart, db, clearCart, placeOrder, logEmail } = useStore()
  const { subtotal, shipping, total } = useCartTotals()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', note: '' })
  const [payment, setPayment] = useState('FPS 轉數快')
  const [error, setError] = useState('')
  const [done, setDone] = useState<Order | null>(null)
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(t.coFillAll[lang])
      return
    }
    setError('')
    setBusy(true)
    const items = cart
      .map((i) => {
        const p = db.products.find((x) => x.id === i.productId)
        return p ? { productId: p.id, name: p.name, qty: i.qty, priceHKD: p.priceHKD } : null
      })
      .filter(Boolean) as Order['items']
    const order = placeOrder({
      items,
      subtotalHKD: subtotal,
      shippingHKD: shipping,
      totalHKD: total,
      currency,
      customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim() },
      payment,
      note: form.note.trim(),
    })
    // 自動發送：客人確認信 + 店主新訂單通知
    await sendOrderEmails(db.emailSettings, logEmail, order)
    setBusy(false)
    setDone(order)
    clearCart()
  }

  const inputCls =
    'w-full font-body text-sm px-4 py-2.5 rounded-xl border border-[#f3dde3] bg-white focus:outline-none focus:ring-2 focus:ring-[#e8c3cf] text-[#5a4550]'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#5a4550]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#fdf8f4] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3dde3] sticky top-0 bg-[#fdf8f4] rounded-t-3xl z-10">
          <h2 className="font-display text-xl font-bold text-[#5a4550]">{done ? t.coSuccess[lang] : t.coTitle[lang]}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f7e6ea] transition-colors">
            <X size={20} className="text-[#a5566f]" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 size={56} className="text-[#8fb49b] mx-auto mb-4" />
            <p className="font-body text-sm text-[#8a6d78] mb-2">{t.coOrderNo[lang]}</p>
            <p className="font-display text-3xl font-bold text-[#a5566f] mb-6">{done.id}</p>
            <p className="font-body text-sm text-[#8a6d78] leading-relaxed mb-8 max-w-sm mx-auto">{t.coSuccessHint[lang]}</p>
            <div className="soft-card rounded-2xl p-4 text-left mb-6">
              {done.items.map((i) => (
                <div key={i.productId} className="flex justify-between text-sm font-body py-1">
                  <span className="text-[#5a4550]">{i.name[lang]} × {i.qty}</span>
                  <span className="text-[#a5566f]">{fmtPrice(i.priceHKD * i.qty, currency)}</span>
                </div>
              ))}
              <div className="border-t border-[#f3dde3] mt-2 pt-2 flex justify-between font-semibold font-display">
                <span>{t.total[lang]}</span>
                <span className="text-[#a5566f]">{fmtPrice(done.totalHKD, currency)}</span>
              </div>
            </div>
            <button onClick={onClose} className="rose-gradient text-white font-body px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
              {lang === 'zh' ? '繼續購物 🌸' : 'Continue Shopping 🌸'}
            </button>
            {db.notify.waPhone && (
              <a
                href={waMeOrderLink(db.notify, done)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 font-body px-8 py-3 rounded-full border border-[#25D366]/50 text-[#1da851] hover:bg-[#25D366]/10 transition-colors"
              >
                <MessageCircle size={16} />
                {lang === 'zh' ? 'WhatsApp 傳送訂單俾店主' : 'Send Order via WhatsApp'}
              </a>
            )}
          </div>
        ) : (
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} placeholder={t.coName[lang]} value={form.name} onChange={set('name')} />
              <input className={inputCls} placeholder={t.coPhone[lang]} value={form.phone} onChange={set('phone')} />
            </div>
            <input className={inputCls} type="email" placeholder={t.coEmail[lang]} value={form.email} onChange={set('email')} />
            <input className={inputCls} placeholder={t.coAddress[lang]} value={form.address} onChange={set('address')} />
            <textarea className={inputCls} rows={2} placeholder={t.coNote[lang]} value={form.note} onChange={set('note')} />

            <div>
              <p className="font-body text-sm text-[#8a6d78] mb-2">{t.coPayment[lang]}</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENTS.map((p) => {
                  const label = typeof p.id === 'function' ? p.id(lang) : p.id
                  const Icon = p.icon
                  return (
                    <button
                      key={label}
                      onClick={() => setPayment(label)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-body transition-all ${
                        payment === label ? 'border-[#c4718b] bg-[#f7e6ea] text-[#a5566f]' : 'border-[#f3dde3] bg-white text-[#8a6d78] hover:bg-[#fdf1f4]'
                      }`}
                    >
                      <Icon size={16} /> {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="soft-card rounded-2xl p-4">
              <div className="flex justify-between text-sm font-body text-[#8a6d78] py-0.5">
                <span>{t.subtotal[lang]}</span>
                <span>{fmtPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-body text-[#8a6d78] py-0.5">
                <span>{t.shipping[lang]}</span>
                <span>{shipping === 0 ? t.free[lang] : fmtPrice(shipping, currency)}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-[#5a4550] pt-1.5">
                <span>{t.total[lang]}</span>
                <span className="text-[#a5566f]">{fmtPrice(total, currency)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-[#c05f7e] font-body">{error}</p>}
            <button
              onClick={submit}
              disabled={busy}
              className="w-full rose-gradient text-white font-body py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? '…' : `${t.coPlace[lang]} · ${fmtPrice(total, currency)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
