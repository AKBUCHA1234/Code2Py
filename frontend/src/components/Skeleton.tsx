import type { CSSProperties } from 'react'

export function Skeleton({
  height = 16,
  width = '100%',
  radius = 8,
  style,
}: {
  height?: number | string
  width?: number | string
  radius?: number
  style?: CSSProperties
}) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} />
}

/** A few stacked lines, for list/card loading states. */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={56} radius={9} />
      ))}
    </div>
  )
}
