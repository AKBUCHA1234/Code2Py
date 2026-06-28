import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltProps {
  children: ReactNode
  max?: number // maximum tilt in degrees
  className?: string
  style?: CSSProperties
}

// Tilt only makes sense with a precise hovering pointer (mouse/trackpad) and
// when the user hasn't asked to reduce motion. On phones it would jitter while
// scrolling, so we fall back to a plain wrapper there.
function tiltAllowed(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return (
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Wrap any element to make it tilt in 3D toward the cursor.
 *
 * The maths: we measure where the pointer is inside the box and normalise it
 * to a -0.5 … 0.5 range on each axis. That drives rotateY (left/right) and
 * rotateX (up/down). useSpring smooths the motion; transformPerspective gives
 * the 3D "camera" so the rotation reads as depth, not a flat skew.
 */
export function Tilt({ children, max = 9, className, style }: TiltProps) {
  const [enabled] = useState(tiltAllowed)
  const ref = useRef<HTMLDivElement>(null)

  const px = useMotionValue(0) // pointer X, -0.5 … 0.5
  const py = useMotionValue(0) // pointer Y, -0.5 … 0.5
  const spring = { stiffness: 150, damping: 15, mass: 0.3 }
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring)

  if (!enabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }

  function handleMove(e: React.PointerEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }

  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}
