import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import HomePage from '@/pages/marketplace/HomePage'
import EventsPage from '@/pages/marketplace/EventsPage'
import EventDetailPage from '@/pages/marketplace/EventDetailPage'
import SuppliersPage from '@/pages/marketplace/SuppliersPage'
import SupplierDetailPage from '@/pages/marketplace/SupplierDetailPage'
import OrganizersPage from '@/pages/marketplace/OrganizersPage'
import OrganizerDetailPage from '@/pages/marketplace/OrganizerDetailPage'
import SavedPage from '@/pages/marketplace/SavedPage'
import OrganizerManagePage from '@/pages/marketplace/OrganizerManagePage'

function MarketplaceLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <TopNav />
      <main className="pb-safe md:pb-space-8">{children}</main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<MarketplaceLayout><HomePage /></MarketplaceLayout>} />
          <Route path="/events" element={<MarketplaceLayout><EventsPage /></MarketplaceLayout>} />
          <Route path="/events/:id" element={<MarketplaceLayout><EventDetailPage /></MarketplaceLayout>} />
          <Route path="/suppliers" element={<MarketplaceLayout><SuppliersPage /></MarketplaceLayout>} />
          <Route path="/suppliers/:id" element={<MarketplaceLayout><SupplierDetailPage /></MarketplaceLayout>} />
          <Route path="/organizers" element={<MarketplaceLayout><OrganizersPage /></MarketplaceLayout>} />
          <Route path="/organizers/:id" element={<MarketplaceLayout><OrganizerDetailPage /></MarketplaceLayout>} />
          <Route path="/saved" element={<MarketplaceLayout><SavedPage /></MarketplaceLayout>} />

          <Route
            path="/manage"
            element={
              <ProtectedRoute requiredRole="organizer">
                <MarketplaceLayout>
                  <OrganizerManagePage />
                </MarketplaceLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
