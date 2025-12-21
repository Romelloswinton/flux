'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url);

  // Center and scale the model
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Calculate scale to fit model in view
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;

  scene.position.x = -center.x * scale;
  scene.position.y = -center.y * scale;
  scene.position.z = -center.z * scale;
  scene.scale.setScalar(scale);

  return <primitive object={scene} />;
}

interface GLBViewerProps {
  modelUrl: string;
  autoRotate?: boolean;
  className?: string;
}

export function GLBViewer({ modelUrl, autoRotate = true, className = '' }: GLBViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />

          {/* Environment for reflections */}
          <Environment preset="sunset" />

          {/* 3D Model */}
          <Model url={modelUrl} />

          {/* Camera Controls */}
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the GLB files
useGLTF.preload('/HeartfeltVision.glb');
useGLTF.preload('/Mp5.glb');
