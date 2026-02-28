import React from 'react'

const NAV_ITEMS = [
  { id: 'nexus',        label: 'NEXUS',      icon: '⬡' },
  { id: 'discovery',    label: 'FORGE',      icon: '◈' },
  { id: 'achievements', label: 'CATHEDRAL',  icon: '✦' },
  { id: 'social',       label: 'CAMPFIRE',   icon: '⬟' },
  { id: 'store',        label: 'MARKET',     icon: '⬢' },
]

export default function NavBar({ currentPage, onNavigate }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem',
      height: '64px',
      background: 'linear-gradient(180deg, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0) 100%)',
      borderBottom: '1px solid rgba(204,0,0,0.2)',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'Bebas Neue', fontSize: '1.8rem',
        color: '#CC0000', letterSpacing: '0.15em',
        textShadow: '0 0 20px rgba(204,0,0,0.6)',
        cursor: 'pointer',
      }} onClick={() => onNavigate('nexus')}>
        ⬡ THE ARENA
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={currentPage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>

      {/* Profile */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.85rem',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #CC0000, #1A0A2E)',
          border: '2px solid #FFD700',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: '#FFD700',
          fontFamily: 'Bebas Neue', letterSpacing: '0.05em',
        }}>LVL</div>
        <span style={{ color: '#F0F0F5' }}>APEX_KRATOS</span>
        <span style={{
          background: 'linear-gradient(90deg, #CC0000, #FF4444)',
          padding: '2px 8px', borderRadius: '3px',
          fontFamily: 'Share Tech Mono', fontSize: '0.75rem',
          color: '#fff',
        }}>78</span>
      </div>
    </nav>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(204,0,0,0.15)' : 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #CC0000' : '2px solid transparent',
        color: active ? '#F0F0F5' : '#888899',
        fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.8rem',
        letterSpacing: '0.12em',
        padding: '0 1rem', height: '64px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = '#F0F0F5'
          e.currentTarget.style.borderBottomColor = 'rgba(204,0,0,0.5)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = '#888899'
          e.currentTarget.style.borderBottomColor = 'transparent'
        }
      }}
    >
      <span style={{ fontSize: '1rem' }}>{item.icon}</span>
      {item.label}
    </button>
  )
}
