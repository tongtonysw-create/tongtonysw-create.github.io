// ── 關於 / 評價 / FAQ / 頁尾（全部讀取後台可編輯內容）────────────
import { useState } from 'react'
import { ChevronDown, Star, Heart } from 'lucide-react'
import { useStore, t } from '@/lib/store'

export function About() {
  const { lang, db } = useStore()
  return (
    <section id="about" className="bg-[#f7e6ea]/40 py-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <img src={db.site.aboutImage} alt="about" className="rounded-[2rem] w-full object-cover shadow-xl shadow-[#c4718b]/15 -rotate-1 hover:rotate-0 transition-transform duration-500" />
        <div>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-[#c4718b] mb-2">Our Story</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#5a4550] mb-5">{db.site.aboutTitle[lang]}</h2>
          <p className="font-body text-[#8a6d78] leading-relaxed text-base md:text-lg">{db.site.aboutText[lang]}</p>
        </div>
      </div>
    </section>
  )
}

export function Reviews() {
  const { lang, db } = useStore()
  return (
    <section id="reviews" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-[#c4718b] mb-2">Reviews</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#5a4550]">{t.reviews[lang]}</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {db.reviews.map((r) => (
          <div key={r.id} className="soft-card rounded-3xl p-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} className={i < r.rating ? 'text-[#e8a0b4] fill-[#e8a0b4]' : 'text-[#f3dde3]'} />
              ))}
            </div>
            <p className="font-body text-sm text-[#5a4550] leading-relaxed mb-4 min-h-[3.5rem]">{r.text[lang]}</p>
            <p className="font-display font-semibold text-[#a5566f] text-sm">{r.name}</p>
            <p className="font-body text-xs text-[#b39aa5]">{r.productName[lang]}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function FaqSection() {
  const { lang, db } = useStore()
  const [openId, setOpenId] = useState<string | null>(db.faqs[0]?.id ?? null)
  return (
    <section id="faq" className="bg-[#e8f1ea]/40 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-[#c4718b] mb-2">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#5a4550]">{t.faq[lang]}</h2>
        </div>
        <div className="space-y-3">
          {db.faqs.map((f) => (
            <div key={f.id} className="soft-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenId(openId === f.id ? null : f.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-body font-medium text-[#5a4550]">{f.q[lang]}</span>
                <ChevronDown size={18} className={`text-[#c4718b] transition-transform ${openId === f.id ? 'rotate-180' : ''}`} />
              </button>
              {openId === f.id && (
                <div className="px-6 pb-5 font-body text-sm text-[#8a6d78] leading-relaxed fade-in">{f.a[lang]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { lang, db } = useStore()
  return (
    <footer className="bg-[#5a4550] text-white/85 py-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart size={18} className="text-[#e8a0b4]" fill="currentColor" />
          <span className="font-display text-xl font-semibold text-white">{db.site.shopName[lang]}</span>
        </div>
        <p className="font-body text-sm mb-6">{db.site.footerText[lang]}</p>
        <div className="flex justify-center gap-6 text-sm font-body mb-6">
          <a href="#shop" className="hover:text-[#e8a0b4] transition-colors">{t.shop[lang]}</a>
          <a href="#about" className="hover:text-[#e8a0b4] transition-colors">{t.about[lang]}</a>
          <a href="#faq" className="hover:text-[#e8a0b4] transition-colors">{t.faq[lang]}</a>
          <a href="#/admin" className="hover:text-[#e8a0b4] transition-colors">{t.admin[lang]}</a>
        </div>
        <p className="font-body text-xs text-white/50">
          {lang === 'zh' ? 'FPS · PayMe · AlipayHK · WeChat Pay · 信用卡' : 'FPS · PayMe · AlipayHK · WeChat Pay · Cards'}
        </p>
      </div>
    </footer>
  )
}
