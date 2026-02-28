import React, { useState, useRef } from 'react'
import { gsap } from 'gsap'
import EntryPortal from './pages/EntryPortal.jsx'
import Nexus from './pages/Nexus.jsx'

// ── Placeholder for pages not yet built ──────────────────────
function Placeholder({ name, color = '#CC0000' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: '1rem',
      background: 'radial-gradient(ellipse at center, #1A0A2E 0%, #0A0A0F 70%)',
    }}>
      <div style={{
        fontFamily: 'Bebas Neue', fontSize: '5rem',
        color, letterSpacing: '0.2em',
        textShadow: `0 0 40px ${color}88`,
      }}>
        {name}
      </div>
      <div style={{
        fontFamily: 'Share Tech Mono', color: '#555566',
        fontSize: '0.85rem', letterSpacing: '0.3em',
      }}>
        UNDER CONSTRUCTION
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage]           = useState('entry')
  const [entryDone, setEntryDone] = useState(false)
  const wipeRef = useRef(null)

  const navigateTo = (dest) => {
    if (dest === page) return
    const wipe = wipeRef.current
    gsap.timeline()
      .set(wipe,  { scaleX: 0, transformOrigin: 'left center',  display: 'block' })
      .to(wipe,   { scaleX: 1, duration: 0.3, ease: 'power3.in' })
      .call(() => setPage(dest))
      .to(wipe,   { scaleX: 0, transformOrigin: 'right center', duration: 0.3, ease: 'power3.out', delay: 0.05 })
      .set(wipe,  { display: 'none' })
  }

  const handleEntryComplete = () => {
    setEntryDone(true)
    setPage('nexus')
  }

  const renderPage = () => {
    switch (page) {
      case 'nexus':        return <Nexus onNavigate={navigateTo} />
      case 'discovery':    return <Placeholder name="DISCOVERY FORGE"      color="#CC0000" />
      case 'achievements': return <Placeholder name="ACHIEVEMENT CATHEDRAL" color="#FFD700" />
      case 'social':       return <Placeholder name="THE CAMPFIRE"         color="#00E5FF" />
      case 'store':        return <Placeholder name="BLACK MARKET"         color="#FFD700" />
      default:             return <Nexus onNavigate={navigateTo} />
    }
  }

  return (
    <>
      {/* Page wipe transition */}
      <div ref={wipeRef} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'linear-gradient(90deg, #0A0A0F 0%, #CC0000 50%, #0A0A0F 100%)',
        display: 'none', pointerEvents: 'none',
      }} />

      {/* Entry portal */}
      {!entryDone && (
        <EntryPortal onComplete={handleEntryComplete} />
      )}

      {/* Main shell */}
      {entryDone && (
        <div style={{ width: '100%', height: '100%' }}>
          <NavBar currentPage={page} onNavigate={navigateTo} />
          {renderPage()}
        </div>
      )}
    </>
  )
}

// ── Inline NavBar (no separate import needed) ─────────────────
const NAV_ITEMS = [
  { id: 'nexus',        label: 'NEXUS',     icon: '⬡' },
  { id: 'discovery',    label: 'FORGE',     icon: '◈' },
  { id: 'achievements', label: 'CATHEDRAL', icon: '✦' },
  { id: 'social',       label: 'CAMPFIRE',  icon: '⬟' },
  { id: 'store',        label: 'MARKET',    icon: '⬢' },
]

function NavBar({ currentPage, onNavigate }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '64px',
      background: 'linear-gradient(180deg, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0) 100%)',
      borderBottom: '1px solid rgba(204,0,0,0.2)',
    }}>
      <div style={{
        fontFamily: 'Bebas Neue', fontSize: '1.8rem',
        color: '#CC0000', letterSpacing: '0.15em',
        textShadow: '0 0 20px rgba(204,0,0,0.6)', cursor: 'pointer',
      }} onClick={() => onNavigate('nexus')}>
        ⬡ THE ARENA
      </div>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            background: currentPage === item.id ? 'rgba(204,0,0,0.15)' : 'transparent',
            border: 'none',
            borderBottom: currentPage === item.id ? '2px solid #CC0000' : '2px solid transparent',
            color: currentPage === item.id ? '#F0F0F5' : '#888899',
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.8rem',
            letterSpacing: '0.12em', padding: '0 1rem', height: '64px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.85rem',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #CC0000, #1A0A2E)',
          border: '2px solid #FFD700',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: '#FFD700', fontFamily: 'Bebas Neue',
        }}>LVL</div>
        <span style={{ color: '#F0F0F5' }}>APEX_KRATOS</span>
        <span style={{
          background: 'linear-gradient(90deg, #CC0000, #FF4444)',
          padding: '2px 8px', borderRadius: '3px',
          fontFamily: 'Share Tech Mono', fontSize: '0.75rem', color: '#fff',
        }}>78</span>
      </div>
    </nav>
  )
}
