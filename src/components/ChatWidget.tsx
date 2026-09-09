// ── AI 客服浮窗：中英雙語、讀取即時庫存 / 後台問答庫 / 查訂單 ─────
import { useEffect, useRef, useState } from 'react'
import { MessageCircleHeart, X, Send, Bot } from 'lucide-react'
import { useStore, t } from '@/lib/store'
import { getChatReply } from '@/lib/chat'

interface Msg {
  from: 'user' | 'bot'
  text: string
  suggestions?: string[]
}

export default function ChatWidget() {
  const { lang, db, currency } = useStore()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing, open])

  const greet = () => {
    const g = getChatReply(lang === 'zh' ? '你好' : 'hello', { products: db.products, qas: db.qas, orders: db.orders, currency })
    setMsgs([{ from: 'bot', text: g.text, suggestions: g.suggestions }])
  }

  const send = (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text) return
    setInput('')
    setMsgs((m) => [...m, { from: 'user', text }])
    setTyping(true)
    // 模擬思考延遲，體感更像 AI
    setTimeout(() => {
      const reply = getChatReply(text, { products: db.products, qas: db.qas, orders: db.orders, currency })
      setMsgs((m) => [...m, { from: 'bot', text: reply.text, suggestions: reply.suggestions }])
      setTyping(false)
    }, 450)
  }

  return (
    <>
      {/* 浮動按鈕 */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true)
            if (msgs.length === 0) greet()
          }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full rose-gradient text-white shadow-xl shadow-[#c4718b]/35 flex items-center justify-center hover:scale-105 transition-transform"
          title={t.chatTitle[lang]}
        >
          <MessageCircleHeart size={24} />
        </button>
      )}

      {/* 聊天窗 */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-sm h-[520px] max-h-[75vh] bg-white rounded-3xl shadow-2xl border border-[#f3dde3] flex flex-col overflow-hidden fade-in">
          <div className="rose-gradient text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </span>
              <div>
                <p className="font-display font-semibold leading-tight">{t.chatTitle[lang]}</p>
                <p className="text-[11px] text-white/85 font-body">{t.chatSubtitle[lang]}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#fdf8f4]">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-bubble-in flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%]`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm font-body whitespace-pre-line leading-relaxed ${
                      m.from === 'user' ? 'rose-gradient text-white rounded-br-md' : 'bg-white border border-[#f3dde3] text-[#5a4550] rounded-bl-md'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.suggestions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="text-[11px] font-body px-3 py-1 rounded-full border border-[#e8c3cf] text-[#a5566f] bg-white hover:bg-[#f7e6ea] transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start chat-bubble-in">
                <div className="bg-white border border-[#f3dde3] px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-[#b39aa5] font-body">
                  …
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-[#f3dde3] bg-white flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t.chatPlaceholder[lang]}
              className="flex-1 font-body text-sm px-4 py-2.5 rounded-full border border-[#f3dde3] focus:outline-none focus:ring-2 focus:ring-[#e8c3cf] text-[#5a4550]"
            />
            <button
              onClick={() => send()}
              className="w-10 h-10 rounded-full rose-gradient text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
