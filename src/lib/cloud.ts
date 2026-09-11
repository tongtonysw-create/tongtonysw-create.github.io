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

/** 開店時讀取雲端資料。ok+null = 雲端無資料（可初始化）；error = 連線失敗（唔好推送，避免覆蓋雲端） */
export async function fetchCloudDB<T>(): Promise<{ status: 'ok'; data: T | null } | { status: 'error' }> {
  const sb = getClient()
  if (!sb) return { status: 'error' }
  try {
    const { data, error } = await sb.from(TABLE).select('data').eq('id', ROW_ID).maybeSingle()
    if (error) {
      console.warn('[cloud] fetch failed:', error.message)
      return { status: 'error' }
    }
    return { status: 'ok', data: (data?.data as T) ?? null }
  } catch (e) {
    console.warn('[cloud] fetch error:', e)
    return { status: 'error' }
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
const LEGACY_ADMIN_PASSWORD = 'admin123' // 未跑 v2 SQL 前嘅過渡密碼；跑咗 v2 後由雲端密碼表接管
let adminPwd = ''

export function setAdminPassword(pwd: string) {
  adminPwd = pwd
}

/** 後台登入：優先用雲端密碼表（v2 RPC）；RPC 未安裝時退回過渡密碼 */
export async function adminLogin(pwd: string): Promise<boolean> {
  const sb = getClient()
  if (!sb) return pwd === LEGACY_ADMIN_PASSWORD
  try {
    const { data, error } = await sb.rpc('admin_check_password', { pwd })
    if (error) return pwd === LEGACY_ADMIN_PASSWORD // RPC 未裝：過渡模式
    return data === true
  } catch {
    return pwd === LEGACY_ADMIN_PASSWORD
  }
}

/** 後台改密碼（需要已跑 v2 SQL）；回傳 ok / wrong（舊密碼錯）/ unavailable（未升級雲端） */
export async function changeAdminPassword(oldPwd: string, newPwd: string): Promise<'ok' | 'wrong' | 'unavailable'> {
  const sb = getClient()
  if (!sb) return 'unavailable'
  try {
    const { data, error } = await sb.rpc('admin_change_password', { old_pwd: oldPwd, new_pwd: newPwd })
    if (error) {
      console.warn('[cloud] change password failed:', error.message)
      return 'unavailable'
    }
    return data === true ? 'ok' : 'wrong'
  } catch {
    return 'unavailable'
  }
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
