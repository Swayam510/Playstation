import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { GAMES, FRIENDS, USER } from '../data/mockData.js'

const ORBIT_RADIUS = 6
const PLANET_SCALE = 0.9

export default function Nexus({ onNavigate }) {
  const canvasRef  = useRef(null)
  const mountRef   = useRef(null)
  const sceneRef   = useRef({})
  const [activeGame, setActiveGame]   = useState(null)
  const [panelOpen, setPanelOpen]     = useState(false)
  const panelRef   = useRef(null)
  const overlayRef = useRef(null)

  // ── Mount Three.js ──────────────────────────────────────────
  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0A0A0F, 1)

    // Scene & camera
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0A0A0F, 0.025)

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 500)
    camera.position.set(0, 8, 22)
    camera.lookAt(0, 0, 0)

    // ── Background star field ───────────────────────────────────
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(3000)
    for (let i = 0; i < 3000; i++) {
      starPos[i] = (Math.random() - 0.5) * 300
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xaaaacc, size: 0.12, sizeAttenuation: true })
    )
    scene.add(stars)

    // ── Central "You" Orb ───────────────────────────────────────
    const youGeo  = new THREE.SphereGeometry(1.2, 32, 32)
    const youMat  = new THREE.MeshStandardMaterial({
      color: 0x1A0A2E, emissive: 0xCC0000, emissiveIntensity: 0.8,
      roughness: 0.3, metalness: 0.9,
    })
    const youMesh = new THREE.Mesh(youGeo, youMat)
    scene.add(youMesh)

    // Outer glow ring around "you"
    const youRingGeo = new THREE.RingGeometry(1.6, 1.75, 64)
    const youRingMat = new THREE.MeshBasicMaterial({ color: 0xCC0000, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    const youRing = new THREE.Mesh(youRingGeo, youRingMat)
    youRing.rotation.x = Math.PI / 2
    scene.add(youRing)

    // ── Orbit Path Ring ─────────────────────────────────────────
    const orbitRingGeo = new THREE.RingGeometry(ORBIT_RADIUS - 0.03, ORBIT_RADIUS + 0.03, 128)
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0x330011, side: THREE.DoubleSide, transparent: true, opacity: 0.5
    })
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat)
    orbitRing.rotation.x = Math.PI / 2
    scene.add(orbitRing)

    // ── Outer orbit for less-recent games ──────────────────────
    const outerRingGeo = new THREE.RingGeometry(ORBIT_RADIUS * 1.6 - 0.02, ORBIT_RADIUS * 1.6 + 0.02, 128)
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x111133, side: THREE.DoubleSide, transparent: true, opacity: 0.3
    })
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat)
    outerRing.rotation.x = Math.PI / 2
    scene.add(outerRing)

    // ── Lights ──────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1A0A2E, 1.5)
    scene.add(ambientLight)

    const centerLight = new THREE.PointLight(0xCC0000, 4, 15)
    scene.add(centerLight)

    const cyanLight = new THREE.PointLight(0x00E5FF, 1, 30)
    cyanLight.position.set(10, 5, 10)
    scene.add(cyanLight)

    // ── Build game planet spheres ───────────────────────────────
    const sorted = [...GAMES].sort((a, b) => b.lastPlayed - a.lastPlayed)
    const planets = []
    const friendLights = []

    sorted.forEach((game, i) => {
      const isInner  = i < 4
      const radius   = isInner ? ORBIT_RADIUS : ORBIT_RADIUS * 1.6
      const speed    = isInner
        ? 0.12 + (i * 0.015) * (1 + (Date.now() - game.lastPlayed) / (1000*60*60*24) * 0.01)
        : 0.06 + i * 0.008
      const angle    = (i / sorted.length) * Math.PI * 2

      // Planet mesh
      const size   = PLANET_SCALE * (isInner ? 1 : 0.75)
      const geo    = new THREE.SphereGeometry(size, 32, 32)
      const color  = new THREE.Color(game.color)
      const mat    = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.6,
      })
      const mesh   = new THREE.Mesh(geo, mat)
      mesh.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
      mesh.userData = { game, orbitAngle: angle, orbitRadius: radius, orbitSpeed: speed, baseY: 0, index: i }
      scene.add(mesh)

      // Glow sprite around planet
      const glowGeo  = new THREE.SphereGeometry(size * 1.35, 16, 16)
      const glowMat  = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.12, side: THREE.BackSide
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      mesh.add(glow)

      // Friend activity pulse light (only if friends are playing)
      if (game.friendsPlaying > 0) {
        const pLight = new THREE.PointLight(0x00E5FF, 0, size * 3)
        pLight.userData = { basePower: 1.5 + game.friendsPlaying * 0.5 }
        mesh.add(pLight)
        friendLights.push(pLight)
      }

      planets.push({ mesh, mat, glowMat, angle, radius, speed, game, isHovered: false })
    })

    sceneRef.current = { scene, camera, renderer, planets, friendLights, youMesh, youRing, youRingMat }

    // ── Raycaster for hover/click ───────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredPlanet = null

    const onMouseMove = (e) => {
      mouse.x =  (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const meshes = planets.map(p => p.mesh)
      const hits   = raycaster.intersectObjects(meshes)

      // Unhover previous
      if (hoveredPlanet && (!hits.length || hits[0].object !== hoveredPlanet.mesh)) {
        gsap.to(hoveredPlanet.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2)' })
        gsap.to(hoveredPlanet.mat, { emissiveIntensity: 0.3, duration: 0.3 })
        hoveredPlanet.isHovered = false
        hoveredPlanet = null
        document.body.style.cursor = 'crosshair'
      }

      if (hits.length) {
        const planet = planets.find(p => p.mesh === hits[0].object)
        if (planet && !planet.isHovered) {
          planet.isHovered = true
          hoveredPlanet = planet
          document.body.style.cursor = 'pointer'
          gsap.to(planet.mesh.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.4, ease: 'back.out(2)' })
          gsap.to(planet.mat, { emissiveIntensity: 1.2, duration: 0.3 })
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

    // ── Intro camera animation ──────────────────────────────────
    camera.position.set(0, 30, 10)
    camera.lookAt(0, 0, 0)
    gsap.to(camera.position, {
      y: 8, z: 22, duration: 2.2,
      ease: 'power3.out',
    })

    // ── UI crystallization ──────────────────────────────────────
    gsap.from('.nexus-ui-item', {
      opacity: 0, y: 20, stagger: 0.1, duration: 0.6,
      ease: 'power2.out', delay: 1.5,
    })

    // ── Render loop ─────────────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t  = clock.getElapsedTime()

      // Orbit planets
      planets.forEach(p => {
        p.angle += p.speed * 0.003
        p.mesh.position.x = Math.cos(p.angle) * p.radius
        p.mesh.position.z = Math.sin(p.angle) * p.radius
        p.mesh.position.y = Math.sin(t * 0.5 + p.mesh.userData.index) * 0.1

        // Self-rotation
        p.mesh.rotation.y += 0.004
        p.mesh.rotation.x = Math.sin(t * 0.3 + p.mesh.userData.index) * 0.05
      })

      // Pulse friend lights
      const pulseVal = Math.sin(t * 3) * 0.5 + 0.5
      friendLights.forEach(l => {
        l.intensity = l.userData.basePower * pulseVal
      })

      // Center orb pulse
      youMesh.rotation.y = t * 0.5
      const orbPulse = Math.sin(t * 2) * 0.1 + 1
      youMesh.scale.setScalar(orbPulse)
      youRingMat.opacity = 0.4 + Math.sin(t * 2.5) * 0.2

      // Orbit ring shimmer
      orbitRingMat.opacity = 0.3 + Math.sin(t * 1.5) * 0.1

      // Stars slow drift
      stars.rotation.y = t * 0.005

      // Camera gentle sway
      camera.position.x = Math.sin(t * 0.2) * 0.5
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ──────────────────────────────────────────────────
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

  // ── Open game panel ─────────────────────────────────────────
  const openGamePanel = (game) => {
    setActiveGame(game)
    setPanelOpen(true)
    setTimeout(() => {
      if (panelRef.current) {
        gsap.timeline()
          .fromTo(panelRef.current,
            { x: 60, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
          )
          .fromTo(panelRef.current.querySelectorAll('.panel-row'),
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, stagger: 0.07, duration: 0.35, ease: 'power2.out' },
            '-=0.2'
          )
      }
    }, 10)
  }

  const closePanel = () => {
    gsap.to(panelRef.current, {
      x: 60, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { setPanelOpen(false); setActiveGame(null) }
    })
  }

  const timeAgo = (ts) => {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div ref={mountRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />

      {/* ── Top HUD ── */}
      <div style={{
        position: 'absolute', top: '80px', left: '2rem',
        fontFamily: 'Bebas Neue', fontSize: '2.2rem',
        color: '#F0F0F5', letterSpacing: '0.15em',
        textShadow: '0 0 30px rgba(204,0,0,0.4)',
        pointerEvents: 'none',
      }} className="nexus-ui-item">
        YOUR NEXUS
        <div style={{ fontSize: '0.75rem', fontFamily: 'Share Tech Mono', color: '#888899', letterSpacing: '0.3em', marginTop: '-0.3rem' }}>
          {USER.name} // LVL {USER.level}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <StatBar user={USER} />

      {/* ── Friends strip ── */}
      <FriendStrip />

      {/* ── Hint ── */}
      {!panelOpen && (
        <div className="nexus-ui-item" style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Rajdhani', fontSize: '0.8rem',
          color: '#555566', letterSpacing: '0.3em',
          pointerEvents: 'none',
        }}>
          CLICK A PLANET TO EXPLORE
        </div>
      )}

      {/* ── Nav shortcuts ── */}
      <NavShortcuts onNavigate={onNavigate} />

      {/* ── Game Detail Panel ── */}
      {panelOpen && activeGame && (
        <GamePanel
          ref={panelRef}
          game={activeGame}
          timeAgo={timeAgo}
          onClose={closePanel}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

// ── Stat Bar ────────────────────────────────────────────────────
function StatBar({ user }) {
  const stats = [
    { label: 'HOURS', value: user.hoursPlayed.toLocaleString() },
    { label: 'PLATINUMS', value: user.platinums },
    { label: 'SOUL SCORE', value: user.soulScore.toLocaleString() },
    { label: 'FRIENDS', value: user.friendCount },
  ]
  return (
    <div className="nexus-ui-item" style={{
      position: 'absolute', top: '80px', right: '2rem',
      display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end',
    }}>
      {stats.map(s => (
        <div key={s.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Rajdhani', fontSize: '0.7rem', color: '#555566', letterSpacing: '0.2em' }}>{s.label}</span>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.3rem', color: '#FFD700' }}>{s.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Friend Strip ────────────────────────────────────────────────
function FriendStrip() {
  const online = FRIENDS.filter(f => f.status === 'online')
  return (
    <div className="nexus-ui-item" style={{
      position: 'absolute', bottom: '5rem', left: '2rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ fontFamily: 'Rajdhani', fontSize: '0.7rem', letterSpacing: '0.3em', color: '#555566', marginBottom: '0.2rem' }}>
        ONLINE NOW
      </div>
      {online.map(f => (
        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `linear-gradient(135deg, #CC0000, #1A0A2E)`,
            border: '1.5px solid #00E5FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bebas Neue', fontSize: '0.6rem', color: '#00E5FF',
            boxShadow: '0 0 8px rgba(0,229,255,0.4)',
          }}>
            {f.avatar}
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.75rem', color: '#F0F0F5' }}>{f.name}</div>
            {f.game && (
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: '#555566' }}>{f.game}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Nav Shortcuts ───────────────────────────────────────────────
function NavShortcuts({ onNavigate }) {
  const shortcuts = [
    { label: 'FORGE',     dest: 'discovery',    icon: '◈', desc: 'Discover Games' },
    { label: 'CATHEDRAL', dest: 'achievements',  icon: '✦', desc: 'Your Trophies'  },
    { label: 'CAMPFIRE',  dest: 'social',        icon: '⬟', desc: 'Social Lobby'   },
    { label: 'MARKET',    dest: 'store',         icon: '⬢', desc: 'Black Market'   },
  ]
  return (
    <div className="nexus-ui-item" style={{
      position: 'absolute', bottom: '2rem', right: '2rem',
      display: 'flex', gap: '0.5rem',
    }}>
      {shortcuts.map(s => (
        <button key={s.dest} onClick={() => onNavigate(s.dest)} style={{
          background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(204,0,0,0.3)',
          color: '#888899', fontFamily: 'Rajdhani', fontWeight: 700,
          fontSize: '0.7rem', letterSpacing: '0.15em',
          padding: '0.5rem 0.75rem', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#CC0000'
            e.currentTarget.style.color = '#F0F0F5'
            e.currentTarget.style.background = 'rgba(204,0,0,0.1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(204,0,0,0.3)'
            e.currentTarget.style.color = '#888899'
            e.currentTarget.style.background = 'rgba(10,10,15,0.8)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  )
}

// ── Game Panel ──────────────────────────────────────────────────
const GamePanel = React.forwardRef(({ game, timeAgo, onClose, onNavigate }, ref) => {
  const statsRows = [
    { label: 'Hours Played', value: game.hours + 'h', color: '#FFD700'  },
    { label: 'Rating',       value: game.rating,       color: '#00E5FF'  },
    { label: 'Friends Online',value: game.friendsPlaying, color: '#CC0000' },
    { label: 'Last Played',  value: timeAgo(game.lastPlayed), color: '#F0F0F5' },
    { label: 'Genre',        value: game.genre,        color: '#888899'  },
  ]

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '80px', right: '2rem',
      width: 300,
      background: 'linear-gradient(160deg, rgba(26,10,46,0.97) 0%, rgba(10,10,15,0.97) 100%)',
      border: '1px solid rgba(204,0,0,0.4)',
      backdropFilter: 'blur(12px)',
      overflow: 'hidden',
    }}>
      {/* Game color bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${game.color}, transparent)` }} />

      {/* Header */}
      <div style={{
        padding: '1.2rem',
        background: `linear-gradient(135deg, ${game.color}22, transparent)`,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button onClick={onClose} style={{
          float: 'right', background: 'none', border: 'none',
          color: '#555566', cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
        }}>✕</button>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#F0F0F5', letterSpacing: '0.1em', lineHeight: 1.1 }}>
          {game.title}
        </div>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: '#555566', marginTop: '0.3rem' }}>
          {game.description}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '1rem 1.2rem' }}>
        {statsRows.map(r => (
          <div key={r.label} className="panel-row" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.45rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: '0.75rem', color: '#555566', letterSpacing: '0.1em' }}>{r.label}</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.1rem', color: r.color, letterSpacing: '0.05em' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Friends playing */}
      {game.friendsPlaying > 0 && (
        <div className="panel-row" style={{
          padding: '0.6rem 1.2rem',
          background: 'rgba(0,229,255,0.05)',
          borderTop: '1px solid rgba(0,229,255,0.1)',
          borderBottom: '1px solid rgba(0,229,255,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#00E5FF',
            boxShadow: '0 0 8px #00E5FF',
            animation: 'pulse-glow 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: 'Rajdhani', fontSize: '0.75rem', color: '#00E5FF', fontWeight: 600 }}>
            {game.friendsPlaying} friend{game.friendsPlaying > 1 ? 's' : ''} playing now
          </span>
        </div>
      )}

      {/* CTA buttons */}
      <div className="panel-row" style={{ padding: '1rem 1.2rem', display: 'flex', gap: '0.5rem' }}>
        <button style={{
          flex: 1, background: 'linear-gradient(135deg, #CC0000, #880000)',
          border: 'none', color: '#fff', fontFamily: 'Bebas Neue',
          fontSize: '0.9rem', letterSpacing: '0.2em', padding: '0.6rem',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => e.target.style.opacity = '0.8'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          PLAY NOW
        </button>
        <button
          onClick={() => onNavigate('discovery')}
          style={{
            flex: 1, background: 'transparent',
            border: '1px solid rgba(204,0,0,0.4)', color: '#888899',
            fontFamily: 'Bebas Neue', fontSize: '0.9rem',
            letterSpacing: '0.2em', padding: '0.6rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#CC0000'; e.target.style.color = '#F0F0F5' }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(204,0,0,0.4)'; e.target.style.color = '#888899' }}
        >
          SIMILAR
        </button>
      </div>
    </div>
  )
})
GamePanel.displayName = 'GamePanel'
