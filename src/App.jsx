import React, { useState, useRef } from 'react'
import { gsap } from 'gsap'
import EntryPortal from './pages/EntryPortal.jsx'
import Nexus from './pages/Nexus.jsx'
import DiscoveryForge from './pages/DiscoveryForge.jsx'
import BlackMarket from './pages/BlackMarket.jsx'
import Cathedral from './pages/Cathedral.jsx' 
import CampfireLobby from './pages/campfire.jsx' // <-- Imported your new Campfire component

// ── Placeholder for pages not yet built ──────────────────────
function Placeholder({ name, color = '#00E6F6' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: '1rem',
      background: 'radial-gradient(ellipse at center, #05050A 0%, #000000 70%)',
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

  // ── Route Renderer ──────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case 'nexus':        return <Nexus onNavigate={navigateTo} />
      case 'discovery':    return <DiscoveryForge />
      case 'achievements': return <Cathedral /> 
      case 'social':       return <CampfireLobby /> // <-- Replaced Placeholder with CampfireLobby
      case 'store':        return <BlackMarket />
      default:             return <Nexus onNavigate={navigateTo} />
    }
  }

  return (
    <>
      {/* Page wipe transition - PS Cyan/Blue */}
      <div ref={wipeRef} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'linear-gradient(90deg, #05050A 0%, #00E6F6 50%, #05050A 100%)',
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

// ── Inline NavBar ─────────────────
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
      background: 'linear-gradient(180deg, rgba(5,5,10,0.98) 0%, rgba(5,5,10,0) 100%)',
      borderBottom: '1px solid rgba(0,230,246,0.2)', 
    }}>
      <div style={{
        fontFamily: 'Bebas Neue', fontSize: '1.8rem',
        color: '#00E6F6', letterSpacing: '0.15em',
        textShadow: '0 0 20px rgba(0,230,246,0.6)', cursor: 'pointer',
      }} onClick={() => onNavigate('nexus')}>
        ⬡ ARENA_OS
      </div>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            background: currentPage === item.id ? 'rgba(0,230,246,0.1)' : 'transparent',
            border: 'none',
            borderBottom: currentPage === item.id ? '2px solid #00E6F6' : '2px solid transparent',
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
          background: 'linear-gradient(135deg, #003791, #05050A)',
          border: '2px solid #00E6F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: '#00E6F6', fontFamily: 'Bebas Neue',
        }}>LVL</div>
        <span style={{ color: '#F0F0F5' }}>SWAYAM_PSN</span>
        <span style={{
          background: 'linear-gradient(90deg, #003791, #00E6F6)',
          padding: '2px 8px', borderRadius: '3px',
          fontFamily: 'Share Tech Mono', fontSize: '0.75rem', color: '#05050A', fontWeight: 'bold'
        }}>78</span>
      </div>
    </nav>
  )
}