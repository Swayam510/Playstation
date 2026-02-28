import React, { useState, useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { GAMES } from '../data/mockData.js'
import { Radar, Crosshair, Zap, Activity, ShieldAlert, Cpu } from 'lucide-react'

// ── PS5 Spider-Man / Miles Morales Palette ───────────────────
const SM = {
  venomRed:  '#FF003D',
  neonCyan:  '#00F0FF',
  voltBlue:  '#0055FF',
  gold:      '#FFB300',
  dark:      '#05050A',
  panel:     'rgba(15, 15, 25, 0.85)',
  webWhite:  'rgba(255, 255, 255, 0.8)'
}

const SLIDERS = [
  { key: 'mood',      label: 'SUIT TECH',    left: 'STEALTH', right: 'VENOM DASH', color: SM.venomRed },
  { key: 'intensity', label: 'THREAT LEVEL', left: 'FRIENDLY', right: 'ULTIMATE',   color: SM.gold },
  { key: 'genre',     label: 'FOCUS',        left: 'NARRATIVE', right: 'COMBAT',     color: SM.neonCyan },
]

// Mock matching algorithm
function getMatch(game, sliders) {
  const a = 1 - Math.abs((game.popularity || 50) - sliders.mood)      / 100
  const b = 1 - Math.abs((game.intensity || 50)  - sliders.intensity) / 100
  const c = 1 - Math.abs((game.popularity || 50) - sliders.genre)      / 100
  return Math.round((a * 0.4 + b * 0.4 + c * 0.2) * 100)
}

// ── Minimalist Web Overlay ───────────────────────────────────
function WebPattern({ opacity = 0.05, color = SM.neonCyan }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hex-web" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="none" stroke={color} strokeWidth="0.5" opacity="0.5"/>
          <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth="0.5" opacity="0.3"/>
          <line x1="0" y1="25" x2="100" y2="75" stroke={color} strokeWidth="0.5" opacity="0.3"/>
          <line x1="0" y1="75" x2="100" y2="25" stroke={color} strokeWidth="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex-web)" />
    </svg>
  )
}

export default function DiscoveryForge() {
  const [sliders, setSliders]     = useState({ mood: 60, intensity: 55, genre: 50 })
  const [activeId, setActiveId]   = useState(GAMES[0].id)
  const pageRef  = useRef(null)
  const featRef  = useRef(null)

  const ranked = useMemo(() =>
    [...GAMES].map(g => ({ ...g, match: getMatch(g, sliders) }))
              .sort((a, b) => b.match - a.match),
  [sliders])

  const featured = ranked.find(g => g.id === activeId) || ranked[0]

  // ── Entrance Animations ─────────────────────────────────
  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    gsap.fromTo('.df-left',   { x: -50, opacity: 0, skewX: 5 }, { x: 0, opacity: 1, skewX: 0, duration: 0.65, ease: 'power3.out', delay: 0.1 })
    gsap.fromTo('.df-center', { y: 40,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.2 })
    gsap.fromTo('.df-right',  { x: 50,  opacity: 0, skewX: -5 }, { x: 0, opacity: 1, skewX: 0, duration: 0.65, ease: 'power3.out', delay: 0.3 })
  }, [])

  const selectGame = (id) => {
    if (id === activeId) return
    gsap.to(featRef.current, {
      opacity: 0, scale: 0.95, filter: 'blur(5px)', duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setActiveId(id)
        gsap.fromTo(featRef.current,
          { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }
        )
      }
    })
  }

  return (
    <div ref={pageRef} style={{
      width: '100%', height: '100vh', background: SM.dark,
      display: 'flex', flexDirection: 'column',
      paddingTop: 64, opacity: 0, overflow: 'hidden', position: 'relative',
    }}>
      
      {/* Dynamic Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse at 15% 70%, ${SM.voltBlue}15 0%, transparent 60%), radial-gradient(ellipse at 85% 20%, ${SM.venomRed}15 0%, transparent 60%)` }} />
      <WebPattern opacity={0.08} color={SM.neonCyan} />

      {/* ── Top Header Bar ── */}
      <div style={{
        position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2.5rem', borderBottom: `2px solid ${SM.venomRed}44`, background: SM.panel, backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: SM.venomRed, filter: `drop-shadow(0 0 10px ${SM.venomRed})` }}>
            <Radar size={40} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: SM.neonCyan, letterSpacing: '0.4em' }}>
              F.N.S.M. NETWORK // NEURAL SCAN ACTIVE
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', letterSpacing: '0.1em', margin: 0, color: '#FFF' }}>
              SPIDER-SENSE <span style={{ color: SM.venomRed }}>PROTOCOL</span>
            </h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: `${SM.neonCyan}11`, padding: '0.5rem 1rem', border: `1px solid ${SM.neonCyan}44`, clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
          <Activity size={18} color={SM.neonCyan} />
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.9rem', color: SM.neonCyan, letterSpacing: '0.2em' }}>
            {ranked.filter(g => g.match >= 70).length} HIGH-RESONANCE TARGETS
          </div>
        </div>
      </div>

      {/* ── Main 3-Column Layout ── */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 320px', minHeight: 0 }}>

        {/* ═══ LEFT: Suit Diagnostic Tuners ═══ */}
        <div className="df-left" style={{ borderRight: `1px solid ${SM.venomRed}33`, padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'rgba(5,5,10,0.6)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${SM.webWhite}22`, paddingBottom: '0.5rem' }}>
            <Cpu size={18} color={SM.webWhite} />
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.3em', color: SM.webWhite }}>
              DIAGNOSTIC TUNING
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {SLIDERS.map(s => (
              <DiagnosticTuner key={s.key} {...s} value={sliders[s.key]} onChange={val => setSliders(p => ({ ...p, [s.key]: Number(val) }))} />
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: '1.5rem', background: `${SM.venomRed}11`, border: `1px solid ${SM.venomRed}44`, clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: SM.venomRed, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>PEAK RESONANCE</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', color: '#FFF', lineHeight: 0.9 }}>
              {featured.match}<span style={{ fontSize: '2rem', color: SM.venomRed }}>%</span>
            </div>
          </div>
        </div>

        {/* ═══ CENTER: HUD Display ═══ */}
        <div className="df-center" style={{ padding: '2rem 3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div ref={featRef}>
            <FeaturedTarget game={featured} />
          </div>
        </div>

        {/* ═══ RIGHT: Target List ═══ */}
        <div className="df-right" style={{ borderLeft: `1px solid ${SM.neonCyan}33`, display: 'flex', flexDirection: 'column', background: 'rgba(5,5,10,0.6)', overflowY: 'auto' }}>
          <div style={{ padding: '1.5rem', position: 'sticky', top: 0, background: SM.panel, backdropFilter: 'blur(10px)', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: `1px solid ${SM.neonCyan}33` }}>
            <Crosshair size={18} color={SM.neonCyan} />
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.3em', color: SM.neonCyan }}>
              DETECTED SIGNALS
            </div>
          </div>
          <div style={{ flex: 1, padding: '1rem' }}>
            {ranked.map((game, idx) => (
              <SignalRow key={game.id} game={game} rank={idx + 1} active={game.id === activeId} onClick={() => selectGame(game.id)} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Internal CSS for Sliders */}
      <style>{`
        input[type=range] { -webkit-appearance:none; appearance:none; background:transparent; cursor:crosshair; display:block; width:100%; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:8px; height:24px;
          background: #FFF; border: 2px solid var(--c);
          box-shadow: 0 0 10px var(--c); margin-top:-10px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:4px; background: var(--t); }
        .df-left::-webkit-scrollbar, .df-center::-webkit-scrollbar, .df-right::-webkit-scrollbar { width:4px; }
        .df-left::-webkit-scrollbar-thumb, .df-center::-webkit-scrollbar-thumb, .df-right::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DIAGNOSTIC TUNER (Replaces WebShooterSlider)
───────────────────────────────────────────────────────────── */
function DiagnosticTuner({ label, left, right, color, value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: '#FFF', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: '1rem', color, textShadow: `0 0 8px ${color}66` }}>{value}hz</span>
      </div>
      <div style={{ position: 'relative', padding: '10px 0' }}>
        <input type="range" min={0} max={100} value={value} onChange={e => onChange(e.target.value)}
          style={{ '--c': color, '--t': `linear-gradient(90deg, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%)` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.65rem', color: '#889', letterSpacing: '0.1em' }}>
        <span>[{left}]</span>
        <span>[{right}]</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FEATURED TARGET (Gamified HUD)
───────────────────────────────────────────────────────────── */
function FeaturedTarget({ game }) {
  const [hov, setHov] = useState(false)
  const isHighMatch = game.match >= 80

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', padding: '2px',
        background: `linear-gradient(135deg, ${SM.venomRed}, ${SM.neonCyan})`,
        clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)',
        transition: 'transform 0.3s',
        transform: hov ? 'scale(1.02)' : 'scale(1)',
      }}>
      
      <div style={{
        background: SM.dark, padding: '2.5rem', height: '100%',
        clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)',
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ background: `${game.color}22`, color: game.color, padding: '0.4rem 1rem', fontFamily: 'Share Tech Mono', fontSize: '0.75rem', letterSpacing: '0.3em', border: `1px solid ${game.color}55` }}>
            TARGET ACQUIRED
          </div>
          {isHighMatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: SM.venomRed, animation: 'pulse 1.5s infinite' }}>
              <ShieldAlert size={20} />
              <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', letterSpacing: '0.1em' }}>PRIME MATCH</span>
            </div>
          )}
        </div>

        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', color: '#FFF', lineHeight: 1, letterSpacing: '0.05em', marginBottom: '1rem' }}>
          {game.title}
        </h2>

        <p style={{ fontFamily: 'Rajdhani', fontSize: '1rem', color: '#AAB', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '90%' }}>
          {game.description}
        </p>

        {/* Gamified Stat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'GENRE PROTOCOL', val: game.genre, icon: <Cpu size={20}/> },
            { label: 'TIME EXPENSE', val: `${game.hours}h`, icon: <Activity size={20}/> },
            { label: 'ALLIES ACTIVE', val: game.friendsPlaying, icon: <Radar size={20}/> }
          ].map((stat, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${SM.neonCyan}`, paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: SM.neonCyan, marginBottom: '0.3rem' }}>
                {stat.icon}
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{stat.label}</span>
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: '#FFF' }}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{
            flex: 1, padding: '1rem', background: `linear-gradient(90deg, ${SM.venomRed}, #AA0022)`,
            border: 'none', color: '#FFF', fontFamily: 'Bebas Neue', fontSize: '1.2rem', letterSpacing: '0.2em',
            cursor: 'pointer', clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
            boxShadow: hov ? `0 0 20px ${SM.venomRed}66` : 'none', transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Zap size={20} /> INITIATE LAUNCH
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIGNAL ROW (List Item)
───────────────────────────────────────────────────────────── */
function SignalRow({ game, rank, active, onClick }) {
  const [hov, setHov] = useState(false)
  
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '0.5rem', cursor: 'pointer',
        background: active ? `${game.color}15` : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: `1px solid ${active ? game.color : 'rgba(255,255,255,0.05)'}`,
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        transition: 'all 0.2s',
      }}>
      
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: active ? game.color : '#556' }}>
        {String(rank).padStart(2, '0')}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: '#FFF', letterSpacing: '0.05em' }}>{game.title}</div>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: '#889' }}>{game.genre.toUpperCase()}</div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: game.color }}>{game.match}%</div>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.6rem', color: '#889', letterSpacing: '0.2em' }}>RESONANCE</div>
      </div>
    </div>
  )
}