import confetti from 'canvas-confetti'

// A tasteful burst in the brand's warm palette.
export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#ED8B3F', '#E8B24A', '#D9772C', '#86A867'],
    scalar: 0.9,
  })
}
