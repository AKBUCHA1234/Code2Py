import { motion } from 'framer-motion'

/** "Cody" — a friendly animated mascot (SVG + Framer Motion, ₹0, offline).
   Bobs gently and blinks. Swap for a Lottie file later by replacing the SVG. */
export function Mascot({ size = 120 }: { size?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        {/* antenna */}
        <line x1="60" y1="20" x2="60" y2="34" stroke="var(--primary-strong)" strokeWidth="3" />
        <circle cx="60" cy="16" r="5" fill="var(--primary)" />
        {/* head */}
        <rect x="28" y="34" width="64" height="52" rx="16" fill="var(--primary)" />
        <rect x="28" y="34" width="64" height="52" rx="16" fill="none" stroke="var(--primary-strong)" strokeWidth="2" />
        {/* face screen */}
        <rect x="38" y="46" width="44" height="28" rx="9" fill="#2B2A1E" />
        {/* blinking eyes */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.85, 0.9, 1] }}
          style={{ transformOrigin: '60px 60px' }}
        >
          <circle cx="51" cy="60" r="4.5" fill="#FBE0C6" />
          <circle cx="69" cy="60" r="4.5" fill="#FBE0C6" />
        </motion.g>
        {/* little smile */}
        <path d="M53 68 Q60 73 67 68" stroke="#FBE0C6" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* body */}
        <rect x="42" y="88" width="36" height="20" rx="8" fill="var(--primary-strong)" />
      </svg>
    </motion.div>
  )
}
