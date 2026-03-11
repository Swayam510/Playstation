import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MARKET_ITEMS, FLASH_DEAL as FLASH_DATA } from '../data/marketData.js'
import {
  Gamepad2, Crown, User, Headphones, Package,
  ShoppingCart, X, Zap, ChevronRight, Tag,
  Flame, Star, Shield, Check, Search
} from 'lucide-react'

const C = {
  void:   '#05050A',
  panel:  '#0C0B12',
  border: 'rgba(255,255,255,0.07)',
  gold:   '#FFB300',
  purple: '#9D00FF',
  cyan:   '#00E6F6',
  green:  '#00FF66',
  red:    '#FF2244',
  text:   '#E8E4F0',
  dim:    '#555570',
  dimmer: '#2A2A38',
}

const RARITY = {
  legendary: { color: '#FFB300', label: 'LEGENDARY', glow: 'rgba(255,179,0,0.5)'  },
  epic:      { color: '#9D00FF', label: 'EPIC',      glow: 'rgba(157,0,255,0.5)'  },
  rare:      { color: '#00E6F6', label: 'RARE',      glow: 'rgba(0,230,246,0.4)'  },
  uncommon:  { color: '#00FF66', label: 'UNCOMMON',  glow: 'rgba(0,255,102,0.35)' },
}

const ARSENAL_ITEMS = MARKET_ITEMS
const FLASH = { ...FLASH_DATA, fuseSeconds: 599 }

const TABS = [
  { id: 'all',      label: 'ALL',      Icon: Shield     },
  { id: 'game',     label: 'GAMES',    Icon: Gamepad2   },
  { id: 'sub',      label: 'PS PLUS',  Icon: Crown      },
  { id: 'avatar',   label: 'AVATARS',  Icon: User        },
  { id: 'hardware', label: 'HARDWARE', Icon: Headphones },
]

const fmt = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`
const fmt2 = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function BlackMarket() {
  const [tab,         setTab]         = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart,        setCart]        = useState([])
  const [cartOpen,    setCartOpen]    = useState(false)
  const [fuseTime,    setFuseTime]    = useState(FLASH.fuseSeconds)
  const [hoveredId,   setHoveredId]   = useState(null)
  const [addedId,     setAddedId]     = useState(null)

  const pageRef      = useRef(null)
  const fuseBarRef   = useRef(null)
  const cartPanelRef = useRef(null)

  // ── Entrance ────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(pageRef.current,   { opacity: 0 },              { opacity: 1, duration: 0.5 })
    tl.fromTo('.arsenal-header', { y: -20, opacity: 0 },      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.1)
    tl.fromTo('.flash-card',     { scale: 0.97, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }, 0.2)
    tl.fromTo('.tab-bar-container', { y: -10, opacity: 0 },      { y: 0, opacity: 1, duration: 0.4 }, 0.3)
    tl.fromTo('.item-card',      { y: 30, opacity: 0 },       { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'back.out(1.4)' }, 0.35)
  }, [])

  // ── Fuse countdown ──────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setFuseTime(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!fuseBarRef.current) return
    gsap.to(fuseBarRef.current, {
      width: `${(fuseTime / FLASH.fuseSeconds) * 100}%`,
      duration: 1, ease: 'none',
    })
  }, [fuseTime])

  // ── Cart panel animation ─────────────────────────────────────
  useEffect(() => {
    if (!cartPanelRef.current) return
    if (cartOpen) {
      gsap.fromTo(cartPanelRef.current, { x: 320, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
    } else {
      gsap.to(cartPanelRef.current, { x: 320, opacity: 0, duration: 0.25, ease: 'power2.in' })
    }
  }, [cartOpen])

  const addToCart = (item) => {
    if (cart.find(c => c.id === item.id)) return
    setCart(c => [...c, item])
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 1500)
    gsap.timeline()
      .to('.cart-btn', { scale: 1.25, duration: 0.15, ease: 'back.out(2)' })
      .to('.cart-btn', { scale: 1,    duration: 0.2,  ease: 'power2.out' })
  }

  const removeFromCart = (id) => setCart(c => c.filter(x => x.id !== id))
  
  const cartTotal = cart.reduce((s, i) => s + Math.round(i.price * (1 - (i.discount || 0) / 100)), 0)

  // ── FILTER LOGIC ─────────────────────────────────────────────
  const filtered = ARSENAL_ITEMS.filter(item => {
    const matchesTab = tab === 'all' || item.type === tab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.genre && item.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
  <div ref={pageRef} style={{
    width: '100%', height: '100vh',
    background: C.void, paddingTop: 64,
    opacity: 0, position: 'relative',
    fontFamily: 'Rajdhani, sans-serif',
    overflowX: 'clip', overflowY: 'auto',
  }}>
      {/* Atmospheric bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 20% 60%, rgba(157,0,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 80% 30%, rgba(0,230,246,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 30% at 50% 100%, rgba(255,179,0,0.04) 0%, transparent 60%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>

        {/* ── HEADER ── */}
        <div className="arsenal-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: C.purple, letterSpacing: '0.5em', marginBottom: '0.3rem' }}>
              ⬡ XENOTECH RECOVERY // ATROPOS CRASH SITE
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2.8rem', color: C.text, letterSpacing: '0.1em', margin: 0, lineHeight: 1 }}>
              THE <span style={{ color: C.purple, textShadow: `0 0 20px ${C.purple}88` }}>OVERGROWN</span> MARKET
            </h1>
          </div>

          <button className="cart-btn" onClick={() => setCartOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.6rem 1.1rem',
            background: cart.length > 0 ? `${C.gold}15` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${cart.length > 0 ? C.gold + '55' : C.border}`,
            color: cart.length > 0 ? C.gold : C.dim,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Bebas Neue', fontSize: '0.9rem', letterSpacing: '0.2em',
          }}>
            <ShoppingCart size={18} />
            LOADOUT
            {cart.length > 0 && (
              <span style={{
                background: C.gold, color: '#000', borderRadius: '50%',
                width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontFamily: 'Share Tech Mono', fontWeight: 'bold',
              }}>{cart.length}</span>
            )}
          </button>
        </div>

        {/* ── FLASH DEAL HERO ── */}
        <div className="flash-card" style={{
          marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(105deg, rgba(12,8,20,0.98) 0%, rgba(8,5,15,0.92) 40%, rgba(157,0,255,0.08) 100%)',
          border: `1px solid ${C.purple}44`,
          display: 'grid', gridTemplateColumns: '1fr auto',
          opacity: fuseTime === 0 ? 0.4 : 1,
          filter: fuseTime === 0 ? 'grayscale(1)' : 'none',
          transition: 'opacity 0.5s, filter 0.5s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem 2rem' }}>
            <div style={{
              width: 90, height: 115, flexShrink: 0,
              borderRadius: 4, overflow: 'hidden',
              border: `2px solid ${C.purple}66`,
              boxShadow: `0 0 30px ${C.purple}44`,
              background: `linear-gradient(145deg, ${FLASH.bgColor || '#0A0910'} 0%, rgba(157,0,255,0.25) 100%)`,
            }}>
              <img
                src={FLASH.cover}
                alt={FLASH.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.background = `linear-gradient(145deg, ${FLASH.bgColor || '#0A0910'} 0%, rgba(157,0,255,0.25) 100%)`
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <Zap size={14} color={C.purple} />
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: C.purple, letterSpacing: '0.4em' }}>
                  VOLATILE DEAL — CORRUPTS IN
                </span>
                <span style={{
                  fontFamily: 'Bebas Neue', fontSize: '1.1rem', letterSpacing: '0.1em', minWidth: 55,
                  color: fuseTime < 60 ? C.red : C.cyan,
                  textShadow: fuseTime < 60 ? `0 0 12px ${C.red}` : `0 0 8px ${C.cyan}`,
                }}>
                  {fmt2(fuseTime)}
                </span>
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: C.text, letterSpacing: '0.06em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                {FLASH.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: C.gold, lineHeight: 1 }}>
                  {fmt(FLASH.price * (1 - FLASH.discount / 100))}
                </span>
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.75rem', color: C.dim, textDecoration: 'line-through' }}>
                  {fmt(FLASH.price)}
                </span>
                <span style={{ background: C.red, color: '#fff', fontFamily: 'Bebas Neue', fontSize: '0.85rem', letterSpacing: '0.15em', padding: '1px 8px' }}>
                  -{FLASH.discount}%
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 2rem', borderLeft: `1px solid ${C.purple}22` }}>
            <button
              disabled={fuseTime === 0}
              onClick={() => addToCart(FLASH)}
              style={{
                background: fuseTime === 0 ? C.dimmer : `linear-gradient(135deg, ${C.purple}, #4B0082)`,
                border: 'none', color: fuseTime === 0 ? C.dim : '#fff',
                fontFamily: 'Bebas Neue', fontSize: '1rem', letterSpacing: '0.25em',
                padding: '0.75rem 2rem', cursor: fuseTime === 0 ? 'not-allowed' : 'pointer',
                boxShadow: fuseTime === 0 ? 'none' : `0 0 25px ${C.purple}55`,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
              }}
            >
              <Shield size={16} /> ACQUIRE
            </button>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.05)', gridColumn: '1 / -1' }}>
            <div ref={fuseBarRef} style={{
              height: '100%', width: '100%',
              background: fuseTime < 60 ? `linear-gradient(90deg, ${C.red}, #FF6622)` : `linear-gradient(90deg, ${C.purple}, ${C.cyan})`,
              boxShadow: fuseTime < 60 ? `0 0 8px ${C.red}` : `0 0 8px ${C.purple}`,
              transition: 'background 0.5s',
            }} />
          </div>
        </div>

        {/* ── TAB & SEARCH BAR ── */}
        <div className="tab-bar-container" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.65rem 1.1rem',
                  background: active ? `${C.cyan}10` : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${active ? C.cyan : 'transparent'}`,
                  color: active ? C.cyan : C.dim,
                  fontFamily: 'Bebas Neue', fontSize: '0.85rem', letterSpacing: '0.2em',
                  cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px',
                }}>
                  <t.Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Search Input Integrated */}
          <div style={{ position: 'relative', width: '300px', marginBottom: '8px' }}>
             <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: searchQuery ? C.cyan : C.dimmer }} />
             <input 
                type="text" 
                placeholder="FIND DATA..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${searchQuery ? C.cyan + '44' : C.border}`,
                  borderRadius: '2px', padding: '0.5rem 1rem 0.5rem 2.2rem',
                  color: C.text, fontFamily: 'Share Tech Mono', fontSize: '0.7rem',
                  letterSpacing: '0.1em', outline: 'none', transition: 'all 0.3s'
                }}
             />
             {searchQuery && (
               <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.dim, cursor: 'pointer' }}
               >
                 <X size={12} />
               </button>
             )}
          </div>
        </div>

        {/* ── GAME CARDS GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {filtered.length > 0 ? filtered.map(item => (
            <ArsenalCard
              key={item.id}
              item={item}
              isHovered={hoveredId === item.id}
              isAdded={addedId === item.id}
              inCart={!!cart.find(c => c.id === item.id)}
              onHover={() => setHoveredId(item.id)}
              onLeave={() => setHoveredId(null)}
              onAdd={() => addToCart(item)}
            />
          )) : (
            <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', border: `1px dashed ${C.dimmer}` }}>
               <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', color: C.dim, letterSpacing: '0.2em' }}>NO SIGNAL DETECTED</div>
               <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: C.dimmer }}>REFINE SEARCH PARAMETERS</div>
            </div>
          )}
        </div>
      </div>

      {/* ── CART PANEL ── */}
      {cartOpen && (
        <div ref={cartPanelRef} style={{
          position: 'fixed', top: 64, right: 0, bottom: 0, width: 320, zIndex: 500,
          background: 'rgba(8,7,14,0.97)', backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.6)', opacity: 0,
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.2rem', color: C.text, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={16} color={C.gold} /> LOADOUT
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.56rem', color: C.dim, letterSpacing: '0.2em' }}>
                {cart.length} ARTIFACT{cart.length !== 1 ? 'S' : ''} SELECTED
              </div>
            </div>
            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', padding: 4, transition: 'color 0.2s' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Package size={40} color={C.dimmer} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', letterSpacing: '0.3em', color: C.dimmer }}>LOADOUT EMPTY</div>
              </div>
            ) : cart.map(item => {
              const r = RARITY[item.rarity] || RARITY.uncommon
              const finalPrice = Math.round(item.price * (1 - (item.discount || 0) / 100))
              return (
                <div key={item.id} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem',
                  background: `${r.color}08`, border: `1px solid ${r.color}22`,
                }}>
                  <div style={{ width: 42, height: 54, flexShrink: 0, borderRadius: 3, overflow: 'hidden', background: `linear-gradient(145deg, ${item.bgColor || '#0A0910'}, ${r.color}20)` }}>
                    {item.cover
                      ? <img src={item.cover} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color={r.color} /></div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.82rem', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '1rem', color: r.color, lineHeight: 1.2 }}>
                      {fmt(finalPrice)}
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: C.dimmer, cursor: 'pointer', padding: 2, transition: 'color 0.2s', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: '1.25rem 1.5rem', borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.6rem', color: C.dim, letterSpacing: '0.2em' }}>TOTAL COST</span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: C.gold, lineHeight: 1 }}>{fmt(cartTotal)}</span>
              </div>
              <button style={{
                width: '100%', padding: '0.85rem',
                background: 'linear-gradient(135deg, #8B0000, #CC1100)',
                border: 'none', color: C.text,
                fontFamily: 'Bebas Neue', fontSize: '1rem', letterSpacing: '0.3em',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(139,0,0,0.5)', transition: 'all 0.2s',
                clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
              }}>
                DEPLOY LOADOUT <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        *::-webkit-scrollbar { width: 3px; }
        *::-webkit-scrollbar-thumb { background: rgba(157,0,255,0.3); border-radius: 2px; }
        *::-webkit-scrollbar-track { background: transparent; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}

function ArsenalCard({ item, isHovered, isAdded, inCart, onHover, onLeave, onAdd }) {
  const cardRef = useRef(null)
  const r = RARITY[item.rarity] || RARITY.uncommon
  const finalPrice = Math.round(item.price * (1 - (item.discount || 0) / 100))

  useEffect(() => {
    if (!cardRef.current) return
    if (isHovered) {
      gsap.to(cardRef.current, { y: -6, duration: 0.3, ease: 'power2.out', boxShadow: `0 12px 40px ${r.glow}, 0 0 0 1px ${r.color}55` })
    } else {
      gsap.to(cardRef.current, { y: 0, duration: 0.3, ease: 'power2.out', boxShadow: '0 2px 12px rgba(0,0,0,0.5)' })
    }
  }, [isHovered, r])

  const TypeIcon = item.type === 'sub' ? Crown
    : item.type === 'avatar' ? User
    : item.type === 'hardware' ? Headphones
    : Gamepad2

  return (
    <div ref={cardRef} className="item-card"
      onMouseEnter={onHover} onMouseLeave={onLeave}
      style={{
        background: C.panel, border: `1px solid ${r.color}22`,
        borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color 0.3s', position: 'relative',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '3/4', flexShrink: 0, overflow: 'hidden', background: `linear-gradient(145deg, ${item.bgColor || '#0A0910'} 0%, ${r.color}15 100%)` }}>
        {item.cover ? (
          <img src={item.cover} alt={item.title} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <TypeIcon size={36} color={r.color} style={{ opacity: 0.7 }} />
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.55rem', color: r.color, letterSpacing: '0.2em', opacity: 0.7 }}>{item.genre}</span>
          </div>
        )}

        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            background: `${r.color}DD`, color: '#000',
            fontFamily: 'Bebas Neue', fontSize: '0.6rem', letterSpacing: '0.15em',
            padding: '2px 7px', lineHeight: 1.6,
            boxShadow: `0 0 10px ${r.glow}`,
          }}>
            {r.label}
          </div>
          {item.discount > 0 && (
            <div style={{ background: C.red, color: '#fff', fontFamily: 'Bebas Neue', fontSize: '0.7rem', letterSpacing: '0.1em', padding: '2px 7px', lineHeight: 1.6 }}>
              -{item.discount}%
            </div>
          )}
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${r.color}, transparent)`,
          opacity: isHovered ? 1 : 0.35, transition: 'opacity 0.3s',
        }} />
      </div>

      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.9rem', color: C.text, lineHeight: 1.25, minHeight: '2.2rem' }}>
          {item.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.25rem', color: r.color, lineHeight: 1 }}>
              {fmt(finalPrice)}
            </div>
            {item.discount > 0 && (
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.55rem', color: C.dimmer, textDecoration: 'line-through' }}>
                {fmt(item.price)}
              </div>
            )}
          </div>

          <button onClick={e => { e.stopPropagation(); onAdd() }} style={{
            padding: '0.42rem 0.7rem',
            background: inCart || isAdded ? `${C.green}20` : isHovered ? `${r.color}18` : 'transparent',
            border: `1px solid ${inCart || isAdded ? C.green + '66' : r.color + '44'}`,
            color: inCart || isAdded ? C.green : r.color,
            fontFamily: 'Bebas Neue', fontSize: '0.72rem', letterSpacing: '0.15em',
            cursor: inCart ? 'default' : 'pointer', transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            {inCart || isAdded ? <><Check size={11} /> LOCKED</> : <>+ ADD</>}
          </button>
        </div>
      </div>
    </div>
  )
}