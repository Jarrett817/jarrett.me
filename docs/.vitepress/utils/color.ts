export function hexToRGB(hexColor: string) {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return { r, g, b }
}

export function linearInterpolation(startColor: string, endColor: string, count: number) {
  const startRGB = hexToRGB(startColor)
  const endRGB = hexToRGB(endColor)

  const colors = []
  for (let i = 0; i < count; i++) {
    const r = Math.round(startRGB.r + (i / (count - 1)) * (endRGB.r - startRGB.r))
    const g = Math.round(startRGB.g + (i / (count - 1)) * (endRGB.g - startRGB.g))
    const b = Math.round(startRGB.b + (i / (count - 1)) * (endRGB.b - startRGB.b))
    const color = `rgb(${r}, ${g}, ${b})`
    colors.push(color)
  }

  return colors
}

export function getCssVar(cssVar: string, dom?: HTMLElement): string {
  return window.getComputedStyle(dom || document.documentElement).getPropertyValue(cssVar).trim()
}
