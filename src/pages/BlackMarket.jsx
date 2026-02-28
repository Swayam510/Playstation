import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { STORE_ITEMS } from '../data/mockData.js'
import { Biohazard, Gamepad2, Crown, User, Headphones, Package, Hexagon, Zap } from 'lucide-react'

// Flash deal: Volatile Malignant Artifact
const FLASH_DEAL = { ...STORE_ITEMS[0], discount: 40, fuseSeconds: 47 }

// Returnal-themed Xenotech Colors
const RARITY_COLORS = {
  legendary: '#FFB300', // Obolite Gold
  epic:      '#9D00FF', // Ether Purple
  rare:      '#00E6F6', // Neon Cyan
  uncommon:  '#00FF66', // Silphium Green
}

const RARITY_GLOWS = {
  legendary: '0 0 30px rgba(255, 179, 0, 0.4)',
  epic:      '0 0 30px rgba(157, 0, 255, 0.4)',
  rare:      '0 0 30px rgba(0, 230, 246, 0.3)',
  uncommon:  '0 0 20px rgba(0, 255, 102, 0.3)',
}

// Helper to make prices look realistic in Rupees
const formatINR = (value) => {
  const inrValue = Math.round(value * 85); // Hackathon trick: convert mock USD to realistic INR
  return `₹ ${inrValue.toLocaleString('en-IN')}`;
}

export default function BlackMarket() {
  const [cart, setCart]             = useState([])
  const [hovered, setHovered]       = useState(null)
  const [purchased, setPurchased]   = useState(null)
  const [fuseTime, setFuseTime]     = useState(FLASH_DEAL.fuseSeconds)
  const [showExplosion, setShowExplosion] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const pageRef      = useRef(null)
  const explosionRef = useRef(null)
  const fuseRef      = useRef(null)
  const particlesRef = useRef([])

  // ── Page intro ─────────────────────────────────────────────
  useEffect(() => {
    gsap.timeline()
      .fromTo(pageRef.current, { opacity:0 }, { opacity:1, duration:0.5 })
      .fromTo('.market-title', { y:-30, opacity:0 }, { y:0, opacity:1, duration:0.6, ease:'power3.out' }, 0.2)
      .fromTo('.flash-banner', { scaleX:0, transformOrigin:'left center' }, { scaleX:1, duration:0.5, ease:'power3.out' }, 0.3)
      .fromTo('.item-card', { y:40, opacity:0 }, { y:0, opacity:1, stagger:0.08, duration:0.5, ease:'back.out(1.4)' }, 0.4)
  }, [])

  // ── Flash deal countdown ────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setFuseTime(t => {
        if (t <= 1) { clearInterval(timer); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fuse animation
  useEffect(() => {
    if (!fuseRef.current || fuseTime <= 0) return
    const pct = (fuseTime / FLASH_DEAL.fuseSeconds) * 100
    gsap.to(fuseRef.current, { width:`${pct}%`, duration:1, ease:'none' })
    
    // Glitch effect when time is running out
    if (fuseTime < 10 && fuseTime > 0) {
      gsap.to('.flash-banner', { x: () => Math.random() * 4 - 2, duration: 0.1, yoyo: true, repeat: 1 })
    }
  }, [fuseTime])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // ── Purchase explosion (Alien Burst) ─────────────────
  const triggerPurchase = (item) => {
    setPurchased(item)
    setShowExplosion(true)
    setCart(c => [...c, item])

    if (navigator.vibrate) navigator.vibrate([100, 50, 200, 50, 300])

    setTimeout(() => {
      if (!explosionRef.current) return
      const el = explosionRef.current

      gsap.timeline()
        .fromTo(el,
          { opacity:0, scale:0.5 },
          { opacity:1, scale:1, duration:0.35, ease:'back.out(2)' }
        )
        .fromTo('.explosion-ring',
          { scale:0.5, opacity:1 },
          { scale:2.5, opacity:0, duration:0.7, stagger:0.1, ease:'power2.out' }, 0.1
        )
        .fromTo('.particle',
          { x:0, y:0, opacity:1, scale:1 },
          {
            x: () => (Math.random()-0.5)*400,
            y: () => (Math.random()-0.5)*400,
            opacity:0, scale:0,
            duration:1.2, stagger:0.02, ease:'power2.out',
          }, 0.1
        )
        .fromTo('.trophy-unlock',
          { y:30, opacity:0, scale:0.8, rotationX: 45 },
          { y:0, opacity:1, scale:1, rotationX: 0, duration:0.6, ease:'back.out(2)' }, 0.2
        )
        .to(el, { opacity:0, scale:0.95, duration:0.4, ease:'power2.in', delay:2.0 })
        .call(() => setShowExplosion(false))
    }, 10)
  }

  const filteredItems = filterType === 'all'
    ? STORE_ITEMS
    : STORE_ITEMS.filter(i => i.type === filterType)

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * (1 - (i.discount||0)/100)), 0)

  return (
    <div ref={pageRef} style={{
      width:'100%', height:'100vh', background:'#05050A',
      overflow:'hidden auto', paddingTop:'64px', opacity:0, position:'relative',
    }}>

      {/* ── Atropos Alien Atmosphere ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 60%, rgba(157,0,255,0.15) 0%, transparent 60%)' }} /> {/* Purple */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 70% 40%, rgba(0,230,246,0.1) 0%, transparent 50%)' }} /> {/* Cyan */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 100%, rgba(5,5,15,0.95) 0%, transparent 40%)' }} />
        {Array.from({length:15}).map((_,i) => (
          <MistParticle key={i} index={i} />
        ))}
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'1rem 2rem 2rem' }}>

        {/* ── Header ── */}
        <div className="market-title" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'1rem' }}>
          <div>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'0.7rem', color:'#00E6F6', letterSpacing:'0.4em' }}>ATROPOS CRASH SITE // XENOTECH RECOVERY</div>
            <h1 style={{ fontFamily:'Bebas Neue', fontSize:'3rem', color:'#F0F0F5', letterSpacing:'0.1em', lineHeight:1 }}>
              THE <span style={{ color:'#9D00FF', textShadow: '0 0 15px rgba(157,0,255,0.5)' }}>OVERGROWN</span> MARKET
            </h1>
          </div>

          {/* Cargo Bay (Cart) */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', paddingBottom:'0.5rem' }}>
            {cart.length > 0 && (
              <div style={{
                fontFamily:'Share Tech Mono', fontSize:'0.75rem', color:'#00E6F6',
                background:'rgba(0,230,246,0.08)', border:'1px solid rgba(0,230,246,0.2)',
                padding:'0.4rem 0.8rem',
              }}>
                CARGO: {cart.length} ARTIFACT{cart.length>1?'S':''} // {formatINR(cartTotal)}
              </div>
            )}
            <div style={{ fontFamily:'Rajdhani', fontWeight:700, fontSize:'0.8rem', color:'#555566', letterSpacing:'0.2em' }}>
              {filteredItems.length} SIGNALS DETECTED
            </div>
          </div>
        </div>

        {/* ── Volatile Malignant Deal ── */}
        <div className="flash-banner" style={{
          marginBottom:'1.5rem',
          background:'linear-gradient(90deg, rgba(157,0,255,0.15), rgba(0,230,246,0.05), transparent)',
          border:'1px solid rgba(157,0,255,0.3)',
          borderLeft:'3px solid #9D00FF',
          padding:'0.75rem 1.25rem',
          display:'flex', alignItems:'center', gap:'1.5rem',
          position:'relative', overflow:'hidden',
          opacity: fuseTime === 0 ? 0.3 : 1, // Dims when expired
          filter: fuseTime === 0 ? 'grayscale(100%)' : 'none'
        }}>
          {/* Decay Fuse */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'rgba(255,255,255,0.05)' }}>
            <div ref={fuseRef} style={{
              height:'100%',
              background: fuseTime > 20
                ? 'linear-gradient(90deg, #9D00FF, #00E6F6)'
                : 'linear-gradient(90deg, #FF0000, #9D00FF)',
              width:'100%',
              boxShadow: fuseTime <= 10 ? '0 0 10px #FF0000' : 'none',
              transition:'box-shadow 0.5s',
            }} />
          </div>

          <div style={{ 
            color: fuseTime < 10 && fuseTime > 0 ? '#FF0000' : '#9D00FF',
            transition: 'color 0.3s'
          }}>
            {fuseTime > 0 ? <Biohazard size={36} /> : <Zap size={36} color="#555" />}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'0.65rem', color:'#9D00FF', letterSpacing:'0.3em' }}>VOLATILE ARTIFACT</div>
            <div style={{ fontFamily:'Bebas Neue', fontSize:'1.2rem', color:'#F0F0F5', letterSpacing:'0.08em' }}>{FLASH_DEAL.title}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'0.65rem', color:'#555566', textDecoration:'line-through' }}>{formatINR(FLASH_DEAL.price)}</div>
            <div style={{ fontFamily:'Bebas Neue', fontSize:'1.6rem', color:'#00E6F6', lineHeight:1 }}>
              {formatINR(FLASH_DEAL.price * (1 - FLASH_DEAL.discount/100))}
            </div>
          </div>
          <div style={{ textAlign:'center', minWidth:70 }}>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'0.6rem', color:'#555566', letterSpacing:'0.2em' }}>CORRUPTS IN</div>
            <div style={{
              fontFamily:'Bebas Neue', fontSize:'1.8rem',
              color: fuseTime === 0 ? '#333' : fuseTime < 15 ? '#FF0000' : '#00E6F6',
              lineHeight:1,
              textShadow: fuseTime > 0 && fuseTime < 15 ? '0 0 12px rgba(255,0,0,0.6)' : 'none',
            }}>
              {fuseTime > 0 ? formatTime(fuseTime) : 'MUTATED'}
            </div>
          </div>
          <button
            disabled={fuseTime === 0}
            onClick={() => triggerPurchase(FLASH_DEAL)}
            style={{
              background: fuseTime === 0 ? '#333' : 'linear-gradient(135deg, #9D00FF, #4B0082)',
              border:'none', color: fuseTime === 0 ? '#666' : '#fff',
              fontFamily:'Bebas Neue', fontSize:'0.95rem', letterSpacing:'0.25em',
              padding:'0.6rem 1.2rem', cursor: fuseTime === 0 ? 'not-allowed' : 'pointer',
              boxShadow: fuseTime === 0 ? 'none' : '0 0 20px rgba(157,0,255,0.4)',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { if(fuseTime > 0) gsap.to(e.currentTarget, { scale:1.05, boxShadow:'0 0 30px rgba(157,0,255,0.7)', duration:0.2 })}}
            onMouseLeave={e => { if(fuseTime > 0) gsap.to(e.currentTarget, { scale:1, boxShadow:'0 0 20px rgba(157,0,255,0.4)', duration:0.2 })}}
          >
            EXTRACT
          </button>
        </div>

        {/* ── Item grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1rem' }}>
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isHovered={hovered===item.id}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onBuy={() => triggerPurchase(item)}
            />
          ))}
        </div>
      </div>

      {/* ── Extraction Burst ── */}
      {showExplosion && purchased && (
        <div ref={explosionRef} style={{
          position:'fixed', inset:0, zIndex:9000,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)',
          opacity:0,
        }}>
          {/* Shockwave rings */}
          {[1,2,3].map(i => (
            <div key={i} className="explosion-ring" style={{
              position:'absolute', width: 100*i, height: 100*i, borderRadius:'50%',
              border:`2px solid ${RARITY_COLORS[purchased.rarity] || '#00E6F6'}`,
              opacity:0,
            }} />
          ))}

          {/* Alien Spore Particles */}
          {Array.from({length:30}).map((_,i) => (
            <div key={i} ref={el => particlesRef.current[i]=el} className="particle" style={{
              position:'absolute', width: 4+Math.random()*6, height: 4+Math.random()*6,
              borderRadius:'50%',
              background: i%2===0 ? RARITY_COLORS[purchased.rarity] : '#fff',
              boxShadow: `0 0 10px ${RARITY_COLORS[purchased.rarity]}`,
              opacity:0,
            }} />
          ))}

          {/* Artifact unlock card */}
          <div className="trophy-unlock" style={{
            background:'linear-gradient(160deg, rgba(157,0,255,0.1), rgba(0,0,0,0.9))',
            border:`1px solid ${RARITY_COLORS[purchased.rarity] || '#00E6F6'}`,
            boxShadow: RARITY_GLOWS[purchased.rarity],
            padding:'3rem', textAlign:'center', opacity:0, minWidth:350,
            backdropFilter: 'blur(10px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ marginBottom:'1.5rem', filter:'drop-shadow(0 0 15px currentColor)', color: RARITY_COLORS[purchased.rarity] }}>
              <Hexagon size={64} strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'0.75rem', color:'#00E6F6', letterSpacing:'0.4em', marginBottom:'0.5rem' }}>
              XENOTECH EXTRACTED
            </div>
            <div style={{
              fontFamily:'Bebas Neue', fontSize:'2.2rem', lineHeight:1,
              color: '#F0F0F5', letterSpacing:'0.08em', marginBottom:'1rem',
            }}>
              {purchased.title}
            </div>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'1rem', color:'#555566' }}>
              PAYMENT VERIFIED // {formatINR(purchased.price * (1 - (purchased.discount||0)/100))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Alien Artifact Card ───────────────────────────────────────
function ItemCard({ item, isHovered, onMouseEnter, onMouseLeave, onBuy }) {
  const cardRef = useRef(null)
  const color   = RARITY_COLORS[item.rarity] || '#00E6F6'
  const discountedPrice = item.price * (1 - (item.discount||0)/100)

  useEffect(() => {
    if (isHovered) {
      gsap.to(cardRef.current, { y:-8, boxShadow: RARITY_GLOWS[item.rarity], duration:0.3, borderColor: color })
    } else {
      gsap.to(cardRef.current, { y:0, boxShadow:'none', duration:0.3, borderColor: `${color}33` })
    }
  }, [isHovered, color, item.rarity])

  // Lucide Icons Map
  const typeIcons = { 
    game: <Gamepad2 size={24} strokeWidth={1.5} />, 
    sub: <Crown size={24} strokeWidth={1.5} />, 
    avatar: <User size={24} strokeWidth={1.5} />, 
    hardware: <Headphones size={24} strokeWidth={1.5} /> 
  }

  return (
    <div
      ref={cardRef}
      className="item-card"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background:'linear-gradient(160deg, rgba(10,5,20,0.9) 0%, rgba(5,5,10,0.95) 100%)',
        border:`1px solid ${color}33`, position:'relative', overflow:'hidden',
        cursor:'pointer', transition:'border-color 0.3s',
      }}
    >
      <div style={{ padding:'1.5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <span style={{ color: color, opacity: 0.8 }}>
            {typeIcons[item.type] || <Package size={24} strokeWidth={1.5} />}
          </span>
          <div style={{
            background:`${color}15`, border:`1px solid ${color}44`,
            color, fontFamily:'Share Tech Mono', fontSize:'0.6rem',
            letterSpacing:'0.2em', padding:'0.2rem 0.5rem',
          }}>
            CLASS: {item.rarity.toUpperCase()}
          </div>
        </div>

        <div style={{ fontFamily:'Bebas Neue', fontSize:'1.4rem', color:'#F0F0F5', letterSpacing:'0.06em', lineHeight:1.1, marginBottom: '1.5rem', height: '3.3rem' }}>
          {item.title}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily:'Share Tech Mono', fontSize:'0.6rem', color:'#555566' }}>EST. VALUE</div>
            <div style={{ fontFamily:'Bebas Neue', fontSize:'1.6rem', color, lineHeight:1 }}>
              {formatINR(discountedPrice)}
            </div>
          </div>
          
          <button
            onClick={onBuy}
            style={{
              background: isHovered ? color : 'transparent',
              border:`1px solid ${color}`,
              color: isHovered ? '#000' : color,
              fontFamily:'Rajdhani', fontWeight: 700, fontSize:'0.8rem', letterSpacing:'0.2em',
              padding:'0.5rem 1rem', cursor:'pointer', transition:'all 0.3s',
            }}
          >
            {isHovered ? 'INITIATE' : 'SCAN'}
          </button>
        </div>
      </div>

      {/* Bioluminescent glow on hover */}
      {isHovered && (
        <div style={{
          position:'absolute', bottom: -20, left: '20%', width: '60%', height: 40,
          background: color, filter: 'blur(30px)', opacity: 0.4, zIndex: 1,
          animation: 'pulse 2s infinite'
        }} />
      )}
    </div>
  )
}

// ── Toxic Mist Particle ───────────────────────────────────────
function MistParticle({ index }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const x = Math.random() * 100
    const y = Math.random() * 100
    const size = 100 + Math.random() * 200
    const dur = 10 + Math.random() * 15
    gsap.set(ref.current, { left:`${x}%`, top:`${y}%`, width:size, height:size })
    gsap.to(ref.current, {
      x: (Math.random()-0.5)*100,
      y: (Math.random()-0.5)*80,
      opacity: 0.05 + Math.random()*0.08,
      duration: dur, repeat:-1, yoyo:true, ease:'sine.inOut', delay: -Math.random()*dur,
    })
  }, [])
  return (
    <div ref={ref} style={{
      position:'absolute', borderRadius:'50%',
      background: index%2===0
        ? 'radial-gradient(circle, rgba(157,0,255,0.4) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(0,230,246,0.3) 0%, transparent 70%)',
      opacity:0, pointerEvents:'none',
    }} />
  )
}