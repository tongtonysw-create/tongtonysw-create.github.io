// ── Admin 後台：產品 / 網站圖片 / 網站文字 / 客服問答 / 訂單 / 電郵 ──
import { useEffect, useMemo, useState } from 'react'
import {
  Lock, Package, Image as ImageIcon, Type, MessageSquareText, ClipboardList,
  Mail, Plus, Trash2, Save, Languages, ArrowLeft, RefreshCcw, Pencil, KeyRound, MessageCircle,
} from 'lucide-react'
import { useStore, fmtPrice, t, uid } from '@/lib/store'
import { translateZhToEn, translateEnToZh } from '@/lib/translate'
import { sendShippingEmail } from '@/lib/email'
import { adminLogin, changeAdminPassword, setAdminPassword, updateCloudOrderStatus } from '@/lib/cloud'
import { sendWhatsAppTest } from '@/lib/whatsapp'
import type { Bilingual, Order, OrderStatus, Product, QA } from '@/lib/types'

// ── 通用小組件 ─────────────────────────────────────────────
const inputCls =
  'w-full font-body text-sm px-3 py-2 rounded-xl border border-[#ecd9e0] bg-white focus:outline-none focus:ring-2 focus:ring-[#e8c3cf] text-[#5a4550]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-body text-[#a07f8d] mb-1">{label}</span>
      {children}
    </label>
  )
}

/** 雙語文字欄 + 一鍵翻譯按鈕 */
function BilingualField({
  label, value, onChange, multiline,
}: { label: string; value: Bilingual; onChange: (v: Bilingual) => void; multiline?: boolean }) {
  const renderInput = (langKey: 'zh' | 'en') =>
    multiline ? (
      <textarea
        className={inputCls + ' pr-12'}
        rows={3}
        value={value[langKey]}
        onChange={(e) => onChange({ ...value, [langKey]: e.target.value })}
      />
    ) : (
      <input
        className={inputCls + ' pr-12'}
        value={value[langKey]}
        onChange={(e) => onChange({ ...value, [langKey]: e.target.value })}
      />
    )
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Field label={`${label}（繁中）`}>
        <div className="relative">
          {renderInput('zh')}
          <button
            type="button"
            title="中 → 英（輔助翻譯）"
            onClick={() => onChange({ ...value, en: translateZhToEn(value.zh) })}
            className="absolute right-1.5 top-1.5 text-[10px] px-2 py-1 rounded-lg bg-[#f7e6ea] text-[#a5566f] hover:bg-[#f2d4dd] flex items-center gap-1"
          >
            <Languages size={11} /> →EN
          </button>
        </div>
      </Field>
      <Field label={`${label}（English）`}>
        <div className="relative">
          {renderInput('en')}
          <button
            type="button"
            title="英 → 中（輔助翻譯）"
            onClick={() => onChange({ ...value, zh: translateEnToZh(value.en) })}
            className="absolute right-1.5 top-1.5 text-[10px] px-2 py-1 rounded-lg bg-[#e8f1ea] text-[#3d6b4f] hover:bg-[#d5e8da] flex items-center gap-1"
          >
            <Languages size={11} /> →中
          </button>
        </div>
      </Field>
    </div>
  )
}

/** 圖片欄：預覽 + URL + 本地上傳 */
function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.readAsDataURL(file)
  }
  return (
    <Field label={label}>
      <div className="flex gap-3 items-start">
        <img src={value} alt="" className="w-20 h-20 rounded-xl object-cover border border-[#ecd9e0] shrink-0 bg-white" />
        <div className="flex-1 space-y-2">
          <input className={inputCls} value={value.startsWith('data:') ? '(本地上傳圖片 data-uri)' : value} onChange={(e) => onChange(e.target.value)} placeholder="圖片 URL" />
          <label className="inline-flex items-center gap-2 text-xs font-body px-3 py-1.5 rounded-lg bg-[#f7e6ea] text-[#a5566f] cursor-pointer hover:bg-[#f2d4dd]">
            <ImageIcon size={13} /> 上傳本地圖片
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      </div>
    </Field>
  )
}

// ── 產品管理 ───────────────────────────────────────────────
const emptyProduct = (): Product => ({
  id: uid('p'),
  name: { zh: '', en: '' },
  desc: { zh: '', en: '' },
  category: 'beads',
  priceHKD: 0,
  stock: 0,
  image: '',
  featured: false,
})

function ProductsTab() {
  const { db, saveProduct, deleteProduct } = useStore()
  const [editing, setEditing] = useState<Product | null>(null)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg font-semibold text-[#5a4550]">產品列表（{db.products.length}）</h3>
        <button onClick={() => setEditing(emptyProduct())} className="flex items-center gap-1.5 text-sm rose-gradient text-white px-4 py-2 rounded-full">
          <Plus size={15} /> 新增產品
        </button>
      </div>

      <div className="space-y-2 mb-6">
        {db.products.map((p) => (
          <div key={p.id} className="soft-card rounded-2xl p-3 flex items-center gap-3">
            <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-[#5a4550] truncate">{p.name.zh} / {p.name.en}</p>
              <p className="text-xs text-[#b39aa5] font-body">
                HK${p.priceHKD} · 庫存 {p.stock} · {p.category}{p.featured ? ' · 精選' : ''}
              </p>
            </div>
            <button onClick={() => setEditing({ ...p })} className="p-2 rounded-lg hover:bg-[#f7e6ea] text-[#a5566f]"><Pencil size={16} /></button>
            <button onClick={() => { if (confirm(`刪除「${p.name.zh}」？`)) deleteProduct(p.id) }} className="p-2 rounded-lg hover:bg-[#fdeaea] text-[#c05f5f]"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#5a4550]/40" onClick={() => setEditing(null)} />
          <div className="relative bg-[#fdf8f4] rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 space-y-4 fade-in">
            <h3 className="font-display text-lg font-bold text-[#5a4550]">編輯產品</h3>
            <BilingualField label="產品名稱" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <BilingualField label="產品描述" multiline value={editing.desc} onChange={(v) => setEditing({ ...editing, desc: v })} />
            <ImageField label="產品圖片" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="價錢（HK$）">
                <input type="number" className={inputCls} value={editing.priceHKD} onChange={(e) => setEditing({ ...editing, priceHKD: Number(e.target.value) })} />
              </Field>
              <Field label="庫存數量">
                <input type="number" className={inputCls} value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
              </Field>
              <Field label="分類">
                <select className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Product['category'] })}>
                  <option value="beads">拼豆 beads</option>
                  <option value="tools">設備 tools</option>
                  <option value="patterns">圖紙 patterns</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-body text-[#8a6d78]">
              <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              設為「店主精選」
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-full border border-[#ecd9e0] text-sm font-body text-[#8a6d78]">取消</button>
              <button
                onClick={() => { saveProduct(editing); setEditing(null) }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full rose-gradient text-white text-sm font-body"
              >
                <Save size={15} /> 儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 網站圖片管理 ───────────────────────────────────────────
function SiteImagesTab() {
  const { db, saveSite } = useStore()
  const [site, setSite] = useState(db.site)
  return (
    <div className="space-y-5 max-w-2xl">
      <ImageField label="首頁主視覺 Hero 圖" value={site.heroImage} onChange={(v) => setSite({ ...site, heroImage: v })} />
      {/* 首頁影片 */}
      <Field label="首頁影片（留空即隱藏影片區塊）">
        <div className="space-y-2">
          <input
            className={inputCls}
            value={site.heroVideo}
            onChange={(e) => setSite({ ...site, heroVideo: e.target.value })}
            placeholder="hero-video.mp4 或 https://..."
          />
          {site.heroVideo && (
            <video src={site.heroVideo} controls muted className="w-full max-w-sm rounded-xl border border-[#ecd9e0]" />
          )}
          <p className="text-[11px] font-body text-[#b39aa5] leading-relaxed">
            影片檔案較大，請將 mp4 放入網站 public 資料夾（例如 hero-video.mp4）再喺上面填檔名；亦可以直接填外部影片 URL。
          </p>
        </div>
      </Field>
      <ImageField label="關於我哋圖片" value={site.aboutImage} onChange={(v) => setSite({ ...site, aboutImage: v })} />
      <ImageField label="頁尾裝飾 Banner" value={site.bannerImage} onChange={(v) => setSite({ ...site, bannerImage: v })} />
      <button onClick={() => saveSite(site)} className="flex items-center gap-1.5 px-6 py-2.5 rounded-full rose-gradient text-white text-sm font-body">
        <Save size={15} /> 儲存全部圖片 / 影片
      </button>
    </div>
  )
}

// ── 網站文字管理 ───────────────────────────────────────────
function SiteTextTab() {
  const { db, saveSite } = useStore()
  const [site, setSite] = useState(db.site)
  return (
    <div className="space-y-5 max-w-3xl">
      <BilingualField label="店名" value={site.shopName} onChange={(v) => setSite({ ...site, shopName: v })} />
      <BilingualField label="頂部公告" value={site.announcement} onChange={(v) => setSite({ ...site, announcement: v })} />
      <BilingualField label="Hero 主標題" value={site.heroTitle} onChange={(v) => setSite({ ...site, heroTitle: v })} />
      <BilingualField label="Hero 副標題" multiline value={site.heroSubtitle} onChange={(v) => setSite({ ...site, heroSubtitle: v })} />
      <BilingualField label="關於標題" value={site.aboutTitle} onChange={(v) => setSite({ ...site, aboutTitle: v })} />
      <BilingualField label="關於內文" multiline value={site.aboutText} onChange={(v) => setSite({ ...site, aboutText: v })} />
      <BilingualField label="頁尾文字" value={site.footerText} onChange={(v) => setSite({ ...site, footerText: v })} />
      <button onClick={() => saveSite(site)} className="flex items-center gap-1.5 px-6 py-2.5 rounded-full rose-gradient text-white text-sm font-body">
        <Save size={15} /> 儲存全部文字
      </button>
    </div>
  )
}

// ── 客服問答庫管理（AI 客服即時讀取）─────────────────────────
function QaTab() {
  const { db, saveQA, deleteQA, saveFaq, deleteFaq } = useStore()
  const [editing, setEditing] = useState<QA | null>(null)
  const [kw, setKw] = useState('')

  const openNew = () => {
    setEditing({ id: uid('q'), question: { zh: '', en: '' }, answer: { zh: '', en: '' }, keywords: [] })
    setKw('')
  }
  const openEdit = (q: QA) => {
    setEditing({ ...q })
    setKw(q.keywords.join(', '))
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg font-semibold text-[#5a4550]">AI 客服問答庫（{db.qas.length}）</h3>
        <button onClick={openNew} className="flex items-center gap-1.5 text-sm rose-gradient text-white px-4 py-2 rounded-full">
          <Plus size={15} /> 新增問答
        </button>
      </div>
      <p className="text-xs font-body text-[#b39aa5] mb-4">AI 客服會根據關鍵字匹配呢啲問答；改完即刻生效，唔使重新整理。</p>

      <div className="space-y-2 mb-8">
        {db.qas.map((q) => (
          <div key={q.id} className="soft-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-[#5a4550]">Q：{q.question.zh} / {q.question.en}</p>
                <p className="text-xs text-[#8a6d78] font-body mt-1 line-clamp-2">A：{q.answer.zh}</p>
                <p className="text-[11px] text-[#b39aa5] font-body mt-1">關鍵字：{q.keywords.join('、')}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(q)} className="p-2 rounded-lg hover:bg-[#f7e6ea] text-[#a5566f]"><Pencil size={15} /></button>
                <button onClick={() => { if (confirm('刪除呢條問答？')) deleteQA(q.id) }} className="p-2 rounded-lg hover:bg-[#fdeaea] text-[#c05f5f]"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ（前台顯示） */}
      <h3 className="font-display text-lg font-semibold text-[#5a4550] mb-3">前台 FAQ（{db.faqs.length}）</h3>
      <div className="space-y-2 mb-4">
        {db.faqs.map((f) => (
          <div key={f.id} className="soft-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-[#5a4550]">{f.q.zh} / {f.q.en}</p>
                <p className="text-xs text-[#8a6d78] font-body mt-1 line-clamp-2">{f.a.zh}</p>
              </div>
              <button onClick={() => { if (confirm('刪除呢條 FAQ？')) deleteFaq(f.id) }} className="p-2 rounded-lg hover:bg-[#fdeaea] text-[#c05f5f] shrink-0"><Trash2 size={15} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-2 mt-3">
              <input className={inputCls} value={f.q.zh} placeholder="問題（繁中）" onChange={(e) => saveFaq({ ...f, q: { ...f.q, zh: e.target.value } })} />
              <input className={inputCls} value={f.q.en} placeholder="Question (EN)" onChange={(e) => saveFaq({ ...f, q: { ...f.q, en: e.target.value } })} />
              <textarea className={inputCls} rows={2} value={f.a.zh} placeholder="答案（繁中）" onChange={(e) => saveFaq({ ...f, a: { ...f.a, zh: e.target.value } })} />
              <textarea className={inputCls} rows={2} value={f.a.en} placeholder="Answer (EN)" onChange={(e) => saveFaq({ ...f, a: { ...f.a, en: e.target.value } })} />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => saveFaq({ id: uid('f'), q: { zh: '新問題', en: 'New question' }, a: { zh: '', en: '' } })}
        className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border border-[#ecd9e0] text-[#a5566f] hover:bg-[#f7e6ea]"
      >
        <Plus size={15} /> 新增 FAQ
      </button>

      {/* QA 編輯彈窗 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#5a4550]/40" onClick={() => setEditing(null)} />
          <div className="relative bg-[#fdf8f4] rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 space-y-4 fade-in">
            <h3 className="font-display text-lg font-bold text-[#5a4550]">編輯客服問答</h3>
            <BilingualField label="問題" value={editing.question} onChange={(v) => setEditing({ ...editing, question: v })} />
            <BilingualField label="回答" multiline value={editing.answer} onChange={(v) => setEditing({ ...editing, answer: v })} />
            <Field label="關鍵字（用逗號分隔，中英皆可，AI 用嚟匹配客人提問）">
              <input className={inputCls} value={kw} onChange={(e) => setKw(e.target.value)} placeholder="例：運費, 免運, shipping, delivery" />
            </Field>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-full border border-[#ecd9e0] text-sm font-body text-[#8a6d78]">取消</button>
              <button
                onClick={() => {
                  saveQA({ ...editing, keywords: kw.split(/[,，]/).map((s) => s.trim()).filter(Boolean) })
                  setEditing(null)
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full rose-gradient text-white text-sm font-body"
              >
                <Save size={15} /> 儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 訂單管理 ───────────────────────────────────────────────
const STATUS_FLOW: OrderStatus[] = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

function OrdersTab() {
  const { db, updateOrderStatus, logEmail } = useStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  const changeStatus = async (o: Order, s: OrderStatus) => {
    updateOrderStatus(o.id, s)
    updateCloudOrderStatus(o.id, s) // 同步上雲端，客人 AI 查單會見到新狀態
    if (s === 'shipped') {
      await sendShippingEmail(db.emailSettings, logEmail, { ...o, status: s })
    }
  }

  if (db.orders.length === 0) {
    return <p className="font-body text-sm text-[#b39aa5] py-10 text-center">暫時未有訂單。客人喺前台結帳後，訂單會即時出現喺度。</p>
  }

  return (
    <div className="space-y-3">
      {db.orders.map((o) => (
        <div key={o.id} className="soft-card rounded-2xl overflow-hidden">
          <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-left">
            <span className="font-display font-bold text-[#a5566f]">{o.id}</span>
            <span className="font-body text-sm text-[#5a4550]">{o.customer.name}</span>
            <span className="font-body text-sm text-[#8a6d78]">{fmtPrice(o.totalHKD, o.currency)}</span>
            <span className="font-body text-xs text-[#b39aa5]">{new Date(o.createdAt).toLocaleString('zh-HK')}</span>
            <span className={`ml-auto text-xs px-3 py-1 rounded-full font-body ${
              o.status === 'shipped' ? 'bg-[#dcefe2] text-[#3d6b4f]'
              : o.status === 'cancelled' ? 'bg-[#f6e3e3] text-[#a05050]'
              : o.status === 'completed' ? 'bg-[#e4e8f5] text-[#4a5a8a]'
              : 'bg-[#f7e6ea] text-[#a5566f]'
            }`}>
              {t[{ pending: 'stPending', paid: 'stPaid', shipped: 'stShipped', completed: 'stCompleted', cancelled: 'stCancelled' }[o.status] as keyof typeof t].zh}
            </span>
          </button>
          {expanded === o.id && (
            <div className="px-5 pb-5 border-t border-[#f3dde3] pt-4 fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-body text-[#a07f8d] mb-1">商品</p>
                  {o.items.map((i) => (
                    <p key={i.productId} className="text-sm font-body text-[#5a4550]">
                      {i.name.zh} × {i.qty} — {fmtPrice(i.priceHKD * i.qty, o.currency)}
                    </p>
                  ))}
                  <p className="text-sm font-body text-[#8a6d78] mt-1">
                    運費：{o.shippingHKD === 0 ? '免費' : fmtPrice(o.shippingHKD, o.currency)} · 合計：<b className="text-[#a5566f]">{fmtPrice(o.totalHKD, o.currency)}</b>
                  </p>
                </div>
                <div className="text-sm font-body text-[#5a4550] space-y-1">
                  <p>📧 {o.customer.email}</p>
                  <p>📞 {o.customer.phone}</p>
                  <p>📍 {o.customer.address}</p>
                  <p>💳 {o.payment}</p>
                  {o.note && <p>📝 {o.note}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs font-body text-[#a07f8d]">更新狀態：</span>
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(o, s)}
                    className={`text-xs px-3 py-1.5 rounded-full font-body transition-colors ${
                      o.status === s ? 'rose-gradient text-white' : 'border border-[#ecd9e0] text-[#8a6d78] hover:bg-[#f7e6ea]'
                    }`}
                  >
                    {t[{ pending: 'stPending', paid: 'stPaid', shipped: 'stShipped', completed: 'stCompleted', cancelled: 'stCancelled' }[s] as keyof typeof t].zh}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-body text-[#b39aa5] mt-2">設為「已發貨」時會自動寄發貨通知電郵俾客人。</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── 電郵設定 + 發件日誌 ─────────────────────────────────────
function EmailTab() {
  const { db, saveEmailSettings, saveNotify } = useStore()
  const [s, setS] = useState(db.emailSettings)
  const [n, setN] = useState(db.notify)
  const [waMsg, setWaMsg] = useState('')
  return (
    <div className="max-w-2xl space-y-6">
      <div className="soft-card rounded-2xl p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-[#5a4550] flex items-center gap-2">
          <MessageCircle size={18} className="text-[#1da851]" /> WhatsApp 新訂單通知
        </h3>
        <div className="bg-[#eafaf0] border border-[#bfe6cd] rounded-xl p-3 text-xs font-body text-[#3d6b4f] leading-relaxed">
          客人一落單，你 WhatsApp 即刻收到訂單詳情（免費，經 CallMeBot 發送到店主自己嘅號碼）。
          未填 APIKEY 前唔會發送；<b>客人確認掣</b>（落單成功頁嘅 wa.me 按鈕）填咗號碼就即用得。
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="店主 WhatsApp 號碼（連區碼，唔使 +）">
            <input className={inputCls} value={n.waPhone} onChange={(e) => setN({ ...n, waPhone: e.target.value })} placeholder="85292128542" />
          </Field>
          <Field label="CallMeBot APIKEY">
            <input className={inputCls} value={n.waApiKey} onChange={(e) => setN({ ...n, waApiKey: e.target.value })} placeholder="未啟動可留空" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-body text-[#8a6d78]">
          <input type="checkbox" checked={n.enabled} onChange={(e) => setN({ ...n, enabled: e.target.checked })} />
          啟用落單自動 WhatsApp 通知（需已填 APIKEY）
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { saveNotify(n); setWaMsg('✅ 已儲存（即時全網生效）') }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full rose-gradient text-white text-sm font-body"
          >
            <Save size={15} /> 儲存設定
          </button>
          <button
            onClick={async () => {
              setWaMsg('發送中…')
              const ok = await sendWhatsAppTest(n)
              setWaMsg(ok ? '📲 測試訊息已發出，睇下你 WhatsApp 收唔收到' : '❌ 發送失敗：請檢查號碼同 APIKEY')
            }}
            disabled={!n.waPhone || !n.waApiKey}
            className="px-6 py-2.5 rounded-full border border-[#25D366]/50 text-[#1da851] text-sm font-body disabled:opacity-40 hover:bg-[#25D366]/10"
          >
            發送測試訊息
          </button>
        </div>
        {waMsg && <p className="text-sm font-body text-[#8a6d78]">{waMsg}</p>}
      </div>

      <div className="soft-card rounded-2xl p-5 space-y-4">
        <h3 className="font-display text-lg font-semibold text-[#5a4550]">電郵通知設定</h3>
        <Field label="店主通知邮箱（新訂單即時通知）">
          <input className={inputCls} value={s.notifyEmail} onChange={(e) => setS({ ...s, notifyEmail: e.target.value })} />
        </Field>
        <div className="bg-[#fdf3e7] border border-[#f0dcc0] rounded-xl p-3 text-xs font-body text-[#8a6a3d] leading-relaxed">
          本示範網站未連接真實 SMTP。如要真正寄出電郵，可到 emailjs.com 免費開戶，建立 Service 同 Template（template 參數用
          <code className="mx-1">to_email / subject / message</code>），然後喺下面填入三個 ID 並開啟「真實發送」。
          未設定前，所有通知信會記錄喺下面嘅「發件日誌」，內容完整可隨時複製人手寄出。
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="EmailJS Service ID">
            <input className={inputCls} value={s.emailjsServiceId} onChange={(e) => setS({ ...s, emailjsServiceId: e.target.value })} placeholder="service_xxx" />
          </Field>
          <Field label="EmailJS Template ID">
            <input className={inputCls} value={s.emailjsTemplateId} onChange={(e) => setS({ ...s, emailjsTemplateId: e.target.value })} placeholder="template_xxx" />
          </Field>
          <Field label="EmailJS Public Key">
            <input className={inputCls} value={s.emailjsPublicKey} onChange={(e) => setS({ ...s, emailjsPublicKey: e.target.value })} placeholder="public key" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-body text-[#8a6d78]">
          <input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} />
          啟用真實發送（需已填妥上面三個 ID）
        </label>
        <button onClick={() => saveEmailSettings(s)} className="flex items-center gap-1.5 px-6 py-2.5 rounded-full rose-gradient text-white text-sm font-body">
          <Save size={15} /> 儲存設定
        </button>
      </div>

      <div className="soft-card rounded-2xl p-5">
        <h3 className="font-display text-lg font-semibold text-[#5a4550] mb-3">發件日誌（{db.emailLog.length}）</h3>
        {db.emailLog.length === 0 ? (
          <p className="text-sm font-body text-[#b39aa5]">暫時未有記錄。客人落單或你更新發貨狀態後會自動記錄。</p>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {db.emailLog.map((e) => (
              <div key={e.id} className="border border-[#f3dde3] rounded-xl p-3 bg-white">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-body ${
                    e.status === 'sent' ? 'bg-[#dcefe2] text-[#3d6b4f]' : e.status === 'failed' ? 'bg-[#f6e3e3] text-[#a05050]' : 'bg-[#f0eef7] text-[#6a5a8a]'
                  }`}>
                    {e.status === 'sent' ? '已真實發送' : e.status === 'failed' ? '發送失敗' : '模擬記錄（未連 EmailJS）'}
                  </span>
                  <span className="text-[11px] font-body text-[#b39aa5]">
                    {e.kind === 'order_confirmation' ? '下單確認信' : e.kind === 'shipping' ? '發貨通知' : '店主新訂單通知'} · {new Date(e.createdAt).toLocaleString('zh-HK')}
                  </span>
                </div>
                <p className="text-sm font-body font-medium text-[#5a4550]">{e.subject}</p>
                <p className="text-xs font-body text-[#8a6d78]">收件人：{e.to}</p>
                <details className="mt-1">
                  <summary className="text-xs font-body text-[#a5566f] cursor-pointer">查看內容</summary>
                  <pre className="text-xs font-body text-[#8a6d78] whitespace-pre-wrap mt-2 bg-[#fdf8f4] rounded-lg p-3">{e.body}</pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── 密碼設定：更改後台管理密碼（存喺 Supabase 私人密碼表，代碼入面唔會再有密碼）──
function SettingsTab() {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async () => {
    setMsg(null)
    if (newPwd.length < 8) {
      setMsg({ ok: false, text: '新密碼最少 8 個字符' })
      return
    }
    if (newPwd !== confirmPwd) {
      setMsg({ ok: false, text: '兩次輸入嘅新密碼唔一致' })
      return
    }
    setBusy(true)
    const r = await changeAdminPassword(oldPwd, newPwd)
    setBusy(false)
    if (r === 'ok') {
      sessionStorage.setItem('beadoria-admin-pw', newPwd)
      setAdminPassword(newPwd)
      setOldPwd(''); setNewPwd(''); setConfirmPwd('')
      setMsg({ ok: true, text: '✅ 密碼已更改，即刻生效（所有裝置嘅後台都用新密碼）' })
    } else if (r === 'wrong') {
      setMsg({ ok: false, text: '現時密碼唔正確' })
    } else {
      setMsg({ ok: false, text: '雲端密碼功能未開通：請先喺 Supabase SQL Editor 跑返 v2 升級腳本' })
    }
  }

  return (
    <div className="max-w-md">
      <div className="soft-card rounded-3xl p-6">
        <h2 className="font-display text-xl font-bold text-[#5a4550] mb-1 flex items-center gap-2">
          <KeyRound size={18} className="text-[#a5566f]" /> 更改管理密碼
        </h2>
        <p className="font-body text-xs text-[#b39aa5] mb-5">
          密碼存喺 Supabase 私人密碼表，唔會再出現喺網站代碼度。更改後即時全網生效。
        </p>
        <div className="space-y-4">
          <Field label="現時密碼">
            <input type="password" className={inputCls} value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
          </Field>
          <Field label="新密碼（最少 8 個字符）">
            <input type="password" className={inputCls} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </Field>
          <Field label="再輸入一次新密碼">
            <input type="password" className={inputCls} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          </Field>
          {msg && (
            <p className={`font-body text-sm ${msg.ok ? 'text-green-700' : 'text-[#c05f5f]'}`}>{msg.text}</p>
          )}
          <button
            onClick={submit}
            disabled={busy || !oldPwd || !newPwd}
            className="w-full rose-gradient text-white font-body py-2.5 rounded-full disabled:opacity-60"
          >
            {busy ? '處理中…' : '更改密碼'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 後台主頁 ───────────────────────────────────────────────
const TABS = [
  { key: 'products', label: '產品管理', icon: Package },
  { key: 'images', label: '網站圖片', icon: ImageIcon },
  { key: 'text', label: '網站文字', icon: Type },
  { key: 'qa', label: '客服問答 / FAQ', icon: MessageSquareText },
  { key: 'orders', label: '訂單管理', icon: ClipboardList },
  { key: 'email', label: '通知設定', icon: Mail },
  { key: 'settings', label: '密碼設定', icon: KeyRound },
] as const

export default function Admin() {
  const { db, resetDemo, refreshOrders } = useStore()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('beadoria-admin') === '1')
  const [pw, setPw] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('products')
  const pendingCount = useMemo(() => db.orders.filter((o) => o.status === 'pending' || o.status === 'paid').length, [db.orders])

  // 登入後拉取雲端訂單（其他裝置客人落嘅單都會見到）
  useEffect(() => {
    if (!authed) return
    const saved = sessionStorage.getItem('beadoria-admin-pw') || ''
    if (saved) setAdminPassword(saved)
    refreshOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const doLogin = async () => {
    if (loginBusy) return
    setLoginBusy(true)
    const ok = await adminLogin(pw)
    setLoginBusy(false)
    if (ok) {
      sessionStorage.setItem('beadoria-admin', '1')
      sessionStorage.setItem('beadoria-admin-pw', pw)
      setAdminPassword(pw)
      setAuthed(true)
    } else {
      alert('密碼錯誤')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f4] px-4">
        <div className="soft-card rounded-3xl p-8 w-full max-w-sm text-center">
          <span className="w-14 h-14 rounded-full rose-gradient text-white flex items-center justify-center mx-auto mb-4">
            <Lock size={22} />
          </span>
          <h1 className="font-display text-2xl font-bold text-[#5a4550] mb-1">Beadoria 後台</h1>
          <p className="font-body text-sm text-[#b39aa5] mb-6">請輸入管理密碼</p>
          <input
            type="password"
            className={inputCls + ' text-center mb-3'}
            placeholder="輸入管理密碼"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') doLogin()
            }}
          />
          <button
            onClick={doLogin}
            disabled={loginBusy}
            className="w-full rose-gradient text-white font-body py-2.5 rounded-full disabled:opacity-60"
          >
            {loginBusy ? '驗證中…' : '登入'}
          </button>
          <a href="#/" className="inline-flex items-center gap-1 text-xs font-body text-[#a5566f] mt-4 hover:underline">
            <ArrowLeft size={12} /> 返回商店
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdf8f4]">
      <div className="rose-gradient text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold">Beadoria 管理後台</h1>
            {pendingCount > 0 && (
              <span className="text-xs bg-white/25 px-3 py-1 rounded-full font-body">{pendingCount} 張訂單待跟進</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (confirm('重置所有資料回示範狀態？（訂單同你嘅修改會清除）')) resetDemo() }}
              className="flex items-center gap-1.5 text-xs font-body bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <RefreshCcw size={13} /> 重置示範資料
            </button>
            <a href="#/" className="flex items-center gap-1 text-xs font-body bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
              <ArrowLeft size={13} /> 返回商店
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto pb-0">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-body whitespace-nowrap transition-colors ${
                tab === tb.key ? 'bg-[#fdf8f4] text-[#a5566f]' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <tb.icon size={15} /> {tb.label}
              {tb.key === 'orders' && pendingCount > 0 && (
                <span className="bg-[#c05f5f] text-white text-[10px] min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === 'products' && <ProductsTab />}
        {tab === 'images' && <SiteImagesTab />}
        {tab === 'text' && <SiteTextTab />}
        {tab === 'qa' && <QaTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'email' && <EmailTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}
