import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial, Sphere } from '@react-three/drei';

function AppNode({ container, position }) {
  const isUp = container.status.startsWith('Up');
  const color = isUp ? '#00ffa3' : '#ff0055';

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
      <Sphere args={[0.4, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.4}
          radius={0.4}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {container.name}
      </Text>
    </Float>
  );
}

const FleetGraph = ({ containers }) => {
  return (
    <div style={{ width: '100%', height: '400px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {containers.map((c, i) => (
          <AppNode 
            key={c.id} 
            container={c} 
            position={[
                (i % 3 - 1) * 2, 
                -(Math.floor(i / 3) - 0.5) * 2, 
                0
            ]} 
          />
        ))}
      </Canvas>
    </div>
  );
};

export default FleetGraph;
