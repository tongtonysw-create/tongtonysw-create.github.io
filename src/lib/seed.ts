// ── 預設資料（首次載入時種入，之後以 localStorage 為準）─────────
import type { Product, SiteContent, Faq, QA, Review, EmailSettings, NotifySettings } from './types'
import { beadArt, pastelScene } from './images'

export const FREE_SHIPPING_HKD = 300
export const HKD_TO_CNY = 0.92
export const SHIPPING_FEE_HKD = 30

export const defaultProducts: Product[] = [
  {
    id: 'p-heart-set',
    name: { zh: '初戀心心拼豆套裝', en: 'First Love Heart Bead Kit' },
    desc: {
      zh: '24 色柔和粉系拼豆 6,000 粒，附愛心模板與燙紙，新手也能拼出浪漫小心心。',
      en: '6,000 pastel beads in 24 rosy shades with heart pegboard & ironing paper — perfect first kit.',
    },
    category: 'beads',
    priceHKD: 168,
    stock: 25,
    image: beadArt('heart', 'rose', 11),
    featured: true,
  },
  {
    id: 'p-flower-set',
    name: { zh: '春日小花拼豆補充包', en: 'Spring Bloom Refill Pack' },
    desc: {
      zh: '12 色清新花系配色 3,000 粒，適合花朵、植物系圖紙創作。',
      en: '3,000 beads in 12 fresh floral tones, made for botanical pattern lovers.',
    },
    category: 'beads',
    priceHKD: 98,
    stock: 40,
    image: beadArt('flower', 'sage', 22),
    featured: true,
  },
  {
    id: 'p-rainbow-set',
    name: { zh: '彩虹雲朵拼豆禮盒', en: 'Rainbow Cloud Gift Box' },
    desc: {
      zh: '36 色全色系 10,000 粒豪華禮盒，送禮自用皆宜。',
      en: 'A deluxe 10,000-bead box in 36 full-spectrum colours — ready to gift.',
    },
    category: 'beads',
    priceHKD: 268,
    stock: 12,
    image: beadArt('rainbow', 'sky', 33),
    featured: true,
  },
  {
    id: 'p-pegboard',
    name: { zh: '透明拼豆模板套裝（5 件）', en: 'Clear Pegboard Set (5 pcs)' },
    desc: {
      zh: '心心、花花、星星、圓形、方形五款加厚模板，可拼接大作品。',
      en: 'Five sturdy pegboards — heart, flower, star, circle & square — linkable for big pieces.',
    },
    category: 'tools',
    priceHKD: 88,
    stock: 60,
    image: beadArt('star', 'lilac', 44),
    featured: false,
  },
  {
    id: 'p-iron-kit',
    name: { zh: '迷你燙斗 + 燙紙套裝', en: 'Mini Iron & Paper Set' },
    desc: {
      zh: '低溫迷你燙斗連 20 張燙紙，均勻受熱，作品更平滑。',
      en: 'Low-heat mini iron with 20 ironing sheets for smooth, even finishes.',
    },
    category: 'tools',
    priceHKD: 158,
    stock: 18,
    image: beadArt('mushroom', 'peach', 55),
    featured: false,
  },
  {
    id: 'p-tweezer',
    name: { zh: '精準鑷子 + 分豆盤', en: 'Precision Tweezers & Tray' },
    desc: {
      zh: '防靜電鑷子配 24 格分豆盤，分色快一倍。',
      en: 'Anti-static tweezers with a 24-cell sorting tray — sort twice as fast.',
    },
    category: 'tools',
    priceHKD: 58,
    stock: 80,
    image: beadArt('cherry', 'cream', 66),
    featured: false,
  },
  {
    id: 'p-custom-pattern',
    name: { zh: '個人化圖紙設計（電子檔）', en: 'Custom Pattern Design (Digital)' },
    desc: {
      zh: '把你嘅相片變成獨一無二嘅拼豆圖紙！設計師一對一調色，附色號清單。',
      en: 'Turn your photo into a one-of-a-kind bead pattern. 1-on-1 colour tuning with a full bead list.',
    },
    category: 'patterns',
    priceHKD: 228,
    stock: 999,
    image: beadArt('cat', 'rose', 77),
    featured: true,
  },
  {
    id: 'p-pattern-pack',
    name: { zh: '療癒系圖紙合集（30 款）', en: 'Healing Pattern Collection (30)' },
    desc: {
      zh: '貓貓、蘑菇、小熊等 30 款原創圖紙 PDF，即買即印。',
      en: '30 original printable PDF patterns — cats, mushrooms, bears and more.',
    },
    category: 'patterns',
    priceHKD: 128,
    stock: 999,
    image: beadArt('bear', 'lilac', 88),
    featured: false,
  },
]

export const defaultSite: SiteContent = {
  shopName: { zh: 'Beadoria 拼豆物語', en: 'Beadoria Bead Stories' },
  heroTitle: { zh: '一粒一粒，拼出屬於你嘅浪漫', en: 'Bead by bead, craft your own romance' },
  heroSubtitle: {
    zh: '香港本土拼豆小店 · 精選柔和色系拼豆、專業工具，同埋一對一個人化圖紙設計，將你嘅回憶變成可以觸摸嘅作品。',
    en: 'A Hong Kong boutique for pastel fuse beads, pro tools and bespoke 1-on-1 pattern design — turning your memories into something you can hold.',
  },
  heroImage: pastelScene('rose', 5),
  heroVideo: 'https://files.catbox.moe/abftnr.mp4', // 已上傳嘅宣傳片（本機開發可改返 hero-video.mp4）
  announcement: { zh: '🌸 全單滿 HK$300 免運費 · 新會員首單 95 折', en: '🌸 Free shipping over HK$300 · 5% off your first order' },
  aboutTitle: { zh: '關於 Beadoria', en: 'About Beadoria' },
  aboutText: {
    zh: '我哋相信，慢活嘅手作時光係都市人最好嘅禮物。每一套拼豆都經過店主親自調色，希望為你帶嚟一個下晝嘅寧靜同滿足。',
    en: 'We believe slow crafting is the best gift for city souls. Every kit is colour-curated by our founder to bring you an afternoon of calm and joy.',
  },
  aboutImage: pastelScene('lilac', 9),
  bannerImage: pastelScene('sage', 14),
  footerText: { zh: '© 2026 Beadoria 拼豆物語 · 香港手作小店 · 用心拼好每一粒', en: '© 2026 Beadoria Bead Stories · Handmade in Hong Kong · Every bead with love' },
}

export const defaultFaqs: Faq[] = [
  {
    id: 'f1',
    q: { zh: '幾耐會收到貨？', en: 'How long is delivery?' },
    a: {
      zh: '香港本地訂單一般 2-4 個工作天經順豐站/智能櫃送出；內地訂單約 5-8 個工作天。個人化圖紙設計需 3-5 個工作天製作，完成後以電郵發送電子檔。',
      en: 'HK orders arrive in 2–4 working days via SF Express lockers; mainland orders take 5–8 working days. Custom patterns take 3–5 working days and are delivered by email.',
    },
  },
  {
    id: 'f2',
    q: { zh: '運費點計？', en: 'How much is shipping?' },
    a: {
      zh: '全單滿 HK$300 免運費；未滿 HK$300 劃一收 HK$30。人民幣訂單會自動按匯率換算。',
      en: 'Free shipping on orders over HK$300, otherwise a flat HK$30. CNY orders are converted automatically.',
    },
  },
  {
    id: 'f3',
    q: { zh: '個人化圖紙要提供咩？', en: 'What do I need for a custom pattern?' },
    a: {
      zh: '落單後電郵一張清晰相片俾我哋（建議正面、光線充足），設計師會出草稿同你確認，滿意先定稿。',
      en: 'After checkout, email us a clear, well-lit photo. Our designer will send a draft for your approval before finalising.',
    },
  },
  {
    id: 'f4',
    q: { zh: '可以退換嗎？', en: 'Can I return or exchange?' },
    a: {
      zh: '未開封實體貨品可於收貨後 7 天內退換；個人化圖紙屬訂製數碼產品，恕不退換。',
      en: 'Unopened physical items can be returned within 7 days. Custom digital patterns are made-to-order and non-refundable.',
    },
  },
]

export const defaultQAs: QA[] = [
  {
    id: 'q1',
    question: { zh: '運費多少？有免運嗎？', en: 'How much is shipping? Any free shipping?' },
    answer: {
      zh: '香港訂單滿 HK$300 免運費，未滿劃一 HK$30。一般 2-4 個工作天送到順豐站或智能櫃。',
      en: 'Free shipping for HK orders over HK$300; otherwise a flat HK$30. Delivery takes 2–4 working days to SF lockers.',
    },
    keywords: ['運費', '免運', '郵費', 'shipping', 'delivery', 'free shipping', '送貨'],
  },
  {
    id: 'q2',
    question: { zh: '點樣訂製個人圖紙？', en: 'How do I order a custom pattern?' },
    answer: {
      zh: '直接購買「個人化圖紙設計」，落單後電郵清晰相片俾我哋，設計師 3-5 個工作天內出草稿同你確認。',
      en: 'Purchase "Custom Pattern Design", then email us a clear photo. Our designer will send a draft within 3–5 working days.',
    },
    keywords: ['圖紙', '訂製', 'custom', 'pattern', '個人化', '設計', 'photo', '相片'],
  },
  {
    id: 'q3',
    question: { zh: '接受什麼付款方式？', en: 'What payment methods do you accept?' },
    answer: {
      zh: '我哋接受 FPS 轉數快、PayMe、AlipayHK、WeChat Pay 同信用卡。落單後會收到付款指示電郵。',
      en: 'We accept FPS, PayMe, AlipayHK, WeChat Pay and credit cards. Payment instructions are emailed after checkout.',
    },
    keywords: ['付款', '支付', 'payment', 'fps', 'payme', 'alipay', '信用卡', 'wechat'],
  },
  {
    id: 'q4',
    question: { zh: '可以退貨嗎？', en: 'Can I get a refund?' },
    answer: {
      zh: '未開封實體貨品 7 天內可退換；訂製圖紙屬數碼產品，恕不退換。如有問題隨時搵我哋。',
      en: 'Unopened physical items: 7-day returns. Custom digital patterns are non-refundable. Reach out anytime if something is wrong.',
    },
    keywords: ['退貨', '退款', 'refund', 'return', '退換', 'exchange'],
  },
  {
    id: 'q5',
    question: { zh: '有實體店嗎？', en: 'Do you have a physical shop?' },
    answer: {
      zh: '我哋暫時係網店，間中會喺香港市集擺檔，留意我哋 IG 公佈！',
      en: "We're online-only for now, but we pop up at Hong Kong craft markets — follow our IG for dates!",
    },
    keywords: ['實體店', '門市', '地址', 'shop', 'store', 'location', '市集'],
  },
]

export const defaultReviews: Review[] = [
  {
    id: 'r1',
    name: 'Katie W.',
    rating: 5,
    text: {
      zh: '顏色真係好靚，同圖片一樣咁溫柔！包裝仲有手寫卡，好有心思 💕',
      en: 'The colours are exactly as dreamy as the photos! There was even a handwritten card 💕',
    },
    productName: { zh: '初戀心心拼豆套裝', en: 'First Love Heart Bead Kit' },
  },
  {
    id: 'r2',
    name: 'Milo C.',
    rating: 5,
    text: {
      zh: '訂咗張貓貓圖紙，設計師好細心改咗三次，成品超似！',
      en: 'Ordered a custom cat pattern — the designer revised it 3 times. The result is spot on!',
    },
    productName: { zh: '個人化圖紙設計', en: 'Custom Pattern Design' },
  },
  {
    id: 'r3',
    name: 'Chloe L.',
    rating: 4,
    text: {
      zh: '迷你燙斗好好用，受熱均勻，第一次燙就成功！',
      en: 'The mini iron works beautifully — even heat, nailed it on my first try!',
    },
    productName: { zh: '迷你燙斗 + 燙紙套裝', en: 'Mini Iron & Paper Set' },
  },
]

export const defaultEmailSettings: EmailSettings = {
  notifyEmail: 'shop@beadoria.hk',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: '',
  enabled: false,
}

export const defaultNotify: NotifySettings = {
  waPhone: '85292128542',
  waApiKey: '',
  enabled: true,
}
