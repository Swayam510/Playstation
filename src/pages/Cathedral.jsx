import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Flame, Award, Sparkles, ScrollText, Star, Trophy, Target, Crown } from 'lucide-react'

// ── Hogwarts Legacy / Great Hall Palette ─────────────────────
const HW = {
  gold:       '#D4AF37',
  brightGold: '#FFD700',
  fire:       '#FF6600',
  ember:      '#CC3300',
  stone:      '#1A1512',
  darkStone:  '#0A0806',
  parchment:  '#F0E6D2',
  magicBlue:  '#4169E1',
}

// Mock Trophy Data
const TROPHIES = [
  { id: 1, game: 'God of War Ragnarök', title: 'The Bear and the Wolf', desc: 'Collect all Trophies', type: 'Platinum', rarity: '1.2%', date: '10.12.2025' },
  { id: 2, game: 'Hogwarts Legacy', title: 'Trophy of Trophies', desc: 'Unlock all other trophies.', type: 'Platinum', rarity: '3.4%', date: '04.05.2025' },
  { id: 3, game: 'Elden Ring', title: 'Elden Lord', desc: 'Achieve the Elden Lord ending', type: 'Gold', rarity: '8.7%', date: '02.20.2026' },
  { id: 4, game: 'Ghost of Tsushima', title: 'Living Legend', desc: 'Obtain all trophies.', type: 'Platinum', rarity: '5.1%', date: '11.08.2024' },
  { id: 5, game: 'Marvel\'s Spider-Man 2', title: 'Dedicated', desc: 'Collect all Trophies', type: 'Platinum', rarity: '9.2%', date: '01.15.2026' },
  { id: 6, game: 'Returnal', title: 'Helios', desc: 'Collect all Trophies', type: 'Platinum', rarity: '0.9%', date: '03.01.2025' },
]

export default function Cathedral() {
  const pageRef = useRef(null)
  const headerRef = useRef(null)

  // ── Entrance Animations ─────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' })
    
    tl.fromTo(headerRef.current, 
      { y: -30, opacity: 0, filter: 'blur(10px)' }, 
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 
      '-=0.4'
    )
    
    tl.fromTo('.portrait-frame', 
      { y: 40, opacity: 0, rotateX: 10 }, 
      { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)' },
      '-=0.6'
    )
  }, [])

  return (
    <div ref={pageRef} style={{
      width: '100%', height: '100vh',
      
      // Removed the blend mode! Just show the raw image.
      backgroundImage: `url('/great_hall.png')`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundColor: HW.darkStone, // Acts as a safety fallback while the image loads
      
      display: 'flex', flexDirection: 'column',
      paddingTop: 80, opacity: 0, overflow: 'hidden auto', position: 'relative',
    }}>
      
      {/* ── Ambient Great Hall Lighting & Magic ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 20% 0%, ${HW.fire}25 0%, transparent 60%)`, mixBlendMode: 'screen' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 80% 10%, ${HW.gold}15 0%, transparent 50%)`, mixBlendMode: 'screen' }} />
        
        {/* Pushed the dark gradient down to 50% and lowered opacity so it doesn't swallow the image */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(5,5,5,0.7) 100%)' }} />
        
        {/* Floating Candles Array */}
        {Array.from({ length: 30 }).map((_, i) => (
          <FloatingCandle key={i} index={i} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '0 3rem 4rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* ── Header: The Cathedral ── */}
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${HW.gold})` }} />
            <Crown size={28} color={HW.gold} style={{ filter: `drop-shadow(0 0 10px ${HW.gold})` }} />
            <div style={{ width: 80, height: 1, background: `linear-gradient(-90deg, transparent, ${HW.gold})` }} />
          </div>
          {/* FIXED FONT SIZING AND WRAPPING */}
          <h1 style={{ 
            fontFamily: 'Bebas Neue', 
            fontSize: 'clamp(3rem, 6vw, 5.5rem)', 
            color: HW.parchment, 
            letterSpacing: '0.12em', margin: 0, lineHeight: 1.1,
            textShadow: `0 0 30px ${HW.fire}88, 0 4px 8px rgba(0,0,0,0.8)`
          }}>
            THE CATHEDRAL OF<br/>
            <span style={{ color: HW.gold }}>RECORDS</span>
          </h1>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '1.2rem', color: '#A89F91', letterSpacing: '0.4em', marginTop: '1rem' }}>
            YOUR LEGACY, CARVED IN STONE
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* ═══ LEFT: The "Sorting Hat" / Gamer DNA ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '100px' }}>
            
            {/* Player Banner */}
            <div style={{
              background: `linear-gradient(180deg, rgba(26,21,18,0.9) 0%, rgba(10,8,6,0.95) 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${HW.gold}44`,
              borderTop: `4px solid ${HW.gold}`,
              padding: '2.5rem 2rem', textAlign: 'center',
              boxShadow: `0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px ${HW.gold}11`
            }}>
              <div style={{ 
                width: 80, height: 80, margin: '0 auto 1.5rem', borderRadius: '50%',
                background: `linear-gradient(135deg, ${HW.gold}, ${HW.fire})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 30px ${HW.fire}66, inset 0 0 10px rgba(255,255,255,0.5)`
              }}>
                <Sparkles size={40} color={HW.darkStone} />
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.75rem', color: HW.gold, letterSpacing: '0.3em', marginBottom: '0.5rem' }}>
                ARCHETYPE IDENTIFIED
              </div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', color: HW.parchment, letterSpacing: '0.1em', lineHeight: 1.1 }}>
                RELUCTANT<br/>COMPLETIONIST
              </div>
              <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, transparent, ${HW.gold}66, transparent)`, margin: '2rem 0' }} />
              
              {/* Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                <StatRow icon={<Trophy size={18}/>} label="PLATINUMS" value="14" />
                <StatRow icon={<Star size={18}/>} label="GOLD RELICS" value="87" />
                <StatRow icon={<Target size={18}/>} label="COMPLETION RATE" value="68%" />
              </div>
            </div>

            {/* Moving Staircase Progress */}
            <div style={{ padding: '1.5rem', border: `1px solid ${HW.gold}33`, background: `rgba(26,21,18,0.8)`, backdropFilter: 'blur(5px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ScrollText size={18} color={HW.gold} />
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.85rem', color: HW.parchment, letterSpacing: '0.2em' }}>
                  THE GRAND STAIRCASE
                </div>
              </div>
              {[90, 75, 40, 15].map((pct, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', marginLeft: `${i * 12}px` }}>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.75rem', color: HW.gold, width: '25px' }}>L{4-i}</div>
                  <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.6)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${HW.fire}, ${HW.brightGold})`, boxShadow: `0 0 10px ${HW.gold}88` }} />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ═══ RIGHT: The Living Portraits ═══ */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: `1px solid ${HW.gold}33`, paddingBottom: '0.5rem' }}>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.1rem', color: HW.gold, letterSpacing: '0.3em' }}>
                GALLERY OF TRIUMPHS
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.75rem', color: '#A89F91', letterSpacing: '0.2em' }}>
                SORT BY: LEGENDARY
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {TROPHIES.map((trophy) => (
                <PortraitCard key={trophy.id} trophy={trophy} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   THE LIVING PORTRAIT CARD
───────────────────────────────────────────────────────────── */
function PortraitCard({ trophy }) {
  const cardRef = useRef(null)
  const isPlat = trophy.type === 'Platinum'
  const primaryColor = isPlat ? HW.magicBlue : HW.gold

  return (
    <div 
      className="portrait-frame"
      ref={cardRef}
      onMouseEnter={() => {
        gsap.to(cardRef.current, { scale: 1.04, y: -8, duration: 0.4, ease: 'power3.out' })
        gsap.to(cardRef.current.querySelector('.frame-glow'), { opacity: 1, duration: 0.3 })
      }}
      onMouseLeave={() => {
        gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.4, ease: 'power3.out' })
        gsap.to(cardRef.current.querySelector('.frame-glow'), { opacity: 0, duration: 0.3 })
      }}
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, #3A2E24, #1A1512)`, // Looks like a wooden frame
        padding: '8px', 
        border: `1px solid ${HW.gold}66`,
        boxShadow: `0 20px 40px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.8)`,
        cursor: 'pointer',
        borderRadius: '4px',
      }}
    >
      <div className="frame-glow" style={{
        position: 'absolute', inset: -15, zIndex: -1, opacity: 0,
        background: `radial-gradient(circle at center, ${primaryColor}88 0%, transparent 70%)`,
        filter: 'blur(20px)', transition: 'opacity 0.3s'
      }} />

      <div style={{
        background: `radial-gradient(ellipse at top, #2A241D 0%, #050403 100%)`,
        border: `1px solid ${HW.gold}33`,
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)',
        padding: '1.5rem', height: '100%',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {isPlat && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(180deg, ${HW.magicBlue}22, transparent)`, pointerEvents: 'none', mixBlendMode: 'screen' }} />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.65rem', color: HW.gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {trophy.game}
          </div>
          <div style={{ 
            background: `${primaryColor}15`, border: `1px solid ${primaryColor}55`,
            color: primaryColor, padding: '0.2rem 0.5rem', borderRadius: '2px',
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.2em'
          }}>
            {trophy.rarity}
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
          <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.9rem', color: HW.parchment, letterSpacing: '0.05em', lineHeight: 1.1, margin: '0 0 0.5rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {trophy.title}
          </h3>
          <p style={{ fontFamily: 'Rajdhani', fontSize: '0.9rem', color: '#A89F91', lineHeight: 1.4, margin: 0 }}>
            {trophy.desc}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${HW.gold}22`, position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.7rem', color: '#8A7F71' }}>
            UNLOCKED: {trophy.date}
          </div>
          <div style={{ 
            width: 40, height: 40, borderRadius: '50%',
            background: `radial-gradient(circle, ${primaryColor}44 0%, transparent 80%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${primaryColor}55`,
            border: `1px solid ${primaryColor}33`
          }}>
            <Award size={22} color={isPlat ? '#E5E4E2' : HW.brightGold} style={{ filter: `drop-shadow(0 0 5px ${primaryColor})` }}/>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────────────────────── */
function StatRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#C8BFB1' }}>
        {icon}
        <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.15em' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: HW.parchment, textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
        {value}
      </div>
    </div>
  )
}

function FloatingCandle({ index }) {
  const ref = useRef(null)
  
  useEffect(() => {
    if (!ref.current) return
    const x = Math.random() * 100
    const y = 5 + Math.random() * 35 // Kept strictly in the top area to avoid overlapping text
    
    gsap.set(ref.current, { left: `${x}%`, top: `${y}%` })
    
    gsap.to(ref.current, {
      y: `-=${10 + Math.random() * 15}`,
      x: `+=${(Math.random() - 0.5) * 8}`,
      duration: 3 + Math.random() * 4,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: -Math.random() * 5
    })
  }, [])

  return (
    <div ref={ref} style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
      <div style={{ 
        color: HW.fire, filter: `drop-shadow(0 0 10px ${HW.brightGold})`,
        animation: `flicker ${0.1 + Math.random() * 0.2}s infinite alternate` 
      }}>
        <Flame size={16} fill={HW.brightGold} />
      </div>
      <div style={{ width: 6, height: 25, background: 'linear-gradient(180deg, #FFF8DC, #D2B48C)', borderRadius: '2px', opacity: 0.9, boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }} />
      <style>{`
        @keyframes flicker {
          0% { opacity: 0.8; transform: scale(0.95) skewX(-2deg); }
          100% { opacity: 1; transform: scale(1.1) skewX(2deg); filter: drop-shadow(0 0 15px ${HW.brightGold}); }
        }
      `}</style>
    </div>
  )
}