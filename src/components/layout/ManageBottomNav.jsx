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
    return () => { active = false }
  }, [location.pathname])

  useEffect(() => {
    setShowMore(false)
  }, [location.pathname, location.search])

  if (!location.pathname.startsWith('/manage')) return null

  return (
    <>
      <nav
        aria-label="Manage navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-mgmt-border bg-mgmt-surface pb-[env(safe-area-inset-bottom)] shadow-mgmt md:hidden"
      >
        <div className="grid grid-cols-5">
          {coreItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.id}
                to={`${item.to}${querySuffix}`}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-0.5 transition-colors duration-fast ${
                  active ? 'text-mgmt-gold' : 'text-mgmt-muted'
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-[2px] w-8 rounded-full bg-gradient-accent-h" />
                )}
                <ManageIcon id={item.id} active={active} />
                <span className="font-barlow text-[0.6875rem] uppercase tracking-[0.08em]">
                  {item.label}
                </span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            aria-label="More modules"
            aria-expanded={showMore}
            aria-controls={morePanelId}
            className={`relative flex h-16 flex-col items-center justify-center gap-0.5 transition-colors duration-fast ${
              showMore ? 'text-mgmt-gold' : 'text-mgmt-muted'
            }`}
          >
            {showMore && (
              <span className="absolute top-0 h-[2px] w-8 rounded-full bg-gradient-accent-h" />
            )}
            <ManageIcon id="more" active={showMore} />
            <span className="font-barlow text-[0.6875rem] uppercase tracking-[0.08em]">More</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div
          className="fixed inset-0 z-50 bg-mgmt-bg/60 backdrop-blur-sm md:hidden"
          onClick={() => setShowMore(false)}
          role="presentation"
        >
          <div
            id={morePanelId}
            className="absolute bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 rounded-t-2xl border-l border-r border-t border-mgmt-border bg-mgmt-surface p-space-4 shadow-mgmt"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="More manage modules"
          >
            <p className="font-barlow text-[0.75rem] uppercase tracking-[0.18em] text-mgmt-gold">
              More Tools
            </p>
            <div className="mt-space-3 grid grid-cols-2 gap-space-2">
              {moreItems.map((item) => {
                const active = location.pathname === item.to
                return (
                  <Link
                    key={item.id}
                    to={`${item.to}${querySuffix}`}
                    className={`flex min-h-10 items-center gap-space-2 rounded-lg border p-space-2 transition-colors duration-fast ${
                      active
                        ? 'border-mgmt-gold/50 bg-gradient-accent-tint text-mgmt-gold'
                        : 'border-mgmt-border bg-mgmt-raised text-mgmt-muted hover:border-mgmt-border-bright hover:text-mgmt-text'
                    }`}
                  >
                    <ManageIcon id={item.id} active={active} />
                    <span className="font-barlow text-[0.8125rem] font-semibold uppercase tracking-[0.04em]">
                      {item.label}
                    </span>
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
