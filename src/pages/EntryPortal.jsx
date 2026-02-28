import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

export default function EntryPortal({ onComplete }) {
  const mountRef = useRef(null)
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('wormhole') // wormhole | landing | done
  const [showSkip, setShowSkip] = useState(false)

  useEffect(() => {
    // Show skip button after 1.5s
    const skipTimer = setTimeout(() => setShowSkip(true), 1500)

    // ── Three.js Setup ──────────────────────────────────────────
    const W = window.innerWidth
    const H = window.innerHeight

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x05050A, 1) // Deep PS void

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05050A, 0.012)

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000)
    camera.position.set(0, 0, 80) // Start far back

    // ── Wormhole Tube Path ──────────────────────────────────────
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 120),
      new THREE.Vector3(2, 1, 80),
      new THREE.Vector3(-3, -2, 40),
      new THREE.Vector3(1, 2, 0),
      new THREE.Vector3(-1, -1, -40),
      new THREE.Vector3(0, 0, -80),
    ])

    // ── Tunnel Ring Lines ───────────────────────────────────────
    const tubeGeometry = new THREE.TubeGeometry(path, 100, 8, 12, false)
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000833, // Deep PS Blue
      side: THREE.BackSide,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
    scene.add(tube)

    // ── Ring Portals ────────────────────────────────────────────
    const rings = []
    for (let i = 0; i < 30; i++) {
      const t = i / 30
      const ringGeo = new THREE.RingGeometry(6, 6.3, 64)
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x00E6F6 : i % 3 === 1 ? 0x003791 : 0xD386A8, // Cyan, Deep Blue, PS Pink
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      const pos = path.getPoint(t)
      ring.position.copy(pos)
      const tangent = path.getTangent(t)
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent)
      scene.add(ring)
      rings.push({ mesh: ring, mat: ringMat, baseOpacity: ringMat.opacity })
    }

    // ── Ember Particles ─────────────────────────────────────────
    const PARTICLE_COUNT = 4000
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    const palette = [
      new THREE.Color(0x00E6F6), // Cyan
      new THREE.Color(0x003791), // Blue
      new THREE.Color(0xFFFFFF), // White
      new THREE.Color(0xD386A8), // Pink
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random()
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 5
      const tubePoint = path.getPoint(t)

      positions[i * 3]     = tubePoint.x + Math.cos(angle) * radius
      positions[i * 3 + 1] = tubePoint.y + Math.sin(angle) * radius
      positions[i * 3 + 2] = tubePoint.z

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = Math.random() * 2.5 + 0.5
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Central Glow Orb ────────────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(1.5, 32, 32)
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0x00E6F6, // Cyan glow at the end of the tunnel
      transparent: true,
      opacity: 0,
    })
    const orb = new THREE.Mesh(orbGeo, orbMat)
    orb.position.set(0, 0, -80)
    scene.add(orb)

    // ── Ambient point lights ────────────────────────────────────
    const mainLight   = new THREE.PointLight(0x00E6F6, 3, 60) // Cyan
    const blueLight   = new THREE.PointLight(0x003791, 2, 40) // Deep Blue
    const whiteLight  = new THREE.PointLight(0xFFFFFF, 2, 40) // White
    mainLight.position.set(0, 0, 60)
    blueLight.position.set(5, 3, 30)
    whiteLight.position.set(-5, -3, 45)
    scene.add(mainLight, blueLight, whiteLight)

    // ── GSAP Camera Animation — fly through tunnel ─────────────
    let progress = { t: 0 }
    const flyTl = gsap.timeline({ delay: 0.3 })

    flyTl.to(progress, {
      t: 0.85,
      duration: 4.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        const camPos = path.getPoint(progress.t)
        const lookAt = path.getPoint(Math.min(progress.t + 0.05, 1))
        camera.position.copy(camPos)
        camera.lookAt(lookAt)

        // FIXED: Track mainLight instead of the deleted redLight
        mainLight.position.copy(camPos)
      },
      onComplete: () => {
        // Final pull-back reveal
        gsap.to(camera.position, {
          z: camera.position.z - 10, duration: 0.6,
          ease: 'power2.out',
          onComplete: triggerLanding,
        })
      }
    })

    // ── Ring pulse animation ────────────────────────────────────
    rings.forEach((r, i) => {
      gsap.to(r.mat, {
        opacity: 0.1,
        duration: 1 + Math.random() * 0.5,
        yoyo: true, repeat: -1,
        delay: i * 0.08,
        ease: 'sine.inOut',
      })
      gsap.to(r.mesh.scale, {
        x: 1.05, y: 1.05,
        duration: 1.2 + Math.random() * 0.4,
        yoyo: true, repeat: -1,
        delay: i * 0.06,
        ease: 'sine.inOut',
      })
    })

    // ── Particle drift ──────────────────────────────────────────
    let driftAngle = 0
    const initialPositions = positions.slice()

    // ── Render Loop ─────────────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Particle swirl drift
      driftAngle = elapsed * 0.3
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = initialPositions[i * 3]
        const iy = initialPositions[i * 3 + 1]
        const iz = initialPositions[i * 3 + 2]
        const dist = Math.sqrt(ix * ix + iy * iy)
        const angle = Math.atan2(iy, ix) + elapsed * (0.1 + (i % 5) * 0.02)
        positions[i * 3]     = Math.cos(angle) * dist + Math.sin(elapsed * 0.5 + i) * 0.05
        positions[i * 3 + 1] = Math.sin(angle) * dist + Math.cos(elapsed * 0.4 + i) * 0.05
        positions[i * 3 + 2] = iz + Math.sin(elapsed * 0.3 + i * 0.1) * 0.3
      }
      particleGeo.attributes.position.needsUpdate = true

      // Tube rotation
      tube.rotation.z = elapsed * 0.05

      // Orb pulse
      const pulse = Math.sin(elapsed * 3) * 0.3 + 0.7
      orbMat.opacity = pulse * 0.4

      // Light movement
      blueLight.position.x = Math.sin(elapsed * 0.7) * 8
      blueLight.position.y = Math.cos(elapsed * 0.5) * 5
      whiteLight.position.x = Math.cos(elapsed * 0.6) * 8
      whiteLight.position.y = Math.sin(elapsed * 0.8) * 5

      renderer.render(scene, camera)
    }
    animate()

    // ── Trigger landing sequence ────────────────────────────────
    const triggerLanding = () => {
      setPhase('landing')
    }

    // ── Resize ──────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(skipTimer)
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      gsap.killTweensOf(progress)
      gsap.killTweensOf(camera.position)
    }
  }, [])

  const handleProceed = () => {
    // Final flash and exit
    gsap.to(mountRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: onComplete,
    })
  }

  return (
    <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Skip button */}
      {showSkip && phase === 'wormhole' && (
        <button
          onClick={handleProceed}
          style={{
            position: 'absolute', bottom: '2rem', right: '2rem',
            background: 'transparent', border: '1px solid rgba(0,230,246,0.5)', // Cyan
            color: '#888899', fontFamily: 'Rajdhani', fontWeight: 600,
            fontSize: '0.8rem', letterSpacing: '0.2em',
            padding: '0.5rem 1.2rem', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color = '#F0F0F5'; e.target.style.borderColor = '#00E6F6' }}
          onMouseLeave={e => { e.target.style.color = '#888899'; e.target.style.borderColor = 'rgba(0,230,246,0.5)' }}
        >
          SKIP INTRO
        </button>
      )}

      {/* Landing overlay — appears after fly-through */}
      {phase === 'landing' && (
        <LandingOverlay onProceed={handleProceed} />
      )}
    </div>
  )
}

// ── Landing Screen ──────────────────────────────────────────────
function LandingOverlay({ onProceed }) {
  const ref = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const btnRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Backdrop fade in
    tl.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })

    // Lines crystallize
    .fromTo([line1Ref.current, line2Ref.current],
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', transformOrigin: 'left center' }
    )

    // Title stamp-in
    .fromTo(titleRef.current,
      { opacity: 0, y: 30, skewX: -5 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.6, ease: 'expo.out' },
      '-=0.2'
    )

    // Subtitle
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    )

    // Button
    .fromTo(btnRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
      '-=0.1'
    )

    // Chromatic aberration flicker on title (Cyan/Blue)
    .to(titleRef.current, {
      textShadow: '-2px 0 2px rgba(0, 55, 145, 0.6), 2px 0 2px rgba(0, 230, 246, 0.6)',
      duration: 0.1, yoyo: true, repeat: 5, ease: 'none',
    }, 0.4)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(0,8,30,0.85) 0%, rgba(5,5,10,0.95) 70%)', // PS Blue/Black Gradient
      opacity: 0,
    }}>
      {/* Decorative lines */}
      <div ref={line1Ref} style={{
        width: 240, height: 1,
        background: 'linear-gradient(90deg, transparent, #00E6F6, transparent)', // Cyan
        marginBottom: '2rem',
        transformOrigin: 'left center',
      }} />

      {/* PS Logo Mark */}
      <div style={{
        fontFamily: 'Bebas Neue', fontSize: '1rem',
        letterSpacing: '0.8em', color: '#888899', marginBottom: '0.5rem',
      }}>
        PLAYSTATION PRESENTS
      </div>

      <h1 ref={titleRef} style={{
        fontFamily: 'Bebas Neue', fontSize: 'clamp(4rem, 12vw, 9rem)',
        color: '#F0F0F5', letterSpacing: '0.1em',
        lineHeight: 0.9, textAlign: 'center',
        opacity: 0,
      }}>
        THE<br />
        <span style={{ color: '#00E6F6', textShadow: '0 0 20px rgba(0, 230, 246, 0.5)' }}>ARENA</span>
      </h1>

      <div ref={line2Ref} style={{
        width: 240, height: 1,
        background: 'linear-gradient(90deg, transparent, #00E6F6, transparent)', // Cyan
        marginTop: '1.5rem', marginBottom: '1.5rem',
        transformOrigin: 'left center',
      }} />

      <p ref={subtitleRef} style={{
        fontFamily: 'Rajdhani', fontWeight: 600,
        fontSize: '1rem', letterSpacing: '0.4em',
        color: '#888899', textTransform: 'uppercase',
        marginBottom: '3rem', opacity: 0,
      }}>
        Your Living Digital Universe
      </p>

      <button
        ref={btnRef}
        onClick={onProceed}
        style={{
          background: 'linear-gradient(135deg, #003791, #001F54)', // PS Blue
          border: '1px solid #00E6F6', // Cyan Border
          borderRadius: '3px',
          color: '#F0F0F5', fontFamily: 'Bebas Neue',
          fontSize: '1.1rem', letterSpacing: '0.4em',
          padding: '1rem 3rem', cursor: 'pointer',
          opacity: 0,
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 0 20px rgba(0, 230, 246, 0.2)', // Cyan glow
        }}
        onMouseEnter={e => {
          gsap.to(e.currentTarget, { scale: 1.05, boxShadow: '0 0 40px rgba(0, 230, 246, 0.6)', duration: 0.2 })
        }}
        onMouseLeave={e => {
          gsap.to(e.currentTarget, { scale: 1, boxShadow: '0 0 20px rgba(0, 230, 246, 0.2)', duration: 0.2 })
        }}
      >
        DROP IN
      </button>

      <div style={{
        position: 'absolute', bottom: '2rem',
        fontFamily: 'Share Tech Mono', fontSize: '0.7rem',
        color: '#333344', letterSpacing: '0.2em',
      }}>
        ARENA_OS v2.4.1 // INITIALIZED
      </div>
    </div>
  )
}