// ── Supabase 雲端資料同步：全店資料存單一 JSON 行，後台改動即時全網生效 ──
// 未設定 URL/KEY 或連線失敗時，自動退回 localStorage 本機模式。
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// 👇 部署前填入 Supabase 項目資料（Dashboard → Settings → API）
export const SUPABASE_URL = 'https://pzmktucgmbyzlxsgscow.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_LWTQ92AEJ0iX7n7qVLFD0A_Bi-qHPw5'

const TABLE = 'beadoria_store'
const ROW_ID = 1

let client: SupabaseClient | null = null

export function cloudEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

function getClient(): SupabaseClient | null {
  if (!cloudEnabled()) return null
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return client
}

/** 開店時讀取雲端資料；無資料回傳 null（呼叫方決定用本地預設） */
export async function fetchCloudDB<T>(): Promise<T | null> {
  const sb = getClient()
  if (!sb) return null
  try {
    const { data, error } = await sb.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle()
    if (error) {
      console.warn('[cloud] fetch failed:', error.message)
      return null
    }
    return (data?.data as T) ?? null
  } catch (e) {
    console.warn('[cloud] fetch error:', e)
    return null
  }
}

/** 推送全店公開資料上雲端（upsert 單行） */
export async function pushCloudDB(db: unknown): Promise<boolean> {
  const sb = getClient()
  if (!sb) return false
  try {
    const { error } = await sb
      .from(TABLE)
      .upsert({ id: ROW_ID, data: db, updated_at: new Date().toISOString() })
    if (error) {
      console.warn('[cloud] push failed:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[cloud] push error:', e)
    return false
  }
}

// ── 訂單（含客人個人資料）：客人可落單；讀取/更新必須經密碼保護嘅 RPC ──
const ORDERS_TABLE = 'beadoria_orders'
let adminPwd = ''

export function setAdminPassword(pwd: string) {
  adminPwd = pwd
}

/** 客人落單：即時寫入雲端訂單表 */
export async function insertCloudOrder(order: { id: string }): Promise<boolean> {
  const sb = getClient()
  if (!sb) return false
  try {
    const { error } = await sb.from(ORDERS_TABLE).upsert({ id: order.id, payload: order })
    if (error) {
      console.warn('[cloud] insert order failed:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[cloud] insert order error:', e)
    return false
  }
}

/** 後台用：密碼驗證後拉取全部訂單 */
export async function fetchCloudOrders<T>(): Promise<T[] | null> {
  const sb = getClient()
  if (!sb || !adminPwd) return null
  try {
    const { data, error } = await sb.rpc('admin_get_orders', { pwd: adminPwd })
    if (error) {
      console.warn('[cloud] fetch orders failed:', error.message)
      return null
    }
    return ((data || []) as { payload: T }[]).map((r) => r.payload)
  } catch (e) {
    console.warn('[cloud] fetch orders error:', e)
    return null
  }
}

/** 後台用：更新訂單狀態 */
export async function updateCloudOrderStatus(oid: string, status: string): Promise<boolean> {
  const sb = getClient()
  if (!sb || !adminPwd) return false
  try {
    const { error } = await sb.rpc('admin_set_order_status', { pwd: adminPwd, oid, st: status })
    if (error) {
      console.warn('[cloud] update order failed:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('[cloud] update order error:', e)
    return false
  }
}

/** 前台 AI 客服查單：只回傳非敏感欄位（狀態/日期/商品/金額） */
export async function trackCloudOrder<T>(oid: string): Promise<T | null> {
  const sb = getClient()
  if (!sb) return null
  try {
    const { data, error } = await sb.rpc('public_track_order', { oid })
    if (error) {
      console.warn('[cloud] track order failed:', error.message)
      return null
    }
    return (data as T) ?? null
  } catch (e) {
    console.warn('[cloud] track order error:', e)
    return null
  }
}
