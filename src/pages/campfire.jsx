import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// ── PROCEDURAL SHADER FOR FIRE & SMOKE ──────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uStatus; // 2: Active, 1: Idle, 0: Offline
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Taper the mesh towards the top
    float taper = 1.0 - vUv.y;
    
    // Adjust wobble speed and amplitude based on status
    float speed = uStatus == 2.0 ? 6.0 : (uStatus == 1.0 ? 3.0 : 1.5);
    float amplitude = uStatus == 2.0 ? 0.25 : (uStatus == 1.0 ? 0.15 : 0.5); 
    
    // Create a wavy, organic movement pushing upward
    pos.x += sin(pos.y * 8.0 + uTime * speed) * amplitude * vUv.y;
    pos.z += cos(pos.y * 6.0 + uTime * speed * 0.8) * amplitude * vUv.y;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uStatus;
  
  void main() {
    // Fade out smoothly at the very top and bottom
    float alpha = smoothstep(0.0, 0.2, vUv.y) * (1.0 - pow(vUv.y, 1.5));
    vec3 color;
    
    if (uStatus == 2.0) {
      // ACTIVE: Roaring Fire (Bright Yellow to Deep Red)
      color = mix(vec3(1.0, 0.9, 0.2), vec3(1.0, 0.1, 0.0), vUv.y);
    } else if (uStatus == 1.0) {
      // IDLE: Small Embers (Orange to Dark Red)
      color = mix(vec3(1.0, 0.4, 0.0), vec3(0.4, 0.0, 0.0), vUv.y);
      alpha *= 0.7; // Slightly more transparent
    } else {
      // OFFLINE: Smoke (Dark Gray to Light Gray)
      color = mix(vec3(0.05, 0.05, 0.05), vec3(0.3, 0.3, 0.3), vUv.y);
      alpha *= 0.5; // Ghostly smoke
    }
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ── INDIVIDUAL PLAYER AVATAR/FLAME ──────────────────────────────────────────
const PlayerFlame = ({ user, index, total }) => {
  const materialRef = useRef();
  
  // Calculate position in a circle
  const radius = 5;
  const angle = (index / total) * Math.PI * 2;
  const position = [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];

  // Map status to shader values
  const statusValues = { active: 2.0, idle: 1.0, offline: 0.0 };
  const uStatus = statusValues[user.status] ?? 0.0;

  // Determine visuals based on status
  const isOffline = user.status === 'offline';
  const scale = user.status === 'active' ? [1, 1.8, 1] : user.status === 'idle' ? [0.7, 0.8, 0.7] : [0.9, 2.5, 0.9];
  const lightColor = user.status === 'active' ? "#ff6600" : "#ff3300";
  const lightIntensity = user.status === 'active' ? 5 : user.status === 'idle' ? 1.5 : 0;

  // Add a random time offset so all fires don't wave in exact unison
  const timeOffset = useMemo(() => Math.random() * 100, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime + timeOffset;
    }
  });

  return (
    <group position={position}>
      {/* Dynamic Lighting for Active/Idle Players */}
      {!isOffline && (
        <pointLight 
          position={[0, 1, 0]} 
          intensity={lightIntensity} 
          distance={8} 
          color={lightColor} 
          castShadow 
        />
      )}

      {/* The Flame / Smoke Mesh */}
      <mesh position={[0, scale[1] / 2, 0]} scale={scale}>
        <coneGeometry args={[0.5, 2, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uStatus: { value: uStatus },
          }}
          transparent
          depthWrite={false}
          // Additive blending looks great for fire, normal blending better for dark smoke
          blending={isOffline ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      {/* Particle Effects: Embers for Fire, Ash for Smoke */}
      <Sparkles 
        count={isOffline ? 15 : 30}
        scale={[1, scale[1], 1]}
        position={[0, scale[1] / 2, 0]}
        size={isOffline ? 4 : 2}
        speed={isOffline ? 0.2 : 0.8}
        opacity={isOffline ? 0.2 : 0.8}
        color={isOffline ? "#444444" : "#ffcc00"}
      />

      {/* UI Label */}
      <Html position={[0, scale[1] + 0.5, 0]} center zIndexRange={[100, 0]}>
        <div style={{
          color: isOffline ? '#888' : '#fff',
          background: isOffline ? 'rgba(20,20,20,0.8)' : 'rgba(0,0,0,0.6)',
          border: `1px solid ${user.status === 'active' ? '#ff6600' : '#333'}`,
          padding: '4px 12px',
          borderRadius: '20px',
          fontFamily: 'monospace',
          fontSize: '12px',
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s ease'
        }}>
          {user.name} <span style={{ opacity: 0.5, fontSize: '10px' }}>• {user.status.toUpperCase()}</span>
        </div>
      </Html>
    </group>
  );
};

// ── MAIN SCENE ──────────────────────────────────────────────────────────────
export default function CampfireLobby({ users }) {
  // Mock data fallback if no users are provided
  const lobbyUsers = users?.length ? users : [
    { id: 1, name: 'GhostSniper', status: 'active' },
    { id: 2, name: 'MageKing', status: 'idle' },
    { id: 3, name: 'IronWall', status: 'offline' },
    { id: 4, name: 'ShadowRogue', status: 'active' },
    { id: 5, name: 'HealerBot', status: 'offline' },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020202' }}>
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        {/* Dim ambient lighting to make the fires pop */}
        <ambientLight intensity={0.05} />
        <color attach="background" args={['#020202']} />
        
        {/* Map through players */}
        {lobbyUsers.map((user, i) => (
          <PlayerFlame key={user.id} user={user} index={i} total={lobbyUsers.length} />
        ))}

        {/* The Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          {/* High roughness so the firelight scatters beautifully, low metalness */}
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Adds realistic grounding shadows to the avatars */}
        <ContactShadows resolution={512} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
        
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going below ground
          minDistance={5} 
          maxDistance={20} 
        />
      </Canvas>
    </div>
  );
}