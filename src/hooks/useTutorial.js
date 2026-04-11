import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'mgmt-tutorial-v1'

export function useTutorial() {
  const [step, setStep] = useState(0)
  const [active, setActive] = useState(false)

  // Auto-start on first visit after a short delay (gives dashboard time to render)
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === 'true'
    if (completed) return
    const timer = setTimeout(() => setActive(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const start = useCallback(() => {
    setStep(0)
    setActive(true)
  }, [])

  const next = useCallback((totalSteps) => {
    setStep((prev) => {
      if (prev < totalSteps - 1) return prev + 1
      return prev
    })
  }, [])

  const prev = useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const complete = useCallback(() => {
    setActive(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const dismiss = useCallback(() => {
    setActive(false)
  }, [])

  return { active, step, start, next, prev, complete, dismiss }
}
