import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { GAMES, USER } from '../data/mockData.js'
import { Shield, Swords, Flame, ChevronRight, Play, ShoppingBag } from 'lucide-react'

// ── Per-game theme engine ──────────────────────────────────────
// Map game titles to a full visual identity
const GAME_THEMES = {
  'god of war': {
    bg:         '/bg_gow.jpg',
    accent:     '#D4AF37',
    blood:      '#8B0000',
    glow:       'rgba(212,175,55,0.25)',
    overlay:    'linear-gradient(90deg, rgba(8,5,4,0.97) 0%, rgba(8,5,4,0.85) 30%, rgba(0,0,0,0.3) 70%)',
    atmosphere: 'radial-gradient(ellipse at 80% 10%, rgba(139,0,0,0.25) 0%, transparent 60%)',
    fog:        'rgba(8,5,4,0.5)',
    font:       "'Cinzel', serif",
    titleSize:  '5rem',
    label:      'REALM OF THE NORSE GODS',
    rune:       'ᚢ',
  },
  'spider-man': {
    bg:         '/bg_spiderman.jpg',
    accent:     '#E8122C',
    blood:      '#0A1A6B',
    glow:       'rgba(232,18,44,0.35)',
    overlay:    'linear-gradient(90deg, rgba(4,6,18,0.97) 0%, rgba(4,6,18,0.85) 30%, rgba(0,0,0,0.15) 70%)',
    atmosphere: 'radial-gradient(ellipse at 70% 20%, rgba(20,50,200,0.35) 0%, transparent 60%)',
    fog:        'rgba(4,6,18,0.45)',
    font:       "'Bebas Neue', sans-serif",
    titleSize:  '5.5rem',
    label:      'NEW YORK CITY · PS5',
    rune:       '◆',
  },
  'horizon': {
    bg:         '/bg_horizon.jpg',
    accent:     '#00C8FF',
    blood:      '#FF6B00',
    glow:       'rgba(0,200,255,0.25)',
    overlay:    'linear-gradient(90deg, rgba(4,12,18,0.97) 0%, rgba(4,12,18,0.85) 30%, rgba(0,0,0,0.15) 70%)',
    atmosphere: 'radial-gradient(ellipse at 75% 30%, rgba(0,120,180,0.3) 0%, transparent 55%)',
    fog:        'rgba(4,12,18,0.4)',
    font:       "'Rajdhani', sans-serif",
    titleSize:  '4.5rem',
    label:      'THE FORBIDDEN WEST',
    rune:       '◈',
  },
  'elden ring': {
    bg:         '/bg_eldenring.jpg',
    accent:     '#C8A84B',
    blood:      '#4A2A08',
    glow:       'rgba(200,168,75,0.2)',
    overlay:    'linear-gradient(90deg, rgba(6,5,8,0.97) 0%, rgba(6,5,8,0.88) 30%, rgba(0,0,0,0.4) 70%)',
    atmosphere: 'radial-gradient(ellipse at 65% 15%, rgba(200,168,75,0.12) 0%, transparent 55%)',
    fog:        'rgba(6,5,8,0.6)',
    font:       "'Cinzel', serif",
    titleSize:  '4.8rem',
    label:      'THE LANDS BETWEEN',
    rune:       '✦',
  },
  'ghost of tsushima': {
    bg:         '/bg_tsushima.jpg',
    accent:     '#FF6B6B',
    blood:      '#8B1A1A',
    glow:       'rgba(255,107,107,0.22)',
    overlay:    'linear-gradient(90deg, rgba(5,5,8,0.97) 0%, rgba(5,5,8,0.85) 30%, rgba(0,0,0,0.2) 70%)',
    atmosphere: 'radial-gradient(ellipse at 70% 20%, rgba(180,40,40,0.22) 0%, transparent 55%)',
    fog:        'rgba(5,5,8,0.4)',
    font:       "'Cinzel', serif",
    titleSize:  '5rem',
    label:      'ISLAND OF TSUSHIMA · FEUDAL JAPAN',
    rune:       '⛩',
  },
  'returnal': {
    bg:         '/bg_returnal.jpg',
    accent:     '#00FF88',
    blood:      '#8800FF',
    glow:       'rgba(0,255,136,0.22)',
    overlay:    'linear-gradient(90deg, rgba(2,6,10,0.97) 0%, rgba(2,6,10,0.88) 30%, rgba(0,0,0,0.2) 70%)',
    atmosphere: 'radial-gradient(ellipse at 70% 20%, rgba(80,0,200,0.28) 0%, transparent 55%)',
    fog:        'rgba(2,6,10,0.5)',
    font:       "'Share Tech Mono', monospace",
    titleSize:  '4.5rem',
    label:      'ATROPOS · CYCLE 001',
    rune:       '⬡',
  },
}

// Fallback theme for any game not explicitly mapped
const DEFAULT_THEME = {
  bg:       '/bg_gow.jpg',
  accent:   '#D4AF37',
  blood:    '#8B0000',
  glow:     'rgba(212,175,55,0.2)',
  overlay:  'linear-gradient(90deg, rgba(8,5,4,0.97) 0%, rgba(8,5,4,0.85) 30%, rgba(0,0,0,0.3) 70%)',
  atmosphere: 'radial-gradient(ellipse at 80% 10%, rgba(139,0,0,0.2) 0%, transparent 60%)',
  fog:      'rgba(8,5,4,0.5)',
  font:     "'Cinzel', serif",
  titleSize:'5rem',
  label:    'REALM GATEWAY',
  rune:     '✦',
}

const getTheme = (game) => {
  if (!game) return DEFAULT_THEME
  const titleLower = game.title.toLowerCase()
  const match = Object.keys(GAME_THEMES).find(key => titleLower.includes(key))
  return match
    ? GAME_THEMES[match]
    : { ...DEFAULT_THEME, accent: game.color || DEFAULT_THEME.accent }
}
const NAV_ITEMS = [
  { icon: Swords,     dest: 'discovery',    label: 'FORGE'     },
  { icon: Shield,     dest: 'achievements', label: 'CATHEDRAL' },
  { icon: Flame,      dest: 'social',       label: 'CAMPFIRE'  },
  { icon: ShoppingBag,dest: 'store',        label: 'MARKET'    },
]

export default function Nexus({ onNavigate }) {
  const [activeGame, setActiveGame] = useState(GAMES[0] || null)
  const [theme, setTheme]           = useState(getTheme(GAMES[0]))
  const [transitioning, setTransitioning] = useState(false)

  const pageRef    = useRef(null)
  const bgRef      = useRef(null)
  const bgNextRef  = useRef(null)
  const contentRef = useRef(null)
  const overlayRef = useRef(null)

  // ── Entrance ────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(pageRef.current,  { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' })
    tl.fromTo('.rune-item',     { x: -40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power3.out' }, '-=0.6')
    tl.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')
  }, [])

  // ── Game switch with full theme morph ───────────────────────
  const handleGameChange = (game) => {
    if (activeGame?.id === game.id || transitioning) return
    const nextTheme = getTheme(game)
    setTransitioning(true)

    // 1. Fade content out
    gsap.to(contentRef.current, { opacity: 0, x: 30, duration: 0.25, ease: 'power2.in' })

    // 2. Fade background out, swap, fade in
    gsap.to(bgRef.current, { opacity: 0, duration: 0.4, ease: 'power2.inOut', delay: 0.1,
      onComplete: () => {
        setActiveGame(game)
        setTheme(nextTheme)
        gsap.to(bgRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out',
          onComplete: () => setTransitioning(false)
        })
        // Fade content in with new theme
        gsap.fromTo(contentRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        )
      }
    })

    // Overlay flash
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
    )
  }

  const timeAgo = (ts) => {
    const m = Math.floor((Date.now() - ts) / 60000)
    if (m < 60)   return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    return `${Math.floor(m / 1440)}d ago`
  }

  return (
    <div ref={pageRef} style={{
      width: '100vw', height: '100vh',
      overflow: 'hidden', position: 'relative',
      color: '#E8E3D8', paddingTop: 64,
      opacity: 0,
    }}>

      {/* ── BACKGROUND — morphs per game ── */}
      <div ref={bgRef} style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('${theme.bg}')`,
        backgroundSize: 'cover', backgroundPosition: 'center top',
        filter: 'brightness(0.45) saturate(0.8)',
        transition: 'background-image 0s',
        zIndex: 0,
      }} />

      {/* Gradient overlay — changes per theme */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: theme.overlay,
        transition: 'background 0.6s ease',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: theme.atmosphere,
        transition: 'background 0.6s ease',
      }} />
      {/* Bottom fog */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
        background: `linear-gradient(to top, ${theme.fog} 0%, transparent 100%)`,
        zIndex: 1, pointerEvents: 'none', transition: 'background 0.6s ease',
      }} />

      {/* Flash overlay for transition */}
      <div ref={overlayRef} style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: theme.accent, opacity: 0,
      }} />

      {/* Grain */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px',
      }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', height: '100%' }}>

        {/* ════════════════════════════════════════
            LEFT COLUMN — Game List + Nav
        ════════════════════════════════════════ */}
        <div style={{
          width: 380, height: '100%', display: 'flex', flexDirection: 'column',
          background: 'rgba(4,4,8,0.55)', backdropFilter: 'blur(12px)',
          borderRight: `1px solid ${theme.accent}18`,
          transition: 'border-color 0.6s ease',
        }}>

          {/* Profile */}
          <div style={{
            padding: '2.25rem 2rem 1.75rem',
            borderBottom: `1px solid rgba(255,255,255,0.05)`,
          }}>
            <div style={{
              fontFamily: 'Share Tech Mono', fontSize: '0.58rem',
              color: theme.accent, letterSpacing: '0.5em', marginBottom: '1rem',
              transition: 'color 0.5s ease',
            }}>
              {theme.rune} REALM GATEWAY
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${theme.accent}`,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${theme.glow}`,
                transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
              }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.3rem', color: theme.accent, transition: 'color 0.5s' }}>
                  {USER.level}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.55rem', color: '#E8E3D8', letterSpacing: '0.06em', lineHeight: 1 }}>
                  {USER.name}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.58rem', color: '#666', letterSpacing: '0.15em', marginTop: '0.2rem' }}>
                  SOUL SCORE · {USER.soulScore?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Rage bar tinted to theme */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.52rem', color: '#444', letterSpacing: '0.25em' }}>SPARTAN RAGE</span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '0.75rem', color: theme.accent, transition: 'color 0.5s' }}>74%</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: '74%',
                  background: `linear-gradient(90deg, ${theme.blood}, ${theme.accent})`,
                  boxShadow: `0 0 10px ${theme.accent}55`,
                  transition: 'background 0.6s ease, box-shadow 0.6s ease',
                }} />
              </div>
            </div>
          </div>

          {/* Game List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}
            className="hide-scroll">
            {GAMES.map((game) => {
              const isActive = activeGame?.id === game.id
              return (
                <div key={game.id} className="rune-item"
                  onClick={() => handleGameChange(game)}
                  style={{
                    padding: '1rem 2rem', cursor: 'pointer', position: 'relative',
                    background: isActive ? `linear-gradient(90deg, ${theme.accent}12, transparent)` : 'transparent',
                    transition: 'all 0.25s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderLeft: `2px solid ${isActive ? theme.accent : 'transparent'}`,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'Share Tech Mono', fontSize: '0.56rem',
                      color: isActive ? theme.accent : '#444',
                      letterSpacing: '0.2em', marginBottom: '0.2rem',
                      transition: 'color 0.4s ease',
                    }}>
                      {game.genre.toUpperCase()}
                    </div>
                    <div style={{
                      fontFamily: isActive ? theme.font : 'Rajdhani',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: isActive ? '1.05rem' : '0.95rem',
                      color: isActive ? '#E8E3D8' : '#666',
                      transition: 'all 0.3s ease', lineHeight: 1.2,
                    }}>
                      {game.title}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight size={16} color={theme.accent} style={{ flexShrink: 0 }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom Nav */}
          <div style={{
            padding: '1.5rem 2rem',
            borderTop: `1px solid rgba(255,255,255,0.05)`,
            display: 'flex', justifyContent: 'space-around',
          }}>
            {NAV_ITEMS.map(n => (
              <NavIcon key={n.dest} Icon={n.icon} label={n.label}
                accent={theme.accent}
                onClick={() => onNavigate(n.dest)} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT AREA — Active Game Showcase
        ════════════════════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5rem' }}>
          <div ref={contentRef} style={{ maxWidth: 800 }}>

            {/* Realm label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ height: 1, width: 50, background: theme.accent, boxShadow: `0 0 8px ${theme.accent}`, transition: 'background 0.5s, box-shadow 0.5s' }} />
              <span style={{
                fontFamily: 'Share Tech Mono', fontSize: '0.7rem',
                color: theme.accent, letterSpacing: '0.45em',
                transition: 'color 0.5s ease',
              }}>
                {theme.label}
              </span>
            </div>

            {/* Title — font changes per game */}
            <h1 style={{
              fontFamily: theme.font,
              fontSize: theme.titleSize,
              fontWeight: 800, margin: '0 0 1.25rem 0', lineHeight: 1.05,
              color: '#F0EDE8',
              textShadow: `0 10px 40px rgba(0,0,0,0.9), 0 0 60px ${theme.glow}`,
              transition: 'font-family 0.4s, color 0.4s, text-shadow 0.5s',
            }}>
              {activeGame?.title}
            </h1>

            <p style={{
              fontFamily: 'Rajdhani', fontSize: '1.1rem',
              color: '#BBBBCC', lineHeight: 1.7, maxWidth: 580,
              marginBottom: '2.5rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}>
              {activeGame?.description}
            </p>

            {/* Stats — accent colored */}
            <div style={{ display: 'flex', gap: '3rem', marginBottom: '2.75rem' }}>
              <StatBlock label="HOURS LOGGED"  value={`${activeGame?.hours}H`}          color={theme.accent}  font={theme.font} />
              <StatBlock label="POWER RATING"  value={`${activeGame?.rating}/10`}        color={theme.blood}   font={theme.font} />
              <StatBlock label="ALLIES ACTIVE" value={activeGame?.friendsPlaying || 0}   color='#9999CC'       font={theme.font} />
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button style={{
                background: `linear-gradient(135deg, ${theme.blood}, ${theme.blood}AA)`,
                border: `1px solid ${theme.blood}`,
                padding: '1rem 3rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                color: '#F0EDE8', fontFamily: theme.font,
                fontWeight: 700, fontSize: '1rem', letterSpacing: '0.15em',
                cursor: 'pointer',
                clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
                boxShadow: `0 8px 30px rgba(0,0,0,0.6)`,
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 35px ${theme.blood}66` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.6)` }}
              >
                <Play fill="currentColor" size={18} /> BEGIN JOURNEY
              </button>

              {/* Last played badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: `1px solid ${theme.accent}22`,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: theme.accent, letterSpacing: '0.2em' }}>
                  LAST PLAYED {timeAgo(activeGame?.lastPlayed)} AGO
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Rajdhani:wght@500;700&family=Share+Tech+Mono&family=Bebas+Neue&display=swap');
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

// ── STAT BLOCK ─────────────────────────────────────────────────
function StatBlock({ label, value, color, font }) {
  return (
    <div>
      <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.58rem', color: '#555', letterSpacing: '0.25em', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{
        fontFamily: font,
        fontSize: '2.4rem', fontWeight: 800, color,
        lineHeight: 1, textShadow: `0 0 20px ${color}44`,
        transition: 'color 0.5s ease, font-family 0.4s ease',
      }}>
        {value}
      </div>
    </div>
  )
}

// ── NAV ICON ───────────────────────────────────────────────────
function NavIcon({ Icon, label, accent, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
        padding: '0.6rem 0.8rem',
        border: `1px solid ${hov ? accent + '88' : 'rgba(255,255,255,0.08)'}`,
        background: hov ? `${accent}10` : 'rgba(0,0,0,0.3)',
        color: hov ? accent : '#556',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: hov ? `0 0 15px ${accent}22` : 'none',
        minWidth: 60,
      }}
    >
      <Icon size={20} />
      <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.5rem', letterSpacing: '0.15em' }}>{label}</span>
    </div>
  )
}