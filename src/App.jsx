import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import OrganizerGuard from '@/components/auth/OrganizerGuard'

import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'
import ManageBottomNav from '@/components/layout/ManageBottomNav'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const SubscribePage = lazy(() => import('@/pages/auth/SubscribePage'))
const HomePage = lazy(() => import('@/pages/marketplace/HomePage'))
const EventsPage = lazy(() => import('@/pages/marketplace/EventsPage'))
const EventDetailPage = lazy(() => import('@/pages/marketplace/EventDetailPage'))
const SuppliersPage = lazy(() => import('@/pages/marketplace/SuppliersPage'))
const SupplierDetailPage = lazy(() => import('@/pages/marketplace/SupplierDetailPage'))
const OrganizersPage = lazy(() => import('@/pages/marketplace/OrganizersPage'))
const OrganizerDetailPage = lazy(() => import('@/pages/marketplace/OrganizerDetailPage'))
const SavedPage = lazy(() => import('@/pages/marketplace/SavedPage'))
const OrganizerManagePage = lazy(() => import('@/pages/marketplace/OrganizerManagePage'))
const ManageDashboardPage = lazy(() => import('@/pages/marketplace/manage/ManageDashboardPage'))
const ManageEventsPage = lazy(() => import('@/pages/marketplace/manage/ManageEventsPage'))
const ManageCheckinPage = lazy(() => import('@/pages/marketplace/manage/ManageCheckinPage'))
const ManageGuestsPage = lazy(() => import('@/pages/marketplace/manage/ManageGuestsPage'))
const ManageSeatingPage = lazy(() => import('@/pages/marketplace/manage/ManageSeatingPage'))
const ManageStaffPage = lazy(() => import('@/pages/marketplace/manage/ManageStaffPage'))
const ManageQrPage = lazy(() => import('@/pages/marketplace/manage/ManageQrPage'))
const ManageIncidentsPage = lazy(() => import('@/pages/marketplace/manage/ManageIncidentsPage'))
const ManageWaitlistPage = lazy(() => import('@/pages/marketplace/manage/ManageWaitlistPage'))
const ManageAnalyticsPage = lazy(() => import('@/pages/marketplace/manage/ManageAnalyticsPage'))
const ManageAuditPage = lazy(() => import('@/pages/marketplace/manage/ManageAuditPage'))
const ManagePlannerPage = lazy(() => import('@/pages/marketplace/manage/ManagePlannerPage'))
const ManageOnlineRegistrationPage = lazy(() => import('@/pages/marketplace/manage/ManageOnlineRegistrationPage'))
const ManageOnsiteRegistrationPage = lazy(() => import('@/pages/marketplace/manage/ManageOnsiteRegistrationPage'))

function MarketplaceLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <TopNav />
      <main className="pb-safe md:pb-space-8">{children}</main>
      <BottomNav />
    </div>
  )
}

function ManageLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <TopNav />
      <main className="pb-24 md:pb-space-8">{children}</main>
      <ManageBottomNav />
    </div>
  )
}

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-space-4 py-space-6 font-body text-body-sm text-neutral-500 md:px-space-6 md:py-space-8">
      Loading page...
    </div>
  )
}

function LazyPage({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function renderLazy(Component) {
  return (
    <LazyPage>
      <Component />
    </LazyPage>
  )
}

function renderMarketplacePage(Component) {
  return <MarketplaceLayout>{renderLazy(Component)}</MarketplaceLayout>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={renderLazy(LoginPage)} />
          <Route path="/register" element={renderLazy(RegisterPage)} />
          <Route path="/subscribe" element={renderMarketplacePage(SubscribePage)} />

          <Route path="/" element={renderMarketplacePage(HomePage)} />
          <Route path="/events" element={renderMarketplacePage(EventsPage)} />
          <Route path="/events/:id" element={renderMarketplacePage(EventDetailPage)} />
          <Route path="/suppliers" element={renderMarketplacePage(SuppliersPage)} />
          <Route path="/suppliers/:id" element={renderMarketplacePage(SupplierDetailPage)} />
          <Route path="/organizers" element={renderMarketplacePage(OrganizersPage)} />
          <Route path="/organizers/:id" element={renderMarketplacePage(OrganizerDetailPage)} />
          <Route path="/saved" element={renderMarketplacePage(SavedPage)} />

          <Route
            path="/manage"
            element={(
              <OrganizerGuard>
                <ManageLayout>
                  {renderLazy(OrganizerManagePage)}
                </ManageLayout>
              </OrganizerGuard>
            )}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={renderLazy(ManageDashboardPage)} />
            <Route path="events" element={renderLazy(ManageEventsPage)} />
            <Route path="planner" element={renderLazy(ManagePlannerPage)} />
            <Route path="registration-online" element={renderLazy(ManageOnlineRegistrationPage)} />
            <Route path="registration-onsite" element={renderLazy(ManageOnsiteRegistrationPage)} />
            <Route path="checkin" element={renderLazy(ManageCheckinPage)} />
            <Route path="guests" element={renderLazy(ManageGuestsPage)} />
            <Route path="seating" element={renderLazy(ManageSeatingPage)} />
            <Route path="staff" element={renderLazy(ManageStaffPage)} />
            <Route path="qr" element={renderLazy(ManageQrPage)} />
            <Route path="incidents" element={renderLazy(ManageIncidentsPage)} />
            <Route path="waitlist" element={renderLazy(ManageWaitlistPage)} />
            <Route path="analytics" element={renderLazy(ManageAnalyticsPage)} />
            <Route path="audit" element={renderLazy(ManageAuditPage)} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
