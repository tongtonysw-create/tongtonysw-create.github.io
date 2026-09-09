import { Routes, Route } from 'react-router'
import { StoreProvider } from './lib/store'
import Storefront from './pages/Storefront'
import Admin from './pages/Admin'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </StoreProvider>
  )
}
