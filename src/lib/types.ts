// ── 全域型別定義 ─────────────────────────────────────────────
export type Lang = 'zh' | 'en'
export type Currency = 'HKD' | 'CNY'

export interface Bilingual {
  zh: string
  en: string
}

export type Category = 'beads' | 'tools' | 'patterns'

export interface Product {
  id: string
  name: Bilingual
  desc: Bilingual
  category: Category
  priceHKD: number
  stock: number
  image: string // data-uri 或 URL
  featured: boolean
}

export interface SiteContent {
  heroTitle: Bilingual
  heroSubtitle: Bilingual
  heroImage: string
  heroVideo: string // 首頁影片（URL 或 public 路徑，留空則唔顯示）
  announcement: Bilingual
  aboutTitle: Bilingual
  aboutText: Bilingual
  aboutImage: string
  bannerImage: string
  shopName: Bilingual
  footerText: Bilingual
}

export interface Faq {
  id: string
  q: Bilingual
  a: Bilingual
}

export interface QA {
  id: string
  question: Bilingual
  answer: Bilingual
  keywords: string[] // 關鍵字（中英皆可）
}

export interface Review {
  id: string
  name: string
  rating: number // 1-5
  text: Bilingual
  productName: Bilingual
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  name: Bilingual
  qty: number
  priceHKD: number
}

export interface Order {
  id: string // BD-XXXXXX
  items: OrderItem[]
  subtotalHKD: number
  shippingHKD: number
  totalHKD: number
  currency: Currency
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  payment: string
  status: OrderStatus
  note: string
  createdAt: string // ISO
}

export interface EmailSettings {
  notifyEmail: string // 店主收新訂單通知的邮箱
  emailjsServiceId: string
  emailjsTemplateId: string
  emailjsPublicKey: string
  enabled: boolean // 是否真實發送（未設定則記錄到發件日誌）
}

export interface NotifySettings {
  waPhone: string    // 店主 WhatsApp（連區碼，唔使 +，例：85292128542）
  waApiKey: string   // CallMeBot APIKEY（啟動後由機械人發送）
  enabled: boolean   // 落單時自動 WhatsApp 通知店主
}

export interface EmailLog {
  id: string
  to: string
  subject: string
  body: string
  kind: 'order_confirmation' | 'shipping' | 'admin_alert'
  status: 'sent' | 'simulated' | 'failed'
  createdAt: string
}

export interface CartItem {
  productId: string
  qty: number
}
