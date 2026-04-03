import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth.jsx'

import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'

import HomePage from '@/pages/marketplace/HomePage'
import EventsPage from '@/pages/marketplace/EventsPage'
import SuppliersPage from '@/pages/marketplace/SuppliersPage'
import OrganizersPage from '@/pages/marketplace/OrganizersPage'
import SavedPage from '@/pages/marketplace/SavedPage'
import LoginPage from '@/pages/auth/LoginPage'

function MarketplaceLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-base">
      <TopNav />
      <main className="max-w-md mx-auto pb-safe">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public marketplace */}
          <Route path="/" element={<MarketplaceLayout><HomePage /></MarketplaceLayout>} />
          <Route path="/events" element={<MarketplaceLayout><EventsPage /></MarketplaceLayout>} />
          <Route path="/suppliers" element={<MarketplaceLayout><SuppliersPage /></MarketplaceLayout>} />
          <Route path="/organizers" element={<MarketplaceLayout><OrganizersPage /></MarketplaceLayout>} />
          <Route path="/saved" element={<MarketplaceLayout><SavedPage /></MarketplaceLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
