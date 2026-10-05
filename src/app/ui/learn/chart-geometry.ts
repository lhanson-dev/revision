type Point = { x: number; y: number }
export type ChartSeries = { name: string; points: readonly Point[] }

export type Crossing = { x: number; y: number }

/** First place two polylines cross (smallest x), or null. Works for straight lines and for longer polylines. */
export function findCrossing(first: readonly Point[], second: readonly Point[]): Crossing | null {
  let best: Crossing | null = null
  for (let i = 0; i < first.length - 1; i += 1) {
    for (let j = 0; j < second.length - 1; j += 1) {
      const [a, b] = [first[i], first[i + 1]]
      const [c, d] = [second[j], second[j + 1]]
      const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x)
      if (denominator === 0) continue
      const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denominator
      const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denominator
      if (t < 0 || t > 1 || u < 0 || u > 1) continue
      const hit = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }
      if (!best || hit.x < best.x) best = hit
    }
  }
  return best
}

/**
 * What to call the crossing of series 1 and series 2. The schema has no field for this, so it is
 * read from the series names: revenue against costs is a break-even point (with Loss and Profit
 * either side); any other pair is simply marked as a crossing point.
 */
export function describeCrossing(series: readonly ChartSeries[]): { label: string; regions: { left: string; right: string } | null } {
  const [first, second] = series
  const names = `${first?.name ?? ''} ${second?.name ?? ''}`.toLowerCase()
  if (/revenue|sales|income/.test(names) && /cost/.test(names)) {
    return { label: 'Break-even', regions: { left: 'Loss', right: 'Profit' } }
  }
  return { label: 'Crossing point', regions: null }
}

/** A tidy y-axis: about four steps with a 1, 2, 2.5, 5 or 10 multiple of a power of ten. */
export function niceAxis(maxValue: number): { step: number; max: number } {
  const raw = maxValue > 0 ? maxValue : 1
  const magnitude = 10 ** Math.floor(Math.log10(raw / 4))
  const step = [1, 2, 2.5, 5, 10].map((multiple) => multiple * magnitude).find((candidate) => candidate * 4 >= raw) ?? magnitude * 10
  return { step, max: step * Math.ceil(raw / step) }
}

export function formatTick(value: number): string {
  return value >= 1000 ? `${value / 1000}k` : String(value)
}
