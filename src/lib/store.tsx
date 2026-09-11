// ── 全域狀態：語言 / 貨幣 / 購物籃 / 後台資料（localStorage 持久化）──
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type {
  Lang, Currency, Product, SiteContent, Faq, QA, Review, Order, EmailSettings, EmailLog, CartItem, NotifySettings,
} from './types'
import {
  defaultProducts, defaultSite, defaultFaqs, defaultQAs, defaultReviews,
  defaultEmailSettings, defaultNotify, HKD_TO_CNY, FREE_SHIPPING_HKD,
} from './seed'
import { cloudEnabled, fetchCloudDB, pushCloudDB, insertCloudOrder, fetchCloudOrders } from './cloud'
import { sendWhatsAppNotify } from './whatsapp'

// 只同步公開內容上雲；訂單/電郵設定屬敏感資料，經獨立表格同密碼 RPC 處理
// （notify 包含 WhatsApp 通知設定，要同步先至令任何裝置嘅客人都觸發到通知）
type PublicDB = Pick<DB, 'products' | 'site' | 'faqs' | 'qas' | 'reviews' | 'notify'>
function publicSubset(d: DB): PublicDB {
  return { products: d.products, site: d.site, faqs: d.faqs, qas: d.qas, reviews: d.reviews, notify: d.notify }
}

const DB_KEY = 'beadoria-db-v2'
const CART_KEY = 'beadoria-cart-v2'

interface DB {
  products: Product[]
  site: SiteContent
  faqs: Faq[]
  qas: QA[]
  reviews: Review[]
  orders: Order[]
  emailSettings: EmailSettings
  emailLog: EmailLog[]
  notify: NotifySettings
}

function loadDB(): DB {
  const base = defaultDB()
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...base, ...parsed, site: { ...base.site, ...(parsed.site || {}) } }
    }
  } catch { /* ignore */ }
  return base
}

function defaultDB(): DB {
  return {
    products: defaultProducts,
    site: defaultSite,
    faqs: defaultFaqs,
    qas: defaultQAs,
    reviews: defaultReviews,
    orders: [],
    emailSettings: defaultEmailSettings,
    emailLog: [],
    notify: defaultNotify,
  }
}

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

// ── UI 固定字串（全站雙語）────────────────────────────────
export const t = {
  shop: { zh: '商品', en: 'Shop' },
  about: { zh: '關於我哋', en: 'About' },
  faq: { zh: '常見問題', en: 'FAQ' },
  reviews: { zh: '客人評價', en: 'Reviews' },
  cart: { zh: '購物籃', en: 'Cart' },
  admin: { zh: '後台管理', en: 'Admin' },
  addToCart: { zh: '加入購物籃', en: 'Add to Cart' },
  added: { zh: '已加入 ✓', en: 'Added ✓' },
  outOfStock: { zh: '缺貨', en: 'Out of Stock' },
  inStock: { zh: '現貨', en: 'In Stock' },
  lowStock: { zh: '少量現貨', en: 'Low Stock' },
  subtotal: { zh: '小計', en: 'Subtotal' },
  shipping: { zh: '運費', en: 'Shipping' },
  total: { zh: '合計', en: 'Total' },
  free: { zh: '免費', en: 'FREE' },
  checkout: { zh: '去結帳', en: 'Checkout' },
  freeShipReached: { zh: '🎉 已達免運門檻！', en: '🎉 Free shipping unlocked!' },
  freeShipHint1: { zh: '再買', en: 'Add' },
  freeShipHint2: { zh: '即可免運費', en: 'more for free shipping' },
  emptyCart: { zh: '購物籃暫時空空如也', en: 'Your cart is empty' },
  emptyCartHint: { zh: '去揀啲心水拼豆啦 🌸', en: 'Go find some beads you love 🌸' },
  catAll: { zh: '全部', en: 'All' },
  catBeads: { zh: '拼豆', en: 'Beads' },
  catTools: { zh: '設備工具', en: 'Tools' },
  catPatterns: { zh: '圖紙設計', en: 'Patterns' },
  featured: { zh: '店主精選', en: "Editor's Picks" },
  allProducts: { zh: '全部商品', en: 'All Products' },
  chatTitle: { zh: '小豆子客服', en: 'Beady Assistant' },
  chatSubtitle: { zh: '中英文都得 · 即時回覆', en: '繁中 / English · replies instantly' },
  chatPlaceholder: { zh: '問吓運費、庫存、訂單…', en: 'Ask about shipping, stock, orders…' },
  orderLookup: { zh: '查訂單', en: 'Track Order' },
  orderIdPlaceholder: { zh: '輸入訂單編號（如 BD-123456）', en: 'Enter order no. (e.g. BD-123456)' },
  // checkout
  coTitle: { zh: '結帳', en: 'Checkout' },
  coName: { zh: '姓名', en: 'Name' },
  coEmail: { zh: '電郵', en: 'Email' },
  coPhone: { zh: '電話', en: 'Phone' },
  coAddress: { zh: '送貨地址 / 順豐站編號', en: 'Address / SF Locker Code' },
  coNote: { zh: '訂單備註（可選）', en: 'Order note (optional)' },
  coPayment: { zh: '付款方式', en: 'Payment Method' },
  coPlace: { zh: '確認下單', en: 'Place Order' },
  coSuccess: { zh: '多謝你嘅訂單！', en: 'Thank you for your order!' },
  coSuccessHint: {
    zh: '確認電郵已發出（可於後台「電郵日誌」查看），我哋會盡快為你準備。',
    en: 'A confirmation email has been sent (see the admin Email Log). We will prepare your order shortly.',
  },
  coOrderNo: { zh: '訂單編號', en: 'Order No.' },
  coFillAll: { zh: '請填妥姓名、電郵、電話同地址', en: 'Please fill in name, email, phone and address' },
  // order status
  stPending: { zh: '待付款', en: 'Pending' },
  stPaid: { zh: '已付款', en: 'Paid' },
  stShipped: { zh: '已發貨', en: 'Shipped' },
  stCompleted: { zh: '已完成', en: 'Completed' },
  stCancelled: { zh: '已取消', en: 'Cancelled' },
} as const

export type TStringKey = keyof typeof t

export function fmtPrice(hkd: number, currency: Currency): string {
  if (currency === 'HKD') return `HK$${hkd.toFixed(hkd % 1 === 0 ? 0 : 2)}`
  return `¥${(hkd * HKD_TO_CNY).toFixed(hkd % 1 === 0 ? 0 : 2)}`
}

export { HKD_TO_CNY, FREE_SHIPPING_HKD }

// ── Context ──────────────────────────────────────────────
interface StoreCtx {
  lang: Lang
  setLang: (l: Lang) => void
  currency: Currency
  setCurrency: (c: Currency) => void
  cart: CartItem[]
  addToCart: (id: string, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  db: DB
  // admin actions
  saveProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  saveSite: (s: SiteContent) => void
  saveFaq: (f: Faq) => void
  deleteFaq: (id: string) => void
  saveQA: (q: QA) => void
  deleteQA: (id: string) => void
  saveReview: (r: Review) => void
  deleteReview: (id: string) => void
  placeOrder: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order
  updateOrderStatus: (id: string, s: Order['status']) => void
  refreshOrders: () => Promise<void>
  saveEmailSettings: (s: EmailSettings) => void
  saveNotify: (n: NotifySettings) => void
  logEmail: (e: Omit<EmailLog, 'id' | 'createdAt'>) => void
  resetDemo: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

let idCounter = 0
export function uid(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

export function newOrderId(): string {
  return `BD-${String(Math.floor(100000 + Math.random() * 900000))}`
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh')
  const [currency, setCurrency] = useState<Currency>('HKD')
  const [cart, setCart] = useState<CartItem[]>(loadCart)
  const [db, setDb] = useState<DB>(loadDB)

  // ── 雲端同步：開店時拉取 Supabase 資料（無雲端行就將本地資料推上去做第一行）
  const skipNextPush = useRef(false)
  const cloudReady = useRef(!cloudEnabled()) // 第一次雲端拉取完成前，禁止任何推送（防舊本地資料覆蓋雲端）
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!cloudEnabled()) return
    let cancelled = false
    ;(async () => {
      const res = await fetchCloudDB<PublicDB>()
      if (cancelled || res.status === 'error') return // 連線失敗：維持本機模式，絕不推送（避免覆蓋雲端）
      cloudReady.current = true // 拉取成功先開放推送
      const remote = res.data
      if (remote) {
        skipNextPush.current = true // 拉取落嚟嘅資料唔好即刻推返上去
        setDb((d) => ({
          ...d,
          ...remote,
          site: { ...d.site, ...(remote.site || {}) },
        }))
      } else {
        pushCloudDB(publicSubset(loadDB())) // 雲端未有任何資料：用本機資料做初始化
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
    if (!cloudEnabled() || !cloudReady.current) return
    if (pushTimer.current) clearTimeout(pushTimer.current) // 任何 db 變動（包括雲端 merge）都要取消未發射嘅舊推送
    if (skipNextPush.current) {
      skipNextPush.current = false
      return
    }
    pushTimer.current = setTimeout(() => { pushCloudDB(publicSubset(db)) }, 800) // 防抖：連續修改合併推送
  }, [db])
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const value = useMemo<StoreCtx>(() => ({
    lang, setLang, currency, setCurrency, cart,
    addToCart: (id, qty = 1) =>
      setCart((c) => {
        const found = c.find((i) => i.productId === id)
        if (found) return c.map((i) => (i.productId === id ? { ...i, qty: i.qty + qty } : i))
        return [...c, { productId: id, qty }]
      }),
    updateQty: (id, qty) =>
      setCart((c) => (qty <= 0 ? c.filter((i) => i.productId !== id) : c.map((i) => (i.productId === id ? { ...i, qty } : i)))),
    removeFromCart: (id) => setCart((c) => c.filter((i) => i.productId !== id)),
    clearCart: () => setCart([]),
    db,
    saveProduct: (p) =>
      setDb((d) => ({
        ...d,
        products: d.products.some((x) => x.id === p.id) ? d.products.map((x) => (x.id === p.id ? p : x)) : [p, ...d.products],
      })),
    deleteProduct: (id) => setDb((d) => ({ ...d, products: d.products.filter((x) => x.id !== id) })),
    saveSite: (s) => setDb((d) => ({ ...d, site: s })),
    saveFaq: (f) =>
      setDb((d) => ({ ...d, faqs: d.faqs.some((x) => x.id === f.id) ? d.faqs.map((x) => (x.id === f.id ? f : x)) : [...d.faqs, f] })),
    deleteFaq: (id) => setDb((d) => ({ ...d, faqs: d.faqs.filter((x) => x.id !== id) })),
    saveQA: (q) =>
      setDb((d) => ({ ...d, qas: d.qas.some((x) => x.id === q.id) ? d.qas.map((x) => (x.id === q.id ? q : x)) : [...d.qas, q] })),
    deleteQA: (id) => setDb((d) => ({ ...d, qas: d.qas.filter((x) => x.id !== id) })),
    saveReview: (r) =>
      setDb((d) => ({ ...d, reviews: d.reviews.some((x) => x.id === r.id) ? d.reviews.map((x) => (x.id === r.id ? r : x)) : [r, ...d.reviews] })),
    deleteReview: (id) => setDb((d) => ({ ...d, reviews: d.reviews.filter((x) => x.id !== id) })),
    placeOrder: (o) => {
      const order: Order = { ...o, id: newOrderId(), createdAt: new Date().toISOString(), status: 'pending' }
      setDb((d) => ({
        ...d,
        orders: [order, ...d.orders],
        products: d.products.map((p) => {
          const item = o.items.find((i) => i.productId === p.id)
          return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
        }),
      }))
      insertCloudOrder(order) // 即時寫入雲端訂單表（防火牆式，失敗唔影響本地）
      sendWhatsAppNotify(db.notify, order) // WhatsApp 即時通知店主（未設 APIKEY 就靜靜略過）
      return order
    },
    updateOrderStatus: (id, s) =>
      setDb((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, status: s } : o)) })),
    refreshOrders: async () => {
      const cloud = await fetchCloudOrders<Order>()
      if (!cloud) return
      // 雲端係訂單嘅唯一真相來源；本地落嘅單若未上雲就合併保留
      setDb((d) => {
        const cloudIds = new Set(cloud.map((o) => o.id))
        const localOnly = d.orders.filter((o) => !cloudIds.has(o.id))
        return { ...d, orders: [...cloud, ...localOnly] }
      })
    },
    saveEmailSettings: (s) => setDb((d) => ({ ...d, emailSettings: s })),
    saveNotify: (n) => setDb((d) => ({ ...d, notify: n })),
    logEmail: (e) =>
      setDb((d) => ({ ...d, emailLog: [{ ...e, id: uid('em'), createdAt: new Date().toISOString() }, ...d.emailLog].slice(0, 100) })),
    resetDemo: () => {
      localStorage.removeItem(DB_KEY)
      localStorage.removeItem(CART_KEY)
      setDb(defaultDB())
      setCart([])
    },
  }), [lang, currency, cart, db])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
