import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles, ContactShadows, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { USER } from '../data/mockData.js';

// ─────────────────────────────────────────────────────────────
//  SHADERS (original - untouched)
// ─────────────────────────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uStatus;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float speed     = uStatus == 2.0 ? 6.0 : (uStatus == 1.0 ? 3.0 : 1.5);
    float amplitude = uStatus == 2.0 ? 0.25 : (uStatus == 1.0 ? 0.15 : 0.05);
    pos.x += sin(pos.y * 8.0 + uTime * speed) * amplitude * vUv.y;
    pos.z += cos(pos.y * 6.0 + uTime * speed * 0.8) * amplitude * vUv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform float uStatus;
  void main() {
    float alpha = smoothstep(0.0, 0.2, vUv.y) * (1.0 - pow(vUv.y, 1.5));
    vec3 color;
    if (uStatus == 2.0) {
      color = mix(vec3(1.0, 0.9, 0.2), vec3(1.0, 0.1, 0.0), vUv.y);
    } else if (uStatus == 1.0) {
      color = mix(vec3(1.0, 0.4, 0.0), vec3(0.4, 0.0, 0.0), vUv.y);
      alpha *= 0.7;
    } else {
      color = mix(vec3(0.05, 0.05, 0.05), vec3(0.3, 0.3, 0.3), vUv.y);
      alpha *= 0.5;
    }
    gl_FragColor = vec4(color, alpha);
  }
`;

// ─────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────
const LOBBY_USERS = [
  { id: 1, name: 'ShadowKnight', status: 'active',  game: 'God of War',   level: 47, avatar: 'SK' },
  { id: 2, name: 'NeonSerpent',  status: 'active',  game: 'Spider-Man 2', level: 62, avatar: 'NS' },
  { id: 3, name: 'VoidRunner',   status: 'idle',    game: null,           level: 35, avatar: 'VR' },
  { id: 4, name: 'CrimsonBlade', status: 'active',  game: 'Returnal',     level: 89, avatar: 'CB' },
  { id: 5, name: 'ArcLight',     status: 'offline', game: null,           level: 54, avatar: 'AL' },
];

const MOCK_MESSAGES = [
  { id: 1, user: 'ShadowKnight', avatar: 'SK', text: 'anyone down for God of War coop?',    time: '9:41 PM', color: '#FF6B35' },
  { id: 2, user: 'NeonSerpent',  avatar: 'NS', text: 'just got Spider-Man platinum 🏆',     time: '9:43 PM', color: '#00C8FF' },
  { id: 3, user: 'CrimsonBlade', avatar: 'CB', text: 'Returnal is absolutely brutal tonight',time: '9:44 PM', color: '#CC0000' },
  { id: 4, user: 'ShadowKnight', avatar: 'SK', text: 'gg on the platinum!! 🔥',             time: '9:45 PM', color: '#FF6B35' },
  { id: 5, user: 'VoidRunner',   avatar: 'VR', text: 'chilling rn, what are we playing?',   time: '9:46 PM', color: '#FFD700' },
];

const C = {
  active:  '#FF6B35',
  idle:    '#FFD700',
  offline: '#444455',
};

// ─────────────────────────────────────────────────────────────
//  3D — CENTRAL CAMPFIRE
// ─────────────────────────────────────────────────────────────
function CentralFire({ scale = 1 }) {
  const matRef = useRef();
  useFrame(s => { if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime; });
  return (
    <group>
      {/* Stone ring */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.3, -0.05, Math.sin(a) * 1.3]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.25, 0.12, 0.18]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
          </mesh>
        );
      })}
      {/* Logs */}
      {[Math.PI / 4, -Math.PI / 4].map((r, i) => (
        <mesh key={i} position={[0, -0.05, 0]} rotation={[0, r, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 2.2, 8]} />
          <meshStandardMaterial color="#3d1f0a" roughness={0.9} />
        </mesh>
      ))}
      {/* Main flame */}
      <mesh position={[0, scale, 0]} scale={[scale * 0.7, scale * 2, scale * 0.7]}>
        <coneGeometry args={[0.5, 2, 32, 32]} />
        <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 }, uStatus: { value: 2.0 } }}
          transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Bright core */}
      <mesh position={[0, 0.4, 0]} scale={[0.3, 0.6, 0.3]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ffff99" transparent opacity={0.6} />
      </mesh>
      <Sparkles count={60} scale={[3, 4, 3]} position={[0, 1.5, 0]} size={2} speed={1.2} opacity={0.85} color="#ffcc00" />
      <Sparkles count={20} scale={[2, 6, 2]} position={[0, 2, 0]}   size={1} speed={0.6} opacity={0.4}  color="#ff4400" />
      <pointLight position={[0, 1.5, 0]} intensity={10} distance={18} color="#ff5500" castShadow />
      <pointLight position={[0, 0.5, 0]} intensity={5}  distance={10} color="#ffaa00" />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
//  3D — PLAYER FLAME
// ─────────────────────────────────────────────────────────────
function PlayerFlame({ user, index, total, isSelected, onClick }) {
  const matRef  = useRef();
  const grpRef  = useRef();
  const timeOff = useMemo(() => Math.random() * 100, []);
  const angle   = (index / total) * Math.PI * 2;
  const pos     = [Math.cos(angle) * 5.5, 0, Math.sin(angle) * 5.5];
  const uStat   = user.status === 'active' ? 2.0 : user.status === 'idle' ? 1.0 : 0.0;
  const scaleY  = user.status === 'active' ? 1.8 : user.status === 'idle' ? 1.0 : 2.2;
  const isOff   = user.status === 'offline';

  useFrame(s => {
    if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime + timeOff;
    if (grpRef.current && isSelected) grpRef.current.position.y = Math.sin(s.clock.elapsedTime * 2) * 0.08;
    else if (grpRef.current) grpRef.current.position.y = 0;
  });

  return (
    <group ref={grpRef} position={pos} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Ground glow */}
      {!isOff && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <circleGeometry args={[0.9, 32]} />
          <meshBasicMaterial color={user.status === 'active' ? '#ff3300' : '#ffaa00'} transparent opacity={0.12} />
        </mesh>
      )}
      {/* Flame */}
      <mesh position={[0, scaleY / 2, 0]} scale={[isOff ? 0.6 : 0.75, scaleY, isOff ? 0.6 : 0.75]}>
        <coneGeometry args={[0.5, 2, 32, 32]} />
        <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 }, uStatus: { value: uStat } }}
          transparent depthWrite={false}
          blending={isOff ? THREE.NormalBlending : THREE.AdditiveBlending} />
      </mesh>
      <Sparkles count={isOff ? 8 : 22} scale={[1, scaleY, 1]} position={[0, scaleY / 2, 0]}
        size={isOff ? 4 : 2} speed={isOff ? 0.15 : 0.9}
        opacity={isOff ? 0.12 : 0.7} color={isOff ? '#333' : '#ffcc00'} />
      {!isOff && (
        <pointLight position={[0, 1, 0]} intensity={user.status === 'active' ? 3.5 : 1}
          distance={7} color={user.status === 'active' ? '#ff6600' : '#ff3300'} />
      )}
      {/* Name label */}
      <Html position={[0, scaleY + 0.75, 0]} center zIndexRange={[50, 0]}>
        <div onClick={onClick} style={{
          color: isOff ? '#555' : '#fff',
          background: isSelected ? 'rgba(204,0,0,0.9)' : isOff ? 'rgba(15,15,20,0.9)' : 'rgba(8,8,18,0.88)',
          border: `1px solid ${isSelected ? '#FF6B35' : isOff ? '#222' : C[user.status]}`,
          padding: '4px 10px', borderRadius: '20px',
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '12px',
          whiteSpace: 'nowrap', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          boxShadow: isSelected ? '0 0 14px rgba(255,107,53,0.6)' : 'none',
          transition: 'all 0.2s', userSelect: 'none',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C[user.status], boxShadow: user.status !== 'offline' ? `0 0 6px ${C[user.status]}` : 'none' }} />
          {user.name}
          <span style={{ opacity: 0.5, fontSize: '9px', fontFamily: 'Share Tech Mono, monospace' }}>Lv{user.level}</span>
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
//  FLOATING CSS EMBERS
// ─────────────────────────────────────────────────────────────
function EmberParticles() {
  const embers = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    left: `${28 + Math.random() * 44}%`,
    size: 2 + Math.random() * 3,
    dur:  4 + Math.random() * 5,
    delay: Math.random() * 6,
    color: ['#FFD700', '#FF6B35', '#FF3300'][i % 3],
  })), []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {embers.map((e, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: '15%', left: e.left,
          width: e.size, height: e.size, borderRadius: '50%',
          background: e.color, opacity: 0,
          animation: `emberRise ${e.dur}s ease-out infinite`,
          animationDelay: `${e.delay}s`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  VOICE WAVE
// ─────────────────────────────────────────────────────────────
function VoiceWave() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: 14 }}>
      {[1, 2, 3, 2, 1].map((h, i) => (
        <div key={i} style={{
          width: 2, height: h * 4, background: '#FF6B35', borderRadius: 1,
          animation: `waveBar ${0.5 + i * 0.12}s ease-in-out infinite`,
          animationDelay: `${i * 0.08}s`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CHAT MESSAGE
// ─────────────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isMe = !!msg.isMe;
  return (
    <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${msg.color}44, #0A0A1F)`,
        border: `1.5px solid ${msg.color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Bebas Neue', fontSize: '0.55rem', color: msg.color,
      }}>{msg.avatar}</div>
      <div style={{ maxWidth: '78%' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: '0.2rem' }}>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.7rem', color: msg.color }}>{msg.user}</span>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: '0.53rem', color: '#222233' }}>{msg.time}</span>
        </div>
        <div style={{
          background: isMe ? 'rgba(204,0,0,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isMe ? 'rgba(204,0,0,0.18)' : 'rgba(255,255,255,0.05)'}`,
          padding: '0.4rem 0.7rem',
          fontFamily: 'Rajdhani', fontSize: '0.82rem', color: '#B0B0C0', lineHeight: 1.5,
        }}>{msg.text}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PLAYER ROW
// ─────────────────────────────────────────────────────────────
function PlayerRow({ user, isSelected, inParty, onClick, onInvite }) {
  const isOff = user.status === 'offline';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.45rem 0.6rem', cursor: 'pointer',
      background: isSelected ? 'rgba(255,107,53,0.08)' : 'transparent',
      border: `1px solid ${isSelected ? 'rgba(255,107,53,0.22)' : 'transparent'}`,
      transition: 'all 0.18s',
    }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${C[user.status]}33, #1A0A2E)`,
        border: `1.5px solid ${C[user.status]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Bebas Neue', fontSize: '0.65rem', color: C[user.status],
        boxShadow: isOff ? 'none' : `0 0 8px ${C[user.status]}55`,
      }}>{user.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.78rem', color: isOff ? '#444455' : '#F0F0F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name}
        </div>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.55rem', color: '#2A2A3A', marginTop: '0.05rem' }}>
          {user.game ? `🎮 ${user.game}` : user.status.toUpperCase()}
        </div>
      </div>
      {!isOff && (
        <button onClick={e => { e.stopPropagation(); onInvite(); }} style={{
          background: inParty ? 'rgba(255,215,0,0.08)' : 'transparent',
          border: `1px solid ${inParty ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.07)'}`,
          color: inParty ? '#FFD700' : '#444455',
          fontFamily: 'Bebas Neue', fontSize: '0.62rem', letterSpacing: '0.1em',
          padding: '0.18rem 0.42rem', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
        }}
          onMouseEnter={e => { if (!inParty) { e.target.style.borderColor = 'rgba(255,107,53,0.4)'; e.target.style.color = '#FF6B35' } }}
          onMouseLeave={e => { if (!inParty) { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.color = '#444455' } }}
        >
          {inParty ? '✓ IN' : '+ ADD'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SELECTED USER CARD
// ─────────────────────────────────────────────────────────────
function SelectedUserCard({ user, onInvite, inParty }) {
  return (
    <div style={{ padding: '0.9rem', background: `${C[user.status]}07`, border: `1px solid ${C[user.status]}22`, animation: 'slideIn 0.25s ease-out' }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C[user.status]}, transparent)`, marginBottom: '0.7rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.05rem', color: '#F0F0F5', letterSpacing: '0.06em' }}>{user.name}</div>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.05rem', color: C[user.status] }}>LV {user.level}</div>
      </div>
      {user.game && <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.58rem', color: '#555566', marginBottom: '0.7rem' }}>🎮 {user.game}</div>}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button onClick={onInvite} style={{
          flex: 1, background: inParty ? 'rgba(255,215,0,0.08)' : `${C[user.status]}12`,
          border: `1px solid ${inParty ? 'rgba(255,215,0,0.3)' : C[user.status] + '35'}`,
          color: inParty ? '#FFD700' : C[user.status],
          fontFamily: 'Bebas Neue', fontSize: '0.78rem', letterSpacing: '0.18em',
          padding: '0.42rem', cursor: 'pointer', transition: 'all 0.2s',
        }}>{inParty ? '✓ IN PARTY' : '+ INVITE'}</button>
        <button style={{
          padding: '0.42rem 0.65rem', background: 'transparent',
          border: '1px solid rgba(255,255,255,0.07)', color: '#444455',
          fontFamily: 'Bebas Neue', fontSize: '0.78rem', letterSpacing: '0.12em',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.color = '#F0F0F5'; e.target.style.borderColor = 'rgba(255,255,255,0.18)' }}
          onMouseLeave={e => { e.target.style.color = '#444455'; e.target.style.borderColor = 'rgba(255,255,255,0.07)' }}
        >MSG</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export default function SocialLobby() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatInput,  setChatInput]      = useState('');
  const [messages,   setMessages]       = useState(MOCK_MESSAGES);
  const [party,      setParty]          = useState([USER.name]);
  const [notif,      setNotif]          = useState(null);
  const [voiceOn,    setVoiceOn]        = useState(false);
  const chatRef = useRef(null);
  const pageRef = useRef(null);

  const onlineCount = LOBBY_USERS.filter(u => u.status !== 'offline').length;

  useEffect(() => {
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    gsap.fromTo('.lob-left',   { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.3 });
    gsap.fromTo('.lob-right',  { x: 50,  opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'power3.out', delay: 0.4 });
    gsap.fromTo('.lob-bottom', { y: 40,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.5,  ease: 'power3.out', delay: 0.5 });
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const showNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(null), 2800); };

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    setMessages(p => [...p, { id: Date.now(), user: USER.name, avatar: 'AK', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: '#CC0000', isMe: true }]);
    setChatInput('');
  };

  const inviteUser = (user) => {
    if (party.includes(user.name)) return;
    setParty(p => [...p, user.name]);
    showNotif(`✓ ${user.name} invited to party`);
  };

  const selUser = LOBBY_USERS.find(u => u.id === selectedUser);

  return (
    <div ref={pageRef} style={{
      width: '100%', height: '100vh', background: '#020208',
      position: 'relative', overflow: 'hidden',
      paddingTop: 64, opacity: 0,
    }}>

      {/* 3D Canvas */}
      <div style={{ position: 'absolute', inset: 0, top: 64 }}>
        <Canvas shadows camera={{ position: [0, 9, 14], fov: 42 }}>
          <ambientLight intensity={0.04} />
          <color attach="background" args={['#020208']} />
          <fog attach="fog" args={['#020208', 18, 45]} />
          <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.4} />
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#080810" roughness={0.9} metalness={0.05} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
            <circleGeometry args={[8, 64]} />
            <meshStandardMaterial color="#110904" roughness={0.95} />
          </mesh>
          <ContactShadows resolution={512} scale={20} blur={2.5} opacity={0.6} far={10} color="#000" />
          <CentralFire scale={1 + (onlineCount / LOBBY_USERS.length) * 0.5} />
          {LOBBY_USERS.map((u, i) => (
            <PlayerFlame key={u.id} user={u} index={i} total={LOBBY_USERS.length}
              isSelected={selectedUser === u.id}
              onClick={() => setSelectedUser(p => p === u.id ? null : u.id)} />
          ))}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={6} maxDistance={20} enableDamping dampingFactor={0.05} />
        </Canvas>
      </div>

      {/* CSS Embers */}
      <EmberParticles />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, top: 64, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 40% at 0% 50%,   rgba(2,2,8,0.85) 0%, transparent 100%),
          radial-gradient(ellipse 80% 40% at 100% 50%, rgba(2,2,8,0.85) 0%, transparent 100%),
          radial-gradient(ellipse 100% 25% at 50% 0%,  rgba(2,2,8,0.9)  0%, transparent 100%),
          radial-gradient(ellipse 100% 25% at 50% 100%,rgba(2,2,8,0.9)  0%, transparent 100%)
        `,
      }} />

      {/* Notification */}
      {notif && (
        <div style={{
          position: 'fixed', top: 78, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9000, background: 'rgba(8,8,18,0.96)',
          border: '1px solid rgba(255,107,53,0.45)',
          color: '#FF6B35', fontFamily: 'Rajdhani', fontWeight: 700,
          fontSize: '0.82rem', letterSpacing: '0.15em',
          padding: '0.55rem 1.5rem',
          animation: 'notifIn 0.3s ease-out',
        }}>{notif}</div>
      )}

      {/* ── LEFT PANEL ── */}
      <div className="lob-left" style={{
        position: 'absolute', left: 0, top: 64, bottom: 0, width: 262,
        zIndex: 10,
        background: 'linear-gradient(90deg, rgba(2,2,12,0.97) 75%, transparent 100%)',
        borderRight: '1px solid rgba(255,107,53,0.09)',
        display: 'flex', flexDirection: 'column', padding: '1.4rem 1.2rem', gap: '1.1rem',
        overflowY: 'auto',
      }}>
        {/* Title */}
        <div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.58rem', color: '#333344', letterSpacing: '0.5em', marginBottom: '0.15rem' }}>THE CAMPFIRE</div>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.75rem', color: '#F0F0F5', letterSpacing: '0.12em', lineHeight: 1, margin: 0 }}>
            SOCIAL <span style={{ color: '#FF6B35' }}>LOBBY</span>
          </h2>
        </div>

        {/* Fire intensity */}
        <div style={{ padding: '0.9rem', background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.35em', color: '#444455' }}>FIRE INTENSITY</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.05rem', color: '#FF6B35' }}>{onlineCount}/{LOBBY_USERS.length}</div>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{
              height: '100%', width: `${(onlineCount / LOBBY_USERS.length) * 100}%`,
              background: 'linear-gradient(90deg, #FF3300, #FF6B35, #FFD700)',
              boxShadow: '0 0 8px #FF6B35', transition: 'width 1s ease',
            }} />
          </div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.56rem', color: '#2A2A3A', marginTop: '0.35rem', letterSpacing: '0.2em' }}>
            {onlineCount} AROUND THE FIRE
          </div>
        </div>

        {/* Player list */}
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.35em', color: '#444455', marginBottom: '0.6rem' }}>AROUND THE FIRE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {LOBBY_USERS.map(u => (
              <PlayerRow key={u.id} user={u}
                isSelected={selectedUser === u.id}
                inParty={party.includes(u.name)}
                onClick={() => setSelectedUser(p => p === u.id ? null : u.id)}
                onInvite={() => inviteUser(u)} />
            ))}
          </div>
        </div>

        {/* Selected user detail */}
        {selUser && (
          <SelectedUserCard user={selUser} onInvite={() => inviteUser(selUser)} inParty={party.includes(selUser.name)} />
        )}

        {/* Voice */}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => setVoiceOn(p => !p)} style={{
            width: '100%', padding: '0.7rem',
            background: voiceOn ? 'rgba(255,107,53,0.12)' : 'transparent',
            border: `1px solid ${voiceOn ? 'rgba(255,107,53,0.35)' : 'rgba(255,255,255,0.07)'}`,
            color: voiceOn ? '#FF6B35' : '#555566',
            fontFamily: 'Bebas Neue', fontSize: '0.9rem', letterSpacing: '0.3em',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            transition: 'all 0.2s',
          }}>
            🎤 {voiceOn ? 'VOICE ACTIVE' : 'JOIN VOICE'}
            {voiceOn && <VoiceWave />}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL — Chat ── */}
      <div className="lob-right" style={{
        position: 'absolute', right: 0, top: 64, bottom: 0, width: 285,
        zIndex: 10,
        background: 'linear-gradient(270deg, rgba(2,2,12,0.97) 75%, transparent 100%)',
        borderLeft: '1px solid rgba(255,107,53,0.09)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Chat header */}
        <div style={{ padding: '1.1rem 1.2rem 0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF6B35', boxShadow: '0 0 7px #FF6B35', animation: 'campfirePulse 2s ease-in-out infinite' }} />
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.35em', color: '#444455' }}>CAMPFIRE CHAT</div>
          <div style={{ marginLeft: 'auto', fontFamily: 'Share Tech Mono', fontSize: '0.56rem', color: '#2A2A3A' }}>{messages.length} MSG</div>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {messages.map(m => <ChatMessage key={m.id} msg={m} />)}
        </div>

        {/* Input */}
        <div style={{ padding: '0.65rem 1.1rem 0.9rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #CC0000, #1A0A2E)', border: '1.5px solid #FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '0.58rem', color: '#FF6B35', flexShrink: 0 }}>AK</div>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Say something..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#F0F0F5', fontFamily: 'Rajdhani', fontSize: '0.83rem', padding: '0.45rem 0.7rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,107,53,0.35)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
          />
          <button onClick={sendMsg} style={{
            background: chatInput.trim() ? 'linear-gradient(135deg, #CC0000, #880000)' : 'rgba(255,255,255,0.04)',
            border: 'none', color: chatInput.trim() ? '#fff' : '#2A2A3A',
            fontFamily: 'Bebas Neue', fontSize: '0.82rem', letterSpacing: '0.12em',
            padding: '0.45rem 0.7rem', cursor: chatInput.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s', flexShrink: 0,
          }}>SEND</button>
        </div>
      </div>

      {/* ── BOTTOM — Party ── */}
      <div className="lob-bottom" style={{
        position: 'absolute', bottom: 0, left: 262, right: 285, zIndex: 10,
        padding: '0.65rem 2rem',
        background: 'linear-gradient(0deg, rgba(2,2,12,0.98) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', gap: '1.25rem',
      }}>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.35em', color: '#444455', flexShrink: 0 }}>YOUR PARTY</div>
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
          {party.map((name, i) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'rgba(255,107,53,0.07)', border: '1px solid rgba(255,107,53,0.22)',
              padding: '0.28rem 0.6rem',
              animation: i === party.length - 1 && i > 0 ? 'slideIn 0.35s ease-out' : 'none',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF6B35', boxShadow: '0 0 4px #FF6B35' }} />
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.73rem', color: '#F0F0F5', letterSpacing: '0.08em' }}>{name}</span>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - party.length) }).map((_, i) => (
            <div key={i} style={{ width: 60, height: 26, border: '1px dashed rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Share Tech Mono', fontSize: '0.53rem', color: '#1A1A2A' }}>OPEN</div>
          ))}
        </div>
        <button onClick={() => party.length > 1 && showNotif('🎮 Starting party session...')} style={{
          marginLeft: 'auto',
          background: party.length > 1 ? 'linear-gradient(135deg, #CC0000, #880000)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${party.length > 1 ? 'rgba(204,0,0,0.4)' : 'rgba(255,255,255,0.05)'}`,
          color: party.length > 1 ? '#fff' : '#2A2A3A',
          fontFamily: 'Bebas Neue', fontSize: '0.88rem', letterSpacing: '0.25em',
          padding: '0.48rem 1.4rem', cursor: party.length > 1 ? 'pointer' : 'default',
          transition: 'all 0.2s', flexShrink: 0,
        }}>START SESSION</button>
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: '0.56rem', color: '#1A1A2A', letterSpacing: '0.18em', flexShrink: 0 }}>CLICK A FLAME</div>
      </div>

      <style>{`
        @keyframes emberRise  { 0%{transform:translateY(0) scale(1);opacity:.8} 100%{transform:translateY(-200px) scale(0);opacity:0} }
        @keyframes campfirePulse { 0%,100%{opacity:1;box-shadow:0 0 8px #FF6B35} 50%{opacity:0.4;box-shadow:0 0 3px #FF6B35} }
        @keyframes notifIn    { from{transform:translateX(-50%) translateY(-10px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes slideIn    { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes waveBar    { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        .lob-left::-webkit-scrollbar{width:2px}
        .lob-left::-webkit-scrollbar-thumb{background:rgba(255,107,53,0.18)}
        input::placeholder{color:#222233}
      `}</style>
    </div>
  );
}
