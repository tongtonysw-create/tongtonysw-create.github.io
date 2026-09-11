import { Routes, Route, Navigate } from 'react-router'
import { StoreProvider } from './lib/store'
import Storefront from './pages/Storefront'
import Admin from './pages/Admin'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/admin" element={<Admin />} />
        {/* 任何唔認得嘅網址都導返首頁，唔會再白屏 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  )
}
