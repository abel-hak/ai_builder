import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // 5000 geometric points rendering as a deep space / tech starfield sphere
  const particlesCount = 5000;
  
  const positions = useMemo(() => {
    const array = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        // Random spherical coordinates mapped visually 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 1.0 + Math.random() * 0.8; 
        
        array[i * 3] = r * Math.sin(phi) * Math.cos(theta); // x
        array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
        array[i * 3 + 2] = r * Math.cos(phi); // z
    }
    return array;
  }, [particlesCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Slowly rotate the sphere continuously
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
      
      // Add subtle reaction to the mouse position
      pointsRef.current.rotation.y += (state.mouse.x * 0.1 - pointsRef.current.rotation.y) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.004} 
        color="#0bd1d1" 
        transparent 
        opacity={0.7} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen scale-125 md:scale-100">
      <Canvas camera={{ position: [0, 0, 2.5] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default HeroBackground;
