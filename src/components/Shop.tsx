// ── 商品區：分類篩選 + 商品卡（雙語名稱、庫存、即時匯率價錢）────
import { useState } from 'react'
import { ShoppingBag, Heart } from 'lucide-react'
import { useStore, t, fmtPrice } from '@/lib/store'
import type { Category, Product } from '@/lib/types'

const CATS: { key: Category | 'all'; labelKey: 'catAll' | 'catBeads' | 'catTools' | 'catPatterns' }[] = [
  { key: 'all', labelKey: 'catAll' },
  { key: 'beads', labelKey: 'catBeads' },
  { key: 'tools', labelKey: 'catTools' },
  { key: 'patterns', labelKey: 'catPatterns' },
]

function ProductCard({ p }: { p: Product }) {
  const { lang, currency, addToCart } = useStore()
  const [added, setAdded] = useState(false)
  const out = p.stock <= 0
  const low = p.stock > 0 && p.stock <= 10

  const handleAdd = () => {
    if (out) return
    addToCart(p.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="soft-card rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-[#c4718b]/15 transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img src={p.image} alt={p.name[lang]} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
        {p.featured && (
          <span className="absolute top-3 left-3 rose-gradient text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1">
            <Heart size={11} fill="currentColor" /> {t.featured[lang]}
          </span>
        )}
        <span
          className={`absolute top-3 right-3 text-[11px] px-3 py-1 rounded-full ${
            out ? 'bg-[#5a4550] text-white' : low ? 'bg-[#f5c09a] text-[#7a4a20]' : 'bg-[#dcefe2] text-[#3d6b4f]'
          }`}
        >
          {out ? t.outOfStock[lang] : low ? `${t.lowStock[lang]} · ${p.stock}` : t.inStock[lang]}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-[#5a4550] mb-1 leading-snug">{p.name[lang]}</h3>
        <p className="font-body text-sm text-[#9a7f8a] leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">{p.desc[lang]}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xl font-bold text-[#a5566f]">{fmtPrice(p.priceHKD, currency)}</span>
          <button
            onClick={handleAdd}
            disabled={out}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-body transition-all ${
              out
                ? 'bg-[#efe4e8] text-[#b39aa5] cursor-not-allowed'
                : added
                  ? 'bg-[#8fb49b] text-white'
                  : 'rose-gradient text-white hover:opacity-90'
            }`}
          >
            <ShoppingBag size={15} />
            {out ? t.outOfStock[lang] : added ? t.added[lang] : t.addToCart[lang]}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const { lang, db } = useStore()
  const [cat, setCat] = useState<Category | 'all'>('all')
  const list = db.products.filter((p) => cat === 'all' || p.category === cat)

  return (
    <section id="shop" className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="font-body text-sm tracking-[0.3em] uppercase text-[#c4718b] mb-2">Shop</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#5a4550]">{t.allProducts[lang]}</h2>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`px-5 py-2 rounded-full text-sm font-body transition-all ${
              cat === c.key ? 'rose-gradient text-white shadow-md shadow-[#c4718b]/25' : 'bg-white border border-[#f3dde3] text-[#8a6d78] hover:bg-[#f7e6ea]'
            }`}
          >
            {t[c.labelKey][lang]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  )
}
