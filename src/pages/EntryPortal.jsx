import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

export default function EntryPortal({ onComplete }) {
  const mountRef     = useRef(null)
  const canvasRef    = useRef(null)
  const flashRef     = useRef(null)
  const logoStageRef = useRef(null)
  const taglineRef   = useRef(null)
  const btnRef       = useRef(null)
  const skipRef      = useRef(null)
  const [showSkip,    setShowSkip]    = useState(false)
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 2000)

    const W = window.innerWidth
    const H = window.innerHeight

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x00010F, 1)

    const scene  = new THREE.Scene()
    scene.fog    = new THREE.FogExp2(0x00010F, 0.006)
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 1000)
    camera.position.set(0, 0, 60)

    // ── Wormhole path ─────────────────────────────────────────
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,   0,   100),
      new THREE.Vector3(3,   2,   70),
      new THREE.Vector3(-4, -2,   40),
      new THREE.Vector3(2,   3,   10),
      new THREE.Vector3(-2, -1,  -20),
      new THREE.Vector3(0,   0,  -60),
    ])

    // ── Tunnel wireframe ──────────────────────────────────────
    const tubeGeo = new THREE.TubeGeometry(path, 150, 10, 18, false)
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x001F6E,
      side: THREE.BackSide,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })
    const tube = new THREE.Mesh(tubeGeo, tubeMat)
    scene.add(tube)

    // ── Star field ────────────────────────────────────────────
    const STAR_COUNT = 2500
    const starPos    = new Float32Array(STAR_COUNT * 3)
    const starColors = new Float32Array(STAR_COUNT * 3)

    const starPalette = [
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0xC0D8FF),
      new THREE.Color(0x00CCFF),
      new THREE.Color(0x88AAFF),
      new THREE.Color(0xFFEEFF),
    ]

    for (let i = 0; i < STAR_COUNT; i++) {
      starPos[i*3]   = (Math.random() - 0.5) * 220
      starPos[i*3+1] = (Math.random() - 0.5) * 220
      starPos[i*3+2] = (Math.random() - 0.5) * 220
      const c = starPalette[Math.floor(Math.random() * starPalette.length)]
      starColors[i*3]   = c.r
      starColors[i*3+1] = c.g
      starColors[i*3+2] = c.b
    }

    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color',    new THREE.BufferAttribute(starColors, 3))

    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const starField = new THREE.Points(starGeo, starMat)
    scene.add(starField)

    // ── PS Symbol helpers ─────────────────────────────────────

    // △ Triangle — pink/red
    const makeTriangle = () => {
      const shape = new THREE.Shape()
      shape.moveTo(0,   1.4)
      shape.lineTo(-1.2, -0.9)
      shape.lineTo( 1.2, -0.9)
      shape.closePath()
      const hole = new THREE.Path()
      hole.moveTo(0,   0.75)
      hole.lineTo(-0.65, -0.55)
      hole.lineTo( 0.65, -0.55)
      hole.closePath()
      shape.holes.push(hole)
      const geo = new THREE.ShapeGeometry(shape)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFF4488, transparent: true, opacity: 0, side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh._mats = [mat]
      return mesh
    }

    // ○ Circle ring — red
    const makeCircle = () => {
      const geo = new THREE.RingGeometry(0.75, 1.1, 64)
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFF2222, transparent: true, opacity: 0, side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh._mats = [mat]
      return mesh
    }

    // ✕ Cross — blue
    const makeCross = () => {
      const group    = new THREE.Group()
      const barGeo   = new THREE.PlaneGeometry(0.42, 2.2)
      const mat1     = new THREE.MeshBasicMaterial({ color: 0x4466FF, transparent: true, opacity: 0, side: THREE.DoubleSide })
      const mat2     = new THREE.MeshBasicMaterial({ color: 0x4466FF, transparent: true, opacity: 0, side: THREE.DoubleSide })
      const b1       = new THREE.Mesh(barGeo, mat1)
      const b2       = new THREE.Mesh(barGeo, mat2)
      b1.rotation.z  =  Math.PI / 4
      b2.rotation.z  = -Math.PI / 4
      group.add(b1, b2)
      group._mats    = [mat1, mat2]
      return group
    }

    // □ Square frame — green/teal
    const makeSquare = () => {
      const shape = new THREE.Shape()
      shape.moveTo(-1.1, -1.1)
      shape.lineTo( 1.1, -1.1)
      shape.lineTo( 1.1,  1.1)
      shape.lineTo(-1.1,  1.1)
      shape.closePath()
      const hole = new THREE.Path()
      hole.moveTo(-0.7, -0.7)
      hole.lineTo( 0.7, -0.7)
      hole.lineTo( 0.7,  0.7)
      hole.lineTo(-0.7,  0.7)
      hole.closePath()
      shape.holes.push(hole)
      const geo  = new THREE.ShapeGeometry(shape)
      const mat  = new THREE.MeshBasicMaterial({
        color: 0x00DD88, transparent: true, opacity: 0, side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh._mats = [mat]
      return mesh
    }

    const triangle = makeTriangle()
    const circle   = makeCircle()
    const cross    = makeCross()
    const square   = makeSquare()

    // Starting positions — spread around the tunnel entrance
    triangle.position.set(-7,   6,   60)
    circle.position.set(  7,   6,   55)
    cross.position.set(  -7,  -6,   65)
    square.position.set(  7,  -6,   58)

    triangle.scale.setScalar(4)
    circle.scale.setScalar(4)
    cross.scale.setScalar(4)
    square.scale.setScalar(4)

    scene.add(triangle, circle, cross, square)

    const setSymbolOpacity = (obj, val) => {
      obj._mats.forEach(m => { m.opacity = val })
    }

    // ── Wormhole ambient particles ────────────────────────────
    const PART  = 4000
    const pPos  = new Float32Array(PART * 3)
    const pCol  = new Float32Array(PART * 3)

    const pPalette = [
      new THREE.Color(0x0066FF),
      new THREE.Color(0x00CCFF),
      new THREE.Color(0xFF3366),
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0x4466FF),
      new THREE.Color(0x00DD88),
    ]

    for (let i = 0; i < PART; i++) {
      const t      = Math.random()
      const angle  = Math.random() * Math.PI * 2
      const radius = 1.5 + Math.random() * 7
      const pt     = path.getPoint(t)
      pPos[i*3]    = pt.x + Math.cos(angle) * radius
      pPos[i*3+1]  = pt.y + Math.sin(angle) * radius
      pPos[i*3+2]  = pt.z
      const c = pPalette[Math.floor(Math.random() * pPalette.length)]
      pCol[i*3]    = c.r; pCol[i*3+1] = c.g; pCol[i*3+2] = c.b
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3))

    const pMat = new THREE.PointsMaterial({
      size: 0.15, vertexColors: true,
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false, sizeAttenuation: true,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── Lights ────────────────────────────────────────────────
    const lights = [
      new THREE.PointLight(0x0066FF, 5, 100),
      new THREE.PointLight(0xFF3366, 3, 70),
      new THREE.PointLight(0x00CCFF, 3, 70),
    ]
    lights[0].position.set(0, 0, 50)
    lights[1].position.set(6, 4, 35)
    lights[2].position.set(-6, -4, 45)
    lights.forEach(l => scene.add(l))

    // ── Render loop ───────────────────────────────────────────
    let frameId
    const clock     = new THREE.Clock()
    const initPPos  = pPos.slice()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Swirl tunnel particles
      for (let i = 0; i < PART; i++) {
        const ix    = initPPos[i*3], iy = initPPos[i*3+1], iz = initPPos[i*3+2]
        const dist  = Math.sqrt(ix*ix + iy*iy)
        const angle = Math.atan2(iy, ix) + t * (0.1 + (i%5)*0.012)
        pPos[i*3]   = Math.cos(angle) * dist
        pPos[i*3+1] = Math.sin(angle) * dist
        pPos[i*3+2] = iz + Math.sin(t * 0.35 + i * 0.07) * 0.25
      }
      pGeo.attributes.position.needsUpdate = true

      // Rotate star field slowly — depth feel
      starField.rotation.y = t * 0.007
      starField.rotation.x = t * 0.003

      // Symbols drift gently
      triangle.rotation.z = Math.sin(t * 0.5)  * 0.18
      circle.rotation.z   = t * 0.07
      cross.rotation.z    = -t * 0.06
      square.rotation.z   = Math.cos(t * 0.4) * 0.14

      // Light dance
      lights[1].position.x = Math.sin(t * 0.7) * 10
      lights[1].position.y = Math.cos(t * 0.5) * 7
      lights[2].position.x = Math.cos(t * 0.6) * 10
      lights[2].position.y = Math.sin(t * 0.8) * 7

      renderer.render(scene, camera)
    }
    animate()

    // ── Master timeline ───────────────────────────────────────
    const tl = gsap.timeline()

    // 1. Stars + particles fade in together
    tl.to(starMat, { opacity: 0.85, duration: 2.0, ease: 'power2.out' }, 0)
    tl.to(pMat,    { opacity: 0.65, duration: 2.2, ease: 'power2.out' }, 0)

    // 2. Symbols appear bright
    tl.add(() => {
      ;[triangle, circle, cross, square].forEach(obj => {
        obj._mats.forEach(m => {
          gsap.to(m, { opacity: 0.95, duration: 1.4, ease: 'power2.out' })
        })
      })
    }, 0.6)

    // 3. Camera flies through tunnel
    const camProg = { t: 0 }
    tl.to(camProg, {
      t: 0.84,
      duration: 5.0,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = path.getPoint(camProg.t)
        const l = path.getPoint(Math.min(camProg.t + 0.05, 1))
        camera.position.copy(p)
        camera.lookAt(l)
        lights[0].position.copy(p)
      },
    }, 1.2)

    // 4. Symbols converge to center as camera approaches end
    tl.add(() => {
      ;[triangle, circle, cross, square].forEach(obj => {
        gsap.to(obj.position, {
          x: 0, y: 0, z: camera.position.z - 10,
          duration: 1.8, ease: 'power3.inOut',
        })
        gsap.to(obj.scale, {
          x: 1.4, y: 1.4, z: 1.4,
          duration: 1.8, ease: 'power3.inOut',
        })
      })
      // Snap rotations to clean angles
      gsap.to(triangle.rotation, { z: 0, duration: 1.8, ease: 'power3.inOut' })
      gsap.to(circle.rotation,   { z: 0, duration: 1.8, ease: 'power3.inOut' })
      gsap.to(cross.rotation,    { z: 0, duration: 1.8, ease: 'power3.inOut' })
      gsap.to(square.rotation,   { z: 0, duration: 1.8, ease: 'power3.inOut' })
    }, 5.0)

    // 5. Stars warp — speed up as we punch through
    tl.to(camera.position, {
      z: camera.position.z - 8,
      duration: 0.9, ease: 'power3.in',
    }, 6.5)

    // 6. White flash — symbols merge
    tl.add(() => {
      gsap.to(flashRef.current, {
        opacity: 1, duration: 0.12, ease: 'none',
        onComplete: () => gsap.to(flashRef.current, { opacity: 0, duration: 0.7, ease: 'power2.out' }),
      })
      ;[triangle, circle, cross, square].forEach(obj => {
        obj._mats.forEach(m => gsap.to(m, { opacity: 0, duration: 0.4, delay: 0.05 }))
      })
      gsap.to(pMat,    { opacity: 0, duration: 0.8, delay: 0.1 })
      gsap.to(starMat, { opacity: 0, duration: 0.7, delay: 0.15 })
    }, 6.8)

    // 7. Landing screen
    tl.add(() => setShowLanding(true), 7.3)

    // Resize handler
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
      tl.kill()
    }
  }, [])

  // ── Landing animation ─────────────────────────────────────
  useEffect(() => {
    if (!showLanding) return
    const tl = gsap.timeline()
    tl.fromTo(logoStageRef.current,
      { opacity: 0, scale: 0.9, filter: 'blur(20px)' },
      { opacity: 1, scale: 1,   filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' }
    )
    tl.fromTo(taglineRef.current,
      { opacity: 0, y: 16, letterSpacing: '0.7em' },
      { opacity: 1, y: 0,  letterSpacing: '0.3em', duration: 1.0, ease: 'power3.out' },
      '-=0.5'
    )
    tl.fromTo(btnRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0,  duration: 0.7, ease: 'back.out(1.5)' },
      '-=0.4'
    )
  }, [showLanding])

  const handleEnter = () => {
    gsap.timeline({ onComplete: onComplete })
      .to(logoStageRef.current, { opacity: 0, scale: 1.06, duration: 0.55, ease: 'power2.in' })
      .to(taglineRef.current,   { opacity: 0, duration: 0.3 }, '-=0.4')
      .to(btnRef.current,       { opacity: 0, duration: 0.2 }, '-=0.3')
      .to(mountRef.current,     { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '-=0.1')
  }

  return (
    <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#00010F' }}>

      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />

      {/* White flash */}
      <div ref={flashRef} style={{
        position: 'absolute', inset: 0,
        background: '#FFFFFF', opacity: 0,
        pointerEvents: 'none', zIndex: 10,
      }} />

      {/* ── Landing ────────────────────────────────────────── */}
      {showLanding && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,20,90,0.7) 0%, rgba(0,1,15,0.94) 65%)',
        }}>

          {/* Ambient glow behind logo */}
          <div style={{
            position: 'absolute',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(0,80,255,0.18) 0%, rgba(0,180,255,0.06) 45%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          <div ref={logoStageRef} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '0.5rem',
            opacity: 0,
          }}>

            {/* PS Symbols row */}
            <div style={{
              display: 'flex', gap: '1.6rem',
              marginBottom: '1.6rem', opacity: 0.6,
            }}>
              {[
                { sym: '△', color: '#FF4488' },
                { sym: '○', color: '#FF2222' },
                { sym: '✕', color: '#4466FF' },
                { sym: '□', color: '#00DD88' },
              ].map(({ sym, color }) => (
                <span key={sym} style={{
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                  fontSize: '1.15rem', color,
                  filter: `drop-shadow(0 0 10px ${color})`,
                }}>{sym}</span>
              ))}
            </div>

            {/* PS Logo */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -50,
                background: 'radial-gradient(circle, rgba(0,120,255,0.22) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(20px)',
                pointerEvents: 'none',
              }} />
              <svg
                width="120" height="120"
                viewBox="0 0 100 100" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,180,255,0.55)) drop-shadow(0 0 50px rgba(0,80,255,0.3))' }}
              >
                <path d="M36 74V26L51 31.5C57 33.8 61 38.2 61 45C61 52.5 56.5 56.5 49.5 54.8L43 52.8V64.5L57.5 69.8C65.5 72.5 70.5 69.2 70.5 62.5V58.5L79 61.5V65.5C79 77 71 81.5 59.5 77.5L43 71.5V74H36Z" fill="white"/>
                <path d="M61.5 79.5L79 73V68L61.5 74.5V79.5Z" fill="#0055BB"/>
                <path d="M20 68.5C20 74 24.5 80 31.5 82L36 83.8V78.5L33 77C29.5 75.5 27.5 73.2 27.5 70.2C27.5 67 29.8 65.5 34 66.8L36 67.5V62.2L33.2 61.4C24.5 58.8 20 63 20 68.5Z" fill="white"/>
              </svg>
            </div>

            {/* PlayStation wordmark */}
            <div style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: '2.5rem', fontWeight: '300',
              color: '#FFFFFF', letterSpacing: '0.22em',
              marginTop: '0.6rem',
              textShadow: '0 0 30px rgba(0,150,255,0.45), 0 2px 6px rgba(0,0,0,0.7)',
            }}>
              PlayStation
            </div>
          </div>

          {/* Divider */}
          <div style={{
            width: 200, height: 1, marginTop: '2.2rem',
            background: 'linear-gradient(90deg, transparent, rgba(0,180,255,0.55), transparent)',
          }} />

          {/* Tagline */}
          <div ref={taglineRef} style={{
            marginTop: '1.5rem',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.65rem',
            color: 'rgba(160,200,255,0.55)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0,
          }}>
            Your World. Your Rules. No Limits.
          </div>

          {/* DROP IN button */}
          <button
            ref={btnRef}
            onClick={handleEnter}
            style={{
              marginTop: '2.2rem', opacity: 0,
              background: 'linear-gradient(135deg, rgba(0,50,140,0.65), rgba(0,100,220,0.4))',
              border: '1px solid rgba(0,180,255,0.4)',
              borderRadius: '2px', color: '#FFFFFF',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.1rem', letterSpacing: '0.55em',
              padding: '1rem 4rem', cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              boxShadow: '0 0 25px rgba(0,100,255,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,230,246,0.9)'
              e.currentTarget.style.boxShadow   = '0 0 40px rgba(0,180,255,0.55), inset 0 0 20px rgba(0,100,255,0.15)'
              gsap.to(e.currentTarget.querySelector('.fill'), { scaleX: 1, duration: 0.35, ease: 'power2.out' })
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,180,255,0.4)'
              e.currentTarget.style.boxShadow   = '0 0 25px rgba(0,100,255,0.2)'
              gsap.to(e.currentTarget.querySelector('.fill'), { scaleX: 0, duration: 0.25, ease: 'power2.in' })
            }}
          >
            <div className="fill" style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(0,100,255,0.25), rgba(0,200,255,0.12))',
              transform: 'scaleX(0)', transformOrigin: 'left',
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>DROP IN</span>
          </button>
        </div>
      )}

      {/* Skip intro */}
      {showSkip && !showLanding && (
        <button
          ref={skipRef}
          onClick={handleEnter}
          style={{
            position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 30,
            background: 'transparent',
            border: '1px solid rgba(0,180,255,0.25)',
            color: 'rgba(160,200,255,0.45)',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.62rem', letterSpacing: '0.28em',
            padding: '0.5rem 1.2rem', cursor: 'pointer',
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color       = '#FFFFFF'
            e.currentTarget.style.borderColor = 'rgba(0,230,246,0.7)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color       = 'rgba(160,200,255,0.45)'
            e.currentTarget.style.borderColor = 'rgba(0,180,255,0.25)'
          }}
        >
          SKIP INTRO
        </button>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');
      `}</style>
    </div>
  )
}