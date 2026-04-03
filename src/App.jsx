import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import OrganizerGuard from '@/components/auth/OrganizerGuard'

import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import SubscribePage from '@/pages/auth/SubscribePage'
import HomePage from '@/pages/marketplace/HomePage'
import EventsPage from '@/pages/marketplace/EventsPage'
import EventDetailPage from '@/pages/marketplace/EventDetailPage'
import SuppliersPage from '@/pages/marketplace/SuppliersPage'
import SupplierDetailPage from '@/pages/marketplace/SupplierDetailPage'
import OrganizersPage from '@/pages/marketplace/OrganizersPage'
import OrganizerDetailPage from '@/pages/marketplace/OrganizerDetailPage'
import SavedPage from '@/pages/marketplace/SavedPage'
import OrganizerManagePage from '@/pages/marketplace/OrganizerManagePage'
import ManageDashboardPage from '@/pages/marketplace/manage/ManageDashboardPage'
import ManageEventsPage from '@/pages/marketplace/manage/ManageEventsPage'
import ManageCheckinPage from '@/pages/marketplace/manage/ManageCheckinPage'
import ManageGuestsPage from '@/pages/marketplace/manage/ManageGuestsPage'
import ManageSeatingPage from '@/pages/marketplace/manage/ManageSeatingPage'
import ManageStaffPage from '@/pages/marketplace/manage/ManageStaffPage'
import ManageQrPage from '@/pages/marketplace/manage/ManageQrPage'
import ManageIncidentsPage from '@/pages/marketplace/manage/ManageIncidentsPage'
import ManageWaitlistPage from '@/pages/marketplace/manage/ManageWaitlistPage'
import ManageAnalyticsPage from '@/pages/marketplace/manage/ManageAnalyticsPage'
import ManageAuditPage from '@/pages/marketplace/manage/ManageAuditPage'

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
          <Route path="/subscribe" element={<MarketplaceLayout><SubscribePage /></MarketplaceLayout>} />

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
            element={(
              <OrganizerGuard>
                <MarketplaceLayout>
                  <OrganizerManagePage />
                </MarketplaceLayout>
              </OrganizerGuard>
            )}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManageDashboardPage />} />
            <Route path="events" element={<ManageEventsPage />} />
            <Route path="checkin" element={<ManageCheckinPage />} />
            <Route path="guests" element={<ManageGuestsPage />} />
            <Route path="seating" element={<ManageSeatingPage />} />
            <Route path="staff" element={<ManageStaffPage />} />
            <Route path="qr" element={<ManageQrPage />} />
            <Route path="incidents" element={<ManageIncidentsPage />} />
            <Route path="waitlist" element={<ManageWaitlistPage />} />
            <Route path="analytics" element={<ManageAnalyticsPage />} />
            <Route path="audit" element={<ManageAuditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
