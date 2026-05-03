import { useEffect, useRef } from 'react'

const COLORS = [
  [168, 85, 247],   // #a855f7 purple
  [129, 140, 248],  // #818cf8 indigo
  [6,   182, 212],  // #06b6d4 cyan
  [147, 51,  234],  // #9333ea violet
]

const ParticleCanvas = ({ count = 70, maxDist = 110 }) => {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: count }, () => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)]
      return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    (Math.random() - 0.5) * 0.25,
        vy:    (Math.random() - 0.5) * 0.25,
        r:     Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.45 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        c,
      }
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const a = (1 - dist / maxDist) * 0.12
            const [r, g, b] = particles[i].c
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${a})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // draw particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.018
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const a = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse))
        const [r, g, b] = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count, maxDist])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

export default ParticleCanvas
