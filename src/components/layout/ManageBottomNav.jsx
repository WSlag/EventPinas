import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ManageIcon } from '@/components/layout/ManageIcons'
import { manageMobileCoreIds, manageNavConfig } from '@/data'
import { getManageBootstrap, getManageRolePermissions } from '@/services'

function byMobilePriority(a, b) {
  return (a.mobilePriority ?? 99) - (b.mobilePriority ?? 99)
}

export default function ManageBottomNav() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [permissions, setPermissions] = useState([])
  const [showMore, setShowMore] = useState(false)
  const selectedEventId = searchParams.get('event')
  const morePanelId = 'manage-more-panel'

  const querySuffix = selectedEventId ? `?event=${selectedEventId}` : ''
  const visibleItems = useMemo(
    () => manageNavConfig.filter((item) => permissions.includes(item.permission)),
    [permissions],
  )
  const coreItems = useMemo(
    () => visibleItems.filter((item) => manageMobileCoreIds.includes(item.id)).sort(byMobilePriority),
    [visibleItems],
  )
  const moreItems = useMemo(
    () => visibleItems.filter((item) => !manageMobileCoreIds.includes(item.id)),
    [visibleItems],
  )

  useEffect(() => {
    if (!location.pathname.startsWith('/manage')) return
    let active = true

    async function loadPermissions() {
      try {
        const bootstrap = await getManageBootstrap({ simulateLatency: false })
        if (!active) return
        setPermissions(getManageRolePermissions(bootstrap.selectedOperatorRole ?? 'admin'))
      } catch {
        if (active) setPermissions(getManageRolePermissions('admin'))
      }
    }

    loadPermissions()
    return () => {
      active = false
    }
  }, [location.pathname])

  useEffect(() => {
    setShowMore(false)
  }, [location.pathname, location.search])

  if (!location.pathname.startsWith('/manage')) return null

  return (
    <>
      <nav
        aria-label="Manage navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white pb-safe shadow-xl md:hidden"
      >
        <div className="grid grid-cols-5">
          {coreItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.id}
                to={`${item.to}${querySuffix}`}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 ${
                  active ? 'text-info' : 'text-neutral-500'
                }`}
              >
                {active && <span className="absolute top-0 h-1 w-8 rounded-full bg-info" />}
                <ManageIcon id={item.id} active={active} />
                <span className="font-display text-caption-sm">{item.label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            aria-label="More modules"
            aria-expanded={showMore}
            aria-controls={morePanelId}
            className={`relative flex h-16 flex-col items-center justify-center gap-0.5 ${
              showMore ? 'text-info' : 'text-neutral-500'
            }`}
          >
            {showMore && <span className="absolute top-0 h-1 w-8 rounded-full bg-info" />}
            <ManageIcon id="more" active={showMore} />
            <span className="font-display text-caption-sm">More</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 md:hidden" onClick={() => setShowMore(false)} role="presentation">
          <div
            id={morePanelId}
            className="absolute bottom-16 left-0 right-0 rounded-t-3xl border border-neutral-200 bg-white p-space-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-label="More manage modules"
          >
            <p className="font-display text-label-md text-neutral-500">More tools</p>
            <div className="mt-space-2 grid grid-cols-2 gap-space-2">
              {moreItems.map((item) => {
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.id}
                    to={`${item.to}${querySuffix}`}
                    className={`flex min-h-10 items-center gap-space-2 rounded-xl border p-space-2 ${
                      active ? 'border-info bg-blue-50 text-info' : 'border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <ManageIcon id={item.id} active={active} />
                    <span className="font-display text-label-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
