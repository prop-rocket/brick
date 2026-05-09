import { useEffect, useState } from 'react'

export function getCSSVar(name) {
  return `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`
}

function readColors() {
  const s = getComputedStyle(document.documentElement)
  const get = (v) => getCSSVar(v)
  return {
    iron:     get('--color-iron'),
    dust:     get('--color-dust'),
    chalk:    get('--color-chalk'),
    mortar:   get('--color-mortar'),
    sand:     get('--color-sand'),
    brickRed: '#C8432B',
    ember:    '#E85D3A',
  }
}

// Returns theme-aware chart colors. Re-resolves CSS vars whenever the
// html element's class attribute changes (dark/light toggle).
export function useChartColors() {
  const [colors, setColors] = useState(readColors)

  useEffect(() => {
    const obs = new MutationObserver(() => setColors(readColors()))
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => obs.disconnect()
  }, [])

  return colors
}
