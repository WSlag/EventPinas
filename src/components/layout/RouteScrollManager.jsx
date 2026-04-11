import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

function resolveLocationKey(location) {
  if (location.key) return location.key
  return `${location.pathname}${location.search}${location.hash}`
}

function getHashTarget(hash) {
  if (!hash || hash === '#') return null

  const decodedId = decodeURIComponent(hash.slice(1))
  if (!decodedId) return null

  const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(decodedId)
    : decodedId.replace(/["\\]/g, '\\$&')

  return (
    document.getElementById(decodedId)
    || document.querySelector(`[id="${escapedId}"]`)
    || document.querySelector(`[name="${escapedId}"]`)
  )
}

export default function RouteScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const locationKey = resolveLocationKey(location)
  const previousLocationKeyRef = useRef(locationKey)
  const scrollPositionsRef = useRef(new Map())

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const previousKey = previousLocationKeyRef.current
    if (previousKey) {
      scrollPositionsRef.current.set(previousKey, {
        x: window.scrollX,
        y: window.scrollY,
      })
    }

    const frameId = window.requestAnimationFrame(() => {
      const hashTarget = getHashTarget(location.hash)
      if (hashTarget && typeof hashTarget.scrollIntoView === 'function') {
        hashTarget.scrollIntoView()
        return
      }

      if (navigationType === 'POP') {
        const savedScroll = scrollPositionsRef.current.get(locationKey)
        if (savedScroll) {
          window.scrollTo(savedScroll.x ?? 0, savedScroll.y ?? 0)
          return
        }
      }

      window.scrollTo(0, 0)
    })

    previousLocationKeyRef.current = locationKey

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [location.hash, locationKey, navigationType])

  return null
}
