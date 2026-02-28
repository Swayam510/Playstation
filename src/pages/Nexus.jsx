import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { GAMES, FRIENDS, USER } from '../data/mockData.js'

const ORBIT_RADIUS = 6
const PLANET_SCALE = 0.95

export default function Nexus({ onNavigate }) {
  const canvasRef  = useRef(null)
  const mountRef   = useRef(null)
  const sceneRef   = useRef({})
  const [activeGame, setActiveGame] = useState(null)
  const [panelOpen, setPanelOpen]   = useState(false)
  const [hoverGame, setHoverGame]   = useState(null)
  const panelRef   = useRef(null)

  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x05050F, 1)
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05050F, 0.012) // much less fog = more visible

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500)
    camera.position.set(0, 10, 24)
    camera.lookAt(0, 0, 0)

    // ── STARS — brighter, more varied ───────────────────────
    const starGeo = new THREE.BufferGeometry()
    const starCount = 4000
    const starPos  = new Float32Array(starCount * 3)
    const starSize = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 400
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 400
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 400
      starSize[i] = Math.random() * 1.5 + 0.3
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('size',     new THREE.BufferAttribute(starSize, 1))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xCCCCFF, size: 0.25, sizeAttenuation: true, transparent: true, opacity: 0.9,
    }))
    scene.add(stars)

    // ── GRID FLOOR — gives depth and scale ──────────────────
    const gridHelper = new THREE.GridHelper(60, 40, 0x220011, 0x110008)
    gridHelper.position.y = -3
    scene.add(gridHelper)

    // ── CENTER ORB — much brighter ───────────────────────────
    const youGeo = new THREE.SphereGeometry(1.4, 64, 64)
    const youMat = new THREE.MeshStandardMaterial({
      color: 0x2A0A3E, emissive: 0xCC0000,
      emissiveIntensity: 2.5, // was 0.8 — now blazing
      roughness: 0.2, metalness: 1.0,
    })
    const youMesh = new THREE.Mesh(youGeo, youMat)
    scene.add(youMesh)

    // Inner core glow
    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32)
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xFF2200, transparent: true, opacity: 0.6 })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    scene.add(coreMesh)

    // Ring around center orb
    const youRingGeo = new THREE.RingGeometry(1.8, 2.1, 128)
    const youRingMat = new THREE.MeshBasicMaterial({ color: 0xFF2200, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    const youRing = new THREE.Mesh(youRingGeo, youRingMat)
    youRing.rotation.x = Math.PI / 2
    scene.add(youRing)

    // Second outer ring
    const ring2Geo = new THREE.RingGeometry(2.3, 2.38, 128)
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xFF6600, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = Math.PI / 2
    scene.add(ring2)

    // ── ORBIT PATHS ─────────────────────────────────────────
    const makeOrbitRing = (r, color, opacity) => {
      const geo = new THREE.RingGeometry(r - 0.04, r + 0.04, 128)
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = Math.PI / 2
      scene.add(mesh)
      return mat
    }
    const orbitMat1 = makeOrbitRing(ORBIT_RADIUS,       0xFF3300, 0.5)
    const orbitMat2 = makeOrbitRing(ORBIT_RADIUS * 1.6, 0x3300FF, 0.3)

    // ── LIGHTS — dramatically brighter ───────────────────────
    scene.add(new THREE.AmbientLight(0x2A1040, 3))   // was 1.5

    const centerLight = new THREE.PointLight(0xFF2200, 8, 25)  // was 4, 15
    scene.add(centerLight)

    const cyanLight = new THREE.PointLight(0x00DDFF, 3, 40)
    cyanLight.position.set(12, 6, 12)
    scene.add(cyanLight)

    const goldLight = new THREE.PointLight(0xFFAA00, 2, 35)
    goldLight.position.set(-12, 4, -8)
    scene.add(goldLight)

    const rimLight = new THREE.DirectionalLight(0x0044FF, 1.5)
    rimLight.position.set(-10, 10, -10)
    scene.add(rimLight)

    // ── PLANET SPHERES ───────────────────────────────────────
    const sorted  = [...GAMES].sort((a, b) => b.lastPlayed - a.lastPlayed)
    const planets = []
    const friendLights = []

    sorted.forEach((game, i) => {
      const isInner = i < 4
      const radius  = isInner ? ORBIT_RADIUS : ORBIT_RADIUS * 1.6
      const speed   = isInner ? 0.18 + i * 0.02 : 0.08 + i * 0.01
      const angle   = (i / sorted.length) * Math.PI * 2
      const size    = PLANET_SCALE * (isInner ? 1.1 : 0.85)

      const geo   = new THREE.SphereGeometry(size, 48, 48)
      const color = new THREE.Color(game.color)
      const mat   = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,  // was 0.3 — planets now glow visibly
        roughness: 0.25,
        metalness: 0.8,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      mesh.userData = { game, orbitAngle: angle, orbitRadius: radius, orbitSpeed: speed, index: i }
      scene.add(mesh)

      // Atmosphere glow layer
      const atmGeo = new THREE.SphereGeometry(size * 1.5, 24, 24)
      const atmMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.BackSide })
      mesh.add(new THREE.Mesh(atmGeo, atmMat))

      // Strong point light per planet — this is what makes them visible
      const pLight = new THREE.PointLight(color, 2.5, size * 10)
      mesh.add(pLight)

      // Friend pulse light
      if (game.friendsPlaying > 0) {
        const fLight = new THREE.PointLight(0x00DDFF, 0, size * 6)
        fLight.userData = { basePower: 2 + game.friendsPlaying * 0.8 }
        mesh.add(fLight)
        friendLights.push(fLight)
      }

      // Orbit trail ring around each planet
      const trailGeo = new THREE.RingGeometry(size * 1.25, size * 1.35, 48)
      const trailMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
      const trail = new THREE.Mesh(trailGeo, trailMat)
      trail.rotation.x = Math.PI / 3
      mesh.add(trail)

      planets.push({ mesh, mat, atmMat, pLight, angle, radius, speed, game, isHovered: false })
    })

    sceneRef.current = { scene, camera, renderer, planets, friendLights, youMesh, youRing, youRingMat, coreMesh }

    // ── RAYCASTER ────────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredPlanet = null

    const onMouseMove = (e) => {
      mouse.x =  (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(planets.map(p => p.mesh))

      if (hoveredPlanet && (!hits.length || hits[0].object !== hoveredPlanet.mesh)) {
        gsap.to(hoveredPlanet.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' })
        gsap.to(hoveredPlanet.mat, { emissiveIntensity: 0.9, duration: 0.3 })
        gsap.to(hoveredPlanet.pLight, { intensity: 2.5, duration: 0.3 })
        hoveredPlanet.isHovered = false
        hoveredPlanet = null
        document.body.style.cursor = 'default'
        setHoverGame(null)
      }

      if (hits.length) {
        const planet = planets.find(p => p.mesh === hits[0].object)
        if (planet && !planet.isHovered) {
          planet.isHovered = true
          hoveredPlanet = planet
          document.body.style.cursor = 'pointer'
          gsap.to(planet.mesh.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.4, ease: 'back.out(2)' })
          gsap.to(planet.mat, { emissiveIntensity: 2.5, duration: 0.3 })
          gsap.to(planet.pLight, { intensity: 6, duration: 0.3 })
          setHoverGame(planet.game)
        }
      }
    }

    const onClick = (e) => {
      mouse.x =  (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(planets.map(p => p.mesh))
      if (hits.length) {
        const planet = planets.find(p => p.mesh === hits[0].object)
        if (planet) openGamePanel(planet.game)
      }
    }

    canvasRef.current.addEventListener('mousemove', onMouseMove)
    canvasRef.current.addEventListener('click', onClick)

    // ── INTRO CAMERA ─────────────────────────────────────────
    camera.position.set(0, 40, 10)
    gsap.to(camera.position, { y: 10, z: 24, duration: 2.5, ease: 'power3.out' })

    gsap.from('.nexus-ui-item', { opacity: 0, y: 20, stagger: 0.08, duration: 0.7, ease: 'power2.out', delay: 1.6 })

    // ── RENDER LOOP ──────────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      planets.forEach(p => {
        p.angle += p.speed * 0.003
        p.mesh.position.x = Math.cos(p.angle) * p.radius
        p.mesh.position.z = Math.sin(p.angle) * p.radius
        p.mesh.position.y = Math.sin(t * 0.6 + p.mesh.userData.index) * 0.15
        p.mesh.rotation.y += 0.005
      })

      // Pulse friend lights
      friendLights.forEach(l => {
        l.intensity = l.userData.basePower * (Math.sin(t * 3.5) * 0.5 + 0.5)
      })

      // Center orb
      youMesh.rotation.y = t * 0.6
      youMesh.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06)
      coreMesh.scale.setScalar(1 + Math.sin(t * 3) * 0.15)
      youRingMat.opacity = 0.5 + Math.sin(t * 2.5) * 0.3
      ring2Mat.opacity   = 0.2 + Math.sin(t * 1.8) * 0.15
      youRing.rotation.z = t * 0.3
      ring2.rotation.z   = -t * 0.2

      // Orbit path shimmer
      orbitMat1.opacity = 0.35 + Math.sin(t * 1.5) * 0.15
      orbitMat2.opacity = 0.2  + Math.sin(t * 1.2) * 0.1

      // Lights pulse
      centerLight.intensity = 7 + Math.sin(t * 2) * 2

      stars.rotation.y = t * 0.006
      gridHelper.position.y = -3 + Math.sin(t * 0.3) * 0.05

      camera.position.x = Math.sin(t * 0.15) * 1.2
      camera.position.y = 10 + Math.sin(t * 0.1) * 0.5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      canvasRef.current?.removeEventListener('mousemove', onMouseMove)
      canvasRef.current?.removeEventListener('click', onClick)
      renderer.dispose()
    }
  }, [])

  const openGamePanel = (game) => {
    setActiveGame(game)
    setPanelOpen(true)
    setTimeout(() => {
      if (!panelRef.current) return
      gsap.timeline()
        .fromTo(panelRef.current, { x: 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
        .fromTo(panelRef.current.querySelectorAll('.panel-row'),
          { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, '-=0.2')
    }, 10)
  }

  const closePanel = () => {
    gsap.to(panelRef.current, {
      x: 80, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { setPanelOpen(false); setActiveGame(null) },
    })
  }

  const timeAgo = (ts) => {
    const m = Math.floor((Date.now() - ts) / 60000)
    if (m < 60)  return `${m}m ago`
    if (m < 1440) return `${Math.floor(m/60)}h ago`
    return `${Math.floor(m/1440)}d ago`
  }

  return (
    <div ref={mountRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,15,0.7) 100%)',
      }} />

      {/* ── TOP LEFT: Identity Block ── */}
      <div className="nexus-ui-item" style={{
        position: 'absolute', top: 80, left: '2rem', zIndex: 10,
      }}>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: '#CC0000', letterSpacing: '0.5em', marginBottom: '0.2rem', opacity: 0.9 }}>
          PERSONAL HUB // NEXUS
        </div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.8rem', color: '#F0F0F5', letterSpacing: '0.12em', lineHeight: 1, textShadow: '0 0 40px rgba(204,0,0,0.6)' }}>
          {USER.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
          <div style={{
            background: 'linear-gradient(90deg, #CC0000, #FF4400)',
            padding: '2px 10px', fontFamily: 'Bebas Neue',
            fontSize: '0.85rem', color: '#fff', letterSpacing: '0.2em',
          }}>
            LEVEL {USER.level}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: '#555566', letterSpacing: '0.2em' }}>
            SOUL SCORE {USER.soulScore?.toLocaleString()}
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: '0.75rem', width: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.55rem', color: '#444455', letterSpacing: '0.2em' }}>XP PROGRESS</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '0.7rem', color: '#CC0000' }}>74%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: '74%',
              background: 'linear-gradient(90deg, #CC0000, #FF6600, #FFD700)',
              boxShadow: '0 0 10px #CC0000',
              animation: 'xpShimmer 2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      {/* ── TOP RIGHT: Stats Block ── */}
      <div className="nexus-ui-item" style={{
        position: 'absolute', top: 80, right: panelOpen ? 320 : '2rem',
        zIndex: 10, transition: 'right 0.4s ease',
        display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end',
      }}>
        {[
          { label: 'HOURS PLAYED', value: USER.hoursPlayed?.toLocaleString() + 'h', color: '#FFD700', icon: '⏱' },
          { label: 'PLATINUMS',    value: USER.platinums,                             color: '#00DDFF', icon: '🏆' },
          { label: 'FRIENDS',      value: USER.friendCount,                           color: '#CC0000', icon: '👥' },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(5,5,15,0.7)',
            border: `1px solid ${s.color}22`,
            padding: '0.5rem 0.85rem',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: '0.85rem' }}>{s.icon}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: s.color, lineHeight: 1, textShadow: `0 0 15px ${s.color}66` }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.52rem', color: '#444455', letterSpacing: '0.25em' }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── HOVER TOOLTIP ── */}
      {hoverGame && !panelOpen && (
        <div style={{
          position: 'absolute', bottom: '6rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, pointerEvents: 'none',
          background: 'rgba(5,5,15,0.92)',
          border: `1px solid ${hoverGame.color}66`,
          padding: '0.6rem 1.2rem',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'fadeInUp 0.2s ease-out',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: hoverGame.color, boxShadow: `0 0 10px ${hoverGame.color}` }} />
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: '#F0F0F5', letterSpacing: '0.12em' }}>{hoverGame.title}</span>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: '#555566' }}>{hoverGame.genre}</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '0.9rem', color: hoverGame.color }}>{hoverGame.rating}/10</span>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.58rem', color: '#333344' }}>CLICK TO EXPAND</span>
        </div>
      )}

      {/* ── BOTTOM LEFT: Friends Online ── */}
      <FriendStrip />

      {/* ── BOTTOM RIGHT: Nav shortcuts ── */}
      <NavShortcuts onNavigate={onNavigate} />

      {/* ── BOTTOM CENTER: hint ── */}
      {!panelOpen && (
        <div className="nexus-ui-item" style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: '#333344',
          letterSpacing: '0.4em', pointerEvents: 'none', zIndex: 10,
          animation: 'breathe 3s ease-in-out infinite',
        }}>
          · CLICK A PLANET TO EXPLORE ·
        </div>
      )}

      {/* ── GAME PANEL ── */}
      {panelOpen && activeGame && (
        <GamePanel ref={panelRef} game={activeGame} timeAgo={timeAgo} onClose={closePanel} onNavigate={onNavigate} />
      )}

      <style>{`
        @keyframes xpShimmer {
          0%,100% { opacity:1; }
          50%      { opacity:0.7; }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateX(-50%) translateY(10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes breathe {
          0%,100% { opacity:0.4; }
          50%      { opacity:1; }
        }
        @keyframes friendPulse {
          0%,100% { box-shadow:0 0 8px #00DDFF; }
          50%      { box-shadow:0 0 18px #00DDFF, 0 0 30px #00DDFF44; }
        }
      `}</style>
    </div>
  )
}

// ── FRIENDS STRIP ────────────────────────────────────────────
function FriendStrip() {
  const online = FRIENDS.filter(f => f.status === 'online')
  return (
    <div className="nexus-ui-item" style={{
      position: 'absolute', bottom: '5rem', left: '2rem',
      zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.35rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00DDFF', boxShadow: '0 0 8px #00DDFF', animation: 'breathe 2s ease-in-out infinite' }} />
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.4em', color: '#444455' }}>
          ONLINE NOW · {online.length}
        </div>
      </div>
      {online.map(f => (
        <div key={f.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.4rem 0.65rem',
          background: 'rgba(5,5,15,0.75)',
          border: '1px solid rgba(0,221,255,0.12)',
          backdropFilter: 'blur(6px)',
          transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,221,255,0.35)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,221,255,0.12)'}
        >
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #002244, #0A0A1F)',
            border: '1.5px solid #00DDFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: '0.65rem', color: '#00DDFF',
            animation: 'friendPulse 2.5s ease-in-out infinite',
            flexShrink: 0,
          }}>{f.avatar}</div>
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.78rem', color: '#F0F0F5' }}>{f.name}</div>
            {f.game && <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.57rem', color: '#00DDFF', opacity: 0.7 }}>🎮 {f.game}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── NAV SHORTCUTS ────────────────────────────────────────────
function NavShortcuts({ onNavigate }) {
  const shortcuts = [
    { label: 'FORGE',     dest: 'discovery',   icon: '◈', color: '#CC0000' },
    { label: 'CATHEDRAL', dest: 'achievements', icon: '✦', color: '#FFD700' },
    { label: 'CAMPFIRE',  dest: 'social',       icon: '⬟', color: '#FF6B35' },
    { label: 'MARKET',    dest: 'store',        icon: '⬢', color: '#00DDFF' },
  ]
  return (
    <div className="nexus-ui-item" style={{
      position: 'absolute', bottom: '2rem', right: '2rem',
      zIndex: 10, display: 'flex', gap: '0.4rem',
    }}>
      {shortcuts.map(s => (
        <button key={s.dest} onClick={() => onNavigate(s.dest)} style={{
          background: 'rgba(5,5,15,0.8)',
          border: `1px solid ${s.color}33`,
          color: '#666677', fontFamily: 'Rajdhani', fontWeight: 700,
          fontSize: '0.68rem', letterSpacing: '0.18em',
          padding: '0.6rem 0.8rem', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
          backdropFilter: 'blur(8px)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = s.color
            e.currentTarget.style.color = s.color
            e.currentTarget.style.background = `${s.color}15`
            e.currentTarget.style.boxShadow = `0 0 20px ${s.color}33`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = `${s.color}33`
            e.currentTarget.style.color = '#666677'
            e.currentTarget.style.background = 'rgba(5,5,15,0.8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  )
}

// ── GAME PANEL ───────────────────────────────────────────────
const GamePanel = React.forwardRef(({ game, timeAgo, onClose, onNavigate }, ref) => {
  const rows = [
    { label: 'Hours Played',   value: game.hours + 'h',          color: '#FFD700' },
    { label: 'Rating',         value: game.rating + ' / 10',     color: '#00DDFF' },
    { label: 'Genre',          value: game.genre,                 color: '#888899' },
    { label: 'Last Played',    value: timeAgo(game.lastPlayed),   color: '#F0F0F5' },
    { label: 'Friends Online', value: game.friendsPlaying,        color: '#CC0000' },
  ]

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 80, right: '2rem',
      width: 300, zIndex: 20,
      background: 'linear-gradient(160deg, rgba(15,5,30,0.98) 0%, rgba(5,5,15,0.98) 100%)',
      border: `1px solid ${game.color}55`,
      backdropFilter: 'blur(20px)',
      boxShadow: `0 0 40px ${game.color}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
      overflow: 'hidden',
    }}>
      {/* Top color strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${game.color}, ${game.color}88, transparent)` }} />

      {/* Color wash */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: `radial-gradient(ellipse at right top, ${game.color}15, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: `1px solid ${game.color}22`, position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '0.9rem', right: '1rem',
          background: 'none', border: 'none', color: '#444455',
          cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.target.style.color = '#F0F0F5'}
          onMouseLeave={e => e.target.style.color = '#444455'}
        >✕</button>

        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.58rem', color: '#444455', letterSpacing: '0.4em', marginBottom: '0.3rem' }}>
          {game.genre.toUpperCase()} · NOW IN ORBIT
        </div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.65rem', color: '#F0F0F5', letterSpacing: '0.08em', lineHeight: 1, textShadow: `0 0 20px ${game.color}55` }}>
          {game.title}
        </div>
        <p style={{ fontFamily: 'Rajdhani', fontSize: '0.8rem', color: '##9999AA', marginTop: '0.4rem', lineHeight: 1.5 }}>
          {game.description}
        </p>

        {/* Rating bar */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.54rem', color: '#444455', letterSpacing: '0.2em' }}>RATING</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '0.85rem', color: game.color }}>{game.rating}/10</span>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', width: `${game.rating * 10}%`, background: `linear-gradient(90deg, ${game.color}, ${game.color}88)`, boxShadow: `0 0 8px ${game.color}` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0.75rem 1.25rem' }}>
        {rows.map(r => (
          <div key={r.label} className="panel-row" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: '0.72rem', color: '#444455', letterSpacing: '0.12em' }}>{r.label}</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: r.color, letterSpacing: '0.05em', textShadow: `0 0 10px ${r.color}44` }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Friends playing */}
      {game.friendsPlaying > 0 && (
        <div className="panel-row" style={{
          padding: '0.6rem 1.25rem',
          background: 'rgba(0,221,255,0.04)',
          borderTop: '1px solid rgba(0,221,255,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.55rem',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00DDFF', boxShadow: '0 0 10px #00DDFF', animation: 'breathe 1.5s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.78rem', color: '#00DDFF' }}>
            {game.friendsPlaying} friend{game.friendsPlaying > 1 ? 's' : ''} playing right now
          </span>
        </div>
      )}

      {/* CTAs */}
      <div className="panel-row" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
        <button style={{
          flex: 2,
          background: `linear-gradient(135deg, ${game.color}, ${game.color}88)`,
          border: 'none', color: '#fff',
          fontFamily: 'Bebas Neue', fontSize: '0.95rem', letterSpacing: '0.25em',
          padding: '0.7rem', cursor: 'pointer',
          boxShadow: `0 4px 20px ${game.color}44`,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'none' }}
        >
          ▶ PLAY NOW
        </button>
        <button onClick={() => onNavigate('discovery')} style={{
          flex: 1, background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', color: '#666677',
          fontFamily: 'Bebas Neue', fontSize: '0.95rem',
          letterSpacing: '0.15em', padding: '0.7rem',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#F0F0F5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#666677' }}
        >
          SIMILAR
        </button>
      </div>
    </div>
  )
})
GamePanel.displayName = 'GamePanel'