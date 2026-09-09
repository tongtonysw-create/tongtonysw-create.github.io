// ── 頂部導航：語言切換 / 貨幣切換 / 購物籃按鈕 ──────────────────
import { ShoppingBag, Sparkles, Globe, Coins } from 'lucide-react'
import { useStore, t } from '@/lib/store'

export default function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { lang, setLang, currency, setCurrency, cart, db } = useStore()
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {/* 公告欄 */}
      <div className="rose-gradient text-white text-center text-sm py-2 px-4 font-body tracking-wide">
        {db.site.announcement[lang]}
      </div>
      <header className="sticky top-0 z-40 bg-[#fdf8f4]/90 backdrop-blur border-b border-[#f3dde3]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <a href="#/" className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 rounded-full rose-gradient flex items-center justify-center text-white shrink-0">
              <Sparkles size={18} />
            </span>
            <span className="font-display text-xl font-semibold text-[#a5566f] truncate">
              {db.site.shopName[lang]}
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-body">
            <a href="#shop" className="hover:text-[#c4718b] transition-colors">{t.shop[lang]}</a>
            <a href="#about" className="hover:text-[#c4718b] transition-colors">{t.about[lang]}</a>
            <a href="#reviews" className="hover:text-[#c4718b] transition-colors">{t.reviews[lang]}</a>
            <a href="#faq" className="hover:text-[#c4718b] transition-colors">{t.faq[lang]}</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* 語言切換 */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border border-[#e8c3cf] hover:bg-[#f7e6ea] transition-colors"
              title="繁中 / English"
            >
              <Globe size={14} className="text-[#c4718b]" />
              {lang === 'zh' ? 'EN' : '繁中'}
            </button>
            {/* 貨幣切換 */}
            <button
              onClick={() => setCurrency(currency === 'HKD' ? 'CNY' : 'HKD')}
              className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full border border-[#e8c3cf] hover:bg-[#f7e6ea] transition-colors"
              title="HKD / RMB"
            >
              <Coins size={14} className="text-[#c4718b]" />
              {currency === 'HKD' ? 'HK$' : '¥ RMB'}
            </button>
            {/* 購物籃 */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 rose-gradient text-white text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">{t.cart[lang]}</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#5a4550] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
