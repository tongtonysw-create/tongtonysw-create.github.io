// ── Hero 主視覺 ─────────────────────────────────────────────
import { ArrowDown } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function Hero() {
  const { lang, db } = useStore()
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="fade-in">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-[#c4718b] mb-4">
            Handmade in Hong Kong 🇭🇰
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#5a4550] mb-6">
            {db.site.heroTitle[lang]}
          </h1>
          <p className="font-body text-base md:text-lg text-[#8a6d78] leading-relaxed mb-8">
            {db.site.heroSubtitle[lang]}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              className="rose-gradient text-white font-body px-7 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#c4718b]/25"
            >
              {lang === 'zh' ? '立即選購 🌸' : 'Shop Now 🌸'}
            </button>
            <button
              onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-body px-7 py-3 rounded-full border border-[#e8c3cf] text-[#a5566f] hover:bg-[#f7e6ea] transition-colors"
            >
              {lang === 'zh' ? '了解更多' : 'Learn More'}
            </button>
          </div>
        </div>
        <div className="relative fade-in">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-[#f7e6ea] -z-10" />
          <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-[#e8f1ea] -z-10" />
          <img
            src={db.site.heroImage}
            alt="hero"
            className="rounded-[2rem] w-full object-cover shadow-2xl shadow-[#c4718b]/20 rotate-1 hover:rotate-0 transition-transform duration-500"
          />
        </div>
      </div>
      <div className="flex justify-center pb-6">
        <ArrowDown className="text-[#d9a7b8] animate-bounce" size={20} />
      </div>
    </section>
  )
}
