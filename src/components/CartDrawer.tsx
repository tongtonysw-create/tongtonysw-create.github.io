// ── 購物籃抽屜：數量增減、小計、HK$300 免運進度條 ────────────────
import { X, Minus, Plus, Trash2, Truck } from 'lucide-react'
import { useStore, t, fmtPrice, FREE_SHIPPING_HKD } from '@/lib/store'
import { SHIPPING_FEE_HKD } from '@/lib/seed'

export function useCartTotals() {
  const { cart, db } = useStore()
  const subtotal = cart.reduce((s, i) => {
    const p = db.products.find((x) => x.id === i.productId)
    return s + (p ? p.priceHKD * i.qty : 0)
  }, 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_HKD ? 0 : SHIPPING_FEE_HKD
  return { subtotal, shipping, total: subtotal + shipping }
}

export default function CartDrawer({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const { lang, currency, cart, db, updateQty, removeFromCart } = useStore()
  const { subtotal, shipping, total } = useCartTotals()
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_HKD) * 100)
  const remaining = Math.max(0, FREE_SHIPPING_HKD - subtotal)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#5a4550]/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#fdf8f4] shadow-2xl slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3dde3]">
          <h2 className="font-display text-xl font-bold text-[#5a4550]">{t.cart[lang]}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f7e6ea] transition-colors">
            <X size={20} className="text-[#a5566f]" />
          </button>
        </div>

        {/* 免運進度 */}
        <div className="px-6 py-4 bg-[#f7e6ea]/60 border-b border-[#f3dde3]">
          <div className="flex items-center gap-2 text-sm font-body text-[#8a6d78] mb-2">
            <Truck size={16} className="text-[#c4718b]" />
            {remaining > 0 ? (
              <span>
                {t.freeShipHint1[lang]} <b className="text-[#a5566f]">{fmtPrice(remaining, currency)}</b> {t.freeShipHint2[lang]}
              </span>
            ) : (
              <span className="text-[#3d6b4f] font-medium">{t.freeShipReached[lang]}</span>
            )}
          </div>
          <div className="h-2.5 bg-white rounded-full overflow-hidden border border-[#f3dde3]">
            <div className="h-full rose-gradient rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] text-[#b39aa5] mt-1.5 font-body">
            {lang === 'zh' ? `免運門檻 HK$${FREE_SHIPPING_HKD}` : `Free shipping threshold HK$${FREE_SHIPPING_HKD}`}
          </p>
        </div>

        {/* 商品列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-lg text-[#8a6d78] mb-1">{t.emptyCart[lang]}</p>
              <p className="font-body text-sm text-[#b39aa5]">{t.emptyCartHint[lang]}</p>
            </div>
          ) : (
            cart.map((item) => {
              const p = db.products.find((x) => x.id === item.productId)
              if (!p) return null
              return (
                <div key={item.productId} className="flex gap-3 soft-card rounded-2xl p-3 fade-in">
                  <img src={p.image} alt={p.name[lang]} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-body text-sm font-medium text-[#5a4550] leading-snug">{p.name[lang]}</h4>
                      <button onClick={() => removeFromCart(item.productId)} className="text-[#d9a7b8] hover:text-[#a5566f] transition-colors shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-[#b39aa5] font-body mt-0.5">{fmtPrice(p.priceHKD, currency)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-[#f3dde3] rounded-full px-1 py-0.5 bg-white">
                        <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-6 h-6 rounded-full hover:bg-[#f7e6ea] flex items-center justify-center transition-colors">
                          <Minus size={12} className="text-[#a5566f]" />
                        </button>
                        <span className="text-sm font-body w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, Math.min(item.qty + 1, p.stock))}
                          className="w-6 h-6 rounded-full hover:bg-[#f7e6ea] flex items-center justify-center transition-colors"
                        >
                          <Plus size={12} className="text-[#a5566f]" />
                        </button>
                      </div>
                      <span className="font-display font-semibold text-[#a5566f]">{fmtPrice(p.priceHKD * item.qty, currency)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 小計 + 結帳 */}
        {cart.length > 0 && (
          <div className="border-t border-[#f3dde3] px-6 py-5 bg-white">
            <div className="flex justify-between text-sm font-body text-[#8a6d78] mb-1.5">
              <span>{t.subtotal[lang]}</span>
              <span>{fmtPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm font-body text-[#8a6d78] mb-2">
              <span>{t.shipping[lang]}</span>
              <span className={shipping === 0 ? 'text-[#3d6b4f] font-medium' : ''}>
                {shipping === 0 ? t.free[lang] : fmtPrice(shipping, currency)}
              </span>
            </div>
            <div className="flex justify-between font-display text-lg font-bold text-[#5a4550] mb-4">
              <span>{t.total[lang]}</span>
              <span>{fmtPrice(total, currency)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full rose-gradient text-white font-body py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#c4718b]/25"
            >
              {t.checkout[lang]} →
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
