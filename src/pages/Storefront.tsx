// ── 前台首頁 ────────────────────────────────────────────────
import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import VideoSection from '@/components/VideoSection'
import Shop from '@/components/Shop'
import CartDrawer from '@/components/CartDrawer'
import CheckoutDialog from '@/components/CheckoutDialog'
import ChatWidget from '@/components/ChatWidget'
import { About, Reviews, FaqSection, Footer } from '@/components/Sections'

export default function Storefront() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <Header onOpenCart={() => setCartOpen(true)} />
      <Hero />
      <VideoSection />
      <Shop />
      <About />
      <Reviews />
      <FaqSection />
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <ChatWidget />
    </div>
  )
}
