const STORAGE_KEY = 'eventpinas-saved-items'

function readSavedMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { events: [], suppliers: [], organizers: [] }
  } catch {
    return { events: [], suppliers: [], organizers: [] }
  }
}

function writeSavedMap(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getSavedItems() {
  return readSavedMap()
}

export function isItemSaved(type, id) {
  const map = readSavedMap()
  return Array.isArray(map[type]) && map[type].includes(id)
}

export function toggleSavedItem(type, id) {
  const map = readSavedMap()
  const current = Array.isArray(map[type]) ? map[type] : []
  const next = current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
  const updated = { ...map, [type]: next }
  writeSavedMap(updated)
  return updated
}

export function clearSavedItems() {
  writeSavedMap({ events: [], suppliers: [], organizers: [] })
}
