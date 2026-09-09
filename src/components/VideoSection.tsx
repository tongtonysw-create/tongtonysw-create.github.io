// ── 首頁影片區塊：自動播放（靜音循環）+ 雙語文案，影片可喺後台更換 ──
import { useStore } from '@/lib/store'
import { Play } from 'lucide-react'

export default function VideoSection() {
  const { lang, db } = useStore()
  const src = db.site.heroVideo?.trim()
  if (!src) return null

  return (
    <section className="max-w-6xl mx-auto px-4 pb-4 -mt-2">
      <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-[#c4718b]/20 fade-in">
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="w-full aspect-video object-cover bg-[#f7e6ea]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#5a4550]/60 to-transparent px-8 pt-5 pb-14">
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-white/85 mb-1 flex items-center gap-1.5">
            <Play size={11} /> Beadoria Studio
          </p>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-white drop-shadow">
            {lang === 'zh' ? '一齊睇下拼豆點樣變成藝術品' : 'Watch beads turn into art'}
          </h2>
        </div>
      </div>
    </section>
  )
}
