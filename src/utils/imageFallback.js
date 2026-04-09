export function getFallbackImageHandler(fallbackSrc) {
  return (event) => {
    const target = event.currentTarget

    if (!fallbackSrc || target.dataset.fallbackApplied === 'true') {
      return
    }

    target.dataset.fallbackApplied = 'true'
    target.src = fallbackSrc
  }
}
